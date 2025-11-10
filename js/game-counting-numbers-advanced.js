// js/game-counting-numbers-advanced.js

import { setTowerProgress } from './reward.js';

let maxLevels = 10;
let currentLevel = 1;
let score = 0;
let maxValue = 20;

let answered = false;
let selectedAnswer = null;
let correctMissing = null;
let missingIndex = null; // 0 = a, 1 = b, 2 = c, 3 = result
let callbacks = { onBackToMenu: null };

// DOM prvky
let levelSpan, scoreSpan, rangeLabel;
let numAEl, numBEl, numCEl, numResultEl;
let op1El, op2El;
let numberPickerEl, checkBtn, nextBtn;
let feedbackEl, summaryEl, finalScoreEl;
let restartBtn, backBtn;

export function initCountingNumbersAdvancedGame(options = {}) {
  callbacks.onBackToMenu = options.onBackToMenu || null;

  levelSpan = document.getElementById('levelNumAdv');
  scoreSpan = document.getElementById('scoreNumAdv');
  rangeLabel = document.getElementById('rangeLabelNumAdv');

  numAEl = document.getElementById('numAdvA');
  numBEl = document.getElementById('numAdvB');
  numCEl = document.getElementById('numAdvC');
  numResultEl = document.getElementById('numAdvResult');
  op1El = document.getElementById('operatorNumAdv1');
  op2El = document.getElementById('operatorNumAdv2');

  numberPickerEl = document.getElementById('numberPickerNumAdv');
  checkBtn = document.getElementById('checkNumAdvBtn');
  nextBtn = document.getElementById('nextNumAdvBtn');
  feedbackEl = document.getElementById('feedbackNumAdv');
  summaryEl = document.getElementById('summaryNumAdv');
  finalScoreEl = document.getElementById('finalScoreNumAdv');
  restartBtn = document.getElementById('restartNumAdvBtn');
  backBtn = document.getElementById('backNumAdvBtn');

  checkBtn.addEventListener('click', onCheckClick);
  nextBtn.addEventListener('click', onNextClick);
  restartBtn.addEventListener('click', () => {
    startNumbersAdvancedGame(maxValue);
  });
  backBtn.addEventListener('click', () => {
    if (callbacks.onBackToMenu) callbacks.onBackToMenu();
  });
}

export function startNumbersAdvancedGame(range = 20) {
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
  document.querySelectorAll('#numberPickerNumAdv .num-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');

  // doplnit vybranou hodnotu na správné místo
  const displayValue = value;
  if (missingIndex === 0) {
    numAEl.textContent = displayValue;
  } else if (missingIndex === 1) {
    numBEl.textContent = displayValue;
  } else if (missingIndex === 2) {
    numCEl.textContent = displayValue;
  } else if (missingIndex === 3) {
    numResultEl.textContent = displayValue;
  }

  checkBtn.disabled = false;
  feedbackEl.textContent = '';
  feedbackEl.className = 'feedback';
}

function generateProblem() {
  answered = false;
  selectedAnswer = null;
  correctMissing = null;
  missingIndex = null;

  checkBtn.disabled = true;
  nextBtn.disabled = true;
  feedbackEl.textContent = '';
  feedbackEl.className = 'feedback';

  document.querySelectorAll('#numberPickerNumAdv .num-btn').forEach(b => b.classList.remove('selected'));

  // vygenerujeme nejdřív kompletní výraz: a op1 b op2 c = result
  const ops = ['+', '-'];

  // op1, op2 náhodně
  const op1 = ops[Math.floor(Math.random() * ops.length)];
  const op2 = ops[Math.floor(Math.random() * ops.length)];
  op1El.textContent = op1;
  op2El.textContent = op2;

  let a, b, c, result;

  // 1) a a b tak, aby 0 <= a (op1) b <= maxValue
  a = Math.floor(Math.random() * (maxValue + 1)); // 0..max
  let temp1;
  if (op1 === '+') {
    const maxB = maxValue - a;
    b = Math.floor(Math.random() * (maxB + 1)); // 0..maxB
    temp1 = a + b;
  } else {
    b = Math.floor(Math.random() * (a + 1)); // 0..a
    temp1 = a - b;
  }

  // 2) temp1 a c tak, aby 0 <= (temp1 op2 c) <= maxValue
  let temp2;
  if (op2 === '+') {
    const maxC = maxValue - temp1;
    c = Math.floor(Math.random() * (maxC + 1)); // 0..maxC
    temp2 = temp1 + c;
  } else {
    c = Math.floor(Math.random() * (temp1 + 1)); // 0..temp1
    temp2 = temp1 - c;
  }

  result = temp2; // finální výsledek

  const values = [a, b, c, result];

  // vybereme náhodně, která pozice bude chybět (0=a,1=b,2=c,3=result)
  missingIndex = Math.floor(Math.random() * 4);
  correctMissing = values[missingIndex];

  // vykreslit – na chybějícím místě _
  numAEl.textContent = missingIndex === 0 ? '_' : a;
  numBEl.textContent = missingIndex === 1 ? '_' : b;
  numCEl.textContent = missingIndex === 2 ? '_' : c;
  numResultEl.textContent = missingIndex === 3 ? '_' : result;
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

    // doplníme správnou hodnotu i do příkladu
    if (missingIndex === 0) {
      numAEl.textContent = correctMissing;
    } else if (missingIndex === 1) {
      numBEl.textContent = correctMissing;
    } else if (missingIndex === 2) {
      numCEl.textContent = correctMissing;
    } else if (missingIndex === 3) {
      numResultEl.textContent = correctMissing;
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
