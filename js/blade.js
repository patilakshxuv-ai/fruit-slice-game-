/**
 * FRUIT SLICE – Blade Swipe Input, Trail Renderer & Slice Physics
 * Smooth ribbon interpolation, intersection detection, and touch control optimization.
 */

(function (window) {
  'use strict';

  class BladeTracker {
    constructor(canvas, onSliceCallback) {
      this.canvas = canvas;
      this.onSlice = onSliceCallback;

      this.points = []; // [{x, y, time}]
      this.isSwiping = false;
      this.maxTrailAge = 180; // ms trail persistence
      this.minSliceVelocity = 350; // px/s minimum to count as active slice
      this.lastSwooshTime = 0;

      this.bindEvents();
    }

    bindEvents() {
      const getPos = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        return {
          x: (e.clientX - rect.left) * (this.canvas.width / rect.width),
          y: (e.clientY - rect.top) * (this.canvas.height / rect.height)
        };
      };

      const handleStart = (e) => {
        // Prevent accidental scrolling on touch devices while swiping on canvas
        if (e.cancelable) e.preventDefault();
        if (window.FSAudio) window.FSAudio.resume();

        this.isSwiping = true;
        const pos = getPos(e);
        this.points = [{ x: pos.x, y: pos.y, time: performance.now() }];
      };

      const handleMove = (e) => {
        if (!this.isSwiping && e.buttons === 0 && e.pointerType === 'mouse') {
          // Allow mouse hover slicing if moving fast
          // but we can require mouse button down or swift movement
        }
        if (!this.isSwiping && e.pointerType !== 'mouse') return;

        if (e.cancelable) e.preventDefault();

        const pos = getPos(e);
        const now = performance.now();
        const prev = this.points[this.points.length - 1];

        if (prev) {
          const dx = pos.x - prev.x;
          const dy = pos.y - prev.y;
          const dt = (now - prev.time) / 1000;
          const dist = Math.hypot(dx, dy);

          // Calculate swipe speed
          if (dt > 0.001) {
            const speed = dist / dt;

            // Trigger blade swoosh sound if swiping fast enough
            if (speed > 800 && now - this.lastSwooshTime > 220) {
              this.lastSwooshTime = now;
              if (window.FSAudio) window.FSAudio.playSwoosh();
            }

            // Check fruit slice collisions between prev and current point
            if (speed >= this.minSliceVelocity && typeof this.onSlice === 'function') {
              this.onSlice(prev.x, prev.y, pos.x, pos.y, speed);
            }
          }
        }

        this.points.push({ x: pos.x, y: pos.y, time: now });
      };

      const handleEnd = (e) => {
        this.isSwiping = false;
      };

      this.canvas.addEventListener('pointerdown', handleStart, { passive: false });
      window.addEventListener('pointermove', handleMove, { passive: false });
      window.addEventListener('pointerup', handleEnd);
      window.addEventListener('pointercancel', handleEnd);

      // Prevent context menu on long press
      this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    update() {
      const now = performance.now();
      // Filter out points older than maxTrailAge
      this.points = this.points.filter(p => now - p.time < this.maxTrailAge);
    }

    draw(ctx) {
      if (this.points.length < 2) return;

      const now = performance.now();
      ctx.save();

      // Draw multi-layered glowing blade trail
      for (let i = 1; i < this.points.length; i++) {
        const p0 = this.points[i - 1];
        const p1 = this.points[i];

        const age = now - p1.time;
        const progress = 1 - Math.min(1, age / this.maxTrailAge);
        const width = progress * 10;

        // Outer white-blue blade glow
        ctx.strokeStyle = `rgba(220, 245, 255, ${progress * 0.9})`;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();

        // Inner razor sharp white core
        ctx.strokeStyle = `rgba(255, 255, 255, ${progress})`;
        ctx.lineWidth = Math.max(1.5, width * 0.4);
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }

      ctx.restore();
    }

    /**
     * Mathematical segment to circle intersection test.
     */
    static checkSegmentCircle(x1, y1, x2, y2, cx, cy, radius) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const lenSq = dx * dx + dy * dy;

      if (lenSq === 0) {
        // Point check
        const distSq = (cx - x1) * (cx - x1) + (cy - y1) * (cy - y1);
        return distSq <= radius * radius;
      }

      // Projection factor t of circle center onto line segment
      const t = Math.max(0, Math.min(1, ((cx - x1) * dx + (cy - y1) * dy) / lenSq));
      const projX = x1 + t * dx;
      const projY = y1 + t * dy;

      const distSq = (cx - projX) * (cx - projX) + (cy - projY) * (cy - projY);
      return distSq <= radius * radius;
    }
  }

  window.FSBlade = BladeTracker;
})(window);
