/**
 * Orbital Merge & Idle Clicker - Audio Synthesizer
 * Zero-dependency Web Audio API sound generator for snappy, immersive sound effects.
 */
(function() {
  'use strict';

  class SoundManager {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.limiter = null;
      this.muted = false;
      this.lastCoinTime = 0;
      this.coinPitchOffset = 0;

      // Restore mute preference
      try {
        const savedMute = localStorage.getItem('orbital_merge_muted');
        if (savedMute !== null) {
          this.muted = JSON.parse(savedMute);
        }
      } catch (e) {
        // Fallback default
      }
    }

    init() {
      if (this.ctx) return;
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      this.ctx = new AudioContext();

      // Master Compressor / Limiter to prevent clipping during fast idle spam
      this.limiter = this.ctx.createDynamicsCompressor();
      this.limiter.threshold.setValueAtTime(-6, this.ctx.currentTime);
      this.limiter.knee.setValueAtTime(12, this.ctx.currentTime);
      this.limiter.ratio.setValueAtTime(16, this.ctx.currentTime);
      this.limiter.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.limiter.release.setValueAtTime(0.2, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.4, this.ctx.currentTime);

      this.masterGain.connect(this.limiter);
      this.limiter.connect(this.ctx.destination);
    }

    ensureContext() {
      if (!this.ctx) {
        this.init();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    setMuted(muted) {
      this.muted = muted;
      try {
        localStorage.setItem('orbital_merge_muted', JSON.stringify(this.muted));
      } catch (e) {}

      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.4, this.ctx.currentTime);
      }
    }

    toggleMute() {
      this.setMuted(!this.muted);
      return this.muted;
    }

    // Play coin / gate pass sound with pitch variance and throttling
    playCoin(tier = 1) {
      if (this.muted) return;
      this.ensureContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      if (now - this.lastCoinTime < 0.04) {
        this.coinPitchOffset = (this.coinPitchOffset + 1) % 5;
      } else {
        this.coinPitchOffset = 0;
      }
      this.lastCoinTime = now;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Harmonic frequencies based on tier and fast-sequence offset
      const baseFreq = 523.25; // C5
      const pentatonic = [1, 1.125, 1.25, 1.5, 1.667, 2, 2.25];
      const scaleIndex = (tier - 1 + this.coinPitchOffset) % pentatonic.length;
      const freq = baseFreq * pentatonic[scaleIndex];

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.08);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.13);
    }

    // Gate whoosh sound
    playGateWhoosh() {
      if (this.muted) return;
      this.ensureContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.15);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.exponentialRampToValueAtTime(1800, now + 0.1);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.19);
    }

    // Celebratory ascending merge fanfare
    playMerge() {
      if (this.muted) return;
      this.ensureContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const chord = [392.00, 523.25, 659.25, 783.99, 1046.50]; // G4, C5, E5, G5, C6

      chord.forEach((freq, idx) => {
        const noteTime = now + idx * 0.055;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.25, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.22);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(noteTime);
        osc.stop(noteTime + 0.23);
      });
    }

    // Crisp UI button click
    playClick() {
      if (this.muted) return;
      this.ensureContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.05);
    }

    // Purchase sound
    playBuy() {
      if (this.muted) return;
      this.ensureContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.11);
    }

    // Triumphant goal fanfare
    playGoalVictory() {
      if (this.muted) return;
      this.ensureContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [
        { f: 523.25, d: 0.1 },
        { f: 659.25, d: 0.1 },
        { f: 783.99, d: 0.1 },
        { f: 1046.50, d: 0.35 }
      ];

      let t = now;
      notes.forEach(n => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(n.f, t);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, t);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + n.d);
        t += n.d * 0.8;
      });
    }
  }

  window.OrbitalAudio = new SoundManager();
})();
