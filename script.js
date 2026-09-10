/**
 * Orbital Merge & Idle Clicker - Main UI Controller
 * Bridges the DOM, game state engine, audio synthesizer, and canvas renderer.
 */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const game = window.OrbitalGame;
  const audio = window.OrbitalAudio;
  const canvas = document.getElementById('orbitCanvas');

  // Initialize Renderer
  const renderer = new window.OrbitalRenderer(canvas, game);
  renderer.start();

  // DOM Elements - Top Bar
  const balanceIcon = document.getElementById('balance-icon');
  const coinBalanceEl = document.getElementById('coin-balance');
  const cpsRateEl = document.getElementById('cps-rate');
  const speedBtn = document.getElementById('speed-btn');
  const speedIndicator = document.getElementById('speed-indicator');
  const soundBtn = document.getElementById('sound-btn');
  const soundIcon = document.getElementById('sound-icon');
  const storeBtn = document.getElementById('store-btn');

  // DOM Elements - Progress Section
  const goalTextEl = document.getElementById('goal-text');
  const goalRewardEl = document.getElementById('goal-reward');
  const goalProgressFill = document.getElementById('goal-progress-fill');

  // DOM Elements - Bottom Control Panel
  const btnMerge = document.getElementById('btn-merge');
  const mergeStatusEl = document.getElementById('merge-status');
  const mergeBadgeEl = document.getElementById('merge-badge');

  const btnBuyShip = document.getElementById('btn-buy-ship');
  const buyShipTitleEl = document.getElementById('buy-ship-title');
  const buyShipCostEl = document.getElementById('buy-ship-cost');
  const shipCapacityEl = document.getElementById('ship-capacity');

  const btnBuyGate = document.getElementById('btn-buy-gate');
  const buyGateTitleEl = document.getElementById('buy-gate-title');
  const buyGateCostEl = document.getElementById('buy-gate-cost');
  const gateCapacityEl = document.getElementById('gate-capacity');

  // DOM Elements - Modal
  const storeModal = document.getElementById('store-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const themeCards = document.querySelectorAll('.theme-card');
  const resetGameBtn = document.getElementById('reset-game-btn');

  const statLifetimeEl = document.getElementById('stat-lifetime');
  const statPassesEl = document.getElementById('stat-passes');
  const statMergesEl = document.getElementById('stat-merges');
  const statTierEl = document.getElementById('stat-tier');

  // -------------------------------------------------------------
  // UI UPDATE METHODS
  // -------------------------------------------------------------

  function formatNumber(num) {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'k';
    return Math.floor(num).toLocaleString();
  }

  function updateBalanceUI() {
    coinBalanceEl.textContent = formatNumber(game.coins);
    cpsRateEl.textContent = `+${formatNumber(game.coinsPerSecond)}/s`;
    balanceIcon.textContent = game.theme.currencySymbol;

    updateButtonsState();
  }

  function updateGoalUI() {
    const goal = game.getCurrentGoal();
    const progress = game.getGoalProgress();

    goalTextEl.textContent = `GOAL: ${goal.text} (${progress.current}/${progress.target})`;
    goalRewardEl.textContent = `+${formatNumber(goal.reward)} ${game.theme.currencySymbol}`;
    goalProgressFill.style.width = `${progress.percent}%`;
  }

  function updateButtonsState() {
    // 1. Merge Button
    const mergePairs = game.getAvailableMergePairsCount();
    const totalShips = game.ships.length;

    if (mergePairs > 0) {
      btnMerge.disabled = false;
      btnMerge.classList.add('ready');
      mergeStatusEl.textContent = `${mergePairs} Pair${mergePairs > 1 ? 's' : ''} Ready`;
      mergeBadgeEl.textContent = `${mergePairs}`;
      mergeBadgeEl.style.background = 'var(--accent-purple)';
      mergeBadgeEl.style.color = '#fff';
    } else {
      btnMerge.disabled = true;
      btnMerge.classList.remove('ready');
      mergeStatusEl.textContent = '0 Ready';
      mergeBadgeEl.textContent = `${totalShips}/${game.maxShipsCapacity}`;
      mergeBadgeEl.style.background = 'rgba(0, 0, 0, 0.3)';
      mergeBadgeEl.style.color = 'var(--text-secondary)';
    }

    // 2. Buy Ship Button
    const shipCost = game.getShipCost();
    buyShipCostEl.textContent = `${game.theme.currencySymbol} ${formatNumber(shipCost)}`;
    buyShipTitleEl.textContent = `+1 ${game.theme.entityName.toUpperCase()}`;
    shipCapacityEl.textContent = `${game.ships.length}/${game.maxShipsCapacity}`;
    btnBuyShip.disabled = !game.canBuyShip();

    // 3. Buy Gate Button
    const gateCost = game.getGateCost();
    buyGateCostEl.textContent = `${game.theme.currencySymbol} ${formatNumber(gateCost)}`;
    buyGateTitleEl.textContent = `+1 ${game.theme.gateName.toUpperCase()}`;
    gateCapacityEl.textContent = `${game.gates.length}/12`;
    btnBuyGate.disabled = !game.canBuyGate();
  }

  function updateThemeUI() {
    const theme = game.theme;
    balanceIcon.textContent = theme.currencySymbol;

    // Update Theme card active state
    themeCards.forEach(card => {
      if (card.dataset.theme === theme.id) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    updateBalanceUI();
    updateGoalUI();
    updateButtonsState();
  }

  function updateStatsModal() {
    statLifetimeEl.textContent = `${formatNumber(game.lifetimeCoins)} ${game.theme.currencySymbol}`;
    statPassesEl.textContent = formatNumber(game.totalPasses);
    statMergesEl.textContent = formatNumber(game.totalMerges);
    statTierEl.textContent = `Tier ${game.getHighestShipTier() || 1}`;
  }

  // -------------------------------------------------------------
  // EVENT LISTENERS & BINDINGS
  // -------------------------------------------------------------

  // Game Engine Events
  game.on('onCoinUpdate', () => updateBalanceUI());
  game.on('onGoalProgress', () => updateGoalUI());
  game.on('onEntityChange', () => updateButtonsState());
  game.on('onThemeChange', () => updateThemeUI());
  game.on('onGoalCompleted', goal => {
    updateGoalUI();
    updateBalanceUI();
  });

  // Buttons - Controls
  btnBuyShip.addEventListener('click', () => {
    game.buyShip();
  });

  btnBuyGate.addEventListener('click', () => {
    game.buyGate();
  });

  btnMerge.addEventListener('click', () => {
    game.mergeNextPair();
  });

  // Top Bar Actions
  speedBtn.addEventListener('click', () => {
    if (game.gameSpeed === 1) game.gameSpeed = 2;
    else if (game.gameSpeed === 2) game.gameSpeed = 5;
    else game.gameSpeed = 1;

    speedIndicator.textContent = `${game.gameSpeed}x`;
    audio.playClick();
  });

  soundBtn.addEventListener('click', () => {
    const isMuted = audio.toggleMute();
    soundIcon.textContent = isMuted ? '🔇' : '🔊';
  });

  storeBtn.addEventListener('click', () => {
    audio.playClick();
    updateStatsModal();
    storeModal.classList.remove('hidden');
  });

  closeModalBtn.addEventListener('click', () => {
    audio.playClick();
    storeModal.classList.add('hidden');
  });

  storeModal.addEventListener('click', e => {
    if (e.target === storeModal) {
      storeModal.classList.add('hidden');
    }
  });

  // Theme Switching
  themeCards.forEach(card => {
    card.addEventListener('click', () => {
      const selectedTheme = card.dataset.theme;
      game.setTheme(selectedTheme);
      audio.playMerge();
    });
  });

  // Reset Game
  resetGameBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all game progress? This cannot be undone.')) {
      game.resetSave();
    }
  });

  // Keyboard Shortcuts
  window.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    if (e.code === 'Space') {
      e.preventDefault();
      game.buyShip();
    } else if (e.key === 'g' || e.key === 'G') {
      game.buyGate();
    } else if (e.key === 'm' || e.key === 'M') {
      game.mergeNextPair();
    } else if (e.key === 's' || e.key === 'S') {
      storeModal.classList.toggle('hidden');
      if (!storeModal.classList.contains('hidden')) {
        updateStatsModal();
      }
    }
  });

  // Check for URL query params (e.g. ?theme=fantasy-realm, ?store=1)
  try {
    const params = new URLSearchParams(window.location.search);
    const themeParam = params.get('theme');
    if (themeParam && window.OrbitalThemes[themeParam]) {
      game.setTheme(themeParam);
    }
    if (params.get('store') === '1' || params.get('store') === 'true') {
      updateStatsModal();
      storeModal.classList.remove('hidden');
    }
  } catch (e) {}

  // Initial Sync
  soundIcon.textContent = audio.muted ? '🔇' : '🔊';
  updateThemeUI();
  updateGoalUI();
  updateBalanceUI();
});
