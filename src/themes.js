/**
 * Orbital Merge & Idle Clicker - Multiverse Themes Configuration
 * Centralized theme definitions allowing seamless asset, styling, and variable toggling.
 */
(function() {
  'use strict';

  const THEMES = {
    'deep-space': {
      id: 'deep-space',
      name: 'Deep Space',
      icon: '🚀',
      description: 'Futuristic starships, ionized energy gates, and a vibrant neon cosmos.',
      currencySymbol: '🪙',
      currencyName: 'Credits',
      entityName: 'Ship',
      entitiesName: 'Ships',
      gateName: 'Energy Gate',
      gatesName: 'Energy Gates',
      cssVars: {
        '--bg-color': '#070913',
        '--card-bg': 'rgba(14, 20, 40, 0.75)',
        '--card-border': 'rgba(64, 156, 255, 0.25)',
        '--accent-cyan': '#00f0ff',
        '--accent-glow': 'rgba(0, 240, 255, 0.45)',
        '--accent-purple': '#b026ff',
        '--accent-green': '#00ff88',
        '--accent-gold': '#ffd700',
        '--text-primary': '#f0f6fc',
        '--text-secondary': '#8b9bb4',
        '--track-ring': 'rgba(0, 240, 255, 0.18)',
        '--track-glow': 'rgba(0, 240, 255, 0.35)',
        '--track-core': 'rgba(255, 255, 255, 0.2)'
      },
      tiers: [
        { tier: 1, name: 'Scout Drone', color: '#00f0ff', secondaryColor: '#7000ff', size: 13, speedMult: 1.00, valueMult: 1 },
        { tier: 2, name: 'Vanguard Fighter', color: '#00ffaa', secondaryColor: '#0077ff', size: 15, speedMult: 1.08, valueMult: 2.5 },
        { tier: 3, name: 'Ion Interceptor', color: '#ffd000', secondaryColor: '#ff5500', size: 17, speedMult: 1.16, valueMult: 6.5 },
        { tier: 4, name: 'Plasma Cruiser', color: '#ff0077', secondaryColor: '#9900ff', size: 19, speedMult: 1.25, valueMult: 17 },
        { tier: 5, name: 'Void Dreadnought', color: '#a855f7', secondaryColor: '#3b82f6', size: 21, speedMult: 1.35, valueMult: 45 },
        { tier: 6, name: 'Quantum Colossus', color: '#f43f5e', secondaryColor: '#fbbf24', size: 23, speedMult: 1.45, valueMult: 120 },
        { tier: 7, name: 'Singularity Core', color: '#ffffff', secondaryColor: '#00f0ff', size: 25, speedMult: 1.55, valueMult: 320 },
        { tier: 8, name: 'Hyperdrive Titan', color: '#00ffea', secondaryColor: '#ff00aa', size: 27, speedMult: 1.65, valueMult: 850 }
      ],
      gateTiers: [
        { tier: 1, name: 'Alpha Node', color: '#00f0ff', pulseColor: 'rgba(0, 240, 255, 0.7)', multiplier: 1 },
        { tier: 2, name: 'Beta Accelerator', color: '#00ff88', pulseColor: 'rgba(0, 255, 136, 0.7)', multiplier: 2 },
        { tier: 3, name: 'Gamma Warp Gate', color: '#ffd700', pulseColor: 'rgba(255, 215, 0, 0.7)', multiplier: 4 },
        { tier: 4, name: 'Delta Vortex Gate', color: '#ff2d75', pulseColor: 'rgba(255, 45, 117, 0.7)', multiplier: 8 },
        { tier: 5, name: 'Omega Rift Gate', color: '#b026ff', pulseColor: 'rgba(176, 38, 255, 0.8)', multiplier: 16 }
      ]
    },

    'fantasy-realm': {
      id: 'fantasy-realm',
      name: 'Fantasy Realm',
      icon: '🐉',
      description: 'Mythical dragons flying in orbit, arcane portals, and celestial mana clouds.',
      currencySymbol: '💎',
      currencyName: 'Mana Gems',
      entityName: 'Dragon',
      entitiesName: 'Dragons',
      gateName: 'Arcane Portal',
      gatesName: 'Arcane Portals',
      cssVars: {
        '--bg-color': '#0d0716',
        '--card-bg': 'rgba(26, 15, 43, 0.8)',
        '--card-border': 'rgba(218, 165, 32, 0.35)',
        '--accent-cyan': '#7bf1a8',
        '--accent-glow': 'rgba(123, 241, 168, 0.45)',
        '--accent-purple': '#c084fc',
        '--accent-green': '#10b981',
        '--accent-gold': '#fbbf24',
        '--text-primary': '#fef3c7',
        '--text-secondary': '#c4b5fd',
        '--track-ring': 'rgba(251, 191, 36, 0.22)',
        '--track-glow': 'rgba(192, 132, 252, 0.4)',
        '--track-core': 'rgba(254, 243, 199, 0.25)'
      },
      tiers: [
        { tier: 1, name: 'Ember Drake', color: '#f97316', secondaryColor: '#ea580c', size: 14, speedMult: 1.00, valueMult: 1 },
        { tier: 2, name: 'Forest Wyvern', color: '#10b981', secondaryColor: '#059669', size: 16, speedMult: 1.08, valueMult: 2.5 },
        { tier: 3, name: 'Storm Serpent', color: '#38bdf8', secondaryColor: '#0284c7', size: 18, speedMult: 1.16, valueMult: 6.5 },
        { tier: 4, name: 'Runic Dragon', color: '#a855f7', secondaryColor: '#7e22ce', size: 20, speedMult: 1.25, valueMult: 17 },
        { tier: 5, name: 'Solar Phoenix', color: '#f59e0b', secondaryColor: '#dc2626', size: 22, speedMult: 1.35, valueMult: 45 },
        { tier: 6, name: 'Nether Leviathan', color: '#ec4899', secondaryColor: '#be185d', size: 24, speedMult: 1.45, valueMult: 120 },
        { tier: 7, name: 'Astral Behemoth', color: '#e0e7ff', secondaryColor: '#818cf8', size: 26, speedMult: 1.55, valueMult: 320 },
        { tier: 8, name: 'Celestial Sovereign', color: '#fef08a', secondaryColor: '#f43f5e', size: 28, speedMult: 1.65, valueMult: 850 }
      ],
      gateTiers: [
        { tier: 1, name: 'Stone Arch', color: '#fbbf24', pulseColor: 'rgba(251, 191, 36, 0.7)', multiplier: 1 },
        { tier: 2, name: 'Emerald Gateway', color: '#34d399', pulseColor: 'rgba(52, 211, 153, 0.7)', multiplier: 2 },
        { tier: 3, name: 'Sapphire Shrine', color: '#60a5fa', pulseColor: 'rgba(96, 165, 250, 0.7)', multiplier: 4 },
        { tier: 4, name: 'Amethyst Sanctum', color: '#c084fc', pulseColor: 'rgba(192, 132, 252, 0.7)', multiplier: 8 },
        { tier: 5, name: 'Celestial Zenith', color: '#fef08a', pulseColor: 'rgba(254, 240, 138, 0.8)', multiplier: 16 }
      ]
    },

    'cyberpunk': {
      id: 'cyberpunk',
      name: 'Cyberpunk',
      icon: '⚡',
      description: 'Encrypted data packets traveling high-speed bus lines through security firewalls.',
      currencySymbol: '⚡',
      currencyName: 'Bitcoins',
      entityName: 'Data Packet',
      entitiesName: 'Data Packets',
      gateName: 'Firewall Hub',
      gatesName: 'Firewall Hubs',
      cssVars: {
        '--bg-color': '#090812',
        '--card-bg': 'rgba(18, 14, 30, 0.85)',
        '--card-border': 'rgba(255, 0, 127, 0.4)',
        '--accent-cyan': '#00ffcc',
        '--accent-glow': 'rgba(255, 0, 128, 0.5)',
        '--accent-purple': '#ff007f',
        '--accent-green': '#39ff14',
        '--accent-gold': '#ffe600',
        '--text-primary': '#00ffcc',
        '--text-secondary': '#ff77aa',
        '--track-ring': 'rgba(255, 0, 128, 0.25)',
        '--track-glow': 'rgba(0, 255, 204, 0.45)',
        '--track-core': 'rgba(255, 255, 255, 0.3)'
      },
      tiers: [
        { tier: 1, name: 'Byte Bit', color: '#00ffcc', secondaryColor: '#008877', size: 12, speedMult: 1.00, valueMult: 1 },
        { tier: 2, name: 'Subroutine Ping', color: '#39ff14', secondaryColor: '#1b8005', size: 14, speedMult: 1.08, valueMult: 2.5 },
        { tier: 3, name: 'Trojan Thread', color: '#ffe600', secondaryColor: '#ff6600', size: 16, speedMult: 1.16, valueMult: 6.5 },
        { tier: 4, name: 'Encrypted Cipher', color: '#ff007f', secondaryColor: '#99004d', size: 18, speedMult: 1.25, valueMult: 17 },
        { tier: 5, name: 'Neural Daemon', color: '#a855f7', secondaryColor: '#6366f1', size: 20, speedMult: 1.35, valueMult: 45 },
        { tier: 6, name: 'Ghost Proxy', color: '#06b6d4', secondaryColor: '#ec4899', size: 22, speedMult: 1.45, valueMult: 120 },
        { tier: 7, name: 'Quantum Payload', color: '#ffffff', secondaryColor: '#ff007f', size: 24, speedMult: 1.55, valueMult: 320 },
        { tier: 8, name: 'Synthesized AI Core', color: '#ffe600', secondaryColor: '#00ffcc', size: 26, speedMult: 1.65, valueMult: 850 }
      ],
      gateTiers: [
        { tier: 1, name: 'Proxy Filter', color: '#ff007f', pulseColor: 'rgba(255, 0, 127, 0.7)', multiplier: 1 },
        { tier: 2, name: 'SSL Tunnel', color: '#00ffcc', pulseColor: 'rgba(0, 255, 204, 0.7)', multiplier: 2 },
        { tier: 3, name: 'Packet Decryptor', color: '#39ff14', pulseColor: 'rgba(57, 255, 20, 0.7)', multiplier: 4 },
        { tier: 4, name: 'Mainframe Router', color: '#ffe600', pulseColor: 'rgba(255, 230, 0, 0.7)', multiplier: 8 },
        { tier: 5, name: 'Quantum Firewall', color: '#a855f7', pulseColor: 'rgba(168, 85, 247, 0.8)', multiplier: 16 }
      ]
    }
  };

  window.OrbitalThemes = THEMES;
})();
