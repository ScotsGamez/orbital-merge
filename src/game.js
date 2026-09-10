/**
 * Orbital Merge & Idle Clicker - Core Game Engine
 * Manages game state, math formulas, entity arrays, collision detection, and merge mechanics.
 */
(function() {
  'use strict';

  class GameState {
    constructor() {
      this.currentThemeId = 'deep-space';
      this.coins = 50;
      this.lifetimeCoins = 50;
      this.totalPasses = 0;
      this.totalMerges = 0;
      this.shipsBought = 0;
      this.gatesBought = 0;
      this.gameSpeed = 1;
      this.maxShipsCapacity = 16;
      this.maxGatesCapacity = 10;
      this.lastSaveTime = Date.now();
      this.coinsPerSecond = 0;
      this.recentEarnings = []; // Rolling window for CPS calculation

      // Base Economy Constants
      this.BASE_SHIP_COST = 40;
      this.BASE_GATE_COST = 120;
      this.COST_EXPONENT = 1.15; // New Cost = Base Cost * 1.15^Owned

      // Entities
      this.ships = [];
      this.gates = [];
      this.nextEntityId = 1;
      this.selectedGateId = null;

      // Drag and Drop state
      this.draggedShip = null;
      this.hoveredShip = null;

      // Goal System
      this.goalIndex = 0;
      this.goals = [
        { id: 'buy_ship_1', text: 'ADD 2 SPACESHIPS', type: 'ships_count', target: 2, reward: 80 },
        { id: 'buy_gate_2', text: 'ADD 2ND GATE', type: 'gates_count', target: 2, reward: 150 },
        { id: 'merge_t2', text: 'MERGE A TIER 2 SHIP', type: 'highest_tier', target: 2, reward: 300 },
        { id: 'earn_500', text: 'REACH 500 COINS', type: 'current_coins', target: 500, reward: 400 },
        { id: 'ships_5', text: 'ADD 5 SPACESHIPS', type: 'ships_count', target: 5, reward: 600 },
        { id: 'buy_gate_3', text: 'ADD 3RD GATE', type: 'gates_count', target: 3, reward: 1000 },
        { id: 'merge_t3', text: 'MERGE A TIER 3 SHIP', type: 'highest_tier', target: 3, reward: 2000 },
        { id: 'merge_gate_t2', text: 'UPGRADE/MERGE A TIER 2 GATE', type: 'highest_gate_tier', target: 2, reward: 2500 },
        { id: 'earn_5k', text: 'REACH 5,000 COINS', type: 'current_coins', target: 5000, reward: 3000 },
        { id: 'ships_10', text: 'ADD 10 SPACESHIPS', type: 'ships_count', target: 10, reward: 5000 },
        { id: 'buy_gate_4', text: 'ADD 4TH GATE', type: 'gates_count', target: 4, reward: 8000 },
        { id: 'merge_t4', text: 'MERGE A TIER 4 SHIP', type: 'highest_tier', target: 4, reward: 12000 },
        { id: 'ships_20', text: 'ADD 20 SPACESHIPS', type: 'ships_bought_total', target: 20, reward: 25000 },
        { id: 'merge_t5', text: 'MERGE A TIER 5 SHIP', type: 'highest_tier', target: 5, reward: 50000 },
        { id: 'earn_100k', text: 'REACH 100,000 COINS', type: 'current_coins', target: 100000, reward: 100000 }
      ];

      // Event Listeners for UI updates
      this.listeners = {
        onCoinUpdate: [],
        onGoalProgress: [],
        onGoalCompleted: [],
        onEntityChange: [],
        onThemeChange: [],
        onGatePass: [],
        onGateSelect: []
      };

      // Initialize default entities
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
      // Start with 1 ship and 1 gate (Tier 1 Gate starts with 2x multiplier!)
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
          multiplier: 2,
          pulse: 0
        }
      ];

      this.repositionGates(false);
    }

    // Reposition gates symmetrically along the orbital circle
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

    // Get current tier configuration for ships
    getShipTierConfig(tier) {
      const tiers = this.theme.tiers;
      const idx = Math.min(tier - 1, tiers.length - 1);
      return tiers[idx] || tiers[0];
    }

    // Base payout formula: Ship Tier Value * Gate Tier Multiplier
    getShipPayout(tier) {
      const cfg = this.getShipTierConfig(tier);
      const baseValue = 10;
      return Math.round(baseValue * cfg.valueMult);
    }

    // Get gate tier configuration
    getGateTierConfig(tier) {
      const tiers = this.theme.gateTiers;
      const idx = Math.min(tier - 1, tiers.length - 1);
      return tiers[idx] || tiers[0];
    }

    // Economy Cost Formulas: Base Cost * 1.15^Owned
    getShipCost() {
      return Math.round(this.BASE_SHIP_COST * Math.pow(this.COST_EXPONENT, this.shipsBought));
    }

    getGateCost() {
      return Math.round(this.BASE_GATE_COST * Math.pow(this.COST_EXPONENT * 1.1, this.gatesBought));
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

      // Stagger new ship spawn angle to avoid overlapping
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
        multiplier: 2, // Tier 1 starts at 2x!
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

    // Find the first mergeable pair of identical ships
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

    // Count how many ship pairs can be merged right now
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

    // Execute Merge on a specific pair of ships
    mergeShips(shipA, shipB) {
      if (shipA.id === shipB.id || shipA.tier !== shipB.tier) return false;

      const idxA = this.ships.findIndex(s => s.id === shipA.id);
      const idxB = this.ships.findIndex(s => s.id === shipB.id);
      if (idxA === -1 || idxB === -1) return false;

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

    // Find the first mergeable pair of identical gates
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

    mergeGates(gateA, gateB) {
      if (gateA.id === gateB.id || gateA.tier !== gateB.tier) return false;

      const idxA = this.gates.findIndex(g => g.id === gateA.id);
      const idxB = this.gates.findIndex(g => g.id === gateB.id);
      if (idxA === -1 || idxB === -1) return false;

      const newTier = gateA.tier + 1;
      const targetAngle = gateB.angle;

      // Remove gateA, upgrade gateB
      this.gates = this.gates.filter(g => g.id !== gateA.id);
      const survivingGate = this.gates.find(g => g.id === gateB.id);
      if (survivingGate) {
        survivingGate.tier = newTier;
        survivingGate.multiplier = Math.pow(2, newTier);
        survivingGate.pulse = 1.2;
      }

      this.repositionGates(true);
      this.totalMerges++;

      if (window.OrbitalAudio) {
        window.OrbitalAudio.playMerge();
      }

      this.checkGoalProgress();
      this.emit('onEntityChange');
      this.save();
      return survivingGate;
    }

    mergeNextGatePair() {
      const pair = this.findMergeableGatePair();
      if (!pair) return null;
      return this.mergeGates(pair[0], pair[1]);
    }

    // Get upgrade cost for an individual gate
    getGateUpgradeCost(gateId) {
      const gate = this.gates.find(g => g.id === gateId);
      if (!gate) return 0;
      return Math.round(this.BASE_GATE_COST * 0.9 * Math.pow(2, gate.tier));
    }

    canUpgradeGate(gateId) {
      const cost = this.getGateUpgradeCost(gateId);
      return this.coins >= cost && cost > 0;
    }

    upgradeGate(gateId) {
      const gate = this.gates.find(g => g.id === gateId);
      if (!gate) return false;

      const cost = this.getGateUpgradeCost(gateId);
      if (this.coins < cost) return false;

      this.coins -= cost;
      gate.tier++;
      gate.multiplier = Math.pow(2, gate.tier);
      gate.pulse = 1.0;

      if (window.OrbitalAudio) {
        window.OrbitalAudio.playMerge();
      }

      this.checkGoalProgress();
      this.emit('onEntityChange');
      this.emit('onCoinUpdate');
      this.save();
      return true;
    }

    selectGate(id) {
      this.selectedGateId = id;
      this.emit('onGateSelect', this.getSelectedGate());
    }

    getSelectedGate() {
      return this.gates.find(g => g.id === this.selectedGateId) || null;
    }

    getHighestShipTier() {
      if (this.ships.length === 0) return 0;
      return Math.max(...this.ships.map(s => s.tier));
    }

    getHighestGateTier() {
      if (this.gates.length === 0) return 0;
      return Math.max(...this.gates.map(g => g.tier));
    }

    // Goal Evaluation
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
        reward: 50000 * endlessStep
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
            const gateMult = gate.multiplier || 2;
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
      this.coinsPerSecond = Math.round(sumRecent / 1.5);

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
        version: 2,
        theme: this.currentThemeId,
        coins: this.coins,
        lifetimeCoins: this.lifetimeCoins,
        totalPasses: this.totalPasses,
        totalMerges: this.totalMerges,
        shipsBought: this.shipsBought,
        gatesBought: this.gatesBought,
        goalIndex: this.goalIndex,
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
          this.applyThemeStyles();
          return;
        }

        const data = JSON.parse(raw);
        if (data) {
          this.currentThemeId = data.theme || 'deep-space';
          this.coins = Math.max(0, data.coins || 0);
          this.lifetimeCoins = Math.max(this.coins, data.lifetimeCoins || this.coins);
          this.totalPasses = data.totalPasses || 0;
          this.totalMerges = data.totalMerges || 0;
          this.shipsBought = data.shipsBought || 0;
          this.gatesBought = data.gatesBought || 0;
          this.goalIndex = data.goalIndex || 0;

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
                multiplier: Math.max(2, g.multiplier || Math.pow(2, tier)),
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
      this.gates.forEach(g => totalGateMult += (g.multiplier || 2));
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
