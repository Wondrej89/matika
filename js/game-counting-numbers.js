// js/game-counting-numbers.js
import { setTowerProgress } from './reward.js';

let maxLevels = 10;
let currentLevel = 1;
let score = 0;
let correctResult = null;
let selectedAnswer = null;
let answered = false;
let maxValue = 10;
let callbacks = { onBackToMenu: null };

// DOM prvky
let levelSpan, scoreSpan, rangeLabel;
let leftNumberEl, rightNumberEl, operatorEl, resultPlaceholder;
let numberPickerEl, checkBtn, nextBtn;
let feedbackEl, summaryEl, finalScoreEl;
let restartBtn, backBtn;

export function initCountingNumbersGame(options = {}) {
  callbacks.onBackToMenu = options.onBackToMenu || null;

  levelSpan = document.getElementById('levelNum');
  scoreSpan = document.getElementById('scoreNum');
  rangeLabel = document.getElementById('rangeLabelNum');

  leftNumberEl = document.getElementById('leftNumberNum');
  rightNumberEl = document.getElementById('rightNumberNum');
  operatorEl = document.getElementById('operatorNum');
  resultPlaceholder = document.getElementById('resultPlaceholderNum');
  numberPickerEl = document.getElementById('numberPickerNum');
  checkBtn = document.getElementById('checkNumBtn');
  nextBtn = document.getElementById('nextNumBtn');
  feedbackEl = document.getElementById('feedbackNum');
  summaryEl = document.getElementById('summaryNum');
  finalScoreEl = document.getElementById('finalScoreNum');
  restartBtn = document.getElementById('restartNumBtn');
  backBtn = document.getElementById('backNumBtn');

  checkBtn.addEventListener('click', onCheckClick);
  nextBtn.addEventListener('click', onNextClick);
  restartBtn.addEventListener('click', () => {
    startNumbersGame(maxValue);
  });
  backBtn.addEventListener('click', () => {
    if (callbacks.onBackToMenu) callbacks.onBackToMenu();
  });
}

export function startNumbersGame(range) {
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
  document.querySelectorAll('#numberPickerNum .num-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  resultPlaceholder.textContent = value;
  checkBtn.disabled = false;
  feedbackEl.textContent = '';
  feedbackEl.className = 'feedback';
}

function generateProblem() {
  answered = false;
  selectedAnswer = null;
  checkBtn.disabled = true;
  nextBtn.disabled = true;
  feedbackEl.textContent = '';
  feedbackEl.className = 'feedback';
  resultPlaceholder.textContent = '?';
  resultPlaceholder.classList.remove('animate-correct', 'animate-wrong');

  document.querySelectorAll('#numberPickerNum .num-btn').forEach(b => b.classList.remove('selected'));

  const isAddition = Math.random() < 0.5;

  let a, b, result;

if (isAddition) {
  // 10 % případů dovolíme nulu
  const allowZero = Math.random() < 0.1;

  // základní hodnota a,b bez nul
  a = Math.floor(Math.random() * (maxValue - 1)) + 1; // 1..maxValue-1
  const maxB = maxValue - a;
  b = Math.floor(Math.random() * maxB) + 1; // 1..maxB
  result = a + b;

  // v 10 % případů náhodně vložíme nulu na jednu stranu (ale ne obě)
  if (allowZero) {
    if (Math.random() < 0.5) {
      a = 0;
    } else {
      b = 0;
    }
    result = a + b;
  }

  operatorEl.textContent = '+';
} else {
  // 10 % případů dovolíme nulu
  const allowZero = Math.random() < 0.1;

  // výchozí stav bez nul
  a = Math.floor(Math.random() * (maxValue - 1)) + 1; // 1..maxValue-1
  b = Math.floor(Math.random() * a); // 0..a-1
  if (b === 0) b = 1;
  result = a - b;
  if (result === 0) {
    result = 1;
    b = a - 1;
  }

  // v 10 % případů povolíme nulu, ale jen tak, aby výsledek nebyl záporný
  if (allowZero) {
    if (Math.random() < 0.5) {
      b = 0; // např. 7 − 0
      result = a;
    } else {
      // zkusíme mít výsledek 0 (např. 5 − 5)
      b = a;
      result = 0;
    }
  }

  operatorEl.textContent = '−';
}


  correctResult = result;

  leftNumberEl.textContent = a;
  rightNumberEl.textContent = b;
}

function onCheckClick() {
  if (answered || selectedAnswer === null) return;
  answered = true;

  checkBtn.disabled = true;
  nextBtn.disabled = false;

  if (selectedAnswer === correctResult) {
    score++;
    scoreSpan.textContent = score;
    setTowerProgress(score); 
    feedbackEl.textContent = 'Správně! 🎉';
    feedbackEl.className = 'feedback correct';
    resultPlaceholder.classList.add('animate-correct');
  } else {
    feedbackEl.textContent = `Škoda, správný výsledek je ${correctResult}.`;
    feedbackEl.className = 'feedback wrong';
    resultPlaceholder.classList.add('animate-wrong');
    resultPlaceholder.textContent = selectedAnswer;
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
