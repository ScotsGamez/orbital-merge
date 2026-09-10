# Orbital Merge & Idle Clicker MVP

A high-performance, dark-space orbital idle/merge game built with **HTML5 Canvas, CSS3, and Vanilla JavaScript**. Entities (spaceships, dragons, or data packets) orbit along a central circular track at 60fps, passing through gates to generate revenue. Players purchase additional entities, add gates, and merge identical tiers to climb through ascending multipliers.

Inspired by circular track idle merge games and fully customizable across the **Multiverse** (Deep Space, Fantasy Realm, and Cyberpunk).

---

## 🎮 Core Gameplay Loop

1. **Orbit & Generate**: Ships revolve clockwise along the central orbit at continuous angular velocity. Each time a ship passes through a gate, a payout is triggered:
   $$\text{Payout} = \text{Ship Tier Value} \times \text{Gate Tier Multiplier}$$
   *(Base Gate Multiplier starts at **2x** and scales by powers of 2: **2x, 4x, 8x, 16x, 32x, 64x**)*.
2. **Buy & Scale**: Expand your fleet and gate network. Costs scale exponentially:
   $$\text{New Cost} = \text{Base Cost} \times 1.15^{\text{Owned Amount}}$$
3. **Merge & Upgrade**:
   - **Merge Ships**: Combine two identical ships into Tier $N+1$ via the **MERGE SHIPS** button or canvas drag-and-drop.
   - **Merge Gates**: Combine two identical gates into Tier $N+1$ with double the multiplier via the **MERGE GATES** button.
   - **Individual Gate Inspector**: Click any gate on the track to open the Gate Inspector HUD card and upgrade it individually.
4. **Mission Goals**: Progressive milestone missions with dynamic progress bars and instant cash bounties.

---

## 📋 GitHub Issue & Feature Tracker

The project includes both an in-game tracker and repository issue board:
- Click the **📋 TRACKER** button in the top bar (or press `T`) to view open issues, submit new ideas or bug reports, and copy formatted GitHub markdown tables.
- See [`FEATURE_TRACKER.md`](./FEATURE_TRACKER.md) for the active board and backlog.
- GitHub issue templates are available in [`.github/ISSUE_TEMPLATE/`](./.github/ISSUE_TEMPLATE/).

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
  - Click on any gate to open the **Gate Inspector** to upgrade or merge it.
  - Drag and drop ships directly onto other ships of identical tier to merge.
- **Keyboard Shortcuts**:
  - `Space`: Buy +1 Ship
  - `G`: Buy +1 Gate
  - `M`: Merge lowest matching ship pair
  - `S`: Open / Close Multiverse Store & Stats modal
  - `T`: Open / Close Issue & Feature Tracker

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
  ├── .github/              # GitHub issue templates
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

Open `index.html` directly in any modern web browser, or serve with a local HTTP server:

```bash
# Using Python
python3 -m http.server 8080

# Using Node (npx)
npx serve .
```

Then visit `http://localhost:8080` in your browser.

---

## 📦 GitHub Push Instructions

```bash
git add .
git commit -m "Enhance gates: radial orientation, 2x base multiplier, gate merge/upgrade system, remove center emoji, add feature tracker"
git push
```
