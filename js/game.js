/**
 * FRUIT SLICE – Main Game Engine & Controller
 * Complete game loop, spawner, combo detection, modes, and UI bindings.
 */

(function (window) {
  'use strict';

  const STORAGE_HIGH_SCORE = 'fruit_slice_highscore_classic';
  const STORAGE_HIGH_ZEN = 'fruit_slice_highscore_zen';
  const STORAGE_TUTORIAL = 'fruit_slice_tutorial_seen';

  class FruitSliceGame {
    constructor() {
      this.canvas = document.getElementById('gameCanvas');
      this.ctx = this.canvas.getContext('2d');

      this.particles = new window.FSParticles();
      this.blade = new window.FSBlade(this.canvas, this.handleSlice.bind(this));

      // Game States: 'MENU', 'PLAYING', 'PAUSED', 'GAMEOVER'
      this.state = 'MENU';
      this.mode = 'CLASSIC'; // 'CLASSIC' or 'ZEN'

      // Scores & Stats
      this.score = 0;
      this.highScoreClassic = this.loadHighScore(STORAGE_HIGH_SCORE);
      this.highScoreZen = this.loadHighScore(STORAGE_HIGH_ZEN);
      this.fruitsSliced = 0;
      this.maxCombo = 0;
      this.strikes = 0; // Max 3 in Classic
      this.maxStrikes = 3;

      // Zen mode timer (60s)
      this.zenTimeRemaining = 60;

      // Entities
      this.fruits = [];
      this.fruitHalves = [];

      // Spawner timer
      this.spawnTimer = 0;
      this.spawnInterval = 2.0;
      this.waveCounter = 0;

      // Combo Tracking during a single stroke
      this.currentStrokeFruits = [];
      this.strokeTimeout = null;

      // Timing
      this.lastFrameTime = performance.now();
      this.animationId = null;

      this.initCanvasSize();
      this.bindUI();
      this.checkTutorial();

      window.addEventListener('resize', () => this.initCanvasSize());

      // Start loop
      this.loop = this.loop.bind(this);
      this.animationId = requestAnimationFrame(this.loop);
    }

    loadHighScore(key) {
      try {
        return parseInt(localStorage.getItem(key), 10) || 0;
      } catch (e) {
        return 0;
      }
    }

    saveHighScore(key, val) {
      try {
        localStorage.setItem(key, val.toString());
      } catch (e) {}
    }

    initCanvasSize() {
      const container = document.getElementById('game-wrapper');
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      this.width = rect.width;
      this.height = rect.height;

      this.canvas.width = this.width * dpr;
      this.canvas.height = this.height * dpr;
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;

      this.ctx.scale(dpr, dpr);
    }

    bindUI() {
      // Audio resume on any touch/click
      window.addEventListener('pointerdown', () => {
        if (window.FSAudio) window.FSAudio.resume();
      }, { once: true });

      // Start Classic Mode
      const btnClassic = document.getElementById('btn-play-classic');
      if (btnClassic) {
        btnClassic.addEventListener('click', () => {
          if (window.FSAudio) window.FSAudio.playClick();
          this.startGame('CLASSIC');
        });
      }

      // Start Zen Mode
      const btnZen = document.getElementById('btn-play-zen');
      if (btnZen) {
        btnZen.addEventListener('click', () => {
          if (window.FSAudio) window.FSAudio.playClick();
          this.startGame('ZEN');
        });
      }

      // Pause button
      const btnPause = document.getElementById('btn-pause');
      if (btnPause) {
        btnPause.addEventListener('click', () => this.togglePause());
      }

      // Resume button
      const btnResume = document.getElementById('btn-resume');
      if (btnResume) {
        btnResume.addEventListener('click', () => this.togglePause());
      }

      // Restart button in pause
      const btnRestartPause = document.getElementById('btn-restart-pause');
      if (btnRestartPause) {
        btnRestartPause.addEventListener('click', () => {
          this.hideModals();
          this.startGame(this.mode);
        });
      }

      // Quit to menu
      const btnQuitPause = document.getElementById('btn-quit-pause');
      if (btnQuitPause) {
        btnQuitPause.addEventListener('click', () => {
          this.hideModals();
          this.showMenu();
        });
      }

      // Game Over: Play Again
      const btnPlayAgain = document.getElementById('btn-gameover-restart');
      if (btnPlayAgain) {
        btnPlayAgain.addEventListener('click', () => {
          if (window.FSAudio) window.FSAudio.playClick();
          this.hideModals();
          this.startGame(this.mode);
        });
      }

      // Game Over: Menu
      const btnGameOverMenu = document.getElementById('btn-gameover-menu');
      if (btnGameOverMenu) {
        btnGameOverMenu.addEventListener('click', () => {
          if (window.FSAudio) window.FSAudio.playClick();
          this.hideModals();
          this.showMenu();
        });
      }

      // Sound Toggle Button
      const btnSound = document.getElementById('btn-sound-toggle');
      if (btnSound) {
        this.updateSoundButtonUI(btnSound);
        btnSound.addEventListener('click', () => {
          if (window.FSAudio) {
            window.FSAudio.resume();
            const isMuted = window.FSAudio.toggleMute();
            this.updateSoundButtonUI(btnSound, isMuted);
          }
        });
      }

      // Tutorial Dismiss
      const tutorialOverlay = document.getElementById('tutorial-overlay');
      if (tutorialOverlay) {
        tutorialOverlay.addEventListener('pointerdown', () => {
          tutorialOverlay.classList.add('hidden');
          try {
            localStorage.setItem(STORAGE_TUTORIAL, 'true');
          } catch (e) {}
        });
      }

      // Keyboard Controls
      window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyP' || e.code === 'Escape') {
          if (this.state === 'PLAYING' || this.state === 'PAUSED') {
            this.togglePause();
          }
        }
      });
    }

    updateSoundButtonUI(btn, isMuted = null) {
      if (isMuted === null && window.FSAudio) {
        isMuted = window.FSAudio.isMuted;
      }
      btn.innerHTML = isMuted ? '🔇' : '🔊';
      btn.setAttribute('aria-label', isMuted ? 'Unmute Sound' : 'Mute Sound');
    }

    checkTutorial() {
      try {
        const seen = localStorage.getItem(STORAGE_TUTORIAL);
        if (!seen) {
          const tutorialOverlay = document.getElementById('tutorial-overlay');
          if (tutorialOverlay) tutorialOverlay.classList.remove('hidden');
        }
      } catch (e) {}
    }

    startGame(mode = 'CLASSIC') {
      this.mode = mode;
      this.state = 'PLAYING';
      this.score = 0;
      this.fruitsSliced = 0;
      this.maxCombo = 0;
      this.strikes = 0;
      this.zenTimeRemaining = 60;

      this.fruits = [];
      this.fruitHalves = [];
      this.particles.clear();

      this.spawnTimer = 0.5; // Quick first spawn
      this.spawnInterval = 2.0;
      this.waveCounter = 0;

      this.hideModals();
      document.getElementById('menu-screen').classList.add('hidden');
      document.getElementById('hud').classList.remove('hidden');

      // Update HUD elements
      this.updateHud();

      const strikesContainer = document.getElementById('hud-strikes');
      const timerContainer = document.getElementById('hud-timer');

      if (this.mode === 'CLASSIC') {
        if (strikesContainer) strikesContainer.classList.remove('hidden');
        if (timerContainer) timerContainer.classList.add('hidden');
      } else {
        if (strikesContainer) strikesContainer.classList.add('hidden');
        if (timerContainer) timerContainer.classList.remove('hidden');
      }
    }

    showMenu() {
      this.state = 'MENU';
      document.getElementById('hud').classList.add('hidden');
      document.getElementById('menu-screen').classList.remove('hidden');
      this.hideModals();

      // Update menu high scores
      const highClassicEl = document.getElementById('menu-highscore-classic');
      const highZenEl = document.getElementById('menu-highscore-zen');
      if (highClassicEl) highClassicEl.textContent = this.highScoreClassic.toLocaleString();
      if (highZenEl) highZenEl.textContent = this.highScoreZen.toLocaleString();
    }

    togglePause() {
      if (this.state === 'PLAYING') {
        this.state = 'PAUSED';
        document.getElementById('pause-modal').classList.remove('hidden');
      } else if (this.state === 'PAUSED') {
        this.state = 'PLAYING';
        document.getElementById('pause-modal').classList.add('hidden');
        this.lastFrameTime = performance.now();
      }
    }

    hideModals() {
      document.querySelectorAll('.modal-overlay').forEach(el => el.classList.add('hidden'));
    }

    updateHud() {
      const scoreEl = document.getElementById('hud-score-val');
      if (scoreEl) scoreEl.textContent = this.score.toLocaleString();

      if (this.mode === 'CLASSIC') {
        const strikeIcons = ['strike-1', 'strike-2', 'strike-3'];
        strikeIcons.forEach((id, idx) => {
          const el = document.getElementById(id);
          if (el) {
            if (idx < this.strikes) {
              el.textContent = '❌';
              el.classList.add('active-strike');
            } else {
              el.textContent = '⭕';
              el.classList.remove('active-strike');
            }
          }
        });
      } else {
        const timerEl = document.getElementById('hud-timer-val');
        if (timerEl) {
          const secs = Math.max(0, Math.ceil(this.zenTimeRemaining));
          timerEl.textContent = `0:${secs < 10 ? '0' : ''}${secs}`;
        }
      }
    }

    /* -------------------------------------------------------------
       FRUIT SLICE COLLISION & COMBOS
       ------------------------------------------------------------- */

    handleSlice(x1, y1, x2, y2, speed) {
      if (this.state !== 'PLAYING') return;

      const sliceAngle = Math.atan2(y2 - y1, x2 - x1);

      for (let i = this.fruits.length - 1; i >= 0; i--) {
        const fruit = this.fruits[i];
        if (fruit.isSliced) continue;

        const isHit = window.FSBlade.checkSegmentCircle(x1, y1, x2, y2, fruit.x, fruit.y, fruit.radius);

        if (isHit) {
          this.sliceFruit(fruit, i, sliceAngle);
        }
      }
    }

    sliceFruit(fruit, index, sliceAngle) {
      fruit.isSliced = true;
      this.fruits.splice(index, 1);

      // Handle Bomb Hit!
      if (fruit.isBomb) {
        if (window.FSAudio) window.FSAudio.playExplosion();
        this.particles.addBombExplosion(fruit.x, fruit.y);

        if (this.mode === 'CLASSIC') {
          // In classic mode: hitting a bomb costs a strike or ends the game!
          this.strikes = this.maxStrikes; // Instant fatal explosion!
          this.updateHud();
          setTimeout(() => this.triggerGameOver('BOOM! YOU SLICED A BOMB!'), 500);
        } else {
          // In Zen mode: -10 seconds penalty & -10 points
          this.zenTimeRemaining = Math.max(0, this.zenTimeRemaining - 10);
          this.score = Math.max(0, this.score - 10);
          this.particles.addFloatingText('-10s PENALTY!', fruit.x, fruit.y, '#ff1744', 28);
          this.updateHud();
        }
        return;
      }

      // Successful fruit slice!
      this.fruitsSliced++;
      const pts = fruit.def.points || 1;
      this.score += pts;

      if (window.FSAudio) {
        window.FSAudio.playSlice(this.currentStrokeFruits.length + 1);
      }

      // Add juice splatter & flying pulp particles
      this.particles.addJuiceExplosion(fruit.x, fruit.y, fruit.def.juiceColor, 22);

      // Spawn two fruit halves flying apart
      const normalAngle = sliceAngle + Math.PI / 2;
      const pushSpeed = 120 + Math.random() * 80;

      const leftHalf = new window.FSFruit.FruitHalf(
        fruit.typeId,
        fruit.x, fruit.y,
        fruit.vx + Math.cos(normalAngle) * pushSpeed,
        fruit.vy + Math.sin(normalAngle) * pushSpeed - 80,
        sliceAngle,
        false
      );

      const rightHalf = new window.FSFruit.FruitHalf(
        fruit.typeId,
        fruit.x, fruit.y,
        fruit.vx - Math.cos(normalAngle) * pushSpeed,
        fruit.vy - Math.sin(normalAngle) * pushSpeed - 80,
        sliceAngle,
        true
      );

      this.fruitHalves.push(leftHalf, rightHalf);

      // Register in current stroke combo
      this.currentStrokeFruits.push({ fruit, x: fruit.x, y: fruit.y });

      // Combo buffer evaluation
      if (this.strokeTimeout) clearTimeout(this.strokeTimeout);
      this.strokeTimeout = setTimeout(() => {
        this.evaluateCombo();
      }, 220);

      this.updateHud();
    }

    evaluateCombo() {
      const count = this.currentStrokeFruits.length;
      if (count >= 3) {
        let comboBonus = 0;
        let comboTitle = '';

        if (count === 3) {
          comboBonus = 30;
          comboTitle = '3x COMBO! +30';
        } else if (count === 4) {
          comboBonus = 50;
          comboTitle = '4x MEGA SLICE! +50';
        } else {
          comboBonus = 100;
          comboTitle = `${count}x BLADE MASTER! +100`;
        }

        this.score += comboBonus;
        if (count > this.maxCombo) this.maxCombo = count;

        const lastFruit = this.currentStrokeFruits[this.currentStrokeFruits.length - 1];
        this.particles.addFloatingText(comboTitle, lastFruit.x, lastFruit.y - 30, '#ffd700', 32);

        if (window.FSAudio) {
          window.FSAudio.playCombo(count);
        }

        this.updateHud();
      }

      this.currentStrokeFruits = [];
    }

    /* -------------------------------------------------------------
       FRUIT & BOMB SPAWNER
       ------------------------------------------------------------- */

    spawnWave() {
      this.waveCounter++;

      // Progressive difficulty: larger waves
      let count = 1;
      const r = Math.random();
      if (this.score > 80 && r < 0.35) count = 4;
      else if (this.score > 40 && r < 0.6) count = 3;
      else if (this.score > 15 || r < 0.5) count = 2;

      const fruitKeys = ['watermelon', 'orange', 'apple', 'banana', 'dragonfruit'];

      // Chance of starfruit bonus in Zen mode or high scores
      if (Math.random() < 0.12) {
        fruitKeys.push('starfruit');
      }

      // Chance of Bomb in Classic mode (never in Zen)
      const spawnBomb = this.mode === 'CLASSIC' && Math.random() < 0.28 && this.waveCounter > 2;

      for (let i = 0; i < count; i++) {
        const type = fruitKeys[Math.floor(Math.random() * fruitKeys.length)];
        this.launchFruit(type);
      }

      if (spawnBomb) {
        this.launchFruit('bomb');
      }

      // Dynamic wave timing
      this.spawnInterval = Math.max(1.1, 2.2 - Math.min(1.0, this.score * 0.01));
    }

    launchFruit(typeId) {
      // Spawn below bottom
      const margin = 80;
      const x = margin + Math.random() * (this.width - margin * 2);
      const y = this.height + 50;

      // Launch velocity aimed toward upper-middle screen
      const targetX = this.width * 0.2 + Math.random() * (this.width * 0.6);
      const flightDuration = 1.3 + Math.random() * 0.4; // seconds to peak
      const vx = (targetX - x) / flightDuration;

      // Calculate upward vy to reach peak height (around 15-35% of screen height)
      const targetPeakY = this.height * (0.15 + Math.random() * 0.25);
      const gravity = 800;
      // v^2 = u^2 - 2gs => u = sqrt(2 * g * deltaY)
      const deltaY = y - targetPeakY;
      const vy = -Math.sqrt(2 * gravity * deltaY);

      const fruit = new window.FSFruit.Fruit(typeId, x, y, vx, vy);
      this.fruits.push(fruit);

      if (typeId === 'bomb' && window.FSAudio) {
        window.FSAudio.playFuse();
      }
    }

    triggerGameOver(reason = 'GAME OVER') {
      this.state = 'GAMEOVER';

      let isNewHigh = false;
      if (this.mode === 'CLASSIC') {
        if (this.score > this.highScoreClassic) {
          this.highScoreClassic = this.score;
          this.saveHighScore(STORAGE_HIGH_SCORE, this.score);
          isNewHigh = true;
        }
      } else {
        if (this.score > this.highScoreZen) {
          this.highScoreZen = this.score;
          this.saveHighScore(STORAGE_HIGH_ZEN, this.score);
          isNewHigh = true;
        }
      }

      // Populate Game Over modal
      const modal = document.getElementById('gameover-modal');
      const scoreVal = document.getElementById('go-final-score');
      const bestVal = document.getElementById('go-best-score');
      const slicedVal = document.getElementById('go-sliced-count');
      const comboVal = document.getElementById('go-max-combo');
      const highBadge = document.getElementById('go-new-high');

      if (scoreVal) scoreVal.textContent = this.score.toLocaleString();
      if (bestVal) bestVal.textContent = (this.mode === 'CLASSIC' ? this.highScoreClassic : this.highScoreZen).toLocaleString();
      if (slicedVal) slicedVal.textContent = this.fruitsSliced.toString();
      if (comboVal) comboVal.textContent = this.maxCombo > 1 ? `${this.maxCombo}x` : 'None';

      if (highBadge) {
        if (isNewHigh && this.score > 0) highBadge.classList.remove('hidden');
        else highBadge.classList.add('hidden');
      }

      if (modal) modal.classList.remove('hidden');
    }

    /* -------------------------------------------------------------
       MAIN GAME LOOP
       ------------------------------------------------------------- */

    loop(currentTime) {
      const dt = Math.min((currentTime - this.lastFrameTime) / 1000, 0.05);
      this.lastFrameTime = currentTime;

      if (this.state === 'PLAYING') {
        this.update(dt);
      }

      this.blade.update();
      this.particles.update(dt);

      this.render();

      this.animationId = requestAnimationFrame(this.loop);
    }

    update(dt) {
      // 1. Zen mode timer
      if (this.mode === 'ZEN') {
        this.zenTimeRemaining -= dt;
        this.updateHud();
        if (this.zenTimeRemaining <= 0) {
          this.zenTimeRemaining = 0;
          this.triggerGameOver('TIME UP!');
          return;
        }
      }

      // 2. Wave Spawner
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.spawnWave();
        this.spawnTimer = this.spawnInterval;
      }

      // 3. Update Whole Fruits
      for (let i = this.fruits.length - 1; i >= 0; i--) {
        const fruit = this.fruits[i];
        fruit.update(dt);

        // Check if fruit fell off screen
        if (fruit.y > this.height + 70 && fruit.vy > 0) {
          // Missed fruit in Classic mode costs 1 strike! (Missing a bomb does NOT)
          if (!fruit.isBomb && this.mode === 'CLASSIC' && !fruit.isSliced) {
            this.strikes++;
            if (window.FSAudio) window.FSAudio.playStrike();
            this.updateHud();

            // Red strike indicator on bottom edge
            this.particles.addFloatingText('MISS! ❌', fruit.x, this.height - 40, '#ff1744', 22);

            if (this.strikes >= this.maxStrikes) {
              this.triggerGameOver('3 STRIKES! GAME OVER');
              return;
            }
          }

          this.fruits.splice(i, 1);
        }
      }

      // 4. Update Split Halves
      for (let i = this.fruitHalves.length - 1; i >= 0; i--) {
        const half = this.fruitHalves[i];
        half.update(dt);

        if (half.y > this.height + 90) {
          this.fruitHalves.splice(i, 1);
        }
      }
    }

    render() {
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;

      ctx.clearRect(0, 0, w, h);

      // 1. Background Wooden Cutting Board
      this.drawCuttingBoard(ctx, w, h);

      // 2. Background Juice Splatters
      this.particles.drawSplatters(ctx);

      // 3. Fruit Halves
      for (let half of this.fruitHalves) {
        half.draw(ctx);
      }

      // 4. Whole Fruits & Bombs
      for (let fruit of this.fruits) {
        fruit.draw(ctx);
      }

      // 5. Particles & Juice Droplets
      this.particles.drawParticles(ctx);

      // 6. Blade Swipe Trail
      this.blade.draw(ctx);

      // 7. Floating Texts
      this.particles.drawFloatingTexts(ctx);

      // 8. Bomb Explosion Screen Flash
      this.particles.drawFlash(ctx, w, h);
    }

    drawCuttingBoard(ctx, w, h) {
      // Warm bamboo wooden plank gradient
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#2e1c0c');
      grad.addColorStop(0.5, '#422813');
      grad.addColorStop(1, '#241407');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Subtle wood grain horizontal stripes
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      const plankHeight = 55;
      for (let y = 0; y < h; y += plankHeight) {
        ctx.fillRect(0, y, w, 1.5);
      }

      // Vignette shadow around edges
      const radGrad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.85);
      radGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      radGrad.addColorStop(1, 'rgba(0, 0, 0, 0.65)');
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, w, h);
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    window.FSGame = new FruitSliceGame();
  });
})(window);
