function ageInDays() {
    const birthday = parseInt(prompt('What day were you born... Good friend?'), 10);
    const birthmonth = parseInt(prompt('What month were you born... Good friend?'), 10);
    const birthyear = parseInt(prompt('What year were you born... Good friend?'), 10);

    // Create a Date object for the birthdate
    const birthDate = new Date(birthyear, birthmonth - 1, birthday);

    // Get the current date
    const today = new Date();

    // Calculate the difference in time (milliseconds)
    const timeDifference = today - birthDate;

    // Convert time difference from milliseconds to days
    const ageInDays = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

    let h1 = document.createElement('h1');
    // Display the result
    const result = document.createTextNode(`You are approximately ${ageInDays} days old.`);

    h1.setAttribute('id', 'ageindays');
    h1.appendChild(result);
    document.getElementById('flex-box-result').appendChild(h1);


}


function reset() {
    const element = document.getElementById('ageindays');
    if (element) {
        element.remove();
    }
}


let imgGenCount = 0;

function creat_img() {
    const div = document.getElementById('img_append');
    imgGenCount++;

    // Unique token per click so the browser never re-serves a cached image.
    const unique = Date.now() + '-' + imgGenCount;

    const image = document.createElement('img');
    image.className = 'generated-img';
    image.alt = 'Random cat #' + imgGenCount;
    // A fresh random cat every click; fall back to Lorem Picsum if the cat API is down.
    image.src = 'https://cataas.com/cat?width=280&height=280&unique=' + unique;
    image.onerror = function () {
        this.onerror = null; // avoid loops if the fallback also fails
        this.src = 'https://picsum.photos/280/280?random=' + unique;
    };

    div.appendChild(image);
    // The gallery grows downward; the container's height expands to fit (see CSS).
}

function randint() {
    return Math.floor(Math.random() * 3);
}

function botchoise(num) {
    return ['rock', 'paper', 'scissors'][num];
}


// Returns 'win' | 'lose' | 'draw' from the player's point of view.
function rpsOutcome(user, computer) {
    if (user === computer) return 'draw';
    const beats = { rock: 'scissors', paper: 'rock', scissors: 'paper' };
    return beats[user] === computer ? 'win' : 'lose';
}

function srcx(botchoice) {
    if (botchoice === 'rock') {
        return 'data:image/jpeg;base64,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';
    } else if (botchoice === 'paper') {
        return 'data:image/jpeg;base64,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';
    } else {
        return 'data:image/jpeg;base64,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';
    }

}


let rpsScore = { you: 0, cpu: 0, draw: 0 };
const rpsSounds = {
    win: new Audio("./static/win.wav"),
    lose: new Audio("./static/hit.wav"),
    draw: new Audio("./static/deal.wav")
};

function playRpsSound(outcome) {
    const sound = rpsSounds[outcome];
    if (!sound) return;
    sound.currentTime = 0;
    sound.play().catch(() => {});
}

function renderRpsScore() {
    document.getElementById('rps-you-score').textContent = rpsScore.you;
    document.getElementById('rps-cpu-score').textContent = rpsScore.cpu;
    document.getElementById('rps-draw-score').textContent = rpsScore.draw;
}

function game(yourChoice) {
    const human = yourChoice.alt;                 // 'rock' | 'paper' | 'scissors'
    const bot = botchoise(randint());
    const outcome = rpsOutcome(human, bot);       // 'win' | 'lose' | 'draw'

    // Keep score.
    if (outcome === 'win') rpsScore.you++;
    else if (outcome === 'lose') rpsScore.cpu++;
    else rpsScore.draw++;
    renderRpsScore();
    playRpsSound(outcome);

    // Show the round below the (still-clickable) choices.
    const verdict = outcome === 'win' ? 'You win!' : outcome === 'lose' ? 'You lose!' : "It's a draw!";
    const result = document.getElementById('rps-result');
    result.innerHTML =
        '<figure class="rps-pick">' +
            '<img src="' + yourChoice.src + '" alt="' + human + '">' +
            '<figcaption>You · ' + human + '</figcaption>' +
        '</figure>' +
        '<div class="rps-verdict ' + outcome + '">' + verdict + '</div>' +
        '<figure class="rps-pick">' +
            '<img src="' + srcx(bot) + '" alt="' + bot + '">' +
            '<figcaption>CPU · ' + bot + '</figcaption>' +
        '</figure>';
    result.classList.add('show');
    // Re-trigger the pop animation each round.
    result.style.animation = 'none';
    void result.offsetWidth;
    result.style.animation = '';
}

