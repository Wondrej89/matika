// js/main.js
import { initReward, resetTower } from './reward.js';
import { initCountingGame, startNewGame as startCountingGame } from './game-counting.js';
import { initCompareGame, startCompareGame } from './game-compare.js';
import { initCountingNumbersGame, startNumbersGame } from './game-counting-numbers.js';
import { initCompareNumbersGame, startCompareNumbersGame } from './game-compare-numbers.js';
import { initCountingNumbersAdvancedGame, startNumbersAdvancedGame } from './game-counting-numbers-advanced.js';

document.addEventListener('DOMContentLoaded', () => {
  // inicializace panelu s věží
  initReward();

  // obrazovky
  const startScreen = document.getElementById('startScreen');
  const gameScreenShapes = document.getElementById('gameScreen');                    // sčítání/odčítání – tvary
  const gameScreenNumbers = document.getElementById('gameScreenNumbers');            // sčítání/odčítání – čísla (1. úroveň)
  const gameScreenNumbersAdvanced = document.getElementById('gameScreenNumbersAdvanced'); // sčítání/odčítání – čísla (2. úroveň)
  const gameScreenCompareShapes = document.getElementById('gameScreenCompare');      // porovnávání – tvary
  const gameScreenCompareNumbers = document.getElementById('gameScreenCompareNumbers');   // porovnávání – čísla

  const rewardPanel = document.getElementById('rewardPanel');

  // tlačítko ukončit hru + modal
  const exitGameBtn = document.getElementById('exitGameBtn');
  const exitModal = document.getElementById('exitModal');
  const exitConfirmBtn = document.getElementById('exitConfirmBtn');
  const exitCancelBtn = document.getElementById('exitCancelBtn');

  // pomocná funkce na přepínání obrazovek
  function showScreen(screen) {
    // vše schovat
    startScreen.hidden = true;
    gameScreenShapes.hidden = true;
    gameScreenNumbers.hidden = true;
    gameScreenNumbersAdvanced.hidden = true;
    gameScreenCompareShapes.hidden = true;
    gameScreenCompareNumbers.hidden = true;

    if (screen === 'start') {
      exitGameBtn.hidden = true;
      if (rewardPanel) rewardPanel.hidden = true;
    } else {
      exitGameBtn.hidden = false;
      if (rewardPanel) rewardPanel.hidden = false;
    }

    if (screen === 'start') {
      startScreen.hidden = false;
    } else if (screen === 'countShapes') {
      gameScreenShapes.hidden = false;
    } else if (screen === 'countNumbers') {
      gameScreenNumbers.hidden = false;
    } else if (screen === 'countNumbersAdvanced') {
      gameScreenNumbersAdvanced.hidden = false;
    } else if (screen === 'compareShapes') {
      gameScreenCompareShapes.hidden = false;
    } else if (screen === 'compareNumbers') {
      gameScreenCompareNumbers.hidden = false;
    }
  }

  // práce s modem
  function openExitModal() {
    exitModal.hidden = false;
  }

  function closeExitModal() {
    exitModal.hidden = true;
  }

  // klik na "× Ukončit hru" – jen otevře modal
  exitGameBtn.addEventListener('click', () => {
    openExitModal();
  });

  // v modalu: zůstat ve hře
  exitCancelBtn.addEventListener('click', () => {
    closeExitModal();
  });

  // v modalu: opravdu ukončit
  exitConfirmBtn.addEventListener('click', () => {
    closeExitModal();
    resetTower();        // smažeme věž
    showScreen('start'); // návrat na úvod
  });

  // kliknutí na pozadí modalu (mimo dialog) taky zavře
  exitModal.addEventListener('click', (e) => {
    if (e.target === exitModal || e.target.classList.contains('modal-backdrop')) {
      closeExitModal();
    }
  });

  // inicializace jednotlivých her (callback po kliknutí na "Zpět na výběr hry" v summary)
  initCountingGame({
    onBackToMenu: () => {
      resetTower();
      showScreen('start');
    },
  });

  initCountingNumbersGame({
    onBackToMenu: () => {
      resetTower();
      showScreen('start');
    },
  });

  initCountingNumbersAdvancedGame({
    onBackToMenu: () => {
      resetTower();
      showScreen('start');
    },
  });

  initCompareGame({
    onBackToMenu: () => {
      resetTower();
      showScreen('start');
    },
  });

  initCompareNumbersGame({
    onBackToMenu: () => {
      resetTower();
      showScreen('start');
    },
  });

  // tlačítka na výběr hry + rozsahu (na úvodní obrazovce)
  document.querySelectorAll('.range-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const game = btn.dataset.game;
      const range = parseInt(btn.dataset.range, 10);

      // nová hra = nová věž
      resetTower();

      if (game === 'countShapes') {
        showScreen('countShapes');
        startCountingGame(range);
      } else if (game === 'countNumbers') {
        showScreen('countNumbers');
        startNumbersGame(range);
      } else if (game === 'countNumbersAdvanced') {
        showScreen('countNumbersAdvanced');
        startNumbersAdvancedGame(range);
      } else if (game === 'compareShapes') {
        showScreen('compareShapes');
        startCompareGame(range);
      } else if (game === 'compareNumbers') {
        showScreen('compareNumbers');
        startCompareNumbersGame(range);
      }
    });
  });

  // startovací stav
  showScreen('start');
});
