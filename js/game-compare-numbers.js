// js/game-compare-numbers.js
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
let leftNumberEl, rightNumberEl, operatorEl;
let signPickerEl, checkBtn, nextBtn;
let feedbackEl, summaryEl, finalScoreEl;
let restartBtn, backBtn;

export function initCompareNumbersGame(options = {}) {
  callbacks.onBackToMenu = options.onBackToMenu || null;

  compareLevelSpan = document.getElementById('compareLevelNum');
  compareScoreSpan = document.getElementById('compareScoreNum');
  compareRangeLabel = document.getElementById('compareRangeLabelNum');
  leftNumberEl = document.getElementById('compareLeftNumberNum');
  rightNumberEl = document.getElementById('compareRightNumberNum');
  operatorEl = document.getElementById('compareOperatorNum');
  signPickerEl = document.getElementById('signPickerNum');
  checkBtn = document.getElementById('checkCompareNumBtn');
  nextBtn = document.getElementById('nextCompareNumBtn');
  feedbackEl = document.getElementById('feedbackCompareNum');
  summaryEl = document.getElementById('summaryCompareNum');
  finalScoreEl = document.getElementById('finalScoreCompareNum');
  restartBtn = document.getElementById('restartCompareNumBtn');
  backBtn = document.getElementById('backCompareNumBtn');

  createSignPicker();

  checkBtn.addEventListener('click', onCheckClick);
  nextBtn.addEventListener('click', onNextClick);
  restartBtn.addEventListener('click', () => {
    startCompareNumbersGame(maxValue);
  });
  backBtn.addEventListener('click', () => {
    if (callbacks.onBackToMenu) callbacks.onBackToMenu();
  });
}

export function startCompareNumbersGame(range = 10) {
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
  document.querySelectorAll('#signPickerNum .sign-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  operatorEl.textContent = sign;
  checkBtn.disabled = false;
  feedbackEl.textContent = '';
  feedbackEl.className = 'feedback';
}

function generateProblem() {
  answered = false;
  selectedSign = null;
  checkBtn.disabled = true;
  nextBtn.disabled = true;
  feedbackEl.textContent = '';
  feedbackEl.className = 'feedback';
  operatorEl.textContent = '?';

  document.querySelectorAll('#signPickerNum .sign-btn').forEach(b => b.classList.remove('selected'));

  const a = Math.floor(Math.random() * (maxValue + 1));
  const b = Math.floor(Math.random() * (maxValue + 1));

  if (a > b) correctSign = '>';
  else if (a < b) correctSign = '<';
  else correctSign = '=';

  leftNumberEl.textContent = a;
  rightNumberEl.textContent = b;
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