// Reset the match back to its default state.
function rps_reset() {
    rpsScore = { you: 0, cpu: 0, draw: 0 };
    renderRpsScore();
    const result = document.getElementById('rps-result');
    result.innerHTML = '';
    result.classList.remove('show');
}


// Scope the colour-changer to its own game section so it doesn't
// repaint unrelated buttons elsewhere on the page.
var all_buttons = document.querySelectorAll('#colors button');
var copybtns = [];
for (let i = 0; i < all_buttons.length; i++) {
    copybtns.push(all_buttons[i].classList[1]);
}

function changebtncolor(color) {
    for (let i = 0; i < all_buttons.length; i++) {
        all_buttons[i].classList.remove(all_buttons[i].classList[1]);
        if (color === 'red') {
            all_buttons[i].classList.add('btn-danger');
        } else if (color === 'green') {
            all_buttons[i].classList.add('btn-success');

        }
    }
}

function randcolor() {
    return Math.floor(Math.random() * 4);
}


function randomcolor() {
    const colors = ['btn-primary', 'btn-danger', 'btn-warning', 'btn-success'];
    for (let i = 0; i < all_buttons.length; i++) {
        all_buttons[i].classList.remove(all_buttons[i].classList[1]);
    }
    for (let i = 0; i < all_buttons.length; i++) {
        all_buttons[i].classList.add(colors[randcolor()]);
    }
}


function resetcolor() {
    for (let i = 0; i < all_buttons.length; i++) {
        all_buttons[i].classList.remove(all_buttons[i].classList[1]);
        all_buttons[i].classList.add(copybtns[i]);
    }
}


function btnchange(btnthingy) {
    if (btnthingy.value === 'red') {
        changebtncolor('red');
    } else if (btnthingy.value === 'green') {
        changebtncolor('green');
    } else if (btnthingy.value === 'random') {
        randomcolor()
    } else if (btnthingy.value === 'reset') {
        resetcolor();
    }
}

let bjGame = {
    "you": {"scoreSpan": "#your-blackjack-result", "div": ".you-box", "score": 0},
    "dealer": {"scoreSpan": "#dealer-blackjack-result", "div": ".dealer-box", "score": 0},
    "cards": ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'k', 'j', 'q', 'a'],
    "cardsmap": {
        '2': 2,
        '3': 3,
        '4': 4,
        '5': 5,
        '6': 6,
        '7': 7,
        '8': 8,
        '9': 9,
        '10': 10,
        'k': 10,
        'j': 10,
        'q': 10,
        'a': [1, 10]
    }

};

function bjcard() {
    let rand = Math.floor(Math.random() * 13);
    return bjGame.cards[rand];
}

// the below object contasins links of the cards images

const cardobj = {
    '2': './static/2.png',
    '3': './static/3.png',
    '4': './static/4.png',
    '5': './static/5.png',
    '6': './static/6.png',
    '7': './static/7.png',
    '8': './static/8.png',
    '9': './static/9.png',
    '10': './static/10.png',
    'k': './static/k.png',
    'j': './static/j.png',
    'q': './static/q.png',
    'a': './static/a.png',

};
const you = bjGame["you"];


const dealer = bjGame["dealer"];
const hitsound = new Audio("./static/hit.wav");
let bjRoundOver = false;

function showcard(card, player) {

    let cardImage = document.createElement("img");
    cardImage.src = cardobj[card];
    document.querySelector(player["div"]).appendChild(cardImage);


}

