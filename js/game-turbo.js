// js/game-turbo.js

let score = 0;
let level = 1;              // úroveň obtížnosti
let maxValue = 2;           // aktuální max výsledek/číslo
const maxValueCap = 20;
const questionsPerStep = 5; // každých 5 příkladů zvýšíme obtížnost
const baseTimeMs = 8000;    // čas na příklad v ms

let questionCount = 0;
let currentAnswer = null;
let timerId = null;
let timeStart = 0;
let timeLimitMs = baseTimeMs;

let lives = 3;
let isGameOver = false;

let aEl, bEl, opEl, qmEl;
let scoreEl, levelEl, livesEl;
let timerFillEl;
let row1El, row2El;
let feedbackEl;
let screenEl;

// Game over modal
let gameOverModalEl, turboFinalScoreEl, turboRetryBtn, turboQuitBtn;

let callbacks = { onBackToMenu: null };

export function initTurboGame(options = {}) {
  callbacks.onBackToMenu = options.onBackToMenu || null;

  screenEl = document.getElementById('gameScreenTurbo');

  scoreEl = document.getElementById('turboScore');
  levelEl = document.getElementById('turboLevel');
  livesEl = document.getElementById('turboLives');
  timerFillEl = document.getElementById('turboTimerFill');

  aEl = document.getElementById('turboA');
  bEl = document.getElementById('turboB');
  opEl = document.getElementById('turboOp');
  qmEl = document.getElementById('turboQuestionMark');

  row1El = document.getElementById('turboRow1');
  row2El = document.getElementById('turboRow2');
  feedbackEl = document.getElementById('turboFeedback');

  // game over modal
  gameOverModalEl = document.getElementById('turboGameOverModal');
  turboFinalScoreEl = document.getElementById('turboFinalScore');
  turboRetryBtn = document.getElementById('turboRetryBtn');
  turboQuitBtn = document.getElementById('turboQuitBtn');

  turboRetryBtn.addEventListener('click', () => {
    hideGameOver();
    startTurboGame();
  });

  turboQuitBtn.addEventListener('click', () => {
    hideGameOver();
    if (callbacks.onBackToMenu) callbacks.onBackToMenu();
  });

  // volitelné: klik na backdrop zavře also (ale tady asi nechceme, nechám to čisté)
  // gameOverModalEl.addEventListener('click', (e) => {
  //   if (e.target === gameOverModalEl || e.target.classList.contains('modal-backdrop')) {
  //     hideGameOver();
  //   }
  // });

  createNumberButtons();
}

export function startTurboGame() {
  // reset stavu
  score = 0;
  level = 1;
  maxValue = 2;
  questionCount = 0;
  timeLimitMs = baseTimeMs;
  lives = 3;
  isGameOver = false;

  scoreEl.textContent = score;
  levelEl.textContent = level;
  feedbackEl.textContent = '';
  updateLivesDisplay();

  updateRowsVisibility();
  resetButtonStates();
  nextQuestion();
}

function createNumberButtons() {
  // řádek 0–10
  row1El.innerHTML = '';
  for (let i = 0; i <= 10; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.className = 'num-btn';
    btn.dataset.value = i;
    btn.addEventListener('click', () => handleAnswerClick(i, btn));
    row1El.appendChild(btn);
  }

  // řádek 11–20
  row2El.innerHTML = '';
  for (let i = 11; i <= 20; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.className = 'num-btn';
    btn.dataset.value = i;
    btn.addEventListener('click', () => handleAnswerClick(i, btn));
    row2El.appendChild(btn);
  }
}

function updateRowsVisibility() {
  // druhý řádek se zobrazí, jakmile obtížnost dovolí dvouciferná čísla
  if (maxValue > 10) {
    row2El.hidden = false;
  } else {
    row2El.hidden = true;
  }
}

function resetButtonStates() {
  screenEl.querySelectorAll('.num-btn').forEach(btn => {
    btn.disabled = false;
    btn.classList.remove('correct', 'wrong');
  });
}

function nextQuestion() {
  if (isGameOver) return;

  clearTimer();

  questionCount++;
  // každých 5 příkladů zvýšíme obtížnost
  if ((questionCount - 1) > 0 && (questionCount - 1) % questionsPerStep === 0) {
    increaseDifficulty();
  }

  const problem = generateProblem();
  aEl.textContent = problem.a;
  bEl.textContent = problem.b;
  opEl.textContent = problem.op;
  qmEl.textContent = '?';

  currentAnswer = problem.result;
  feedbackEl.textContent = '';

  screenEl.classList.remove('locked');
  resetButtonStates();
  startTimer();
}

