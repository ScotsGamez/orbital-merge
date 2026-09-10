# Orbital Merge & Idle Clicker MVP

A high-performance, dark-space orbital idle/merge game built with **HTML5 Canvas, CSS3, and Vanilla JavaScript**. Entities (spaceships, dragons, or data packets) orbit along a central circular track at 60fps, passing through gates to generate revenue. Players purchase additional entities, add gates, and merge identical tiers to climb through ascending multipliers.

Inspired by circular track idle merge games and fully customizable across the **Multiverse** (Deep Space, Fantasy Realm, and Cyberpunk).

- 🌐 **Live Demo (GitHub Pages)**: [https://scotsgamez.github.io/orbital-merge/](https://scotsgamez.github.io/orbital-merge/)
- 💻 **GitHub Repository**: [https://github.com/ScotsGamez/orbital-merge](https://github.com/ScotsGamez/orbital-merge)
- 🏠 **Local Network Access**: `http://192.168.0.21:8080`

---

## 🎮 Core Gameplay Loop

1. **Orbit & Generate**: Ships revolve clockwise along the central orbit at continuous angular velocity. Each time a ship passes through a gate, a payout is triggered:
   $$\text{Payout} = \text{Ship Tier Value} \times \text{Gate Tier Multiplier}$$
   *(Base Gate Multiplier starts at **2x** and scales by powers of 2: **2x, 4x, 8x, 16x, 32x, 64x**)*.
2. **Buy & Scale**: Expand your fleet and gate network starting with 1-coin economy:
   $$\text{New Cost} = \text{Base Cost} \times 1.15^{\text{Owned Amount}}$$
3. **Merge & Upgrade**: Merging requires an investment of currency that scales with the tier of the entities being combined:
   - **Merge Ships**: Combine two identical ships into Tier $N+1$ via the **MERGE SHIPS** button or canvas drag-and-drop. Merge cost scales exponentially: $\text{Cost} = \text{round}(2 \times 2.2^{T-1})$ coins (Tier 1: 2 coins, Tier 2: 4 coins, Tier 3: 10 coins).
   - **Merge Gates**: Combine two identical gates into Tier $N+1$ with double the multiplier via the **MERGE GATES** button. Merge cost scales exponentially: $\text{Cost} = \text{round}(10 \times 2.5^{T-1})$ coins (Tier 1: 10 coins, Tier 2: 25 coins, Tier 3: 63 coins).
4. **Mission Goals**: Progressive milestone missions with dynamic progress bars and instant cash bounties.

---

## 📋 Issue & Feature Tracker (GitHub)

Submit new ideas, balance feedback, and bug reports directly on GitHub:

- 💡 **[Submit Feature Request](https://github.com/ScotsGamez/orbital-merge/issues/new?template=feature_request.yml)** — Suggest new mechanics, visual themes, sound effects, or progression balance.
- 🐛 **[Report a Bug](https://github.com/ScotsGamez/orbital-merge/issues/new?template=bug_report.yml)** — Report any glitches, calculation mismatches, or layout issues.
- 📋 **[Roadmap & Change Log](FEATURE_TRACKER.md)** — View completed updates and upcoming backlog items.

---

## 🌌 Multiverse Themes

Switch themes seamlessly in real-time from the **Store (🌌)** menu:

| Theme | Entities | Gates | Currency | Style & Atmosphere |
| :--- | :--- | :--- | :--- | :--- |
| **Deep Space** (Default) | Scout Drones, Cruisers, Titans | Ionized Energy Gates | 🪙 Credits | Neon cyan/purple starfield with cosmic singularity core |
| **Fantasy Realm** | Drakes, Wyverns, Celestial Sovereigns | Arcane Runic Portals | 💎 Mana Gems | Mystic gold/emerald aura with floating mana wisps |
| **Cyberpunk** | Data Bytes, Neural Daemons, AI Cores | Security Firewalls | ⚡ Bitcoins | Synthwave matrix grid with binary trace sparks |

---

## 🕹️ Controls & Hotkeys

- **Mouse / Touch**:
  - Click **+1 SHIP** or **+1 GATE** to purchase.
  - Click **MERGE SHIPS** or **MERGE GATES** to combine matching pairs.
  - Drag and drop ships directly onto other ships of identical tier to merge.
- **Keyboard Shortcuts**:
  - `Space`: Buy +1 Ship
  - `G`: Buy +1 Gate
  - `M`: Merge lowest matching ship pair
  - `S`: Open / Close Multiverse Store & Stats modal

---

## 🛠️ Tech Stack & Architecture

- **Rendering**: HTML5 Canvas API with sub-pixel rendering, high-DPI scaling, and radial lighting.
- **Audio**: Web Audio API procedural synthesizer (zero external audio file dependencies).
- **Persistence**: Automatic `localStorage` saving with offline idle revenue calculation.
- **Directory Structure**:
  ```text
  orbital-merge/
  ├── index.html            # Semantic game layout & modals
  ├── style.css             # Modern dark neon theme & animations
  ├── script.js             # Controller binding DOM, audio, renderer & engine
  ├── FEATURE_TRACKER.md    # Central project issue and idea tracker
  ├── .github/
  │   └── ISSUE_TEMPLATE/   # Interactive GitHub Issue Forms (YAML)
  │       ├── feature_request.yml
  │       ├── bug_report.yml
  │       └── config.yml
  ├── src/
  │   ├── themes.js         # Central Multiverse theme definitions
  │   ├── audio.js          # Web Audio API sound synthesis
  │   ├── game.js           # Game state, economy math, collision, merge & upgrade
  │   └── renderer.js       # 60fps canvas engine, particles & drag-and-drop
  ├── README.md             # Documentation
  └── .gitignore
  ```

---

## 🚀 Local Setup & Running

Serve with a local HTTP server:

```bash
# Using Python (accessible to local network)
python3 -m http.server 8080 --bind 0.0.0.0
```

Then visit `http://localhost:8080` (or `http://192.168.0.21:8080` from phones/tablets on your WiFi).
