# Orbital Merge & Idle Clicker MVP

A high-performance, dark-space orbital idle/merge game built with **HTML5 Canvas, CSS3, and Vanilla JavaScript**. Entities (spaceships, dragons, or data packets) orbit along a central circular track at 60fps, passing through gates to generate revenue. Players purchase additional entities, add gates, and merge identical tiers to climb through ascending multipliers.

Inspired by circular track idle merge games and fully customizable across the **Multiverse** (Deep Space, Fantasy Realm, and Cyberpunk).

---

## 🎮 Core Gameplay Loop

1. **Orbit & Generate**: Ships revolve clockwise along the central orbit at continuous angular velocity. Each time a ship passes through a gate, a payout is triggered:
   $$\text{Payout} = \text{Ship Tier Value} \times \text{Gate Tier Multiplier}$$
2. **Buy & Scale**: Expand your fleet and gate network. Costs scale exponentially:
   $$\text{New Cost} = \text{Base Cost} \times 1.15^{\text{Owned Amount}}$$
3. **Merge & Upgrade**:
   - **Dedicated Merge Button**: Automatically combines the lowest available matching pair into a higher-tier entity.
   - **Canvas Drag-and-Drop**: Drag ships directly on the canvas and drop them onto matching same-tier ships to merge.
4. **Mission Goals**: Progressive milestone missions with dynamic progress bars and instant cash bounties.

---

## 🌌 Multiverse Themes

Switch themes seamlessly in real-time from the **Store (🌌)** menu:

| Theme | Entities | Gates | Currency | Style & Atmosphere |
| :--- | :--- | :--- | :--- | :--- |
| **Deep Space** (MVP Default) | Scout Drones, Cruisers, Titans | Ionized Energy Gates | 🪙 Credits | Neon cyan/purple starfield with cosmic dust |
| **Fantasy Realm** | Drakes, Wyverns, Celestial Sovereigns | Arcane Runic Portals | 💎 Mana Gems | Mystic gold/emerald aura with floating wisps |
| **Cyberpunk** | Data Bytes, Neural Daemons, AI Cores | Security Firewalls | ⚡ Bitcoins | Synthwave matrix grid with binary trace sparks |

---

## 🕹️ Controls & Hotkeys

- **Mouse / Touch**:
  - Click **+1 SHIP** or **+1 GATE** to purchase.
  - Click **MERGE** to combine matching pairs.
  - Drag and drop ships directly onto other ships of identical tier to merge.
- **Keyboard Shortcuts**:
  - `Space`: Buy +1 Ship
  - `G`: Buy +1 Gate
  - `M`: Merge lowest matching pair
  - `S`: Open / Close Multiverse Store & Stats modal

---

## 🛠️ Tech Stack & Architecture

- **Rendering**: HTML5 Canvas API with sub-pixel rendering, high-DPI scaling, and radial lighting.
- **Audio**: Web Audio API procedural synthesizer (zero external audio file dependencies).
- **Persistence**: Automatic `localStorage` saving with offline idle revenue calculation.
- **Directory Structure**:
  ```text
  orbital-merge/
  ├── index.html         # Semantic game layout
  ├── style.css          # Modern dark neon theme & animations
  ├── script.js          # Controller binding DOM and game loop
  ├── src/
  │   ├── themes.js      # Central Multiverse theme definitions
  │   ├── audio.js       # Web Audio API sound synthesis
  │   ├── game.js        # Game state, economy math, collision, goals
  │   └── renderer.js    # 60fps canvas engine, particles & drag-and-drop
  ├── README.md          # Documentation
  └── .gitignore
  ```

---

## 🚀 Local Setup & Running

Open `index.html` directly in any modern web browser, or serve with a lightweight local HTTP server:

```bash
# Using Python
python3 -m http.server 8080

# Using Node (npx)
npx serve .
```

Then visit `http://localhost:8080` in your browser.

---

## 📦 GitHub Initialization

To push this repository to GitHub, run:

```bash
git init
git add .
git commit -m "Initial commit: Orbital Merge MVP foundation"
git branch -M main
git remote add origin https://github.com/[USERNAME]/[REPO_NAME].git
git push -u origin main
```
