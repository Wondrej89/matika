// js/reward.js

let towerEl = null;
let celebrationTimeout = null;

export function initReward() {
  towerEl = document.getElementById('rewardTower');
}

/**
 * Vynuluje věž – volat na začátku nové hry.
 */
export function resetTower() {
  if (!towerEl) return;
  towerEl.classList.remove('full');
  towerEl.innerHTML = '';
}

/**
 * Nastaví věž podle počtu správných odpovědí (0–10).
 * Pokud je 10, spustí konfeti ohňostroj.
 */
export function setTowerProgress(correctCount) {
  if (!towerEl) return;
  towerEl.classList.remove('full');
  towerEl.innerHTML = '';

  const capped = Math.max(0, Math.min(10, correctCount));

  for (let i = 0; i < capped; i++) {
    const block = document.createElement('div');
    block.className = 'reward-block';
    towerEl.appendChild(block);
  }

  if (capped === 10) {
    towerEl.classList.add('full');
    launchConfetti();
  }
}

/** Vytvoří krátký konfetový ohňostroj přes celou obrazovku. */
function launchConfetti() {
  // aby se nespouštěl znovu, pokud už běží
  if (document.querySelector('.celebration-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'celebration-overlay';
  document.body.appendChild(overlay);

  const colors = ['#ff6b6b', '#ffd93b', '#6bcb77', '#4f8cff', '#a66bff', '#ff9f1c'];
  const confettiCount = 120;

  for (let i = 0; i < confettiCount; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti';

    // náhodná pozice a parametry animace
    const left = Math.random() * 100; // %
    const delay = Math.random() * 0.8; // s
    const duration = 1.8 + Math.random() * 1.0; // 1.8–2.8 s

    const color = colors[Math.floor(Math.random() * colors.length)];

    piece.style.left = `${left}vw`;
    piece.style.backgroundColor = color;
    piece.style.animationDuration = `${duration}s`;
    piece.style.animationDelay = `${delay}s`;

    overlay.appendChild(piece);
  }

  // po ~3 s overlay odstraníme
  if (celebrationTimeout) {
    clearTimeout(celebrationTimeout);
  }
  celebrationTimeout = setTimeout(() => {
    overlay.remove();
    celebrationTimeout = null;
  }, 3200);
}
