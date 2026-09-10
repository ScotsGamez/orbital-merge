/**
 * Orbital Merge & Idle Clicker - 60fps Canvas Renderer
 * Handles track rendering, ships, gates, engine exhaust trails, floating texts, and drag-and-drop.
 */
(function() {
  'use strict';

  class OrbitalRenderer {
    constructor(canvas, game) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.game = game;

      this.width = 0;
      this.height = 0;
      this.centerX = 0;
      this.centerY = 0;
      this.orbitRadius = 0;
      this.dpr = window.devicePixelRatio || 1;

      // Particle and FX arrays
      this.particles = [];
      this.floatingTexts = [];
      this.shipTrails = [];

      // Background stars / grid cache
      this.bgElements = [];
      this.bgInitialized = false;

      // Drag and Drop / Selection
      this.draggedShip = null;
      this.dragPos = { x: 0, y: 0 };
      this.hoverTargetShip = null;
      this.isPointerDown = false;

      // Animation loop
      this.lastFrameTime = performance.now();
      this.isRunning = false;

      this.initEvents();
      this.resize();
    }

    initEvents() {
      window.addEventListener('resize', () => this.resize());

      this.game.on('onGatePass', data => {
        this.createGatePassEffect(data);
      });

      this.game.on('onGoalCompleted', goal => {
        this.createCelebrationBurst();
      });

      // Canvas Pointer Interactions
      this.canvas.addEventListener('pointerdown', e => this.handlePointerDown(e));
      window.addEventListener('pointermove', e => this.handlePointerMove(e));
      window.addEventListener('pointerup', e => this.handlePointerUp(e));
      window.addEventListener('pointercancel', e => this.handlePointerUp(e));
    }

    resize() {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      this.width = rect.width;
      this.height = rect.height;

      this.dpr = window.devicePixelRatio || 1;
      this.canvas.width = Math.floor(this.width * this.dpr);
      this.canvas.height = Math.floor(this.height * this.dpr);

      this.centerX = this.width / 2;
      this.centerY = this.height / 2;
      this.orbitRadius = Math.min(this.width, this.height) * 0.36;

      this.initBackgroundElements();
    }

    initBackgroundElements() {
      this.bgElements = [];
      const count = 80;
      for (let i = 0; i < count; i++) {
        this.bgElements.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          size: Math.random() * 2 + 0.7,
          alpha: Math.random() * 0.7 + 0.2,
          speed: Math.random() * 0.02 + 0.005,
          phase: Math.random() * Math.PI * 2
        });
      }
      this.bgInitialized = true;
    }

    start() {
      if (this.isRunning) return;
      this.isRunning = true;
      this.lastFrameTime = performance.now();
      requestAnimationFrame(time => this.loop(time));
    }

    loop(currentTime) {
      if (!this.isRunning) return;

      const dt = Math.min(0.1, (currentTime - this.lastFrameTime) / 1000);
      this.lastFrameTime = currentTime;

      // Update game physics and collision
      this.game.update(dt);

      // Render Frame
      this.render(dt);

      requestAnimationFrame(time => this.loop(time));
    }

    render(dt) {
      const ctx = this.ctx;
      ctx.save();
      ctx.scale(this.dpr, this.dpr);

      // Clear Screen
      ctx.clearRect(0, 0, this.width, this.height);

      // 1. Draw Background
      this.drawBackground(dt);

      // 2. Draw Center Core / Hub (NO EMOJI - Pure Sci-Fi Singularity)
      this.drawCenterHub();

      // 3. Draw Orbit Track
      this.drawTrack();

      // 4. Draw Gates (Rotated spanning across the line)
      this.drawGates();

      // 5. Draw Engine Trails
      this.drawTrails(dt);

      // 6. Draw Ships
      this.drawShips();

      // 7. Draw Drag & Drop Overlays
      this.drawDragInteraction();

      // 8. Draw Particles & FX
      this.drawParticles(dt);

      // 9. Draw Floating Text Popups
      this.drawFloatingTexts(dt);

      ctx.restore();
    }

    drawBackground(dt) {
      const ctx = this.ctx;
      const theme = this.game.theme;
      const now = performance.now() * 0.001;

      if (theme.id === 'deep-space') {
        const grad = ctx.createRadialGradient(
          this.centerX, this.centerY, this.orbitRadius * 0.2,
          this.centerX, this.centerY, this.width * 0.7
        );
        grad.addColorStop(0, 'rgba(20, 35, 75, 0.45)');
        grad.addColorStop(0.6, 'rgba(10, 15, 35, 0.2)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.width, this.height);

        this.bgElements.forEach(star => {
          const flicker = Math.sin(now * 3 + star.phase) * 0.3 + 0.7;
          ctx.fillStyle = `rgba(220, 240, 255, ${star.alpha * flicker})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
        });

      } else if (theme.id === 'fantasy-realm') {
        const grad = ctx.createRadialGradient(
          this.centerX, this.centerY, 10,
          this.centerX, this.centerY, this.orbitRadius * 1.4
        );
        grad.addColorStop(0, 'rgba(90, 30, 140, 0.35)');
        grad.addColorStop(0.7, 'rgba(30, 10, 50, 0.15)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.width, this.height);

        this.bgElements.forEach(star => {
          star.y -= star.speed * 20;
          if (star.y < 0) star.y = this.height;
          const flicker = Math.sin(now * 2 + star.phase) * 0.35 + 0.65;
          ctx.fillStyle = `rgba(230, 180, 255, ${star.alpha * flicker * 0.7})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 1.3, 0, Math.PI * 2);
          ctx.fill();
        });

      } else if (theme.id === 'cyberpunk') {
        ctx.strokeStyle = 'rgba(0, 255, 204, 0.05)';
        ctx.lineWidth = 1;
        const gridSize = 45;
        for (let x = 0; x < this.width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, this.height);
          ctx.stroke();
        }
        for (let y = 0; y < this.height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(this.width, y);
          ctx.stroke();
        }

        this.bgElements.forEach(star => {
          const flicker = Math.sin(now * 8 + star.phase) > 0.3 ? 0.9 : 0.1;
          ctx.fillStyle = `rgba(255, 0, 127, ${flicker * 0.6})`;
          ctx.fillRect(star.x, star.y, 2, 2);
        });
      }
    }

    // High-tech Sci-Fi Singularity Center Core (NO EMOJI)
    drawCenterHub() {
      const ctx = this.ctx;
      const theme = this.game.theme;
      const now = performance.now() * 0.001;

      ctx.save();
      ctx.translate(this.centerX, this.centerY);

      // Rotating Outer Energy Ring
      ctx.save();
      ctx.rotate(now * 0.4);
      ctx.strokeStyle = theme.cssVars['--accent-cyan'];
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 14]);
      ctx.beginPath();
      ctx.arc(0, 0, 38, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Counter-rotating Inner Tech Ring
      ctx.save();
      ctx.rotate(-now * 0.6);
      ctx.strokeStyle = theme.cssVars['--accent-purple'];
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 10]);
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Pulsing Glow Aura
      const pulse = Math.sin(now * 2.5) * 3;
      const coreRadius = 22 + pulse;

      const haloGrad = ctx.createRadialGradient(0, 0, coreRadius * 0.4, 0, 0, coreRadius * 2.5);
      haloGrad.addColorStop(0, theme.cssVars['--accent-glow']);
      haloGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(0, 0, coreRadius * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Core Plasma Sphere
      const coreGrad = ctx.createRadialGradient(-coreRadius * 0.25, -coreRadius * 0.25, 2, 0, 0, coreRadius);
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.35, theme.cssVars['--accent-cyan']);
      coreGrad.addColorStop(0.85, theme.cssVars['--accent-purple']);
      coreGrad.addColorStop(1, '#0b0f1e');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      // Center Singularity Eye
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    drawTrack() {
      const ctx = this.ctx;
      const theme = this.game.theme;
      const R = this.orbitRadius;

      ctx.save();

      // Outer Glow Halo
      ctx.strokeStyle = theme.cssVars['--track-glow'];
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY, R, 0, Math.PI * 2);
      ctx.stroke();

      // Sharp Core Track Line
      ctx.strokeStyle = theme.cssVars['--track-ring'];
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY, R, 0, Math.PI * 2);
      ctx.stroke();

      // Dashed inner accent ring
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 12]);
      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY, R, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();
    }

    // Rotated Gates that Span Across the Orbit Track as a Real Archway
    drawGates() {
      const ctx = this.ctx;
      const R = this.orbitRadius;

      this.game.gates.forEach(gate => {
        const angle = gate.angle;
        const gx = this.centerX + Math.cos(angle) * R;
        const gy = this.centerY + Math.sin(angle) * R;

        const gateCfg = this.game.getGateTierConfig(gate.tier);
        const pulse = gate.pulse || 0;

        ctx.save();
        ctx.translate(gx, gy);
        // Rotate by 'angle' so local X-axis is RADIAL (outward).
        // The beam spanning from -halfWidth to +halfWidth crosses the track from inside to outside!
        ctx.rotate(angle);

        const beamHalfWidth = 24 + pulse * 6; // Radial distance between pylons
        const pylonDepth = 8; // Tangential thickness of pylons

        // Passing Pulse Flare
        if (pulse > 0.05) {
          ctx.fillStyle = gateCfg.pulseColor;
          ctx.shadowColor = gateCfg.color;
          ctx.shadowBlur = 18 * pulse;
          ctx.beginPath();
          ctx.arc(0, 0, 22 * pulse, 0, Math.PI * 2);
          ctx.fill();
        }

        // Energy Plasma Beam spanning ACROSS the orbital track (from inner to outer radius)
        const fieldGrad = ctx.createLinearGradient(-beamHalfWidth, 0, beamHalfWidth, 0);
        fieldGrad.addColorStop(0, gateCfg.color);
        fieldGrad.addColorStop(0.5, '#ffffff');
        fieldGrad.addColorStop(1, gateCfg.color);

        ctx.strokeStyle = fieldGrad;
        ctx.lineWidth = 4 + pulse * 4;
        ctx.shadowColor = gateCfg.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(-beamHalfWidth, 0);
        ctx.lineTo(beamHalfWidth, 0);
        ctx.stroke();

        // Inner & Outer Pylons (oriented straddling the track line)
        // Inner pylon at x = -beamHalfWidth, Outer pylon at x = +beamHalfWidth
        [-beamHalfWidth, beamHalfWidth].forEach(px => {
          ctx.fillStyle = '#101424';
          ctx.strokeStyle = gateCfg.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          // Pylon oriented perpendicular to beam, so it faces along the track like an arch post
          ctx.roundRect(px - 4, -pylonDepth, 8, pylonDepth * 2, 3);
          ctx.fill();
          ctx.stroke();

          // Pylon LED / Power Crystal
          ctx.fillStyle = gateCfg.color;
          ctx.beginPath();
          ctx.arc(px, 0, 2.5, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.restore();

        // Multiplier Pill Badge - Positioned cleanly outside the outer pylon
        const outerPylonDist = R + beamHalfWidth + 14;
        const badgeX = this.centerX + Math.cos(angle) * outerPylonDist;
        const badgeY = this.centerY + Math.sin(angle) * outerPylonDist;

        ctx.save();
        ctx.translate(badgeX, badgeY);
        ctx.fillStyle = 'rgba(10, 16, 32, 0.88)';
        ctx.strokeStyle = gateCfg.color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(-16, -8, 32, 16, 4);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 9.5px monospace';
        ctx.fillStyle = gateCfg.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Multiplier display: 2x, 4x, 8x, etc.
        const badgeText = gateCfg.badge || (gate.tier > 1 ? `${gate.multiplier}x` : 'Lv.1');
        ctx.fillText(badgeText, 0, 1);
        ctx.restore();
      });
    }

    drawTrails(dt) {
      const ctx = this.ctx;
      const R = this.orbitRadius;

      this.game.ships.forEach(ship => {
        if (this.draggedShip && this.draggedShip.id === ship.id) return;

        const sx = this.centerX + Math.cos(ship.angle) * (R + (ship.radiusOffset || 0));
        const sy = this.centerY + Math.sin(ship.angle) * (R + (ship.radiusOffset || 0));
        const tierCfg = this.game.getShipTierConfig(ship.tier);

        const rearAngle = ship.angle - 0.05;
        const rx = this.centerX + Math.cos(rearAngle) * (R + (ship.radiusOffset || 0));
        const ry = this.centerY + Math.sin(rearAngle) * (R + (ship.radiusOffset || 0));

        this.shipTrails.push({
          x: rx + (Math.random() - 0.5) * 2,
          y: ry + (Math.random() - 0.5) * 2,
          color: tierCfg.color,
          size: Math.max(1.5, tierCfg.size * 0.22),
          life: 0.28,
          maxLife: 0.28
        });
      });

      for (let i = this.shipTrails.length - 1; i >= 0; i--) {
        const tr = this.shipTrails[i];
        tr.life -= dt;
        if (tr.life <= 0) {
          this.shipTrails.splice(i, 1);
          continue;
        }

        const alpha = (tr.life / tr.maxLife) * 0.6;
        ctx.fillStyle = tr.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(tr.x, tr.y, tr.size * (tr.life / tr.maxLife), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
    }

    drawShips() {
      const ctx = this.ctx;
      const R = this.orbitRadius;
      const theme = this.game.theme;

      this.game.ships.forEach(ship => {
        let x, y, heading;

        if (this.draggedShip && this.draggedShip.id === ship.id) {
          x = this.dragPos.x;
          y = this.dragPos.y;
          heading = ship.angle + Math.PI / 2;
        } else {
          x = this.centerX + Math.cos(ship.angle) * (R + (ship.radiusOffset || 0));
          y = this.centerY + Math.sin(ship.angle) * (R + (ship.radiusOffset || 0));
          heading = ship.angle + Math.PI / 2;
        }

        const tierCfg = this.game.getShipTierConfig(ship.tier);
        const s = tierCfg.size;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(heading);

        if (this.hoverTargetShip && this.hoverTargetShip.id === ship.id) {
          ctx.strokeStyle = '#00ff88';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#00ff88';
          ctx.shadowBlur = 16;
          ctx.beginPath();
          ctx.arc(0, 0, s * 1.5, 0, Math.PI * 2);
          ctx.stroke();
        }

        if (theme.id === 'deep-space') {
          this.drawSpaceShip(ctx, ship, tierCfg, s);
        } else if (theme.id === 'fantasy-realm') {
          this.drawDragon(ctx, ship, tierCfg, s);
        } else {
          this.drawCyberPacket(ctx, ship, tierCfg, s);
        }

        ctx.restore();

        // Upright Tier Pill Badge
        ctx.save();
        ctx.translate(x, y - s - 10);
        ctx.fillStyle = 'rgba(10, 14, 28, 0.85)';
        ctx.strokeStyle = tierCfg.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(-8, -7, 16, 14, 4);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${ship.tier}`, 0, 1);
        ctx.restore();
      });
    }

    drawSpaceShip(ctx, ship, tierCfg, s) {
      ctx.shadowColor = tierCfg.color;
      ctx.shadowBlur = 10;

      ctx.fillStyle = '#161e38';
      ctx.strokeStyle = tierCfg.color;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(s * 1.2, 0);
      ctx.lineTo(-s * 0.9, -s * 0.75);
      ctx.lineTo(-s * 0.5, 0);
      ctx.lineTo(-s * 0.9, s * 0.75);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = tierCfg.secondaryColor;
      ctx.beginPath();
      ctx.moveTo(s * 0.5, 0);
      ctx.lineTo(-s * 0.2, -s * 0.25);
      ctx.lineTo(-s * 0.2, s * 0.25);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-s * 0.5, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    drawDragon(ctx, ship, tierCfg, s) {
      const wingFlap = Math.sin(performance.now() * 0.015) * 0.4;

      ctx.shadowColor = tierCfg.color;
      ctx.shadowBlur = 10;

      ctx.fillStyle = tierCfg.secondaryColor;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-s * 0.4, (-s * 1.1) * (1 + wingFlap));
      ctx.lineTo(s * 0.3, -s * 0.3);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-s * 0.4, (s * 1.1) * (1 + wingFlap));
      ctx.lineTo(s * 0.3, s * 0.3);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = tierCfg.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.8, s * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s * 0.75, 0, s * 0.25, 0, Math.PI * 2);
      ctx.fill();
    }

    drawCyberPacket(ctx, ship, tierCfg, s) {
      ctx.shadowColor = tierCfg.color;
      ctx.shadowBlur = 12;

      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = tierCfg.color;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(s, 0);
      ctx.lineTo(0, -s * 0.7);
      ctx.lineTo(-s * 0.8, 0);
      ctx.lineTo(0, s * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = tierCfg.secondaryColor;
      ctx.fillRect(-s * 0.25, -s * 0.25, s * 0.5, s * 0.5);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(s * 0.4, -1, 3, 2);
    }

    drawDragInteraction() {
      if (!this.draggedShip) return;
      const ctx = this.ctx;
      const R = this.orbitRadius;
      const homeX = this.centerX + Math.cos(this.draggedShip.angle) * R;
      const homeY = this.centerY + Math.sin(this.draggedShip.angle) * R;

      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.setLineDash([4, 6]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(homeX, homeY);
      ctx.lineTo(this.dragPos.x, this.dragPos.y);
      ctx.stroke();

      if (this.hoverTargetShip) {
        const targetX = this.centerX + Math.cos(this.hoverTargetShip.angle) * R;
        const targetY = this.centerY + Math.sin(this.hoverTargetShip.angle) * R;

        ctx.strokeStyle = '#00ff88';
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 12;
        ctx.lineWidth = 3;
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.moveTo(this.dragPos.x, this.dragPos.y);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        const midX = (this.dragPos.x + targetX) / 2;
        const midY = (this.dragPos.y + targetY) / 2;
        ctx.setLineDash([]);
        ctx.fillStyle = '#00ff88';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✨ MERGE!', midX, midY - 12);
      }

      ctx.restore();
    }

    createGatePassEffect(data) {
      const R = this.orbitRadius;
      const angle = data.gate.angle;
      const gx = this.centerX + Math.cos(angle) * R;
      const gy = this.centerY + Math.sin(angle) * R;
      const currency = this.game.theme.currencySymbol;

      this.floatingTexts.push({
        text: `+${data.payout.toLocaleString()} ${currency}`,
        x: gx,
        y: gy,
        vy: -38,
        alpha: 1.0,
        scale: 1.2,
        color: '#ffd700'
      });

      const count = 10;
      const tierCfg = this.game.getShipTierConfig(data.ship.tier);
      for (let i = 0; i < count; i++) {
        const speed = Math.random() * 60 + 20;
        const pAngle = Math.random() * Math.PI * 2;
        this.particles.push({
          x: gx,
          y: gy,
          vx: Math.cos(pAngle) * speed,
          vy: Math.sin(pAngle) * speed,
          color: i % 2 === 0 ? tierCfg.color : '#ffd700',
          size: Math.random() * 3 + 1.5,
          alpha: 1.0,
          life: 0.45,
          maxLife: 0.45
        });
      }
    }

    createCelebrationBurst() {
      const count = 40;
      const colors = ['#00f0ff', '#ffd700', '#ff007f', '#00ff88', '#ffffff'];
      for (let i = 0; i < count; i++) {
        const pAngle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 120 + 40;
        this.particles.push({
          x: this.centerX,
          y: this.centerY,
          vx: Math.cos(pAngle) * speed,
          vy: Math.sin(pAngle) * speed,
          color: colors[i % colors.length],
          size: Math.random() * 4 + 2,
          alpha: 1.0,
          life: 0.9,
          maxLife: 0.9
        });
      }
    }

    drawParticles(dt) {
      const ctx = this.ctx;
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.life -= dt;
        if (p.life <= 0) {
          this.particles.splice(i, 1);
          continue;
        }

        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.alpha = Math.max(0, p.life / p.maxLife);

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
    }

    drawFloatingTexts(dt) {
      const ctx = this.ctx;
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        const ft = this.floatingTexts[i];
        ft.y += ft.vy * dt;
        ft.alpha -= dt * 1.5;
        if (ft.alpha <= 0) {
          this.floatingTexts.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(ft.x, ft.y);
        ctx.scale(ft.scale, ft.scale);
        ctx.fillStyle = ft.color;
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.globalAlpha = ft.alpha;
        ctx.fillText(ft.text, 0, 0);
        ctx.restore();
      }
      ctx.globalAlpha = 1.0;
    }

    getCanvasCoords(e) {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }

    findShipNear(x, y, threshold = 35) {
      const R = this.orbitRadius;
      for (const ship of this.game.ships) {
        const sx = this.centerX + Math.cos(ship.angle) * (R + (ship.radiusOffset || 0));
        const sy = this.centerY + Math.sin(ship.angle) * (R + (ship.radiusOffset || 0));
        const dist = Math.hypot(x - sx, y - sy);
        if (dist <= threshold) {
          return ship;
        }
      }
      return null;
    }

    handlePointerDown(e) {
      const coords = this.getCanvasCoords(e);

      // Check if dragging a ship
      const ship = this.findShipNear(coords.x, coords.y);
      if (ship) {
        this.draggedShip = ship;
        this.game.draggedShip = ship;
        this.dragPos = coords;
        this.isPointerDown = true;
        this.canvas.setPointerCapture(e.pointerId);
      }
    }

    handlePointerMove(e) {
      if (!this.draggedShip) return;
      this.dragPos = this.getCanvasCoords(e);

      const target = this.findShipNear(this.dragPos.x, this.dragPos.y, 42);
      if (target && target.id !== this.draggedShip.id && target.tier === this.draggedShip.tier) {
        this.hoverTargetShip = target;
      } else {
        this.hoverTargetShip = null;
      }
    }

    addFloatingText(text, x, y, color = '#ffd700', scale = 1.2) {
      this.floatingTexts.push({
        text: text,
        x: x,
        y: y,
        vy: -35,
        alpha: 1.0,
        scale: scale,
        color: color
      });
    }

    handlePointerUp(e) {
      if (this.draggedShip) {
        if (this.hoverTargetShip) {
          const cost = this.game.getShipMergeCost(this.draggedShip.tier);
          if (this.game.coins >= cost) {
            const merged = this.game.mergeShips(this.draggedShip, this.hoverTargetShip);
            if (merged) {
              this.addFloatingText(`-${cost} ${this.game.theme.currencySymbol}`, this.dragPos.x, this.dragPos.y - 20, '#ffd700');
            }
          } else {
            this.addFloatingText(`Need ${cost} ${this.game.theme.currencySymbol}!`, this.dragPos.x, this.dragPos.y - 20, '#ff4d4d', 1.3);
            if (window.OrbitalAudio && window.OrbitalAudio.playClick) {
              window.OrbitalAudio.playClick();
            }
          }
        }
        this.draggedShip = null;
        this.game.draggedShip = null;
        this.hoverTargetShip = null;
      }
      this.isPointerDown = false;
    }
  }

  window.OrbitalRenderer = OrbitalRenderer;
})();
