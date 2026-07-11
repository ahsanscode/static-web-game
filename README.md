# ARCADE.JS

A neon-styled collection of foundational vanilla-JavaScript web games and toys — built with
plain HTML, CSS and DOM manipulation. No frameworks, no build step.

Open `index.html` in a browser to play.

## Games & toys

| Game | Description |
| --- | --- |
| **King of Fighters — Arena** | 🆕 A canvas-based fighting game. Play a friend on one keyboard **or fight the computer**. Health bars, round timer, blocking, KO and best-of-three matches. |
| **Blackjack** | Classic hit / stand / deal card game against the dealer. |
| **Rock · Paper · Scissors** | Play against the computer. |
| **Change the Buttons Color** | Recolor a set of buttons at random or on demand. |
| **Image Generator** | Append random images to the page. |
| **Age in Days** | Enter your birthday, get your age in days. |

## Fighting game controls

Pick a mode on the start screen: **👥 2 Players** (shared keyboard) or **🤖 vs Computer**
(the CPU controls Player 2 — it approaches, attacks, blocks and retreats on its own).

| Action | Player 1 (KYO) | Player 2 (IORI) |
| --- | --- | --- |
| Move left / right | `A` / `D` | `J` / `L` |
| Jump | `W` | `I` |
| Block / crouch | `S` | `K` |
| Punch | `F` | `O` |
| Kick | `G` | `P` |

Punches are fast and light; kicks hit harder but are slower. Hold **block** while facing your
opponent to soak most of the damage. First to win two rounds takes the match.

## Project structure

```
index.html      – single-page hub for every game
CSS/style.css   – neon arcade design system + component styles
JS/script.js    – logic for the classic games (blackjack, RPS, etc.)
JS/fighting.js  – the King of Fighters arena engine (canvas)
static/         – card images and sound effects
```
