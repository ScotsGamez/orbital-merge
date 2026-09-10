/**
 * Orbital Merge - Google Firebase Realtime Global Scoreboard Service
 * Synchronizes real visitors' scores and rankings globally via Firebase Realtime Database.
 */
(function() {
  'use strict';

  // Default Firebase configuration
  // When Scotland sets up their Firebase project, the databaseURL goes here.
  const DEFAULT_FIREBASE_CONFIG = {
    databaseURL: 'https://orbital-merge-default-rtdb.firebaseio.com',
    projectId: 'orbital-merge'
  };

  class ScoreboardService {
    constructor() {
      this.config = this.loadConfig();
      this.playerId = this.getOrCreatePlayerId();
      this.isConnected = false;
      this.cachedScores = [];
      this.lastSubmitTime = 0;
      this.lastSubmitScore = 0;
      this.subscribers = [];
      this.pollInterval = null;

      this.init();
    }

    getOrCreatePlayerId() {
      let id = null;
      try {
        id = localStorage.getItem('orbital_merge_player_uuid');
        if (!id) {
          id = 'pilot_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
          localStorage.setItem('orbital_merge_player_uuid', id);
        }
      } catch (e) {
        id = 'pilot_' + Math.random().toString(36).substring(2, 10);
      }
      return id;
    }

    loadConfig() {
      let cfg = Object.assign({}, DEFAULT_FIREBASE_CONFIG);
      try {
        const stored = localStorage.getItem('orbital_merge_firebase_config');
        if (stored) {
          const parsed = JSON.parse(stored);
          cfg = Object.assign(cfg, parsed);
        }
      } catch (e) {}

      if (window.ORBITAL_FIREBASE_CONFIG) {
        cfg = Object.assign(cfg, window.ORBITAL_FIREBASE_CONFIG);
      }
      return cfg;
    }

    setFirebaseConfig(config) {
      if (!config) return false;
      if (typeof config === 'string') {
        let url = config.trim();
        if (!url.startsWith('http')) url = 'https://' + url;
        if (url.endsWith('/')) url = url.slice(0, -1);
        this.config = { databaseURL: url };
      } else {
        this.config = Object.assign({}, this.config, config);
      }

      try {
        localStorage.setItem('orbital_merge_firebase_config', JSON.stringify(this.config));
      } catch (e) {}

      this.init();
      return true;
    }

    hasValidConfig() {
      return !!(this.config && this.config.databaseURL && this.config.databaseURL.includes('firebaseio.com'));
    }

    async init() {
      if (!this.hasValidConfig()) {
        this.isConnected = false;
        return;
      }

      try {
        await this.fetchGlobalScores();
        this.isConnected = true;
        this.startPolling();
      } catch (e) {
        console.warn('Firebase initial connection error:', e);
        this.isConnected = false;
      }
    }

    startPolling() {
      if (this.pollInterval) clearInterval(this.pollInterval);
      // Poll every 30 seconds to keep scores fresh across real visitors
      this.pollInterval = setInterval(() => {
        if (this.hasValidConfig()) {
          this.fetchGlobalScores().catch(() => {});
        }
      }, 30000);
    }

    async fetchGlobalScores() {
      if (!this.hasValidConfig()) return [];

      try {
        const endpoint = `${this.config.databaseURL}/leaderboard.json`;
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error('Firebase HTTP ' + res.status);
        const data = await res.json();
        return this.processScoresData(data);
      } catch (err) {
        console.warn('Failed to fetch from Firebase:', err);
        return [];
      }
    }

    processScoresData(rawData) {
      if (!rawData || typeof rawData !== 'object') {
        this.cachedScores = [];
        return [];
      }

      const list = [];
      Object.keys(rawData).forEach(key => {
        const item = rawData[key];
        if (item && typeof item.score === 'number') {
          list.push({
            id: key,
            name: String(item.name || 'Commander').slice(0, 16),
            score: Math.floor(item.score),
            tier: item.tier || 1,
            avatar: item.avatar || '🚀',
            timestamp: item.timestamp || 0,
            isPlayer: key === this.playerId
          });
        }
      });

      // Sort descending by score
      list.sort((a, b) => b.score - a.score);

      list.forEach((entry, idx) => {
        entry.rank = idx + 1;
      });

      this.cachedScores = list;
      this.notifySubscribers(list);
      return list;
    }

    async submitScore(playerName, score, tier = 1, avatar = '🚀') {
      if (!this.hasValidConfig()) return false;
      if (!score || score <= 0) return false;

      const now = Date.now();
      // Rate-limit submissions to at most once every 4 seconds unless score changed significantly
      if (now - this.lastSubmitTime < 4000 && score <= this.lastSubmitScore) {
        return false;
      }

      this.lastSubmitTime = now;
      this.lastSubmitScore = score;

      const existingEntry = this.cachedScores.find(s => s.id === this.playerId);
      const bestScore = existingEntry ? Math.max(existingEntry.score, Math.floor(score)) : Math.floor(score);
      const bestTier = existingEntry ? Math.max(existingEntry.tier || 1, tier || 1) : (tier || 1);

      const payload = {
        name: String(playerName || 'Commander').slice(0, 16),
        score: bestScore,
        tier: bestTier,
        avatar: avatar,
        timestamp: now
      };

      try {
        const endpoint = `${this.config.databaseURL}/leaderboard/${this.playerId}.json`;
        const res = await fetch(endpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          this.isConnected = true;
          // Refresh local cached view
          await this.fetchGlobalScores();
          return true;
        } else {
          console.warn('Firebase submit HTTP status:', res.status);
          return false;
        }
      } catch (err) {
        console.warn('Firebase submit error:', err);
        return false;
      }
    }

    subscribe(callback) {
      if (typeof callback === 'function') {
        this.subscribers.push(callback);
      }
    }

    notifySubscribers(data) {
      this.subscribers.forEach(cb => {
        try { cb(data); } catch (e) {}
      });
    }
  }

  window.OrbitalScoreboardService = new ScoreboardService();
})();
