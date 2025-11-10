// js/game-counting.js
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
let leftShapesEl, rightShapesEl, operatorEl, resultPlaceholder;
let numberPickerEl, checkBtn, nextBtn;
let feedbackEl, summaryEl, finalScoreEl;
let restartBtn, backBtn;

export function initCountingGame(options = {}) {
  callbacks.onBackToMenu = options.onBackToMenu || null;

  levelSpan = document.getElementById('level');
  scoreSpan = document.getElementById('score');
  rangeLabel = document.getElementById('rangeLabel');

  leftShapesEl = document.getElementById('leftShapes');
  rightShapesEl = document.getElementById('rightShapes');
  operatorEl = document.getElementById('operator');
  resultPlaceholder = document.getElementById('resultPlaceholder');
  numberPickerEl = document.getElementById('numberPicker');
  checkBtn = document.getElementById('checkBtn');
  nextBtn = document.getElementById('nextBtn');
  feedbackEl = document.getElementById('feedback');
  summaryEl = document.getElementById('summary');
  finalScoreEl = document.getElementById('finalScore');
  restartBtn = document.getElementById('restartBtn');
  backBtn = document.getElementById('backBtn');

  checkBtn.addEventListener('click', onCheckClick);
  nextBtn.addEventListener('click', onNextClick);
  restartBtn.addEventListener('click', () => {
    startNewGame(maxValue);
  });
  backBtn.addEventListener('click', () => {
    if (callbacks.onBackToMenu) callbacks.onBackToMenu();
  });
}

export function startNewGame(range) {
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
  document.querySelectorAll('#numberPicker .num-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  resultPlaceholder.textContent = value;
  checkBtn.disabled = false;
  feedbackEl.textContent = '';
  feedbackEl.className = 'feedback';
}

function drawShapes(container, count, type, color) {
  container.innerHTML = '';
  container.style.gridTemplateColumns = '';
  if (count === 0) {
    return;
  }
  let cols = Math.ceil(Math.sqrt(count));
  if (cols > 5) cols = 5;
  container.style.gridTemplateColumns = `repeat(${cols}, 18px)`;

  for (let i = 0; i < count; i++) {
    const s = document.createElement('div');
    s.className = 'shape';
    if (type !== 'square') {
      s.classList.add(`shape--${type}`);
    }
    s.style.setProperty('--shape-color', color);
    container.appendChild(s);
  }
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

  document.querySelectorAll('#numberPicker .num-btn').forEach(b => b.classList.remove('selected'));

  const isAddition = Math.random() < 0.5;
  const allowZero = Math.random() < 0.1; // jen 10 % všech příkladů může mít nulu

  let a, b, result;

  if (isAddition) {
    if (!allowZero) {
      // BEZ NUL: a >= 1, b >= 1, a + b <= maxValue
      a = Math.floor(Math.random() * (maxValue - 1)) + 1; // 1..maxValue-1
      let maxB = maxValue - a; // aspoň 1
      if (maxB < 1) maxB = 1;
      b = Math.floor(Math.random() * maxB) + 1; // 1..maxB
      result = a + b;
    } else {
      // S NULOU: jedna strana je 0, druhá 1..maxValue
      const zeroOnLeft = Math.random() < 0.5;
      if (zeroOnLeft) {
        a = 0;
        b = Math.floor(Math.random() * maxValue) + 1; // 1..maxValue
      } else {
        b = 0;
        a = Math.floor(Math.random() * maxValue) + 1;
      }
      result = a + b; // vždy > 0
    }
    operatorEl.textContent = '+';
  } else {
    if (!allowZero) {
      // BEZ NUL: a > b >= 1, výsledek >= 1
      a = Math.floor(Math.random() * (maxValue - 1)) + 2; // 2..maxValue
      const maxB = a - 1; // min 1
      b = Math.floor(Math.random() * maxB) + 1; // 1..a-1
      result = a - b; // 1..a-1
    } else {
      // S NULOU: buď b = 0 (výsledek = a), nebo výsledek = 0 (a = b)
      a = Math.floor(Math.random() * maxValue) + 1; // 1..maxValue
      if (Math.random() < 0.5) {
        // např. 7 − 0
        b = 0;
        result = a;
      } else {
        // např. 5 − 5 = 0
        b = a;
        result = 0;
      }
    }
    operatorEl.textContent = '−';
  }

  correctResult = result;

  const shapeTypes = ['square', 'circle', 'diamond', 'rounded'];
  const colors = ['#4f8cff', '#ff6b6b', '#ffd93b', '#6bcb77', '#a66bff'];

  const leftType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
  const rightType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
  const leftColor = colors[Math.floor(Math.random() * colors.length)];
  const rightColor = colors[Math.floor(Math.random() * colors.length)];

  drawShapes(leftShapesEl, a, leftType, leftColor);
  drawShapes(rightShapesEl, b, rightType, rightColor);
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
