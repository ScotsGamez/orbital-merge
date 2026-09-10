/**
 * Orbital Merge & Idle Clicker - Core Game Engine
 * Manages game state, math formulas, entity arrays, collision detection, and merge mechanics.
 */
(function() {
  'use strict';

  class GameState {
    constructor() {
      this.currentThemeId = 'deep-space';
      // Economy starting from 1 coin
      this.coins = 3;
      this.lifetimeCoins = 3;
      this.totalPasses = 0;
      this.totalMerges = 0;
      this.shipsBought = 0;
      this.gatesBought = 0;
      this.gameSpeed = 1;
      this.maxShipsCapacity = 16;
      this.maxGatesCapacity = 10;
      this.lastSaveTime = Date.now();
      this.coinsPerSecond = 0;
      this.recentEarnings = [];
      this.highScore = 0;
      this.playerName = 'Commander';

      // Base Economy Constants: Ship Level 1 starts with 1 coin!
      this.BASE_SHIP_COST = 1;
      this.BASE_GATE_COST = 5;
      this.COST_EXPONENT = 1.15; // New Cost = Base Cost * 1.15^Owned

      // Entities
      this.ships = [];
      this.gates = [];
      this.nextEntityId = 1;

      // Drag and Drop state
      this.draggedShip = null;
      this.hoveredShip = null;

      // Goal System scaled for 1-coin progression
      this.goalIndex = 0;
      this.goals = [
        { id: 'buy_ship_1', text: 'ADD 2 SPACESHIPS', type: 'ships_count', target: 2, reward: 5 },
        { id: 'merge_t2', text: 'MERGE A TIER 2 SHIP', type: 'highest_tier', target: 2, reward: 10 },
        { id: 'buy_gate_2', text: 'ADD 2ND GATE', type: 'gates_count', target: 2, reward: 15 },
        { id: 'earn_50', text: 'REACH 50 COINS', type: 'current_coins', target: 50, reward: 25 },
        { id: 'merge_gate_t2', text: 'MERGE A TIER 2 GATE', type: 'highest_gate_tier', target: 2, reward: 50 },
        { id: 'ships_5', text: 'ADD 5 SPACESHIPS', type: 'ships_count', target: 5, reward: 75 },
        { id: 'merge_t3', text: 'MERGE A TIER 3 SHIP', type: 'highest_tier', target: 3, reward: 150 },
        { id: 'earn_500', text: 'REACH 500 COINS', type: 'current_coins', target: 500, reward: 250 },
        { id: 'buy_gate_3', text: 'ADD 3RD GATE', type: 'gates_count', target: 3, reward: 500 },
        { id: 'ships_10', text: 'ADD 10 SPACESHIPS', type: 'ships_count', target: 10, reward: 750 },
        { id: 'merge_t4', text: 'MERGE A TIER 4 SHIP', type: 'highest_tier', target: 4, reward: 1500 },
        { id: 'earn_5k', text: 'REACH 5,000 COINS', type: 'current_coins', target: 5000, reward: 3000 },
        { id: 'ships_20', text: 'ADD 20 SPACESHIPS', type: 'ships_bought_total', target: 20, reward: 10000 },
        { id: 'merge_t5', text: 'MERGE A TIER 5 SHIP', type: 'highest_tier', target: 5, reward: 25000 },
        { id: 'earn_100k', text: 'REACH 100,000 COINS', type: 'current_coins', target: 100000, reward: 50000 }
      ];

      this.listeners = {
        onCoinUpdate: [],
        onGoalProgress: [],
        onGoalCompleted: [],
        onEntityChange: [],
        onThemeChange: [],
        onGatePass: []
      };

      this.initDefaultEntities();
      this.loadSave();
    }

    get theme() {
      return window.OrbitalThemes[this.currentThemeId] || window.OrbitalThemes['deep-space'];
    }

    setTheme(themeId) {
      if (!window.OrbitalThemes[themeId]) return;
      this.currentThemeId = themeId;
      this.applyThemeStyles();
      this.emit('onThemeChange', this.theme);
      this.save();
    }

    applyThemeStyles() {
      const theme = this.theme;
      const root = document.documentElement;
      for (const [key, value] of Object.entries(theme.cssVars)) {
        root.style.setProperty(key, value);
      }
    }

    initDefaultEntities() {
      // Start with 1 Level 1 Ship and 1 Level 1 Gate
      this.ships = [
        {
          id: this.nextEntityId++,
          tier: 1,
          angle: 0,
          speed: 0.95,
          radiusOffset: 0
        }
      ];

      this.gates = [
        {
          id: this.nextEntityId++,
          tier: 1,
          angle: Math.PI * 0.5,
          targetAngle: Math.PI * 0.5,
          multiplier: 1,
          pulse: 0
        }
      ];

      this.repositionGates(false);
    }

    repositionGates(smooth = true) {
      const count = this.gates.length;
      if (count === 0) return;

      const step = (Math.PI * 2) / count;
      this.gates.forEach((gate, i) => {
        const target = i * step;
        if (!smooth) {
          gate.angle = target;
        }
        gate.targetAngle = target;
      });
    }

    getShipTierConfig(tier) {
      const tiers = this.theme.tiers;
      const idx = Math.min(tier - 1, tiers.length - 1);
      return tiers[idx] || tiers[0];
    }

    // Ship Tier Base Payout: Tier 1 is 1 coin!
    getShipPayout(tier) {
      const cfg = this.getShipTierConfig(tier);
      return cfg.baseValue || 1;
    }

    getGateTierConfig(tier) {
      const tiers = this.theme.gateTiers;
      const idx = Math.min(tier - 1, tiers.length - 1);
      return tiers[idx] || tiers[0];
    }

    // Economy Cost Formulas: Ship Level 1 starts with 1 coin!
    getShipCost() {
      return Math.max(1, Math.round(this.BASE_SHIP_COST * Math.pow(this.COST_EXPONENT, this.shipsBought)));
    }

    getGateCost() {
      return Math.max(5, Math.round(this.BASE_GATE_COST * Math.pow(1.25, this.gatesBought)));
    }

    canBuyShip() {
      return this.coins >= this.getShipCost() && this.ships.length < this.maxShipsCapacity;
    }

    canBuyGate() {
      return this.coins >= this.getGateCost() && this.gates.length < this.maxGatesCapacity;
    }

    buyShip() {
      const cost = this.getShipCost();
      if (this.coins < cost) return false;
      if (this.ships.length >= this.maxShipsCapacity) return false;

      this.coins -= cost;
      this.shipsBought++;

      const lastAngle = this.ships.length > 0 ? this.ships[this.ships.length - 1].angle : 0;
      const newAngle = (lastAngle - (Math.PI * 2) / (this.ships.length + 1) + Math.PI * 2) % (Math.PI * 2);

      const newShip = {
        id: this.nextEntityId++,
        tier: 1,
        angle: newAngle,
        speed: 0.95 + (Math.random() * 0.05 - 0.025),
        radiusOffset: (Math.random() - 0.5) * 6
      };

      this.ships.push(newShip);

      if (window.OrbitalAudio) {
        window.OrbitalAudio.playBuy();
      }

      this.checkGoalProgress();
      this.emit('onEntityChange');
      this.emit('onCoinUpdate');
      this.save();
      return true;
    }

    buyGate() {
      const cost = this.getGateCost();
      if (this.coins < cost) return false;
      if (this.gates.length >= this.maxGatesCapacity) return false;

      this.coins -= cost;
      this.gatesBought++;

      const newGate = {
        id: this.nextEntityId++,
        tier: 1,
        angle: 0,
        targetAngle: 0,
        multiplier: 1,
        pulse: 0
      };

      this.gates.push(newGate);
      this.repositionGates(true);

      if (window.OrbitalAudio) {
        window.OrbitalAudio.playBuy();
      }

      this.checkGoalProgress();
      this.emit('onEntityChange');
      this.emit('onCoinUpdate');
      this.save();
      return true;
    }

    findMergeableShipPair() {
      const tierMap = new Map();
      for (const ship of this.ships) {
        if (!tierMap.has(ship.tier)) {
          tierMap.set(ship.tier, []);
        }
        tierMap.get(ship.tier).push(ship);
      }

      const sortedTiers = Array.from(tierMap.keys()).sort((a, b) => a - b);
      for (const tier of sortedTiers) {
        const list = tierMap.get(tier);
        if (list.length >= 2) {
          return [list[0], list[1]];
        }
      }
      return null;
    }

    getAvailableMergePairsCount() {
      const counts = {};
      for (const ship of this.ships) {
        counts[ship.tier] = (counts[ship.tier] || 0) + 1;
      }
      let pairs = 0;
      for (const count of Object.values(counts)) {
        pairs += Math.floor(count / 2);
      }
      return pairs;
    }

    getShipMergeCost(tier = 1) {
      return Math.round(2 * Math.pow(2.2, tier - 1));
    }

    canMergeShips(tier = null) {
      const pair = this.findMergeableShipPair();
      if (!pair) return false;
      const targetTier = tier !== null ? tier : pair[0].tier;
      return this.coins >= this.getShipMergeCost(targetTier);
    }

    mergeShips(shipA, shipB) {
      if (shipA.id === shipB.id || shipA.tier !== shipB.tier) return false;

      const cost = this.getShipMergeCost(shipA.tier);
      if (this.coins < cost) return false;

      const idxA = this.ships.findIndex(s => s.id === shipA.id);
      const idxB = this.ships.findIndex(s => s.id === shipB.id);
      if (idxA === -1 || idxB === -1) return false;

      this.coins -= cost;
      const newTier = shipA.tier + 1;
      const targetAngle = shipB.angle;

      const toRemove = [shipA.id, shipB.id];
      this.ships = this.ships.filter(s => !toRemove.includes(s.id));

      const mergedShip = {
        id: this.nextEntityId++,
        tier: newTier,
        angle: targetAngle,
        speed: 0.95 + (newTier - 1) * 0.08,
        radiusOffset: 0
      };
      this.ships.push(mergedShip);

      this.totalMerges++;

      if (window.OrbitalAudio) {
        window.OrbitalAudio.playMerge();
      }

      this.checkGoalProgress();
      this.emit('onEntityChange');
      this.emit('onCoinUpdate');
      this.save();
      return mergedShip;
    }

    mergeNextPair() {
      const pair = this.findMergeableShipPair();
      if (!pair) return null;
      return this.mergeShips(pair[0], pair[1]);
    }

    // -------------------------------------------------------------
    // GATE MERGING & UPGRADING
    // -------------------------------------------------------------

    findMergeableGatePair() {
      const tierMap = new Map();
      for (const gate of this.gates) {
        if (!tierMap.has(gate.tier)) {
          tierMap.set(gate.tier, []);
        }
        tierMap.get(gate.tier).push(gate);
      }

      const sortedTiers = Array.from(tierMap.keys()).sort((a, b) => a - b);
      for (const tier of sortedTiers) {
        const list = tierMap.get(tier);
        if (list.length >= 2) {
          return [list[0], list[1]];
        }
      }
      return null;
    }

    getAvailableGateMergePairsCount() {
      const counts = {};
      for (const gate of this.gates) {
        counts[gate.tier] = (counts[gate.tier] || 0) + 1;
      }
      let pairs = 0;
      for (const count of Object.values(counts)) {
        pairs += Math.floor(count / 2);
      }
      return pairs;
    }

    getGateMergeCost(tier = 1) {
      return Math.round(10 * Math.pow(2.5, tier - 1));
    }

    canMergeGates(tier = null) {
      const pair = this.findMergeableGatePair();
      if (!pair) return false;
      const targetTier = tier !== null ? tier : pair[0].tier;
      return this.coins >= this.getGateMergeCost(targetTier);
    }

    mergeGates(gateA, gateB) {
      if (gateA.id === gateB.id || gateA.tier !== gateB.tier) return false;

      const cost = this.getGateMergeCost(gateA.tier);
      if (this.coins < cost) return false;

      const idxA = this.gates.findIndex(g => g.id === gateA.id);
      const idxB = this.gates.findIndex(g => g.id === gateB.id);
      if (idxA === -1 || idxB === -1) return false;

      this.coins -= cost;
      const newTier = gateA.tier + 1;

      this.gates = this.gates.filter(g => g.id !== gateA.id);
      const survivingGate = this.gates.find(g => g.id === gateB.id);
      if (survivingGate) {
        survivingGate.tier = newTier;
        survivingGate.multiplier = Math.pow(2, newTier - 1);
        survivingGate.pulse = 1.2;
      }

      this.repositionGates(true);
      this.totalMerges++;

      if (window.OrbitalAudio) {
        window.OrbitalAudio.playMerge();
      }

      this.checkGoalProgress();
      this.emit('onEntityChange');
      this.emit('onCoinUpdate');
      this.save();
      return survivingGate;
    }

    mergeNextGatePair() {
      const pair = this.findMergeableGatePair();
      if (!pair) return null;
      return this.mergeGates(pair[0], pair[1]);
    }

    getHighestShipTier() {
      if (this.ships.length === 0) return 0;
      return Math.max(...this.ships.map(s => s.tier));
    }

    getHighestGateTier() {
      if (this.gates.length === 0) return 0;
      return Math.max(...this.gates.map(g => g.tier));
    }

    // -------------------------------------------------------------
    // SCOREBOARD & LEADERBOARD SYSTEM
    // -------------------------------------------------------------

    setPlayerName(name) {
      if (!name || typeof name !== 'string') return;
      const clean = name.trim().slice(0, 16);
      if (clean.length > 0) {
        this.playerName = clean;
        try {
          localStorage.setItem('orbital_merge_player_name', clean);
        } catch (e) {}
        this.save();
        this.emit('onScoreboardUpdate');
      }
    }

    calculateScore() {
      const shipTier = this.getHighestShipTier();
      const gateTier = this.getHighestGateTier();
      const shipTierBonus = Math.max(0, shipTier - 1) * 1000;
      const gateTierBonus = Math.max(0, gateTier - 1) * 2500;
      const mergeBonus = this.totalMerges * 100;
      const passBonus = this.totalPasses * 2;
      const coinsScore = Math.floor(this.lifetimeCoins);
      const currentScore = coinsScore + shipTierBonus + gateTierBonus + mergeBonus + passBonus;
      if (currentScore > this.highScore) {
        this.highScore = currentScore;
      }
      if (window.OrbitalScoreboardService && window.OrbitalScoreboardService.hasValidConfig()) {
        window.OrbitalScoreboardService.submitScore(this.playerName, currentScore, shipTier, (this.theme && this.theme.icon) ? this.theme.icon : '🚀');
      }
      return currentScore;
    }

    getGalacticRivals() {
      return [
        { id: 'rival_1', name: 'Nova Prime', avatar: '👑', tier: 8, baseScore: 10000000 },
        { id: 'rival_2', name: 'Vortex Sovereign', avatar: '🌀', tier: 7, baseScore: 3500000 },
        { id: 'rival_3', name: 'Cyber Valkyrie', avatar: '⚡', tier: 6, baseScore: 1000000 },
        { id: 'rival_4', name: 'Quantum Wraith', avatar: '🛰️', tier: 5, baseScore: 350000 },
        { id: 'rival_5', name: 'Solaris Fox', avatar: '☀️', tier: 5, baseScore: 120000 },
        { id: 'rival_6', name: 'Chrono Nomad', avatar: '⏱️', tier: 4, baseScore: 45000 },
        { id: 'rival_7', name: 'Astro Phantom', avatar: '🌌', tier: 4, baseScore: 15000 },
        { id: 'rival_8', name: 'Nebula Strider', avatar: '🚀', tier: 3, baseScore: 5000 },
        { id: 'rival_9', name: 'Orbital Scout', avatar: '🛸', tier: 2, baseScore: 1800 },
        { id: 'rival_10', name: 'Cadet Spark', avatar: '👾', tier: 2, baseScore: 600 },
        { id: 'rival_11', name: 'Rookie Glider', avatar: '🚀', tier: 1, baseScore: 180 },
        { id: 'rival_12', name: 'Star Trainee', avatar: '🛰️', tier: 1, baseScore: 40 }
      ];
    }

    getLeaderboard() {
      const playerScore = this.calculateScore();

      // Check if real global scores from Firebase are available
      if (window.OrbitalScoreboardService && window.OrbitalScoreboardService.hasValidConfig()) {
        const realScores = window.OrbitalScoreboardService.cachedScores || [];
        const myPlayerId = window.OrbitalScoreboardService.playerId;
        const hasPlayer = realScores.some(s => s.isPlayer || s.id === myPlayerId);
        let all = [...realScores];
        if (!hasPlayer) {
          all.push({
            id: myPlayerId,
            name: this.playerName || 'Commander',
            avatar: (this.theme && this.theme.icon) ? this.theme.icon : '🚀',
            tier: this.getHighestShipTier() || 1,
            score: playerScore,
            isPlayer: true
          });
          all.sort((a, b) => b.score - a.score);
        } else {
          all = all.map(entry => {
            if (entry.id === myPlayerId || entry.isPlayer) {
              return {
                ...entry,
                name: this.playerName || entry.name,
                avatar: (this.theme && this.theme.icon) ? this.theme.icon : entry.avatar,
                score: Math.max(entry.score, playerScore),
                tier: Math.max(entry.tier || 1, this.getHighestShipTier() || 1),
                isPlayer: true
              };
            }
            return entry;
          });
          all.sort((a, b) => b.score - a.score);
        }

        let playerRank = 1;
        let nextRival = null;

        all.forEach((entry, idx) => {
          entry.rank = idx + 1;
          if (entry.isPlayer || entry.id === myPlayerId) {
            entry.isPlayer = true;
            playerRank = entry.rank;
            if (idx > 0) {
              nextRival = all[idx - 1];
            }
          }
        });

        return {
          entries: all,
          playerRank,
          playerScore,
          totalRanks: all.length,
          nextRival,
          pointsToPassNext: nextRival ? Math.max(1, nextRival.score - playerScore + 1) : 0,
          isRealGlobal: true
        };
      }

      const rivals = this.getGalacticRivals().map(r => ({
        id: r.id,
        name: r.name,
        avatar: r.avatar,
        tier: r.tier,
        score: r.baseScore,
        isPlayer: false
      }));

      const playerEntry = {
        id: 'player',
        name: this.playerName || 'Commander',
        avatar: (this.theme && this.theme.icon) ? this.theme.icon : '🚀',
        tier: this.getHighestShipTier() || 1,
        score: playerScore,
        isPlayer: true
      };

      const all = [...rivals, playerEntry];
      all.sort((a, b) => b.score - a.score);

      let playerRank = 1;
      let nextRival = null;

      all.forEach((entry, idx) => {
        entry.rank = idx + 1;
        if (entry.isPlayer) {
          playerRank = entry.rank;
          if (idx > 0) {
            nextRival = all[idx - 1];
          }
        }
      });

      return {
        entries: all,
        playerRank,
        playerScore,
        totalRanks: all.length,
        nextRival,
        pointsToPassNext: nextRival ? Math.max(1, nextRival.score - playerScore + 1) : 0
      };
    }

    getPersonalRecords() {
      const highestShipTier = this.getHighestShipTier() || 1;
      const highestGateTier = this.getHighestGateTier() || 1;
      const shipConfig = this.getShipTierConfig(highestShipTier);
      const gateConfig = (this.theme && this.theme.gateTiers) ? this.theme.gateTiers.find(g => g.tier === highestGateTier) : null;
      const gateMult = gateConfig ? `${gateConfig.multiplier}x` : `${Math.pow(2, highestGateTier - 1)}x`;

      return {
        highScore: Math.max(this.highScore, this.calculateScore()),
        lifetimeCoins: this.lifetimeCoins,
        highestShipTier: highestShipTier,
        highestShipName: shipConfig ? shipConfig.name : `Tier ${highestShipTier}`,
        highestGateTier: highestGateTier,
        highestGateMultiplier: gateMult,
        totalMerges: this.totalMerges,
        totalPasses: this.totalPasses,
        playerName: this.playerName || 'Commander'
      };
    }

    getCurrentGoal() {
      if (this.goalIndex < this.goals.length) {
        return this.goals[this.goalIndex];
      }
      const endlessStep = this.goalIndex - this.goals.length + 1;
      const target = 20 + endlessStep * 5;
      return {
        id: `endless_${this.goalIndex}`,
        text: `FLEET EXPANSION: REACH ${target} SHIPS BOUGHT`,
        type: 'ships_bought_total',
        target: target,
        reward: 5000 * endlessStep
      };
    }

    getGoalProgress() {
      const goal = this.getCurrentGoal();
      let current = 0;
      switch (goal.type) {
        case 'ships_count':
          current = this.ships.length;
          break;
        case 'gates_count':
          current = this.gates.length;
          break;
        case 'highest_tier':
          current = this.getHighestShipTier();
          break;
        case 'highest_gate_tier':
          current = this.getHighestGateTier();
          break;
        case 'current_coins':
          current = this.coins;
          break;
        case 'ships_bought_total':
          current = this.shipsBought;
          break;
        default:
          current = 0;
      }
      const percent = Math.min(100, Math.max(0, (current / goal.target) * 100));
      return {
        current: Math.min(current, goal.target),
        target: goal.target,
        percent: percent,
        isComplete: current >= goal.target
      };
    }

    checkGoalProgress() {
      const progress = this.getGoalProgress();
      this.emit('onGoalProgress', progress);

      if (progress.isComplete) {
        const goal = this.getCurrentGoal();
        this.coins += goal.reward;
        this.lifetimeCoins += goal.reward;

        if (window.OrbitalAudio) {
          window.OrbitalAudio.playGoalVictory();
        }

        this.emit('onGoalCompleted', goal);
        this.goalIndex++;
        this.emit('onCoinUpdate');
        this.save();
      }
    }

    update(dt) {
      const effectiveDt = dt * this.gameSpeed;

      // 1. Smoothly interpolate gates to their target angles
      this.gates.forEach(gate => {
        if (gate.pulse > 0) {
          gate.pulse = Math.max(0, gate.pulse - effectiveDt * 3.5);
        }
        if (gate.angle !== gate.targetAngle) {
          let diff = gate.targetAngle - gate.angle;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          gate.angle += diff * Math.min(1, effectiveDt * 5);
          gate.angle = (gate.angle + Math.PI * 2) % (Math.PI * 2);
        }
      });

      // 2. Move Ships & Detect Collisions with Gates
      const TWO_PI = Math.PI * 2;
      let frameEarnings = 0;

      this.ships.forEach(ship => {
        if (this.draggedShip && this.draggedShip.id === ship.id) return;

        const tierCfg = this.getShipTierConfig(ship.tier);
        const angularVelocity = ship.speed * tierCfg.speedMult;
        const prevAngle = ship.angle;
        let newAngle = (prevAngle + angularVelocity * effectiveDt) % TWO_PI;

        this.gates.forEach(gate => {
          let passed = false;
          const gAngle = (gate.angle % TWO_PI + TWO_PI) % TWO_PI;

          if (newAngle >= prevAngle) {
            if (gAngle >= prevAngle && gAngle < newAngle) {
              passed = true;
            }
          } else {
            if (gAngle >= prevAngle || gAngle < newAngle) {
              passed = true;
            }
          }

          if (passed) {
            const shipBaseVal = this.getShipPayout(ship.tier);
            const gateMult = gate.multiplier || 1;
            const payout = shipBaseVal * gateMult;

            this.coins += payout;
            this.lifetimeCoins += payout;
            this.totalPasses++;
            frameEarnings += payout;
            gate.pulse = 1.0;

            if (window.OrbitalAudio) {
              window.OrbitalAudio.playCoin(ship.tier);
            }

            this.emit('onGatePass', {
              ship: ship,
              gate: gate,
              payout: payout
            });
          }
        });

        ship.angle = newAngle;
      });

      // 3. Rolling CPS
      const now = performance.now();
      if (frameEarnings > 0) {
        this.recentEarnings.push({ time: now, amount: frameEarnings });
      }
      this.recentEarnings = this.recentEarnings.filter(e => now - e.time <= 1500);
      const sumRecent = this.recentEarnings.reduce((acc, e) => acc + e.amount, 0);
      this.coinsPerSecond = Number((sumRecent / 1.5).toFixed(1));

      this.checkGoalProgress();

      if (frameEarnings > 0) {
        this.emit('onCoinUpdate');
      }

      if (Date.now() - this.lastSaveTime > 5000) {
        this.save();
      }
    }

    on(event, callback) {
      if (this.listeners[event]) {
        this.listeners[event].push(callback);
      }
    }

    emit(event, data) {
      if (this.listeners[event]) {
        this.listeners[event].forEach(cb => cb(data));
      }
    }

    save() {
      this.lastSaveTime = Date.now();
      const stateData = {
        version: 3, // Incremented version for 1-coin economy
        theme: this.currentThemeId,
        coins: this.coins,
        lifetimeCoins: this.lifetimeCoins,
        totalPasses: this.totalPasses,
        totalMerges: this.totalMerges,
        shipsBought: this.shipsBought,
        gatesBought: this.gatesBought,
        goalIndex: this.goalIndex,
        highScore: this.highScore,
        playerName: this.playerName,
        ships: this.ships.map(s => ({ tier: s.tier, angle: s.angle })),
        gates: this.gates.map(g => ({ tier: g.tier, angle: g.angle, multiplier: g.multiplier })),
        timestamp: this.lastSaveTime
      };

      try {
        localStorage.setItem('orbital_merge_save_v1', JSON.stringify(stateData));
      } catch (e) {}
    }

    loadSave() {
      try {
        const raw = localStorage.getItem('orbital_merge_save_v1');
        if (!raw) {
          try {
            const storedName = localStorage.getItem('orbital_merge_player_name');
            if (storedName) this.playerName = storedName;
          } catch (e) {}
          this.applyThemeStyles();
          return;
        }

        const data = JSON.parse(raw);
        // If old version (< 3), reset to start clean with 1-coin economy
        if (!data.version || data.version < 3) {
          this.applyThemeStyles();
          return;
        }

        this.currentThemeId = data.theme || 'deep-space';
        this.coins = Math.max(0, data.coins || 0);
        this.lifetimeCoins = Math.max(this.coins, data.lifetimeCoins || this.coins);
        this.totalPasses = data.totalPasses || 0;
        this.totalMerges = data.totalMerges || 0;
        this.shipsBought = data.shipsBought || 0;
        this.gatesBought = data.gatesBought || 0;
        this.goalIndex = data.goalIndex || 0;
        this.highScore = data.highScore || 0;
        this.playerName = data.playerName || 'Commander';

        try {
          const storedName = localStorage.getItem('orbital_merge_player_name');
          if (storedName) this.playerName = storedName;
        } catch (e) {}

        if (Array.isArray(data.ships) && data.ships.length > 0) {
          this.ships = data.ships.map(s => ({
            id: this.nextEntityId++,
            tier: s.tier || 1,
            angle: s.angle || 0,
            speed: 0.95 + ((s.tier || 1) - 1) * 0.08,
            radiusOffset: 0
          }));
        }

        if (Array.isArray(data.gates) && data.gates.length > 0) {
          this.gates = data.gates.map(g => {
            const tier = g.tier || 1;
            return {
              id: this.nextEntityId++,
              tier: tier,
              angle: g.angle || 0,
              targetAngle: g.angle || 0,
              multiplier: Math.pow(2, tier - 1),
              pulse: 0
            };
          });
          this.repositionGates(false);
        }

        if (data.timestamp) {
          const elapsedSeconds = Math.min(6 * 3600, (Date.now() - data.timestamp) / 1000);
          if (elapsedSeconds > 10) {
            const estRate = this.calculateEstimatedIdleRate();
            const offlineGain = Math.round(estRate * elapsedSeconds * 0.5);
            if (offlineGain > 0) {
              this.coins += offlineGain;
              this.lifetimeCoins += offlineGain;
            }
          }
        }
      } catch (e) {
        console.warn('Failed to parse save file:', e);
      }

      this.applyThemeStyles();
    }

    calculateEstimatedIdleRate() {
      if (this.ships.length === 0 || this.gates.length === 0) return 0;
      let totalShipValue = 0;
      this.ships.forEach(s => totalShipValue += this.getShipPayout(s.tier));
      let totalGateMult = 0;
      this.gates.forEach(g => totalGateMult += (g.multiplier || 1));
      return Math.round((totalShipValue * totalGateMult) / 6.5);
    }

    resetSave() {
      try {
        localStorage.removeItem('orbital_merge_save_v1');
      } catch (e) {}
      window.location.reload();
    }
  }

  window.OrbitalGame = new GameState();
})();
