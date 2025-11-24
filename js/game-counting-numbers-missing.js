// js/game-counting-numbers-missing.js
import { setTowerProgress } from './reward.js';

let maxLevels = 10;
let currentLevel = 1;
let score = 0;
let maxValue = 10;

let answered = false;
let selectedAnswer = null;
let correctMissing = null;
let missingLeft = true;   // true = chybí levý operand, false = pravý
let isAddition = true;

let callbacks = { onBackToMenu: null };

// DOM
let levelSpan, scoreSpan, rangeLabel;
let leftNumEl, rightNumEl, resultEl, operatorEl;
let numberPickerEl, checkBtn, nextBtn;
let feedbackEl, summaryEl, finalScoreEl;
let restartBtn, backBtn;

export function initCountingNumbersMissingGame(options = {}) {
  callbacks.onBackToMenu = options.onBackToMenu || null;

  levelSpan = document.getElementById('levelNumMiss');
  scoreSpan = document.getElementById('scoreNumMiss');
  rangeLabel = document.getElementById('rangeLabelNumMiss');

  leftNumEl   = document.getElementById('missLeftNum');
  rightNumEl  = document.getElementById('missRightNum');
  resultEl    = document.getElementById('missResultNum');
  operatorEl  = document.getElementById('missOperator');

  numberPickerEl = document.getElementById('numberPickerNumMiss');
  checkBtn  = document.getElementById('checkNumMissBtn');
  nextBtn   = document.getElementById('nextNumMissBtn');
  feedbackEl = document.getElementById('feedbackNumMiss');
  summaryEl  = document.getElementById('summaryNumMiss');
  finalScoreEl = document.getElementById('finalScoreNumMiss');
  restartBtn = document.getElementById('restartNumMissBtn');
  backBtn    = document.getElementById('backNumMissBtn');

  checkBtn.addEventListener('click', onCheckClick);
  nextBtn.addEventListener('click', onNextClick);
  restartBtn.addEventListener('click', () => startNumbersMissingGame(maxValue));
  backBtn.addEventListener('click', () => { if (callbacks.onBackToMenu) callbacks.onBackToMenu(); });
}

export function startNumbersMissingGame(range = 10) {
  maxValue = range;
  currentLevel = 1;
  score = 0;
  scoreSpan.textContent = score;
  levelSpan.textContent = currentLevel;
  rangeLabel.textContent = maxValue;
  summaryEl.hidden = true;

  createNumberPicker();
  generateProblem();
}

function createNumberPicker() {
  numberPickerEl.innerHTML = '';
  for (let i = 0; i <= maxValue; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.className = 'num-btn';
    btn.dataset.value = i;
    btn.addEventListener('click', () => {
      if (answered) return;
      selectNumber(i, btn);
    });
    numberPickerEl.appendChild(btn);
  }
}

function selectNumber(value, btn) {
  selectedAnswer = value;
  document.querySelectorAll('#numberPickerNumMiss .num-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');

  if (missingLeft) {
    leftNumEl.textContent = value;
  } else {
    rightNumEl.textContent = value;
  }

  checkBtn.disabled = false;
  feedbackEl.textContent = '';
  feedbackEl.className = 'feedback';
}

function generateProblem() {
  answered = false;
  selectedAnswer = null;
  correctMissing = null;

  checkBtn.disabled = true;
  nextBtn.disabled = true;
  feedbackEl.textContent = '';
  feedbackEl.className = 'feedback';

  document.querySelectorAll('#numberPickerNumMiss .num-btn').forEach(b => b.classList.remove('selected'));

  // Náhodně: + nebo −, a chybí levý/pravy operand
  isAddition = Math.random() < 0.5;
  missingLeft = Math.random() < 0.5;
  operatorEl.textContent = isAddition ? '+' : '−';

  let a, b, r;

  if (isAddition) {
    // Chceme A + B = R, 0<=A,B,R<=maxValue
    // Snadné: vybereme R a jeden operand, druhý dopočítáme.
    r = randInt(0, maxValue);
    const knownIsLeft = !missingLeft; // pokud chybí levý, známý je pravý; a naopak
    if (knownIsLeft) {
      // známý A, chybí B
      a = randInt(0, r);
      b = r - a; // 0..max
      leftNumEl.textContent = a;
      rightNumEl.textContent = '_';
      correctMissing = b;
    } else {
      // známý B, chybí A
      b = randInt(0, r);
      a = r - b;
      leftNumEl.textContent = '_';
      rightNumEl.textContent = b;
      correctMissing = a;
    }
  } else {
    // Chceme A − B = R, 0<=R<=maxValue, 0<=B<=maxValue, A=B+R <= maxValue
    r = randInt(0, maxValue);
    b = randInt(0, maxValue - r);
    a = b + r;

    if (missingLeft) {
      // _ − B = R → chybí A
      leftNumEl.textContent = '_';
      rightNumEl.textContent = b;
      correctMissing = a; // A = B + R
    } else {
      // A − _ = R → chybí B
      leftNumEl.textContent = a;
      rightNumEl.textContent = '_';
      correctMissing = b;
    }
  }

  resultEl.textContent = r;
}

function onCheckClick() {
  if (answered || selectedAnswer === null) return;
  answered = true;

  checkBtn.disabled = true;
  nextBtn.disabled = false;

  if (selectedAnswer === correctMissing) {
    score++;
    scoreSpan.textContent = score;
    setTowerProgress(score);
    feedbackEl.textContent = 'Správně! 🎉';
    feedbackEl.className = 'feedback correct';
  } else {
    feedbackEl.textContent = `Škoda, správná odpověď je ${correctMissing}.`;
    feedbackEl.className = 'feedback wrong';
    // doplníme správnou hodnotu
    if (missingLeft) {
      leftNumEl.textContent = correctMissing;
    } else {
      rightNumEl.textContent = correctMissing;
    }
  }

  if (currentLevel === maxLevels) {
    nextBtn.textContent = 'Zobrazit výsledek';
  } else {
    nextBtn.textContent = 'Další příklad';
  }
}

function onNextClick() {
  if (!answered) return;

  if (currentLevel === maxLevels) {
    showSummary();
  } else {
    currentLevel++;
    levelSpan.textContent = currentLevel;
    generateProblem();
  }
}

function showSummary() {
  summaryEl.hidden = false;
  finalScoreEl.textContent = `${score}`;
  nextBtn.disabled = true;
  checkBtn.disabled = true;
}

function randInt(min, max) {
  // včetně obou krajů
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
