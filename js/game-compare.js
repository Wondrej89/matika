// js/game-compare.js
import { setTowerProgress } from './reward.js';

let maxLevels = 10;
let currentLevel = 1;
let score = 0;
let maxValue = 10;

let answered = false;
let selectedSign = null;
let correctSign = null;
let callbacks = { onBackToMenu: null };

// DOM prvky
let compareLevelSpan, compareScoreSpan, compareRangeLabel;
let leftShapesEl, rightShapesEl, operatorEl;
let signPickerEl, checkBtn, nextBtn;
let feedbackEl, summaryEl, finalScoreEl;
let restartBtn, backBtn;

export function initCompareGame(options = {}) {
  callbacks.onBackToMenu = options.onBackToMenu || null;

  compareLevelSpan = document.getElementById('compareLevel');
  compareScoreSpan = document.getElementById('compareScore');
  compareRangeLabel = document.getElementById('compareRangeLabel');
  leftShapesEl = document.getElementById('compareLeftShapes');
  rightShapesEl = document.getElementById('compareRightShapes');
  operatorEl = document.getElementById('compareOperator');
  signPickerEl = document.getElementById('signPicker');
  checkBtn = document.getElementById('checkCompareBtn');
  nextBtn = document.getElementById('nextCompareBtn');
  feedbackEl = document.getElementById('feedbackCompare');
  summaryEl = document.getElementById('summaryCompare');
  finalScoreEl = document.getElementById('finalScoreCompare');
  restartBtn = document.getElementById('restartCompareBtn');
  backBtn = document.getElementById('backCompareBtn');

  createSignPicker();

  checkBtn.addEventListener('click', onCheckClick);
  nextBtn.addEventListener('click', onNextClick);
  restartBtn.addEventListener('click', () => {
    startCompareGame(maxValue);
  });
  backBtn.addEventListener('click', () => {
    if (callbacks.onBackToMenu) callbacks.onBackToMenu();
  });
}

export function startCompareGame(range = 10) {
  maxValue = range;
  currentLevel = 1;
  score = 0;
  compareScoreSpan.textContent = score;
  compareLevelSpan.textContent = currentLevel;
  compareRangeLabel.textContent = maxValue;
  summaryEl.hidden = true;

  generateProblem();
}

function createSignPicker() {
  signPickerEl.innerHTML = '';
  const signs = ['<', '>', '='];

  signs.forEach(sign => {
    const btn = document.createElement('button');
    btn.textContent = sign;
    btn.className = 'sign-btn';
    btn.dataset.sign = sign;
    btn.addEventListener('click', () => {
      if (answered) return;
      selectSign(sign, btn);
    });
    signPickerEl.appendChild(btn);
  });
}

function selectSign(sign, btn) {
  selectedSign = sign;
  document.querySelectorAll('#signPicker .sign-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  operatorEl.textContent = sign;
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
  selectedSign = null;
  checkBtn.disabled = true;
  nextBtn.disabled = true;
  feedbackEl.textContent = '';
  feedbackEl.className = 'feedback';
  operatorEl.textContent = '?';

  document.querySelectorAll('#signPicker .sign-btn').forEach(b => b.classList.remove('selected'));

  const a = Math.floor(Math.random() * (maxValue + 1));
  const b = Math.floor(Math.random() * (maxValue + 1));

  if (a > b) correctSign = '>';
  else if (a < b) correctSign = '<';
  else correctSign = '=';

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
  if (answered || selectedSign === null) return;
  answered = true;

  checkBtn.disabled = true;
  nextBtn.disabled = false;

  if (selectedSign === correctSign) {
    score++;
    compareScoreSpan.textContent = score;
    setTowerProgress(score); 
    feedbackEl.textContent = 'Správně! 🎉';
    feedbackEl.className = 'feedback correct';
  } else {
    feedbackEl.textContent = `Škoda, správně je „${correctSign}“.`;
    feedbackEl.className = 'feedback wrong';
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
    compareLevelSpan.textContent = currentLevel;
    generateProblem();
  }
}

function showSummary() {
  summaryEl.hidden = false;
  finalScoreEl.textContent = `${score}`;
  nextBtn.disabled = true;
  checkBtn.disabled = true;
}