function generateProblem() {
  const op = Math.random() < 0.5 ? '+' : '−';
  let a, b, r;

  if (op === '+') {
    // vybereme výsledek a a,b tak, aby r <= maxValue
    r = randInt(0, maxValue);
    a = randInt(0, r);
    b = r - a;
  } else {
    // A - B = R; 0 <= R <= maxValue; A <= maxValue
    r = randInt(0, maxValue);
    b = randInt(0, maxValue - r);
    a = b + r;
  }

  return { a, b, op, result: r };
}

function handleAnswerClick(value, btn) {
  if (isGameOver) return;
  if (currentAnswer === null) return;
  // odpověď jen jednou
  if (screenEl.classList.contains('locked')) return;

  screenEl.classList.add('locked');
  clearTimer();

  const correct = value === currentAnswer;

  if (correct) {
    score++;
    scoreEl.textContent = score;
    btn.classList.add('correct');
    feedbackEl.textContent = 'Správně! 🎉';
  } else {
    btn.classList.add('wrong');
    feedbackEl.textContent = `Špatně, správná odpověď byla ${currentAnswer}.`;
    // zvýraznit správné tlačítko
    highlightCorrectButton();
    loseLife();
    if (isGameOver) return;
  }

  // po krátké pauze další příklad
  setTimeout(() => {
    nextQuestion();
  }, 800);
}

function startTimer() {
  timeStart = performance.now();
  timerFillEl.style.transform = 'scaleX(1)';

  clearTimer();
  timerId = requestAnimationFrame(tickTimer);
}

function tickTimer(now) {
  if (isGameOver) {
    clearTimer();
    return;
  }

  const elapsed = now - timeStart;
  const ratio = 1 - elapsed / timeLimitMs;

  if (ratio <= 0) {
    timerFillEl.style.transform = 'scaleX(0)';
    // čas vypršel, odpověď špatně
    handleTimeout();
    return;
  }

  timerFillEl.style.transform = `scaleX(${ratio})`;
  timerId = requestAnimationFrame(tickTimer);
}

function handleTimeout() {
  if (isGameOver) return;
  if (screenEl.classList.contains('locked')) return;
  screenEl.classList.add('locked');

  feedbackEl.textContent = `Čas vypršel, správná odpověď byla ${currentAnswer}.`;
  highlightCorrectButton();
  loseLife();
  if (isGameOver) return;

  setTimeout(() => {
    nextQuestion();
  }, 900);
}

function clearTimer() {
  if (timerId !== null) {
    cancelAnimationFrame(timerId);
    timerId = null;
  }
}

function increaseDifficulty() {
  // každých 5 příkladů zvedneme maxValue o 2 až do 20
  maxValue = Math.min(maxValueCap, maxValue + 2);
  level++;
  levelEl.textContent = level;
  updateRowsVisibility();
  launchConfetti();
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function highlightCorrectButton() {
  screenEl.querySelectorAll('.num-btn').forEach(b => {
    if (parseInt(b.dataset.value, 10) === currentAnswer) {
      b.classList.add('correct');
    }
  });
}

function loseLife() {
  lives--;
  updateLivesDisplay();
  if (lives <= 0) {
    gameOver();
  }
}

function updateLivesDisplay() {
  const full = '❤️'.repeat(Math.max(0, lives));
  const empty = '🤍'.repeat(Math.max(0, 3 - lives));
  livesEl.textContent = full + empty;
}

function gameOver() {
  isGameOver = true;
  clearTimer();
  screenEl.classList.add('locked');
  showGameOver();
}

function showGameOver() {
  turboFinalScoreEl.textContent = score;
  gameOverModalEl.hidden = false;
}

function hideGameOver() {
  gameOverModalEl.hidden = true;
  isGameOver = false;
}

// jednoduchý konfeti efekt – používá .celebration-overlay a .confetti z CSS
function launchConfetti() {
  // pokud už běží, znovu nespouštěj
  if (document.querySelector('.celebration-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'celebration-overlay';
  document.body.appendChild(overlay);

  const colors = ['#ff6b6b', '#ffd93b', '#6bcb77', '#4f8cff', '#a66bff', '#ff9f1c'];
  const confettiCount = 90;

  for (let i = 0; i < confettiCount; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti';

    const left = Math.random() * 100;
    const delay = Math.random() * 0.8;
    const duration = 1.8 + Math.random() * 1.0;
    const color = colors[Math.floor(Math.random() * colors.length)];

    piece.style.left = `${left}vw`;
    piece.style.backgroundColor = color;
    piece.style.animationDuration = `${duration}s`;
    piece.style.animationDelay = `${delay}s`;

    overlay.appendChild(piece);
  }

  setTimeout(() => {
    overlay.remove();
  }, 3200);
}
