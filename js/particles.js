/**
 * FRUIT SLICE – Particle Effects, Juice Splatters & Floating Arcade Text
 */

(function (window) {
  'use strict';

  class ParticleSystem {
    constructor() {
      this.particles = [];
      this.splatters = [];
      this.floatingTexts = [];
      this.flashAlpha = 0;
    }

    triggerBombFlash() {
      this.flashAlpha = 0.85;
    }

    addJuiceExplosion(x, y, color, count = 20) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 120 + Math.random() * 380;
        this.particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 60,
          radius: 3 + Math.random() * 5,
          color: color,
          alpha: 1,
          decay: 0.015 + Math.random() * 0.02,
          gravity: 600
        });
      }

      // Add background juice splatter decal
      if (this.splatters.length < 35) {
        this.splatters.push({
          x: x + (Math.random() - 0.5) * 40,
          y: y + (Math.random() - 0.5) * 40,
          radius: 20 + Math.random() * 25,
          color: color,
          alpha: 0.55,
          decay: 0.0015 // Fades gradually
        });
      }
    }

    addBombExplosion(x, y) {
      this.triggerBombFlash();
      const count = 55;
      const colors = ['#ffffff', '#ffeb3b', '#ff9800', '#ff3d00', '#212121'];

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 150 + Math.random() * 550;
        this.particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 4 + Math.random() * 8,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: 0.02 + Math.random() * 0.025,
          gravity: 200
        });
      }
    }

    addFloatingText(text, x, y, color = '#ffffff', fontSize = 24) {
      this.floatingTexts.push({
        text: text,
        x: x,
        y: y,
        vy: -75,
        color: color,
        fontSize: fontSize,
        alpha: 1,
        life: 1.1,
        maxLife: 1.1
      });
    }

    update(dt) {
      // Screen flash
      if (this.flashAlpha > 0) {
        this.flashAlpha -= dt * 2.5;
        if (this.flashAlpha < 0) this.flashAlpha = 0;
      }

      // Flying particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.vy += p.gravity * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.alpha -= p.decay * (dt * 60);

        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
        }
      }

      // Splatters fade slowly
      for (let i = this.splatters.length - 1; i >= 0; i--) {
        const s = this.splatters[i];
        s.alpha -= s.decay * (dt * 60);
        if (s.alpha <= 0) {
          this.splatters.splice(i, 1);
        }
      }

      // Floating texts
      for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        const ft = this.floatingTexts[i];
        ft.y += ft.vy * dt;
        ft.life -= dt;
        ft.alpha = Math.max(0, ft.life / ft.maxLife);
        if (ft.life <= 0) {
          this.floatingTexts.splice(i, 1);
        }
      }
    }

    drawSplatters(ctx) {
      for (let s of this.splatters) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, s.alpha);
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();

        // Droplet blobs around
        ctx.beginPath();
        ctx.arc(s.x + s.radius * 0.7, s.y - s.radius * 0.5, s.radius * 0.28, 0, Math.PI * 2);
        ctx.arc(s.x - s.radius * 0.8, s.y + s.radius * 0.4, s.radius * 0.22, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    drawParticles(ctx) {
      for (let p of this.particles) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    drawFloatingTexts(ctx) {
      for (let ft of this.floatingTexts) {
        ctx.save();
        ctx.globalAlpha = ft.alpha;
        ctx.fillStyle = ft.color;
        ctx.font = `900 ${ft.fontSize}px 'Fredoka One', 'Arial Black', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Drop shadow for legibility
        ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }
    }

    drawFlash(ctx, width, height) {
      if (this.flashAlpha > 0) {
        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 255, ${this.flashAlpha})`;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }
    }

    clear() {
      this.particles = [];
      this.splatters = [];
      this.floatingTexts = [];
      this.flashAlpha = 0;
    }
  }

  window.FSParticles = ParticleSystem;
})(window);