function updateScore(card, activeplayer) {
    if (card === 'a') {
        if (activeplayer['score'] === 21) {
            return false
        }
        if (activeplayer['score'] + 10 <= 21) {
            activeplayer['score'] += 10;
            return true;
        } else {
            if (activeplayer['score'] + 1 <= 21) {

                activeplayer['score'] += 1;
                return true;
            }
        }


    } else {

        if (activeplayer['score'] + bjGame['cardsmap'][card] <= 21) {
            activeplayer['score'] += bjGame['cardsmap'][card];
            return true;
        } else {

            activeplayer['score'] += bjGame['cardsmap'][card];
            return true;
        }
    }

}

function showScore(activeplayer) {
    if (activeplayer['score'] > 21) {
        document.querySelector(activeplayer["scoreSpan"]).textContent = "BUST";
        document.querySelector(activeplayer["scoreSpan"]).style.color = "red";
        return false;
    } else {
        document.querySelector(activeplayer["scoreSpan"]).textContent = `${activeplayer['score']}`;
        return true;
    }
}

function bj_hit() {


    let card = bjcard();
    if (you['score'] <= 21) {

        showcard(card, you);
        hitsound.play();
    }
    updateScore(card, you)
    showScore(you)


}


document.querySelector('#bj-hit-btn').addEventListener('click', bj_hit);


function dealerfunc() {
    let card = bjcard();
    if (dealer['score'] <= 21) {

        showcard(card, dealer);
        // hitsound.play();
    }
    updateScore(card, dealer)
    showScore(dealer)

}

function winnerfunc() {
    let winner;
    if (you['score'] <= 21) {
        console.log(dealer['score']);
        if (you['score'] > dealer['score']) {
            console.log('ppp');
            winner = 'you';
        } else if (dealer['score'] > 21) {
            console.log('ppp');
            winner = 'you';
        } else if (you['score'] < dealer['score'] && dealer['score'] <= 21) {
            winner = 'dealer';
        }
    } else if ((you['score'] >= 21 && dealer['score'] >= 21) || (you['score'] === dealer['score'])) {
        winner = 'Draw';
    } else {
        winner = 'dealer';
    }
    return winner;
}

function finalresult(winner) {
    let messege, msgcolor;
    if (winner === 'you') {
        messege = 'You win';
        msgcolor = 'green';
        let winsound = new Audio("./static/win.wav");
        winsound.play();
    } else if (winner === 'dealer') {
        messege = 'You lost';
        msgcolor = 'red';
    } else {
        messege = 'You Drew';
        msgcolor = 'Black';
    }

    document.querySelector('#finalresult').textContent = messege;
    document.querySelector('#finalresult').style.color = msgcolor;
}


function bj_stand() {
    if (bjRoundOver || (you['score'] === 0 && dealer['score'] === 0)) {
        return;
    }
    while (dealer['score'] < 16) {
        dealerfunc();
    }
    finalresult(winnerfunc());
    bjRoundOver = true;
}

document.querySelector('#bj-stand-btn').addEventListener('click', bj_stand)

const dealsound = new Audio("./static/deal.wav");

function bj_deal() {
    let yourimages = document.querySelector('.you-box').querySelectorAll('img');
    let dealerimages = document.querySelector('.dealer-box').querySelectorAll('img');

    for (let img of yourimages) {
        img.remove();
    }
    for (let img of dealerimages) {
        img.remove();
    }
    document.querySelector(you['scoreSpan']).textContent = '0';
    document.querySelector(you['scoreSpan']).style.color = 'white';
    document.querySelector(dealer['scoreSpan']).textContent = '0';
    document.querySelector(dealer['scoreSpan']).style.color = 'white';
    dealsound.play();
    document.querySelector('#finalresult').textContent = "Let's play";
    document.querySelector('#finalresult').style.color = 'white';
    bjGame['you']['score'] = 0;
    bjGame['dealer']['score'] = 0;
    bjRoundOver = false;
}


document.querySelector('#bj-deal-btn').addEventListener('click', bj_deal)

function bj_reset() {
    document.querySelector('#wons').textContent = '0';
    document.querySelector('#losses').textContent = '0';
    document.querySelector('#Draws').textContent = '0';
    bj_deal();
}

document.querySelector('#bj-reset-btn').addEventListener('click', bj_reset)


















