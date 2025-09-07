const output = document.querySelector("output");
const doors = Array.from(document.querySelectorAll(".door"));
const scoreboard = document.getElementById("scoreboard");
const toggleScoreBtn = document.getElementById("toggle-score");
const elWinsSwap = document.getElementById("wins-swap");
const elWinsStay = document.getElementById("wins-stay");
const elLossesSwap = document.getElementById("losses-swap");
const elLossesStay = document.getElementById("losses-stay");
const elGames = document.getElementById("games-total");

let stage = 0;
let prize = randDoor();
let picked = null;
let revealed = null;
let gameOver = false;

const stats = {
  wins_swap: 0,
  wins_stay: 0,
  losses_swap: 0,
  losses_stay: 0,
  games_total: 0,
};

function randDoor() {
  return Math.floor(Math.random() * 3) + 1;
}

function loadStats() {
  Object.keys(stats).forEach((k) => {
    const v = parseInt(localStorage.getItem(k) || "0", 10);
    stats[k] = Number.isFinite(v) ? v : 0;
  });
  renderScore();
}

function saveStats() {
  Object.entries(stats).forEach(([k, v]) => localStorage.setItem(k, String(v)));
  renderScore();
}

function renderScore() {
  elWinsSwap.textContent = stats.wins_swap;
  elWinsStay.textContent = stats.wins_stay;
  elLossesSwap.textContent = stats.losses_swap;
  elLossesStay.textContent = stats.losses_stay;
  elGames.textContent = stats.games_total;
}

function hostReveal(prizeDoor, pickedDoor) {
  const pool = [1, 2, 3].filter((d) => d !== pickedDoor && d !== prizeDoor);
  if (pickedDoor === prizeDoor) {
    return pool[Math.floor(Math.random() * pool.length)];
  }
  return pool[0];
}

function remainingDoor(peek, pickedDoor) {
  return [1, 2, 3].find((d) => d !== peek && d !== pickedDoor);
}

function selectDoor(el) {
  doors.forEach((d) => {
    d.classList.remove("is-selected");
    d.setAttribute("aria-selected", "false");
  });
  el.classList.add("is-selected");
  el.setAttribute("aria-selected", "true");
}

function openEmpty(el, markRevealed = false) {
  el.classList.remove("open--money");
  el.classList.add("open--empty");
  if (markRevealed) el.classList.add("revealed");
}

function openMoney(el) {
  el.classList.remove("open--empty", "revealed");
  el.classList.add("open--money");
}

function doorByNum(n) {
  return document.getElementById(String(n));
}

function setMessage(msg) {
  output.innerHTML = msg;
}

function removeListeners() {
  doors.forEach((d) => {
    d.removeEventListener("click");
  });
}

function addPlayAgain() {
  const existing = document.getElementById("play-again");
  if (existing) existing.remove();
  const btn = document.createElement("button");
  const div = document.getElementById("play-again-btn");
  btn.id = "play-again";
  btn.className = "btn btn-primary";
  btn.textContent = "Play Again";
  btn.addEventListener("click", resetGame);
  div.appendChild(btn);
}

function endRound(win, swapped) {
  if (swapped) {
    if (win) stats.wins_swap += 1;
    else stats.losses_swap += 1;
  } else {
    if (win) stats.wins_stay += 1;
    else stats.losses_stay += 1;
  }
  stats.games_total += 1;
  saveStats();
  addPlayAgain();
  gameOver = true;
}

function resetGame() {
  doors.forEach((d) => {
    d.setAttribute("aria-selected", "false");
    d.classList.remove("open--empty", "open--money", "is-selected", "revealed");
  });
  stage = 0;
  prize = randDoor();
  picked = null;
  revealed = null;
  gameOver = false;
  setMessage("Pick any door.");
  const btn = document.getElementById("play-again");
  if (btn) btn.remove();
  doors.forEach((d) => {
    d.addEventListener("click", () => {
      if (gameOver) return;
      const id = parseInt(d.id, 10);

      if (stage === 0) {
        picked = id;
        revealed = hostReveal(prize, picked);
        selectDoor(d);
        openEmpty(doorByNum(revealed), true);
        const other = remainingDoor(revealed, picked);
        setMessage(
          `Click your original door to stay on ${picked}, or click door ${other} to swap.`,
        );
        stage = 1;
        return;
      }

      if (stage === 1) {
        if (id === revealed) return;
        const swapped = id !== picked;
        const chosenEl = doorByNum(id);
        if (id === prize) {
          openMoney(chosenEl);
          setMessage("You win!");
          endRound(true, swapped);
        } else {
          openEmpty(chosenEl);
          doorByNum(prize).classList.add("open--money");
          setMessage(`You lose. The prize was behind door ${prize}.`);
          endRound(false, swapped);
        }
        return;
      }
    });
  });
}

toggleScoreBtn.addEventListener("click", () => {
  const hidden = scoreboard.classList.toggle("is-hidden");
  toggleScoreBtn.textContent = hidden ? "Show Scoreboard" : "Hide Scoreboard";
});
resetGame();
loadStats();
setMessage("Pick any door.");
