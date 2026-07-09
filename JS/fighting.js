/* =====================================================================
   KING OF FIGHTERS — ARENA
   A local 2-player canvas brawler.
   Player 1:  A / D move · W jump · S block · F punch · G kick
   Player 2:  J / L move · I jump · K block · O punch · P kick
   ===================================================================== */

(function () {
    const canvas = document.getElementById('fight-canvas');
    if (!canvas) return; // section not present
    const ctx = canvas.getContext('2d');

    const W = canvas.width;      // 960
    const H = canvas.height;     // 440
    const GROUND = H - 56;       // y of the floor (feet rest here)
    const GRAVITY = 0.9;
    const ROUND_TIME = 60;       // seconds
    const WINS_NEEDED = 2;       // best of 3

    /* ---- sound (reuse repo assets, be resilient if blocked) -------- */
    function sfx(src, vol) {
        try {
            const a = new Audio(src);
            a.volume = vol;
            return a;
        } catch (e) { return { play() {}, cloneNode() { return this; } }; }
    }
    const sndHit = sfx('./static/hit.wav', 0.5);
    const sndWin = sfx('./static/win.wav', 0.6);
    const sndBell = sfx('./static/deal.wav', 0.6);
    function play(sound) {
        try { const n = sound.cloneNode ? sound.cloneNode() : sound; n.volume = sound.volume; n.play(); } catch (e) {}
    }

    /* ---- input ----------------------------------------------------- */
    const keys = new Set();
    const GAME_KEYS = new Set(['a', 'd', 'w', 's', 'f', 'g', 'j', 'l', 'i', 'k', 'o', 'p']);

    window.addEventListener('keydown', function (e) {
        const k = e.key.toLowerCase();
        if (!GAME_KEYS.has(k)) return;
        // only hijack the page when the arena is the thing in view
        if (isArenaEngaged()) e.preventDefault();
        if (!keys.has(k)) {
            keys.add(k);
            onPress(k);
        }
    });
    window.addEventListener('keyup', function (e) {
        keys.delete(e.key.toLowerCase());
    });

    function isArenaEngaged() {
        const rect = canvas.getBoundingClientRect();
        return rect.top < window.innerHeight * 0.9 && rect.bottom > window.innerHeight * 0.1;
    }

    function onPress(k) {
        if (state !== 'fight') return;
        if (k === 'f') p1.startAttack('punch');
        if (k === 'g') p1.startAttack('kick');
        if (k === 'o') p2.startAttack('punch');
        if (k === 'p') p2.startAttack('kick');
        if (k === 'w') p1.jump();
        if (k === 'i') p2.jump();
    }

    /* ---- fighter --------------------------------------------------- */
    class Fighter {
        constructor(opts) {
            this.name = opts.name;
            this.colors = opts.colors;     // {suit, suitDark, skin, trim, glow}
            this.startX = opts.x;
            this.facing = opts.facing;     // 1 = right, -1 = left
            this.controls = opts.controls; // {left,right,jump,block,punch,kick}
            this.width = 52;
            this.reset();
        }

        reset() {
            this.x = this.startX;
            this.y = GROUND;
            this.vx = 0;
            this.vy = 0;
            this.height = 122;
            this.health = 100;
            this.onGround = true;
            this.attackType = null;
            this.attackTimer = 0;
            this.attackConnected = false;
            this.hitStun = 0;
            this.blocking = false;
            this.flash = 0;        // white hit flash
            this.blockFlash = 0;
            this.ko = false;
            this.walkPhase = 0;
        }

        jump() {
            if (this.onGround && this.hitStun <= 0 && !this.ko) {
                this.vy = -15.5;
                this.onGround = false;
            }
        }

        startAttack(type) {
            if (this.attackTimer > 0 || this.hitStun > 0 || this.ko) return;
            if (!this.onGround && this.attackType) return;
            this.attackType = type;
            this.attackTimer = type === 'punch' ? 18 : 26;
            this.attackConnected = false;
        }

        get crouching() {
            return keys.has(this.controls.block) && this.onGround && this.hitStun <= 0 && !this.ko;
        }

        getHurtbox() {
            const h = this.crouching ? this.height * 0.66 : this.height;
            return { x: this.x - this.width / 2, y: this.y - h, w: this.width, h: h };
        }

        getHitbox() {
            if (this.attackTimer <= 0 || this.attackConnected) return null;
            let active;
            if (this.attackType === 'punch') active = this.attackTimer <= 13 && this.attackTimer >= 6;
            else active = this.attackTimer <= 19 && this.attackTimer >= 7;
            if (!active) return null;

            const reach = this.attackType === 'punch' ? 60 : 78;
            const hbW = this.attackType === 'punch' ? 32 : 38;
            const cy = this.attackType === 'punch'
                ? this.y - this.height * 0.66
                : this.y - this.height * 0.34;
            const cx = this.x + this.facing * (this.width / 2 + reach - hbW / 2);
            return {
                x: cx - hbW / 2, y: cy - 16, w: hbW, h: 32,
                dmg: this.attackType === 'punch' ? 6 : 12,
                knock: this.attackType === 'punch' ? 6 : 10,
                type: this.attackType
            };
        }

        takeHit(hb, fromDir) {
            const facingAttacker = this.facing === -fromDir;
            const isBlocking = this.crouching && facingAttacker;
            let dmg = hb.dmg;
            if (isBlocking) {
                dmg = Math.max(1, dmg * 0.18);
                this.vx = fromDir * 3;
                this.blockFlash = 8;
                play(sndBell);
            } else {
                this.vx = fromDir * hb.knock;
                if (hb.type === 'kick' && this.onGround) { this.vy = -5; this.onGround = false; }
                this.hitStun = hb.type === 'kick' ? 22 : 14;
                this.flash = 8;
                this.attackTimer = 0;
                this.attackType = null;
                spawnHitSpark(hb.x + hb.w / 2, hb.y + hb.h / 2, this.colors.glow);
                play(sndHit);
            }
            this.health = Math.max(0, this.health - dmg);
        }

        update(dt, opp) {
            if (this.ko) { // fall / lie down
                this.vy += GRAVITY;
                this.y = Math.min(GROUND, this.y + this.vy);
                if (this.y >= GROUND) { this.y = GROUND; this.vy = 0; }
                return;
            }

            this.facing = opp.x >= this.x ? 1 : -1;

            // Outside of the live round, stand still (no input, no drift).
            if (state !== 'fight') { this.vx = 0; this.walkPhase = 0; return; }

            this.blocking = this.crouching && (opp.x - this.x) * this.facing > 0;

            if (this.attackTimer > 0) this.attackTimer--;
            if (this.hitStun > 0) this.hitStun--;
            if (this.flash > 0) this.flash--;
            if (this.blockFlash > 0) this.blockFlash--;

            const canAct = this.hitStun <= 0 && this.attackTimer <= 0 && !this.crouching;
            const speed = 3.7;
            if (canAct) {
                if (keys.has(this.controls.left)) { this.vx = -speed; this.walkPhase += 0.3; }
                else if (keys.has(this.controls.right)) { this.vx = speed; this.walkPhase += 0.3; }
                else { this.vx *= this.onGround ? 0.6 : 0.9; }
            } else {
                this.vx *= this.onGround ? 0.75 : 0.95;
            }

            // gravity + vertical
            this.vy += GRAVITY;
            this.y += this.vy;
            if (this.y >= GROUND) { this.y = GROUND; this.vy = 0; this.onGround = true; }
            else this.onGround = false;

            // horizontal
            this.x += this.vx;
            const half = this.width / 2;
            if (this.x < half + 8) { this.x = half + 8; this.vx = 0; }
            if (this.x > W - half - 8) { this.x = W - half - 8; this.vx = 0; }
        }

        draw(ctx) {
            const c = this.colors;
            const f = this.facing;
            const crouch = this.crouching;
            const h = crouch ? this.height * 0.66 : this.height;
            const feetY = this.y;
            const hipY = feetY - h * 0.44;
            const shoulderY = feetY - h * 0.80;
            const headY = feetY - h * 0.90;
            const headR = 15;

            ctx.save();

            // ground shadow
            ctx.globalAlpha = 0.28;
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.ellipse(this.x, GROUND + 4, this.width * 0.7, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;

            const bob = this.onGround ? Math.sin(this.walkPhase) * 2 : 0;

            // ---- legs
            const legSpread = 12;
            ctx.strokeStyle = c.suitDark;
            ctx.lineWidth = 11;
            ctx.lineCap = 'round';
            // kicking front leg
            const kicking = this.attackType === 'kick' && this.attackTimer > 0;
            if (kicking) {
                const ext = (this.attackTimer <= 19 && this.attackTimer >= 5) ? 1 : 0.4;
                ctx.beginPath();
                ctx.moveTo(this.x, hipY);
                ctx.lineTo(this.x + f * 42 * ext, feetY - h * 0.30);
                ctx.stroke();
                // back leg planted
                ctx.beginPath();
                ctx.moveTo(this.x, hipY);
                ctx.lineTo(this.x - f * 8, feetY);
                ctx.stroke();
            } else {
                const step = this.onGround ? Math.sin(this.walkPhase) * 8 : 6;
                ctx.beginPath();
                ctx.moveTo(this.x, hipY);
                ctx.lineTo(this.x - legSpread + step, feetY);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(this.x, hipY);
                ctx.lineTo(this.x + legSpread - step, feetY);
                ctx.stroke();
            }

            // ---- torso
            const torsoW = 30;
            const grd = ctx.createLinearGradient(this.x - torsoW, 0, this.x + torsoW, 0);
            grd.addColorStop(0, c.suitDark);
            grd.addColorStop(0.5, c.suit);
            grd.addColorStop(1, c.suitDark);
            ctx.fillStyle = grd;
            roundRect(ctx, this.x - torsoW / 2, shoulderY + bob, torsoW, hipY - shoulderY + 6, 10);
            ctx.fill();

            // belt / trim
            ctx.fillStyle = c.trim;
            ctx.fillRect(this.x - torsoW / 2, hipY - 4 + bob, torsoW, 6);

            // ---- back arm
            ctx.strokeStyle = c.skin;
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.moveTo(this.x - f * 6, shoulderY + 6 + bob);
            ctx.lineTo(this.x - f * 16, shoulderY + 34 + bob);
            ctx.stroke();

            // ---- front arm (punch extends)
            const punching = this.attackType === 'punch' && this.attackTimer > 0;
            ctx.beginPath();
            ctx.moveTo(this.x + f * 6, shoulderY + 6 + bob);
            if (punching) {
                const ext = (this.attackTimer <= 13 && this.attackTimer >= 4) ? 1 : 0.5;
                const fistX = this.x + f * (14 + 44 * ext);
                const fistY = shoulderY + 12 + bob;
                ctx.lineTo(fistX, fistY);
                ctx.stroke();
                // glove
                ctx.fillStyle = c.trim;
                ctx.beginPath();
                ctx.arc(fistX, fistY, 8, 0, Math.PI * 2);
                ctx.fill();
            } else if (this.blocking) {
                // guard up
                ctx.lineTo(this.x + f * 12, shoulderY + 2 + bob);
                ctx.lineTo(this.x + f * 6, shoulderY - 8 + bob);
                ctx.stroke();
            } else {
                ctx.lineTo(this.x + f * 16, shoulderY + 34 + bob);
                ctx.stroke();
                ctx.fillStyle = c.trim;
                ctx.beginPath();
                ctx.arc(this.x + f * 16, shoulderY + 34 + bob, 7, 0, Math.PI * 2);
                ctx.fill();
            }

            // ---- head
            ctx.fillStyle = c.skin;
            ctx.beginPath();
            ctx.arc(this.x + f * 2, headY + bob, headR, 0, Math.PI * 2);
            ctx.fill();
            // headband
            ctx.fillStyle = c.glow;
            ctx.fillRect(this.x - headR + f * 2, headY - 6 + bob, headR * 2, 6);
            // headband tails
            ctx.strokeStyle = c.glow;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.x - f * headR + f * 2, headY - 3 + bob);
            ctx.lineTo(this.x - f * (headR + 14) + f * 2, headY + 4 + bob + Math.sin(this.walkPhase) * 3);
            ctx.stroke();
            // eye
            ctx.fillStyle = '#12203a';
            ctx.fillRect(this.x + f * 6, headY + bob, 4, 4);

            // ---- hit / block flash overlay
            if (this.flash > 0) {
                ctx.globalAlpha = this.flash / 12;
                ctx.fillStyle = '#fff';
                const hb = this.getHurtbox();
                roundRect(ctx, hb.x, hb.y, hb.w, hb.h, 10);
                ctx.fill();
                ctx.globalAlpha = 1;
            }
            if (this.blockFlash > 0) {
                ctx.globalAlpha = this.blockFlash / 16;
                ctx.strokeStyle = '#9fe8ff';
                ctx.lineWidth = 3;
                const hb = this.getHurtbox();
                roundRect(ctx, hb.x - 4, hb.y - 4, hb.w + 8, hb.h + 8, 12);
                ctx.stroke();
                ctx.globalAlpha = 1;
            }

            ctx.restore();
        }
    }

    /* ---- particles ------------------------------------------------- */
    let sparks = [];
    function spawnHitSpark(x, y, color) {
        for (let i = 0; i < 12; i++) {
            const a = Math.random() * Math.PI * 2;
            const s = 2 + Math.random() * 5;
            sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1, life: 18 + Math.random() * 10, color });
        }
    }
    function updateSparks() {
        for (const p of sparks) { p.x += p.vx; p.y += p.vy; p.vy += 0.35; p.life--; }
        sparks = sparks.filter(p => p.life > 0);
    }
    function drawSparks() {
        for (const p of sparks) {
            ctx.globalAlpha = Math.max(0, p.life / 26);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    /* ---- players --------------------------------------------------- */
    const p1 = new Fighter({
        name: 'KYO', x: 250, facing: 1,
        colors: { suit: '#2a6cff', suitDark: '#123a9e', skin: '#f2c9a0', trim: '#7fd4ff', glow: '#38e8ff' },
        controls: { left: 'a', right: 'd', jump: 'w', block: 's', punch: 'f', kick: 'g' }
    });
    const p2 = new Fighter({
        name: 'IORI', x: 710, facing: -1,
        colors: { suit: '#ff3d7f', suitDark: '#a01147', skin: '#f2c9a0', trim: '#ffb0d0', glow: '#ff5db1' },
        controls: { left: 'j', right: 'l', jump: 'i', block: 'k', punch: 'o', kick: 'p' }
    });

    /* ---- HUD / DOM ------------------------------------------------- */
    const el = {
        p1health: document.getElementById('p1-health'),
        p2health: document.getElementById('p2-health'),
        timer: document.getElementById('fight-timer'),
        overlay: document.getElementById('fight-overlay'),
        msg: document.getElementById('fight-msg'),
        sub: document.getElementById('fight-sub'),
        start: document.getElementById('fight-start'),
        p1pips: document.getElementById('p1-pips'),
        p2pips: document.getElementById('p2-pips')
    };

    /* ---- match state ----------------------------------------------- */
    let state = 'ready';   // ready | intro | fight | roundover | matchover
    let timeLeft = ROUND_TIME;
    let lastSec = 0;
    let stateTimer = 0;    // frames for transient states
    let bigText = '';      // FIGHT! / K.O. etc.
    let bigTextTimer = 0;
    let scores = { p1: 0, p2: 0 };

    function setPips() {
        function pip(n) { return '<i class="' + (n ? 'on' : '') + '"></i>'; }
        if (el.p1pips) el.p1pips.innerHTML = pip(scores.p1 >= 1) + pip(scores.p1 >= 2);
        if (el.p2pips) el.p2pips.innerHTML = pip(scores.p2 >= 1) + pip(scores.p2 >= 2);
    }

    function updateHealthBars() {
        if (el.p1health) el.p1health.style.width = p1.health + '%';
        if (el.p2health) el.p2health.style.width = p2.health + '%';
    }

    function showBig(text, frames) { bigText = text; bigTextTimer = frames; }

    function startMatch() {
        scores = { p1: 0, p2: 0 };
        setPips();
        beginRound();
    }

    function beginRound() {
        p1.reset(); p2.reset();
        sparks = [];
        timeLeft = ROUND_TIME;
        lastSec = performance.now();
        updateHealthBars();
        if (el.timer) el.timer.textContent = timeLeft;
        state = 'intro';
        stateTimer = 90; // ~1.5s
        showBig('READY', 55);
        hideOverlay();
        play(sndBell);
    }

    function endRound(winner) {
        state = 'roundover';
        stateTimer = 140;
        if (winner === 'p1') { scores.p1++; p2.ko = true; }
        else if (winner === 'p2') { scores.p2++; p1.ko = true; }
        setPips();
        play(sndWin);

        if (winner === 'draw') showBig('DRAW', 120);
        else showBig('K.O.', 120);
    }

    function checkMatchOver() {
        if (scores.p1 >= WINS_NEEDED || scores.p2 >= WINS_NEEDED) {
            state = 'matchover';
            const champ = scores.p1 > scores.p2 ? p1 : p2;
            showOverlay(champ.name + ' WINS!', 'Best of three · ' + scores.p1 + ' — ' + scores.p2, 'REMATCH');
            return true;
        }
        return false;
    }

    function showOverlay(msg, sub, btn) {
        if (!el.overlay) return;
        el.overlay.classList.remove('hidden');
        if (el.msg) el.msg.textContent = msg;
        if (el.sub) el.sub.textContent = sub || '';
        if (el.start) el.start.textContent = btn || 'FIGHT!';
    }
    function hideOverlay() { if (el.overlay) el.overlay.classList.add('hidden'); }

    if (el.start) {
        el.start.addEventListener('click', function () {
            startMatch();
        });
    }

    /* ---- combat resolution ----------------------------------------- */
    function overlaps(a, b) {
        return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }

    function resolveCombat() {
        // keep bodies from stacking
        const dx = p2.x - p1.x;
        const minDist = (p1.width + p2.width) / 2 - 6;
        if (Math.abs(dx) < minDist) {
            const push = (minDist - Math.abs(dx)) / 2;
            const dir = dx >= 0 ? 1 : -1;
            p1.x -= dir * push; p2.x += dir * push;
        }

        const h1 = p1.getHitbox();
        if (h1) {
            const hb2 = p2.getHurtbox();
            if (overlaps(h1, hb2)) { p2.takeHit(h1, p1.facing); p1.attackConnected = true; }
        }
        const h2 = p2.getHitbox();
        if (h2) {
            const hb1 = p1.getHurtbox();
            if (overlaps(h2, hb1)) { p1.takeHit(h2, p2.facing); p2.attackConnected = true; }
        }
    }

    /* ---- stage ----------------------------------------------------- */
    function drawStage() {
        // sky
        const sky = ctx.createLinearGradient(0, 0, 0, H);
        sky.addColorStop(0, '#1a0b2e');
        sky.addColorStop(0.5, '#2b1055');
        sky.addColorStop(1, '#3d1e6d');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, W, H);

        // sun / moon
        const moon = ctx.createRadialGradient(W * 0.5, 130, 20, W * 0.5, 130, 120);
        moon.addColorStop(0, 'rgba(255,120,180,0.55)');
        moon.addColorStop(1, 'rgba(255,120,180,0)');
        ctx.fillStyle = moon;
        ctx.beginPath();
        ctx.arc(W * 0.5, 130, 120, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffd36e';
        ctx.beginPath();
        ctx.arc(W * 0.5, 130, 60, 0, Math.PI * 2);
        ctx.fill();

        // distant skyline silhouette
        ctx.fillStyle = 'rgba(10,4,24,0.75)';
        const base = GROUND - 6;
        let bx = 0;
        const rng = mulberry(1337);
        while (bx < W) {
            const bw = 30 + rng() * 46;
            const bh = 60 + rng() * 120;
            ctx.fillRect(bx, base - bh, bw, bh);
            bx += bw + 6;
        }

        // floor
        const floor = ctx.createLinearGradient(0, GROUND, 0, H);
        floor.addColorStop(0, '#241436');
        floor.addColorStop(1, '#0d0718');
        ctx.fillStyle = floor;
        ctx.fillRect(0, GROUND, W, H - GROUND);

        // neon floor line + perspective grid
        ctx.strokeStyle = 'rgba(255,93,177,0.8)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, GROUND);
        ctx.lineTo(W, GROUND);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(56,232,255,0.18)';
        ctx.lineWidth = 1;
        for (let i = -8; i <= 8; i++) {
            const vx = W / 2 + i * 60;
            ctx.beginPath();
            ctx.moveTo(W / 2 + i * 12, GROUND);
            ctx.lineTo(vx, H);
            ctx.stroke();
        }
    }

    /* ---- main loop ------------------------------------------------- */
    function loop() {
        // timing for the round clock
        if (state === 'fight') {
            const now = performance.now();
            if (now - lastSec >= 1000) {
                lastSec = now;
                timeLeft--;
                if (el.timer) el.timer.textContent = Math.max(0, timeLeft);
                if (timeLeft <= 0) {
                    if (p1.health === p2.health) endRound('draw');
                    else endRound(p1.health > p2.health ? 'p1' : 'p2');
                }
            }
        }

        // state transitions
        if (stateTimer > 0) {
            stateTimer--;
            if (stateTimer === 0) {
                if (state === 'intro') { state = 'fight'; showBig('FIGHT!', 45); lastSec = performance.now(); }
                else if (state === 'roundover') {
                    if (!checkMatchOver()) beginRound();
                }
            }
        }

        // updates
        p1.update(1, p2);
        p2.update(1, p1);
        if (state === 'fight') {
            resolveCombat();
            if (p1.health <= 0 || p2.health <= 0) {
                if (p1.health <= 0 && p2.health <= 0) endRound('draw');
                else endRound(p1.health <= 0 ? 'p2' : 'p1');
            }
            updateHealthBars();
        }
        updateSparks();

        // render
        drawStage();
        // draw fighters back-to-front by x for a little depth
        if (p1.y <= p2.y) { p1.draw(ctx); p2.draw(ctx); }
        else { p2.draw(ctx); p1.draw(ctx); }
        drawSparks();
        drawBigText();

        requestAnimationFrame(loop);
    }

    function drawBigText() {
        if (bigTextTimer <= 0 || !bigText) return;
        bigTextTimer--;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const scale = bigText === 'K.O.' ? 96 : 64;
        ctx.font = '900 ' + scale + 'px "Orbitron", system-ui, sans-serif';
        ctx.lineWidth = 8;
        ctx.strokeStyle = 'rgba(0,0,0,0.55)';
        ctx.strokeText(bigText, W / 2, H / 2 - 40);
        const g = ctx.createLinearGradient(0, H / 2 - 90, 0, H / 2);
        g.addColorStop(0, '#fff');
        g.addColorStop(1, bigText === 'K.O.' ? '#ff5db1' : '#38e8ff');
        ctx.fillStyle = g;
        ctx.fillText(bigText, W / 2, H / 2 - 40);
        ctx.restore();
    }

    /* ---- helpers --------------------------------------------------- */
    function roundRect(ctx, x, y, w, h, r) {
        r = Math.min(r, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }
    function mulberry(seed) {
        let t = seed;
        return function () {
            t += 0x6D2B79F5;
            let r = Math.imul(t ^ (t >>> 15), 1 | t);
            r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
            return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
        };
    }

    /* ---- boot ------------------------------------------------------ */
    setPips();
    updateHealthBars();
    if (el.timer) el.timer.textContent = ROUND_TIME;
    showOverlay('KING OF FIGHTERS', 'Local 2-player · Best of three', 'FIGHT!');
    requestAnimationFrame(loop);
})();
