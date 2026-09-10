/**
 * Orbital Merge & Idle Clicker - Main UI Controller
 * Bridges the DOM, game state engine, audio synthesizer, and canvas renderer.
 */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Dynamic Viewport Height calculation for iOS Safari & mobile browsers
  function updateViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
  window.addEventListener('resize', updateViewportHeight);
  window.addEventListener('orientationchange', updateViewportHeight);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', updateViewportHeight);
  }
  updateViewportHeight();

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
  const btnMergeShips = document.getElementById('btn-merge-ships');
  const mergeStatusEl = document.getElementById('merge-status');
  const mergeBadgeEl = document.getElementById('merge-badge');

  const btnMergeGates = document.getElementById('btn-merge-gates');
  const gateMergeStatusEl = document.getElementById('gate-merge-status');
  const gateMergeBadgeEl = document.getElementById('gate-merge-badge');

  const btnBuyShip = document.getElementById('btn-buy-ship');
  const buyShipTitleEl = document.getElementById('buy-ship-title');
  const buyShipCostEl = document.getElementById('buy-ship-cost');
  const shipCapacityEl = document.getElementById('ship-capacity');

  const btnBuyGate = document.getElementById('btn-buy-gate');
  const buyGateTitleEl = document.getElementById('buy-gate-title');
  const buyGateCostEl = document.getElementById('buy-gate-cost');
  const gateCapacityEl = document.getElementById('gate-capacity');

  // DOM Elements - Modals
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
    // 1. Merge Ships Button
    const mergePairs = game.getAvailableMergePairsCount();
    const totalShips = game.ships.length;
    const nextShipPair = game.findMergeableShipPair();
    const shipMergeCost = nextShipPair ? game.getShipMergeCost(nextShipPair[0].tier) : 0;
    const canAffordShipMerge = game.coins >= shipMergeCost;

    if (mergePairs > 0) {
      mergeStatusEl.textContent = `${mergePairs} Ready • ${game.theme.currencySymbol} ${formatNumber(shipMergeCost)}`;
      mergeBadgeEl.textContent = `${mergePairs}`;

      if (canAffordShipMerge) {
        btnMergeShips.disabled = false;
        btnMergeShips.classList.add('ready');
        mergeBadgeEl.style.background = 'var(--accent-purple)';
        mergeBadgeEl.style.color = '#fff';
      } else {
        btnMergeShips.disabled = true;
        btnMergeShips.classList.remove('ready');
        mergeBadgeEl.style.background = 'rgba(255, 255, 255, 0.1)';
        mergeBadgeEl.style.color = 'var(--text-secondary)';
      }
    } else {
      btnMergeShips.disabled = true;
      btnMergeShips.classList.remove('ready');
      mergeStatusEl.textContent = '0 Ready';
      mergeBadgeEl.textContent = `${totalShips}/${game.maxShipsCapacity}`;
      mergeBadgeEl.style.background = 'rgba(0, 0, 0, 0.3)';
      mergeBadgeEl.style.color = 'var(--text-secondary)';
    }

    // 2. Merge Gates Button
    const gateMergePairs = game.getAvailableGateMergePairsCount();
    const totalGates = game.gates.length;
    const nextGatePair = game.findMergeableGatePair();
    const gateMergeCost = nextGatePair ? game.getGateMergeCost(nextGatePair[0].tier) : 0;
    const canAffordGateMerge = game.coins >= gateMergeCost;

    if (gateMergePairs > 0) {
      gateMergeStatusEl.textContent = `${gateMergePairs} Ready • ${game.theme.currencySymbol} ${formatNumber(gateMergeCost)}`;
      gateMergeBadgeEl.textContent = `${gateMergePairs}`;

      if (canAffordGateMerge) {
        btnMergeGates.disabled = false;
        btnMergeGates.classList.add('ready');
        gateMergeBadgeEl.style.background = 'var(--accent-cyan)';
        gateMergeBadgeEl.style.color = '#000';
      } else {
        btnMergeGates.disabled = true;
        btnMergeGates.classList.remove('ready');
        gateMergeBadgeEl.style.background = 'rgba(255, 255, 255, 0.1)';
        gateMergeBadgeEl.style.color = 'var(--text-secondary)';
      }
    } else {
      btnMergeGates.disabled = true;
      btnMergeGates.classList.remove('ready');
      gateMergeStatusEl.textContent = '0 Ready';
      gateMergeBadgeEl.textContent = `${totalGates}/${game.maxGatesCapacity}`;
      gateMergeBadgeEl.style.background = 'rgba(0, 0, 0, 0.3)';
      gateMergeBadgeEl.style.color = 'var(--text-secondary)';
    }

    // 3. Buy Ship Button
    const shipCost = game.getShipCost();
    buyShipCostEl.textContent = `${game.theme.currencySymbol} ${formatNumber(shipCost)}`;
    buyShipTitleEl.textContent = `+1 ${game.theme.entityName.toUpperCase()}`;
    shipCapacityEl.textContent = `${game.ships.length}/${game.maxShipsCapacity}`;
    btnBuyShip.disabled = !game.canBuyShip();

    // 4. Buy Gate Button
    const gateCost = game.getGateCost();
    const isNarrow = window.innerWidth <= 768;
    buyGateCostEl.textContent = `${game.theme.currencySymbol} ${formatNumber(gateCost)}`;
    buyGateTitleEl.textContent = isNarrow ? '+1 GATE' : `+1 ${game.theme.gateName.toUpperCase()}`;
    gateCapacityEl.textContent = `${game.gates.length}/${game.maxGatesCapacity}`;
    btnBuyGate.disabled = !game.canBuyGate();
  }



  function updateThemeUI() {
    const theme = game.theme;
    balanceIcon.textContent = theme.currencySymbol;

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

  game.on('onCoinUpdate', () => updateBalanceUI());
  game.on('onGoalProgress', () => updateGoalUI());
  game.on('onEntityChange', () => {
    updateButtonsState();
  });
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

  btnMergeShips.addEventListener('click', () => {
    const nextShipPair = game.findMergeableShipPair();
    const cost = nextShipPair ? game.getShipMergeCost(nextShipPair[0].tier) : 0;
    const merged = game.mergeNextPair();
    if (merged && renderer) {
      const R = renderer.orbitRadius || 180;
      const x = renderer.centerX + Math.cos(merged.angle) * R;
      const y = renderer.centerY + Math.sin(merged.angle) * R;
      renderer.addFloatingText(`-${cost} ${game.theme.currencySymbol}`, x, y - 20, '#ffd700');
    }
  });

  btnMergeGates.addEventListener('click', () => {
    const nextGatePair = game.findMergeableGatePair();
    const cost = nextGatePair ? game.getGateMergeCost(nextGatePair[0].tier) : 0;
    const merged = game.mergeNextGatePair();
    if (merged && renderer) {
      const R = renderer.orbitRadius || 180;
      const x = renderer.centerX + Math.cos(merged.angle) * R;
      const y = renderer.centerY + Math.sin(merged.angle) * R;
      renderer.addFloatingText(`-${cost} ${game.theme.currencySymbol}`, x, y - 20, '#ffd700');
    }
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
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.code === 'Space') {
      e.preventDefault();
      game.buyShip();
    } else if (e.key === 'g' || e.key === 'G') {
      game.buyGate();
    } else if (e.key === 'm' || e.key === 'M') {
      const nextShipPair = game.findMergeableShipPair();
      const cost = nextShipPair ? game.getShipMergeCost(nextShipPair[0].tier) : 0;
      const merged = game.mergeNextPair();
      if (merged && renderer) {
        const R = renderer.orbitRadius || 180;
        const x = renderer.centerX + Math.cos(merged.angle) * R;
        const y = renderer.centerY + Math.sin(merged.angle) * R;
        renderer.addFloatingText(`-${cost} ${game.theme.currencySymbol}`, x, y - 20, '#ffd700');
      }
    } else if (e.key === 's' || e.key === 'S') {
      storeModal.classList.toggle('hidden');
      if (!storeModal.classList.contains('hidden')) {
        updateStatsModal();
      }
    }
  });

  // Query Params
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
