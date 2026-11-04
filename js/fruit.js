/**
 * FRUIT SLICE – Fruit Entities, Halves Physics & Vector Graphics
 * 100% original programmatic vector rendering with cross-sections.
 */

(function (window) {
  'use strict';

  const FRUIT_TYPES = {
    watermelon: {
      name: 'Watermelon',
      radius: 44,
      points: 1,
      juiceColor: 'rgba(229, 57, 53, 0.75)',
      drawWhole: function (ctx, radius) {
        // Outer green striped sphere
        const grad = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, radius * 0.1, 0, 0, radius);
        grad.addColorStop(0, '#4caf50');
        grad.addColorStop(0.7, '#2e7d32');
        grad.addColorStop(1, '#1b5e20');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();

        // Dark green stripes
        ctx.strokeStyle = '#0d3810';
        ctx.lineWidth = 4;
        for (let i = -2; i <= 2; i++) {
          ctx.beginPath();
          ctx.ellipse(i * 14, 0, 6, radius * 0.94, (i * Math.PI) / 12, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Gloss glint
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.ellipse(-radius * 0.4, -radius * 0.4, radius * 0.25, radius * 0.12, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
      },
      drawHalf: function (ctx, radius, isRight) {
        // Half circle
        ctx.beginPath();
        ctx.arc(0, 0, radius, -Math.PI / 2, Math.PI / 2, isRight);
        ctx.closePath();
        ctx.fillStyle = '#2e7d32';
        ctx.fill();

        // Inner white rind
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.88, -Math.PI / 2, Math.PI / 2, isRight);
        ctx.closePath();
        ctx.fillStyle = '#c8e6c9';
        ctx.fill();

        // Inner vibrant red pulp
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.8, -Math.PI / 2, Math.PI / 2, isRight);
        ctx.closePath();
        ctx.fillStyle = '#e53935';
        ctx.fill();

        // Black seeds
        ctx.fillStyle = '#1a0505';
        const seedAngles = [-0.9, -0.4, 0.1, 0.6, 1.1];
        const dir = isRight ? 1 : -1;
        seedAngles.forEach(a => {
          const r = radius * 0.52;
          const sx = Math.cos(a) * r * dir;
          const sy = Math.sin(a) * r;
          ctx.beginPath();
          ctx.ellipse(sx, sy, 3, 1.8, a, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    },

    orange: {
      name: 'Orange',
      radius: 38,
      points: 1,
      juiceColor: 'rgba(255, 152, 0, 0.75)',
      drawWhole: function (ctx, radius) {
        const grad = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, radius * 0.1, 0, 0, radius);
        grad.addColorStop(0, '#ffb74d');
        grad.addColorStop(0.6, '#ff9800');
        grad.addColorStop(1, '#e65100');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();

        // Peel texture dots
        ctx.fillStyle = 'rgba(230, 81, 0, 0.4)';
        for (let i = 0; i < 12; i++) {
          const a = (i * Math.PI * 2) / 12;
          ctx.beginPath();
          ctx.arc(Math.cos(a) * radius * 0.7, Math.sin(a) * radius * 0.7, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Gloss
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.beginPath();
        ctx.ellipse(-radius * 0.35, -radius * 0.35, radius * 0.22, radius * 0.12, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
      },
      drawHalf: function (ctx, radius, isRight) {
        // Outer peel
        ctx.beginPath();
        ctx.arc(0, 0, radius, -Math.PI / 2, Math.PI / 2, isRight);
        ctx.closePath();
        ctx.fillStyle = '#f57c00';
        ctx.fill();

        // White pith
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.9, -Math.PI / 2, Math.PI / 2, isRight);
        ctx.closePath();
        ctx.fillStyle = '#fff3e0';
        ctx.fill();

        // Orange pulp
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.82, -Math.PI / 2, Math.PI / 2, isRight);
        ctx.closePath();
        ctx.fillStyle = '#ff9800';
        ctx.fill();

        // Citrus segments spokes
        ctx.strokeStyle = '#fff3e0';
        ctx.lineWidth = 1.8;
        const dir = isRight ? 1 : -1;
        for (let i = -2; i <= 2; i++) {
          const a = (i * Math.PI) / 6;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(a) * radius * 0.8 * dir, Math.sin(a) * radius * 0.8);
          ctx.stroke();
        }
      }
    },

    apple: {
      name: 'Green Apple',
      radius: 36,
      points: 1,
      juiceColor: 'rgba(124, 179, 66, 0.75)',
      drawWhole: function (ctx, radius) {
        // Apple silhouette (slight dimple at top and bottom)
        const grad = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, radius * 0.1, 0, 0, radius);
        grad.addColorStop(0, '#aed581');
        grad.addColorStop(0.6, '#7cb342');
        grad.addColorStop(1, '#33691e');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 2, radius, 0, Math.PI * 2);
        ctx.fill();

        // Brown stem & leaf
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(-2, -radius - 8, 4, 10);

        ctx.fillStyle = '#4caf50';
        ctx.beginPath();
        ctx.ellipse(6, -radius - 4, 8, 4, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();

        // Gloss
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.beginPath();
        ctx.ellipse(-radius * 0.35, -radius * 0.35, radius * 0.22, radius * 0.12, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
      },
      drawHalf: function (ctx, radius, isRight) {
        // Outer skin
        ctx.beginPath();
        ctx.arc(0, 0, radius, -Math.PI / 2, Math.PI / 2, isRight);
        ctx.closePath();
        ctx.fillStyle = '#7cb342';
        ctx.fill();

        // Pale creamy flesh
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.88, -Math.PI / 2, Math.PI / 2, isRight);
        ctx.closePath();
        ctx.fillStyle = '#f1f8e9';
        ctx.fill();

        // Core & seeds
        const dir = isRight ? 1 : -1;
        ctx.fillStyle = '#dcedc8';
        ctx.beginPath();
        ctx.ellipse(dir * 6, 0, 8, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#3e2723';
        ctx.beginPath();
        ctx.arc(dir * 7, -3, 2.5, 0, Math.PI * 2);
        ctx.arc(dir * 7, 4, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    },

    banana: {
      name: 'Banana',
      radius: 34,
      points: 1,
      juiceColor: 'rgba(253, 216, 53, 0.75)',
      drawWhole: function (ctx, radius) {
        ctx.save();
        ctx.rotate(-Math.PI / 6);

        // Curved banana arc
        ctx.fillStyle = '#fbc02d';
        ctx.beginPath();
        ctx.arc(0, 0, radius * 1.3, -Math.PI * 0.6, Math.PI * 0.1);
        ctx.lineWidth = radius * 0.6;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#fbc02d';
        ctx.stroke();

        // Bright yellow highlight
        ctx.lineWidth = radius * 0.3;
        ctx.strokeStyle = '#ffee58';
        ctx.stroke();

        // Dark tips
        ctx.fillStyle = '#5d4037';
        const tipA = -Math.PI * 0.6;
        const tx = Math.cos(tipA) * radius * 1.3;
        const ty = Math.sin(tipA) * radius * 1.3;
        ctx.beginPath();
        ctx.arc(tx, ty, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      },
      drawHalf: function (ctx, radius, isRight) {
        ctx.beginPath();
        ctx.arc(0, 0, radius, -Math.PI / 2, Math.PI / 2, isRight);
        ctx.closePath();
        ctx.fillStyle = '#fbc02d';
        ctx.fill();

        // Creamy center
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.8, -Math.PI / 2, Math.PI / 2, isRight);
        ctx.closePath();
        ctx.fillStyle = '#fffde7';
        ctx.fill();

        // Seed flecks in center
        ctx.fillStyle = '#8d6e63';
        const dir = isRight ? 1 : -1;
        for (let i = -1; i <= 1; i++) {
          ctx.beginPath();
          ctx.arc(dir * 5, i * 6, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },

    dragonfruit: {
      name: 'Dragonfruit',
      radius: 40,
      points: 2,
      juiceColor: 'rgba(233, 30, 99, 0.85)',
      drawWhole: function (ctx, radius) {
        // Bright magenta egg
        const grad = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, radius * 0.1, 0, 0, radius);
        grad.addColorStop(0, '#ff4081');
        grad.addColorStop(0.6, '#e91e63');
        grad.addColorStop(1, '#880e4f');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();

        // Green leaf scales
        ctx.fillStyle = '#76ff03';
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI * 2) / 6;
          const sx = Math.cos(a) * (radius - 4);
          const sy = Math.sin(a) * (radius - 4);
          ctx.beginPath();
          ctx.ellipse(sx, sy, 8, 4, a, 0, Math.PI * 2);
          ctx.fill();
        }
      },
      drawHalf: function (ctx, radius, isRight) {
        // Magenta rind
        ctx.beginPath();
        ctx.arc(0, 0, radius, -Math.PI / 2, Math.PI / 2, isRight);
        ctx.closePath();
        ctx.fillStyle = '#e91e63';
        ctx.fill();

        // White pulp
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.84, -Math.PI / 2, Math.PI / 2, isRight);
        ctx.closePath();
        ctx.fillStyle = '#fafafa';
        ctx.fill();

        // Dotted black seeds
        ctx.fillStyle = '#212121';
        const dir = isRight ? 1 : -1;
        for (let i = 0; i < 18; i++) {
          const a = (i * 1.3) % (Math.PI * 0.8) - Math.PI * 0.4;
          const r = radius * (0.2 + (i % 5) * 0.12);
          ctx.beginPath();
          ctx.arc(Math.cos(a) * r * dir, Math.sin(a) * r, 1.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },

    starfruit: {
      name: 'Golden Starfruit',
      radius: 42,
      points: 3,
      juiceColor: 'rgba(255, 215, 0, 0.85)',
      drawWhole: function (ctx, radius) {
        // Glowing star
        ctx.fillStyle = '#ffd700';
        ctx.strokeStyle = '#ffab00';
        ctx.lineWidth = 3;

        ctx.beginPath();
        const spikes = 5;
        for (let i = 0; i < spikes; i++) {
          const a = (i * Math.PI * 2) / spikes - Math.PI / 2;
          const ax = Math.cos(a) * radius;
          const ay = Math.sin(a) * radius;
          const midA = a + Math.PI / spikes;
          const mx = Math.cos(midA) * (radius * 0.55);
          const my = Math.sin(midA) * (radius * 0.55);

          if (i === 0) ctx.moveTo(ax, ay);
          else ctx.lineTo(ax, ay);
          ctx.lineTo(mx, my);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Inner glowing star
        ctx.fillStyle = '#fffde7';
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.25, 0, Math.PI * 2);
        ctx.fill();
      },
      drawHalf: function (ctx, radius, isRight) {
        ctx.beginPath();
        ctx.arc(0, 0, radius, -Math.PI / 2, Math.PI / 2, isRight);
        ctx.closePath();
        ctx.fillStyle = '#ffd700';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.75, -Math.PI / 2, Math.PI / 2, isRight);
        ctx.closePath();
        ctx.fillStyle = '#fffde7';
        ctx.fill();
      }
    },

    bomb: {
      name: 'Bomb',
      radius: 38,
      isBomb: true,
      points: 0,
      drawWhole: function (ctx, radius, time = 0) {
        // Dark cast iron sphere
        const grad = ctx.createRadialGradient(-radius * 0.35, -radius * 0.35, radius * 0.1, 0, 0, radius);
        grad.addColorStop(0, '#546e7a');
        grad.addColorStop(0.5, '#263238');
        grad.addColorStop(1, '#0b0f12');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();

        // Danger skull / warning mark in center
        ctx.fillStyle = '#ff1744';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('☠', 0, 2);

        // Metal neck cap
        ctx.fillStyle = '#78909c';
        ctx.fillRect(-6, -radius - 4, 12, 6);

        // Twisted burning fuse cord
        ctx.strokeStyle = '#d7ccc8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -radius - 4);
        ctx.quadraticCurveTo(8, -radius - 14, 4, -radius - 20);
        ctx.stroke();

        // Burning spark at fuse tip
        const sparkX = 4;
        const sparkY = -radius - 20;
        const sparkGrad = ctx.createRadialGradient(sparkX, sparkY, 1, sparkX, sparkY, 8);
        sparkGrad.addColorStop(0, '#ffffff');
        sparkGrad.addColorStop(0.4, '#ffff00');
        sparkGrad.addColorStop(0.8, '#ff3d00');
        sparkGrad.addColorStop(1, 'rgba(255, 61, 0, 0)');

        ctx.fillStyle = sparkGrad;
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, 8 + Math.sin(time * 25) * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  /**
   * Whole Fruit / Bomb entity thrown in parabolic arc.
   */
  class Fruit {
    constructor(typeId, x, y, vx, vy) {
      this.typeId = typeId;
      this.def = FRUIT_TYPES[typeId] || FRUIT_TYPES.watermelon;
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.radius = this.def.radius;
      this.isBomb = !!this.def.isBomb;
      this.angle = 0;
      this.angularVelocity = (Math.random() - 0.5) * 6; // Radians per sec
      this.isSliced = false;
      this.timeAlive = 0;
    }

    update(dt, gravity = 800) {
      this.vy += gravity * dt;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.angle += this.angularVelocity * dt;
      this.timeAlive += dt;
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);

      // Shadow underneath
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 8;
      this.def.drawWhole(ctx, this.radius, this.timeAlive);
      ctx.restore();

      ctx.restore();
    }
  }

  /**
   * Half Fruit split after slice.
   */
  class FruitHalf {
    constructor(typeId, x, y, vx, vy, sliceAngle, isRight) {
      this.typeId = typeId;
      this.def = FRUIT_TYPES[typeId] || FRUIT_TYPES.watermelon;
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.sliceAngle = sliceAngle;
      this.isRight = isRight;
      this.radius = this.def.radius;
      this.angle = sliceAngle;
      this.angularVelocity = (isRight ? 1 : -1) * (4 + Math.random() * 5);
      this.alpha = 1;
    }

    update(dt, gravity = 950) {
      this.vy += gravity * dt;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.angle += this.angularVelocity * dt;
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);

      if (this.def.drawHalf) {
        this.def.drawHalf(ctx, this.radius, this.isRight);
      }

      ctx.restore();
    }
  }

  window.FSFruit = {
    TYPES: FRUIT_TYPES,
    Fruit: Fruit,
    FruitHalf: FruitHalf
  };
})(window);
