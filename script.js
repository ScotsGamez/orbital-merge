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

  // DOM Elements - Scoreboard Modal
  const scoreboardBtn = document.getElementById('scoreboard-btn');
  const scoreboardModal = document.getElementById('scoreboard-modal');
  const closeScoreboardBtn = document.getElementById('close-scoreboard-btn');
  const playerAvatarDisplay = document.getElementById('player-avatar-display');
  const playerDisplayName = document.getElementById('player-display-name');
  const btnEditName = document.getElementById('btn-edit-name');
  const playerRankBadge = document.getElementById('player-rank-badge');
  const playerTierBadge = document.getElementById('player-tier-badge');
  const playerScoreDisplay = document.getElementById('player-score-display');
  const callsignEditContainer = document.getElementById('callsign-edit-container');
  const callsignInput = document.getElementById('callsign-input');
  const btnSaveCallsign = document.getElementById('btn-save-callsign');
  const btnCancelCallsign = document.getElementById('btn-cancel-callsign');
  const rankMotivationBanner = document.getElementById('rank-motivation-banner');
  const rankMotivationText = document.getElementById('rank-motivation-text');
  const tabBtnLeaderboard = document.getElementById('tab-btn-leaderboard');
  const tabBtnRecords = document.getElementById('tab-btn-records');
  const tabLeaderboard = document.getElementById('tab-leaderboard');
  const tabRecords = document.getElementById('tab-records');
  const leaderboardRows = document.getElementById('leaderboard-rows');

  const recHighScore = document.getElementById('rec-high-score');
  const recLifetimeCoins = document.getElementById('rec-lifetime-coins');
  const recHighestShip = document.getElementById('rec-highest-ship');
  const recHighestGate = document.getElementById('rec-highest-gate');
  const recTotalMerges = document.getElementById('rec-total-merges');
  const recTotalPasses = document.getElementById('rec-total-passes');
  const firebaseSyncBadge = document.getElementById('firebase-sync-badge');

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

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function updateScoreboardUI() {
    const lbData = game.getLeaderboard();
    const records = game.getPersonalRecords();

    // 0. Sync Status Badge
    if (firebaseSyncBadge) {
      const isConfigured = window.OrbitalScoreboardService && window.OrbitalScoreboardService.hasValidConfig();
      if (isConfigured) {
        firebaseSyncBadge.textContent = '🟢 Real Players Live';
        firebaseSyncBadge.classList.add('live');
      } else {
        firebaseSyncBadge.textContent = '🟡 Real Global Ready';
        firebaseSyncBadge.classList.remove('live');
      }
    }

    // 1. Player Standing Card
    if (playerAvatarDisplay) {
      playerAvatarDisplay.textContent = game.theme ? game.theme.icon : '🚀';
    }
    if (playerDisplayName) {
      playerDisplayName.textContent = game.playerName || 'Commander';
    }
    if (playerRankBadge) {
      playerRankBadge.textContent = `Rank #${lbData.playerRank}`;
      if (lbData.playerRank === 1) {
        playerRankBadge.textContent = '👑 Rank #1 Champion';
        playerRankBadge.style.background = 'linear-gradient(135deg, #ffd700, #ffaa00)';
      } else if (lbData.playerRank <= 3) {
        playerRankBadge.style.background = 'linear-gradient(135deg, #00f0ff, #00ff88)';
      } else {
        playerRankBadge.style.background = 'linear-gradient(135deg, #ffd700, #ff8800)';
      }
    }
    if (playerTierBadge) {
      playerTierBadge.textContent = `Fleet Tier ${records.highestShipTier}`;
    }
    if (playerScoreDisplay) {
      playerScoreDisplay.textContent = `${formatNumber(lbData.playerScore)} PTS`;
    }

    // 2. Motivation Banner
    if (rankMotivationText) {
      if (lbData.playerRank === 1) {
        if (lbData.totalRanks === 1) {
          rankMotivationText.textContent = '👑 You hold Rank #1! Share with friends to compete on your live board!';
        } else {
          rankMotivationText.textContent = '👑 You are the Galactic Champion! Unrivaled fleet master!';
        }
      } else if (lbData.nextRival) {
        rankMotivationText.textContent = `Only ${formatNumber(lbData.pointsToPassNext)} PTS to pass ${lbData.nextRival.name} (#${lbData.nextRival.rank})!`;
      } else {
        rankMotivationText.textContent = 'Earn coins and merge ships to climb the galactic leaderboard!';
      }
    }

    // 3. Render Leaderboard Rows
    if (leaderboardRows) {
      leaderboardRows.innerHTML = '';
      lbData.entries.forEach(entry => {
        const row = document.createElement('div');
        row.className = `lb-row ${entry.isPlayer ? 'player-row' : ''}`;

        let rankClass = '';
        let rankLabel = `#${entry.rank}`;
        if (entry.rank === 1) {
          rankClass = 'rank-top-1';
          rankLabel = '👑 1';
        } else if (entry.rank === 2) {
          rankClass = 'rank-top-2';
          rankLabel = '🥈 2';
        } else if (entry.rank === 3) {
          rankClass = 'rank-top-3';
          rankLabel = '🥉 3';
        }

        row.innerHTML = `
          <div class="lb-rank ${rankClass}">${rankLabel}</div>
          <div class="lb-pilot">
            <span class="lb-avatar">${entry.avatar}</span>
            <span class="lb-name">${escapeHtml(entry.name)}${entry.isPlayer ? '<span class="you-tag">YOU</span>' : ''}</span>
          </div>
          <div class="lb-tier">T${entry.tier}</div>
          <div class="lb-score">${formatNumber(entry.score)}</div>
        `;
        leaderboardRows.appendChild(row);
      });
    }

    // 4. Personal Records
    if (recHighScore) {
      recHighScore.textContent = `${formatNumber(records.highScore)} PTS`;
    }
    if (recLifetimeCoins) {
      recLifetimeCoins.textContent = `${formatNumber(records.lifetimeCoins)} ${game.theme.currencySymbol}`;
    }
    if (recHighestShip) {
      recHighestShip.textContent = `${records.highestShipName} (T${records.highestShipTier})`;
    }
    if (recHighestGate) {
      recHighestGate.textContent = `${records.highestGateMultiplier} (T${records.highestGateTier})`;
    }
    if (recTotalMerges) {
      recTotalMerges.textContent = formatNumber(records.totalMerges);
    }
    if (recTotalPasses) {
      recTotalPasses.textContent = formatNumber(records.totalPasses);
    }
  }

  // -------------------------------------------------------------
  // EVENT LISTENERS & BINDINGS
  // -------------------------------------------------------------

  game.on('onCoinUpdate', () => {
    updateBalanceUI();
    if (scoreboardModal && !scoreboardModal.classList.contains('hidden')) {
      updateScoreboardUI();
    }
  });
  game.on('onGoalProgress', () => updateGoalUI());
  game.on('onEntityChange', () => {
    updateButtonsState();
    if (scoreboardModal && !scoreboardModal.classList.contains('hidden')) {
      updateScoreboardUI();
    }
  });
  game.on('onThemeChange', () => {
    updateThemeUI();
    if (scoreboardModal && !scoreboardModal.classList.contains('hidden')) {
      updateScoreboardUI();
    }
  });
  game.on('onScoreboardUpdate', () => {
    if (scoreboardModal && !scoreboardModal.classList.contains('hidden')) {
      updateScoreboardUI();
    }
  });
  game.on('onGoalCompleted', goal => {
    updateGoalUI();
    updateBalanceUI();
    if (scoreboardModal && !scoreboardModal.classList.contains('hidden')) {
      updateScoreboardUI();
    }
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

  // Scoreboard Modal Actions
  scoreboardBtn.addEventListener('click', () => {
    audio.playClick();
    if (window.OrbitalScoreboardService && window.OrbitalScoreboardService.hasValidConfig()) {
      window.OrbitalScoreboardService.fetchGlobalScores().then(() => {
        if (scoreboardModal && !scoreboardModal.classList.contains('hidden')) {
          updateScoreboardUI();
        }
      }).catch(() => {});
    }
    updateScoreboardUI();
    scoreboardModal.classList.remove('hidden');
  });

  if (window.OrbitalScoreboardService) {
    window.OrbitalScoreboardService.subscribe(() => {
      if (scoreboardModal && !scoreboardModal.classList.contains('hidden')) {
        updateScoreboardUI();
      }
    });
  }

  closeScoreboardBtn.addEventListener('click', () => {
    audio.playClick();
    scoreboardModal.classList.add('hidden');
    callsignEditContainer.classList.add('hidden');
  });

  scoreboardModal.addEventListener('click', e => {
    if (e.target === scoreboardModal) {
      scoreboardModal.classList.add('hidden');
      callsignEditContainer.classList.add('hidden');
    }
  });

  // Scoreboard Tabs Switching
  tabBtnLeaderboard.addEventListener('click', () => {
    audio.playClick();
    tabBtnLeaderboard.classList.add('active');
    tabBtnRecords.classList.remove('active');
    tabLeaderboard.classList.remove('hidden');
    tabRecords.classList.add('hidden');
  });

  tabBtnRecords.addEventListener('click', () => {
    audio.playClick();
    tabBtnRecords.classList.add('active');
    tabBtnLeaderboard.classList.remove('active');
    tabRecords.classList.remove('hidden');
    tabLeaderboard.classList.add('hidden');
    updateScoreboardUI();
  });

  // Callsign Editing
  btnEditName.addEventListener('click', () => {
    audio.playClick();
    callsignEditContainer.classList.toggle('hidden');
    if (!callsignEditContainer.classList.contains('hidden')) {
      callsignInput.value = game.playerName || 'Commander';
      callsignInput.focus();
    }
  });

  btnSaveCallsign.addEventListener('click', () => {
    audio.playClick();
    const newName = callsignInput.value.trim();
    if (newName) {
      game.setPlayerName(newName);
      updateScoreboardUI();
    }
    callsignEditContainer.classList.add('hidden');
  });

  btnCancelCallsign.addEventListener('click', () => {
    audio.playClick();
    callsignEditContainer.classList.add('hidden');
  });

  callsignInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      btnSaveCallsign.click();
    } else if (e.key === 'Escape') {
      btnCancelCallsign.click();
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
    } else if (e.key === 'l' || e.key === 'L') {
      scoreboardModal.classList.toggle('hidden');
      if (!scoreboardModal.classList.contains('hidden')) {
        if (window.OrbitalScoreboardService && window.OrbitalScoreboardService.hasValidConfig()) {
          window.OrbitalScoreboardService.fetchGlobalScores().then(() => {
            if (!scoreboardModal.classList.contains('hidden')) {
              updateScoreboardUI();
            }
          }).catch(() => {});
        }
        updateScoreboardUI();
      }
    } else if (e.key === 'Escape') {
      storeModal.classList.add('hidden');
      scoreboardModal.classList.add('hidden');
      callsignEditContainer.classList.add('hidden');
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
    if (params.get('scoreboard') === '1' || params.get('leaderboard') === '1') {
      if (window.OrbitalScoreboardService && window.OrbitalScoreboardService.hasValidConfig()) {
        window.OrbitalScoreboardService.fetchGlobalScores().then(() => {
          if (scoreboardModal && !scoreboardModal.classList.contains('hidden')) {
            updateScoreboardUI();
          }
        }).catch(() => {});
      }
      updateScoreboardUI();
      scoreboardModal.classList.remove('hidden');
    }
  } catch (e) {}

  // Initial Sync
  soundIcon.textContent = audio.muted ? '🔇' : '🔊';
  updateThemeUI();
  updateGoalUI();
  updateBalanceUI();
});
