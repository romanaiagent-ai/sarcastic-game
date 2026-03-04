import Phaser from "phaser";
import { SarcasticCommentary } from "../systems/SarcasticCommentary";
import { SoundManager } from "../systems/SoundManager";

interface StarLayer {
  graphics: Phaser.GameObjects.Graphics;
  stars: Array<{ x: number; y: number; size: number; speed: number }>;
}

interface Enemy {
  body: Phaser.GameObjects.Graphics;
  glowGraphics: Phaser.GameObjects.Graphics;
  type: "grunt" | "shooter" | "rusher";
  hp: number;
  maxHp: number;
  speed: number;
  shootTimer: number;
  shootInterval: number;
  value: number;
  vx: number;
  vy: number;
}

interface Bullet {
  graphics: Phaser.GameObjects.Graphics;
  trail: Phaser.GameObjects.Graphics[];
  vx: number;
  vy: number;
  isEnemy: boolean;
  age: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: number;
  life: number;
  maxLife: number;
  size: number;
}

export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Graphics;
  private playerGlow!: Phaser.GameObjects.Graphics;
  private playerX: number = 0;
  private playerY: number = 0;
  private playerHp: number = 100;
  private playerMaxHp: number = 100;
  private playerSpeed: number = 360;
  private playerShootCooldown: number = 0;
  private playerShootRate: number = 180; // ms
  private playerInvincible: number = 0;
  private playerAngle: number = 0;

  private enemies: Enemy[] = [];
  private bullets: Bullet[] = [];
  private particles: Particle[] = [];
  private starLayers: StarLayer[] = [];

  private score: number = 0;
  private wave: number = 1;
  private waveEnemiesRemaining: number = 0;
  private waveTransitionTimer: number = 0;
  private inWaveTransition: boolean = false;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };
  private spaceKey!: Phaser.Input.Keyboard.Key;

  // HUD elements
  private hudHealth!: Phaser.GameObjects.Graphics;
  private hudScore!: Phaser.GameObjects.Text;
  private hudWave!: Phaser.GameObjects.Text;
  private hudHealthText!: Phaser.GameObjects.Text;

  // Audio
  private sfx!: SoundManager;

  // Commentary
  private commentary!: SarcasticCommentary;
  private commentaryText!: Phaser.GameObjects.Text;
  private commentaryTimer: number = 0;

  // Screen shake
  private shakeTimer: number = 0;
  private shakeIntensity: number = 0;
  private cameraOffX: number = 0;
  private cameraOffY: number = 0;

  private gameWidth: number = 800;
  private gameHeight: number = 600;
  private isGameOver: boolean = false;

  constructor() {
    super({ key: "GameScene" });
  }

  create() {
    this.gameWidth = this.scale.width;
    this.gameHeight = this.scale.height;
    this.playerX = this.gameWidth / 2;
    this.playerY = this.gameHeight / 2;
    this.isGameOver = false;
    this.score = 0;
    this.wave = 1;
    this.playerHp = this.playerMaxHp;

    this.sfx = new SoundManager();
    this.commentary = new SarcasticCommentary();

    this.createStarBackground();
    this.createPlayer();
    this.createHUD();
    this.createCommentaryText();

    this.setupInput();
    this.spawnWave(this.wave);

    // Mouse click to shoot
    this.input.on("pointerdown", () => {
      this.tryShoot();
    });

    // Show wave start message
    this.showCommentary(this.commentary.getWaveMessage(1), 3000);
  }

  private createStarBackground() {
    const speeds = [0.1, 0.2, 0.4];
    const counts = [60, 40, 20];
    const alphas = [0.3, 0.5, 0.9];

    for (let l = 0; l < 3; l++) {
      const gfx = this.add.graphics();
      gfx.setDepth(-10 + l);
      const stars: StarLayer["stars"] = [];
      for (let i = 0; i < counts[l]; i++) {
        stars.push({
          x: Math.random() * this.gameWidth,
          y: Math.random() * this.gameHeight,
          size: Math.random() * (l + 1) * 0.8 + 0.5,
          speed: speeds[l],
        });
      }
      gfx.setAlpha(alphas[l]);
      this.starLayers.push({ graphics: gfx, stars });
    }
  }

  private createPlayer() {
    this.playerGlow = this.add.graphics();
    this.playerGlow.setDepth(1);
    this.player = this.add.graphics();
    this.player.setDepth(2);
    this.drawPlayer(false);
  }

  private drawPlayer(hit: boolean) {
    const px = this.playerX;
    const py = this.playerY;

    this.playerGlow.clear();
    this.player.clear();

    if (this.playerInvincible > 0 && Math.floor(this.playerInvincible / 80) % 2 === 0) return;

    // Glow
    const glowColor = hit ? 0xff4444 : 0x00ff88;
    for (let r = 24; r >= 8; r -= 4) {
      const alpha = ((24 - r) / 16) * 0.15;
      this.playerGlow.fillStyle(glowColor, alpha);
      this.playerGlow.fillCircle(px, py, r);
    }

    // Triangle ship
    const size = 16;
    const angle = this.playerAngle;
    const pts: Phaser.Math.Vector2[] = [
      new Phaser.Math.Vector2(
        px + Math.cos(angle) * size,
        py + Math.sin(angle) * size
      ),
      new Phaser.Math.Vector2(
        px + Math.cos(angle + 2.4) * size * 0.8,
        py + Math.sin(angle + 2.4) * size * 0.8
      ),
      new Phaser.Math.Vector2(
        px + Math.cos(angle - 2.4) * size * 0.8,
        py + Math.sin(angle - 2.4) * size * 0.8
      ),
    ];

    // Engine thrust
    this.player.fillStyle(0x00aaff, 0.6);
    const thrustPts: Phaser.Math.Vector2[] = [
      new Phaser.Math.Vector2(
        px + Math.cos(angle + Math.PI) * (size * 0.5),
        py + Math.sin(angle + Math.PI) * (size * 0.5)
      ),
      new Phaser.Math.Vector2(
        px + Math.cos(angle + 2.0) * (size * 0.4),
        py + Math.sin(angle + 2.0) * (size * 0.4)
      ),
      new Phaser.Math.Vector2(
        px + Math.cos(angle - 2.0) * (size * 0.4),
        py + Math.sin(angle - 2.0) * (size * 0.4)
      ),
    ];
    this.player.fillTriangle(
      thrustPts[0].x, thrustPts[0].y,
      thrustPts[1].x, thrustPts[1].y,
      thrustPts[2].x, thrustPts[2].y
    );

    // Hull
    this.player.fillStyle(hit ? 0xff4444 : 0x00ff88, 1);
    this.player.fillTriangle(pts[0].x, pts[0].y, pts[1].x, pts[1].y, pts[2].x, pts[2].y);

    // Cockpit
    this.player.fillStyle(0x00ffff, 0.8);
    this.player.fillCircle(
      px + Math.cos(angle) * 6,
      py + Math.sin(angle) * 6,
      3
    );
  }

  private createHUD() {
    const d = 2; // depth for HUD
    const hudDepth = 100;

    // Health background
    const hpBg = this.add.graphics();
    hpBg.setDepth(hudDepth);
    hpBg.setScrollFactor(0);
    hpBg.fillStyle(0x111111, 0.8);
    hpBg.fillRect(10, 10, 204, 22);
    hpBg.lineStyle(1, 0x00ff88, 0.5);
    hpBg.strokeRect(10, 10, 204, 22);

    this.hudHealth = this.add.graphics();
    this.hudHealth.setDepth(hudDepth + 1);
    this.hudHealth.setScrollFactor(0);

    this.hudHealthText = this.add.text(215, 12, "HP", {
      fontFamily: "monospace",
      fontSize: "11px",
      color: "#00ff88",
    });
    this.hudHealthText.setDepth(hudDepth + 2);
    this.hudHealthText.setScrollFactor(0);

    // Score (centered top)
    this.hudScore = this.add.text(this.gameWidth / 2, 14, "SCORE: 0", {
      fontFamily: "Orbitron, monospace",
      fontSize: "14px",
      color: "#00ffff",
    });
    this.hudScore.setOrigin(0.5, 0);
    this.hudScore.setDepth(hudDepth);
    this.hudScore.setScrollFactor(0);

    // Wave (top right)
    this.hudWave = this.add.text(this.gameWidth - 10, 14, "WAVE 1", {
      fontFamily: "Orbitron, monospace",
      fontSize: "14px",
      color: "#ff8800",
    });
    this.hudWave.setOrigin(1, 0);
    this.hudWave.setDepth(hudDepth);
    this.hudWave.setScrollFactor(0);

    this.updateHUD();

    // Mute toggle button
    const muteBtn = this.add.text(this.gameWidth - 14, 36, "🔊", { fontSize: "16px" });
    muteBtn.setOrigin(1, 0);
    muteBtn.setDepth(hudDepth + 2);
    muteBtn.setScrollFactor(0);
    muteBtn.setInteractive({ useHandCursor: true });
    muteBtn.on("pointerup", () => {
      const muted = this.sfx.toggleMute();
      muteBtn.setText(muted ? "🔇" : "🔊");
    });
  }

  private updateHUD() {
    // Health bar
    this.hudHealth.clear();
    const hpPercent = this.playerHp / this.playerMaxHp;
    const barColor =
      hpPercent > 0.6 ? 0x00ff88 : hpPercent > 0.3 ? 0xffaa00 : 0xff2200;
    this.hudHealth.fillStyle(barColor, 0.9);
    this.hudHealth.fillRect(12, 12, Math.floor(200 * hpPercent), 18);

    this.hudScore.setText(`SCORE: ${this.score.toLocaleString()}`);
    this.hudWave.setText(`WAVE ${this.wave}`);
    this.hudHealthText.setText(`HP ${this.playerHp}`);
  }

  private createCommentaryText() {
    this.commentaryText = this.add.text(this.gameWidth / 2, this.gameHeight - 40, "", {
      fontFamily: "monospace",
      fontSize: "13px",
      color: "#ffff00",
      stroke: "#000000",
      strokeThickness: 3,
      align: "center",
    });
    this.commentaryText.setOrigin(0.5);
    this.commentaryText.setDepth(200);
    this.commentaryText.setScrollFactor(0);
    this.commentaryText.setAlpha(0);
  }

  private showCommentary(text: string, duration: number = 2500) {
    this.commentaryText.setText(`> ${text}`);
    this.commentaryText.setAlpha(1);
    this.commentaryTimer = duration;
  }

  private setupInput() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  private spawnWave(waveNum: number) {
    const grunts = 3 + waveNum * 2;
    const shooters = Math.floor(waveNum / 2);
    const rushers = Math.floor(waveNum / 3);
    this.waveEnemiesRemaining = grunts + shooters + rushers;

    for (let i = 0; i < grunts; i++) {
      this.spawnEnemy("grunt");
    }
    for (let i = 0; i < shooters; i++) {
      this.spawnEnemy("shooter");
    }
    for (let i = 0; i < rushers; i++) {
      this.spawnEnemy("rusher");
    }
  }

  private spawnEnemy(type: "grunt" | "shooter" | "rusher") {
    const margin = 50;
    let ex: number, ey: number;
    const side = Math.floor(Math.random() * 4);
    switch (side) {
      case 0: ex = Math.random() * this.gameWidth; ey = -margin; break;
      case 1: ex = this.gameWidth + margin; ey = Math.random() * this.gameHeight; break;
      case 2: ex = Math.random() * this.gameWidth; ey = this.gameHeight + margin; break;
      default: ex = -margin; ey = Math.random() * this.gameHeight; break;
    }

    const glow = this.add.graphics();
    glow.setDepth(3);
    const body = this.add.graphics();
    body.setDepth(4);

    const configs = {
      grunt: { hp: 30, speed: 60 + this.wave * 5, shootInterval: 0, value: 100 },
      shooter: { hp: 50, speed: 40 + this.wave * 3, shootInterval: 2000 - this.wave * 50, value: 200 },
      rusher: { hp: 20, speed: 140 + this.wave * 10, shootInterval: 0, value: 150 },
    };
    const cfg = configs[type];

    const enemy: Enemy = {
      body,
      glowGraphics: glow,
      type,
      hp: cfg.hp,
      maxHp: cfg.hp,
      speed: cfg.speed,
      shootTimer: Math.random() * cfg.shootInterval,
      shootInterval: Math.max(cfg.shootInterval, 500),
      value: cfg.value,
      vx: 0,
      vy: 0,
    };

    // Store position in body
    body.setPosition(ex, ey);
    glow.setPosition(ex, ey);
    this.drawEnemy(enemy);
    this.enemies.push(enemy);
  }

  private drawEnemy(enemy: Enemy) {
    const bx = enemy.body.x;
    const by = enemy.body.y;
    enemy.body.clear();
    enemy.glowGraphics.clear();

    const colors = { grunt: 0xff2222, shooter: 0xff8800, rusher: 0xaa00ff };
    const color = colors[enemy.type];

    // Glow effect
    for (let r = 20; r >= 8; r -= 4) {
      const alpha = ((20 - r) / 12) * 0.12;
      enemy.glowGraphics.fillStyle(color, alpha);
      enemy.glowGraphics.fillCircle(0, 0, r);
    }

    // Health bar
    if (enemy.hp < enemy.maxHp) {
      enemy.body.fillStyle(0x333333, 0.8);
      enemy.body.fillRect(-14, -18, 28, 4);
      enemy.body.fillStyle(0x00ff00, 1);
      enemy.body.fillRect(-14, -18, Math.floor(28 * (enemy.hp / enemy.maxHp)), 4);
    }

    switch (enemy.type) {
      case "grunt":
        // Red square
        enemy.body.fillStyle(color, 1);
        enemy.body.fillRect(-10, -10, 20, 20);
        enemy.body.lineStyle(1, 0xff6666, 0.8);
        enemy.body.strokeRect(-10, -10, 20, 20);
        break;
      case "shooter":
        // Orange hexagon
        enemy.body.fillStyle(color, 1);
        enemy.body.fillPoints(this.hexPoints(12), true);
        enemy.body.lineStyle(1.5, 0xffdd00, 0.8);
        enemy.body.strokePoints(this.hexPoints(12), true);
        break;
      case "rusher":
        // Purple circle
        enemy.body.fillStyle(color, 1);
        enemy.body.fillCircle(0, 0, 10);
        enemy.body.lineStyle(2, 0xff44ff, 0.9);
        enemy.body.strokeCircle(0, 0, 10);
        break;
    }
  }

  private hexPoints(r: number): Phaser.Geom.Point[] {
    const pts: Phaser.Geom.Point[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      pts.push(new Phaser.Geom.Point(Math.cos(angle) * r, Math.sin(angle) * r));
    }
    return pts;
  }

  private tryShoot() {
    if (this.isGameOver || this.playerShootCooldown > 0) return;
    this.playerShootCooldown = this.playerShootRate;

    const angle = this.playerAngle;
    const speed = 500;
    const bx = this.playerX + Math.cos(angle) * 20;
    const by = this.playerY + Math.sin(angle) * 20;

    this.sfx.playShoot();
    this.spawnBullet(bx, by, Math.cos(angle) * speed, Math.sin(angle) * speed, false);
  }

  private spawnBullet(
    x: number, y: number,
    vx: number, vy: number,
    isEnemy: boolean
  ) {
    const gfx = this.add.graphics();
    gfx.setDepth(5);
    gfx.setPosition(x, y);

    const color = isEnemy ? 0xff4444 : 0xffff00;
    gfx.fillStyle(color, 1);
    gfx.fillCircle(0, 0, isEnemy ? 4 : 3);
    gfx.fillStyle(0xffffff, 0.6);
    gfx.fillCircle(0, 0, isEnemy ? 2 : 1.5);

    const trail: Phaser.GameObjects.Graphics[] = [];
    for (let t = 0; t < 3; t++) {
      const tg = this.add.graphics();
      tg.setDepth(4);
      tg.setPosition(x, y);
      tg.fillStyle(color, 0.3 - t * 0.08);
      tg.fillCircle(0, 0, (isEnemy ? 3 : 2) - t * 0.5);
      trail.push(tg);
    }

    this.bullets.push({ graphics: gfx, trail, vx, vy, isEnemy, age: 0 });
  }

  private spawnParticles(x: number, y: number, color: number, count: number = 12) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 150 + 50;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        life: 600,
        maxLife: 600,
        size: Math.random() * 4 + 1,
      });
    }
  }

  private triggerShake(intensity: number = 8, duration: number = 300) {
    this.shakeIntensity = intensity;
    this.shakeTimer = duration;
  }

  update(time: number, delta: number) {
    if (this.isGameOver) return;

    this.updateStars(delta);
    this.updatePlayer(delta);
    this.updateBullets(delta);
    this.updateEnemies(delta, time);
    this.updateParticles(delta);
    this.updateCommentary(delta);
    this.updateShake(delta);
    this.checkWave();
  }

  private updateStars(delta: number) {
    for (const layer of this.starLayers) {
      layer.graphics.clear();
      layer.graphics.fillStyle(0xffffff, 1);
      for (const star of layer.stars) {
        star.y += star.speed * (delta / 16);
        if (star.y > this.gameHeight) {
          star.y = 0;
          star.x = Math.random() * this.gameWidth;
        }
        layer.graphics.fillCircle(
          star.x + this.cameraOffX * star.speed * 0.5,
          star.y + this.cameraOffY * star.speed * 0.5,
          star.size
        );
      }
    }
  }

  private updatePlayer(delta: number) {
    const dt = delta / 1000;
    let dx = 0, dy = 0;

    if (this.cursors.left.isDown || this.wasd.left.isDown) dx -= 1;
    if (this.cursors.right.isDown || this.wasd.right.isDown) dx += 1;
    if (this.cursors.up.isDown || this.wasd.up.isDown) dy -= 1;
    if (this.cursors.down.isDown || this.wasd.down.isDown) dy += 1;

    // Movement is relative to ship facing direction (toward mouse)
    // W/Up = forward thrust, S/Down = reverse, A/D = strafe
    const facing = this.playerAngle;
    const strafe = facing + Math.PI / 2;

    let mx = 0, my = 0;

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      mx += Math.cos(facing);
      my += Math.sin(facing);
    }
    if (this.cursors.down.isDown || this.wasd.down.isDown) {
      mx -= Math.cos(facing);
      my -= Math.sin(facing);
    }
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      mx -= Math.cos(strafe);
      my -= Math.sin(strafe);
    }
    if (this.cursors.right.isDown || this.wasd.right.isDown) {
      mx += Math.cos(strafe);
      my += Math.sin(strafe);
    }

    if (mx !== 0 || my !== 0) {
      const len = Math.sqrt(mx * mx + my * my);
      this.playerX += (mx / len) * this.playerSpeed * dt;
      this.playerY += (my / len) * this.playerSpeed * dt;
    }

    // Clamp to bounds
    const margin = 20;
    this.playerX = Phaser.Math.Clamp(this.playerX, margin, this.gameWidth - margin);
    this.playerY = Phaser.Math.Clamp(this.playerY, margin, this.gameHeight - margin);

    // Aim toward mouse
    const pointer = this.input.activePointer;
    const tx = pointer.x - this.cameraOffX;
    const ty = pointer.y - this.cameraOffY;
    this.playerAngle = Math.atan2(ty - this.playerY, tx - this.playerX);

    // Shoot with space or held mouse
    if (this.playerShootCooldown > 0) {
      this.playerShootCooldown -= delta;
    }
    if (this.spaceKey.isDown || (this.input.activePointer.isDown && this.input.activePointer.leftButtonDown())) {
      this.tryShoot();
    }

    if (this.playerInvincible > 0) this.playerInvincible -= delta;

    // Update player visuals
    this.player.setPosition(0, 0);
    this.playerGlow.setPosition(0, 0);
    this.drawPlayer(false);
  }

  private updateBullets(delta: number) {
    const dt = delta / 1000;
    const toRemove: Bullet[] = [];

    for (const bullet of this.bullets) {
      bullet.age += delta;

      // Move trail first
      for (let t = bullet.trail.length - 1; t > 0; t--) {
        bullet.trail[t].setPosition(bullet.trail[t - 1].x, bullet.trail[t - 1].y);
      }
      if (bullet.trail.length > 0) {
        bullet.trail[0].setPosition(bullet.graphics.x, bullet.graphics.y);
      }

      bullet.graphics.x += bullet.vx * dt;
      bullet.graphics.y += bullet.vy * dt;

      const bx = bullet.graphics.x;
      const by = bullet.graphics.y;
      const oob = bx < -50 || bx > this.gameWidth + 50 || by < -50 || by > this.gameHeight + 50;
      const tooOld = bullet.age > 3000;

      if (oob || tooOld) {
        toRemove.push(bullet);
        continue;
      }

      if (!bullet.isEnemy) {
        // Check against enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
          const e = this.enemies[i];
          const ex = e.body.x, ey = e.body.y;
          const dist = Phaser.Math.Distance.Between(bx, by, ex, ey);
          if (dist < 16) {
            e.hp -= 25;
            toRemove.push(bullet);
            this.spawnParticles(ex, ey, 0xffaa00, 6);

            if (e.hp <= 0) {
              this.killEnemy(e, i);
            } else {
              this.sfx.playHit();
              this.drawEnemy(e);
            }
            break;
          }
        }
      } else {
        // Check against player
        if (this.playerInvincible <= 0) {
          const dist = Phaser.Math.Distance.Between(bx, by, this.playerX, this.playerY);
          if (dist < 16) {
            toRemove.push(bullet);
            this.damagePlayer(15);
          }
        }
      }
    }

    for (const b of toRemove) {
      b.graphics.destroy();
      for (const t of b.trail) t.destroy();
      const idx = this.bullets.indexOf(b);
      if (idx >= 0) this.bullets.splice(idx, 1);
    }
  }

  private killEnemy(enemy: Enemy, index: number) {
    const ex = enemy.body.x;
    const ey = enemy.body.y;
    const colors = { grunt: 0xff2222, shooter: 0xff8800, rusher: 0xaa00ff };

    this.sfx.playExplosion();
    this.spawnParticles(ex, ey, colors[enemy.type], 16);
    this.spawnParticles(ex, ey, 0xffffff, 6);

    enemy.body.destroy();
    enemy.glowGraphics.destroy();
    this.enemies.splice(index, 1);
    this.waveEnemiesRemaining--;

    this.score += enemy.value;
    this.updateHUD();

    // Good commentary occasionally
    if (this.score > 0 && this.score % 1000 === 0) {
      this.showCommentary(this.commentary.getGoodMessage(), 2000);
    }
  }

  private damagePlayer(amount: number) {
    this.playerHp = Math.max(0, this.playerHp - amount);
    this.playerInvincible = 600;
    this.sfx.playPlayerHit();
    this.triggerShake(6, 250);
    this.updateHUD();
    this.drawPlayer(true);

    if (this.playerHp <= 0) {
      this.triggerGameOver();
    } else {
      this.showCommentary(this.commentary.getHitMessage(), 2000);
    }
  }

  private updateEnemies(delta: number, time: number) {
    const dt = delta / 1000;

    for (const enemy of this.enemies) {
      const ex = enemy.body.x;
      const ey = enemy.body.y;
      const toPx = this.playerX - ex;
      const toPy = this.playerY - ey;
      const dist = Math.sqrt(toPx * toPx + toPy * toPy);

      if (dist > 0) {
        const nx = toPx / dist;
        const ny = toPy / dist;

        switch (enemy.type) {
          case "grunt":
            enemy.vx = nx * enemy.speed;
            enemy.vy = ny * enemy.speed;
            break;
          case "shooter": {
            const preferredDist = 220;
            if (dist < preferredDist - 20) {
              enemy.vx = -nx * enemy.speed * 0.5;
              enemy.vy = -ny * enemy.speed * 0.5;
            } else if (dist > preferredDist + 20) {
              enemy.vx = nx * enemy.speed * 0.5;
              enemy.vy = ny * enemy.speed * 0.5;
            } else {
              // Strafe
              enemy.vx = -ny * enemy.speed * 0.4;
              enemy.vy = nx * enemy.speed * 0.4;
            }
            break;
          }
          case "rusher":
            enemy.vx = nx * enemy.speed;
            enemy.vy = ny * enemy.speed;
            break;
        }

        enemy.body.x += enemy.vx * dt;
        enemy.body.y += enemy.vy * dt;
        enemy.glowGraphics.x = enemy.body.x;
        enemy.glowGraphics.y = enemy.body.y;
      }

      // Shooter fires
      if (enemy.type === "shooter") {
        enemy.shootTimer -= delta;
        if (enemy.shootTimer <= 0) {
          enemy.shootTimer = enemy.shootInterval;
          const angle = Math.atan2(this.playerY - enemy.body.y, this.playerX - enemy.body.x);
          const spd = 200 + this.wave * 10;
          this.sfx.playEnemyShoot();
          this.spawnBullet(
            enemy.body.x, enemy.body.y,
            Math.cos(angle) * spd, Math.sin(angle) * spd,
            true
          );
        }
      }

      // Contact damage
      const cdist = Phaser.Math.Distance.Between(enemy.body.x, enemy.body.y, this.playerX, this.playerY);
      if (cdist < 22 && this.playerInvincible <= 0) {
        this.damagePlayer(enemy.type === "rusher" ? 20 : 10);
      }

      this.drawEnemy(enemy);
    }
  }

  private updateParticles(delta: number) {
    const dt = delta / 1000;
    const particleGraphics = this.add.graphics();
    particleGraphics.setDepth(6);

    const toRemove: number[] = [];

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.95;
      p.vy *= 0.95;
      p.life -= delta;

      if (p.life <= 0) {
        toRemove.push(i);
        continue;
      }

      const alpha = p.life / p.maxLife;
      const size = p.size * alpha;
      particleGraphics.fillStyle(p.color, alpha);
      particleGraphics.fillCircle(p.x, p.y, size);
    }

    // Remove dead particles
    for (let i = toRemove.length - 1; i >= 0; i--) {
      this.particles.splice(toRemove[i], 1);
    }

    // Destroy this temporary graphics after drawing (will be recreated next frame)
    // Actually we should use a persistent one... let's fix this
    this.time.delayedCall(0, () => particleGraphics.destroy());
  }

  private updateCommentary(delta: number) {
    if (this.commentaryTimer > 0) {
      this.commentaryTimer -= delta;
      if (this.commentaryTimer <= 0) {
        this.commentaryText.setAlpha(0);
      } else if (this.commentaryTimer < 500) {
        this.commentaryText.setAlpha(this.commentaryTimer / 500);
      }
    }
  }

  private updateShake(delta: number) {
    if (this.shakeTimer > 0) {
      this.shakeTimer -= delta;
      this.cameraOffX = (Math.random() - 0.5) * this.shakeIntensity;
      this.cameraOffY = (Math.random() - 0.5) * this.shakeIntensity;
      this.cameras.main.setScroll(this.cameraOffX, this.cameraOffY);
    } else {
      this.cameraOffX = 0;
      this.cameraOffY = 0;
      this.cameras.main.setScroll(0, 0);
    }
  }

  private checkWave() {
    if (this.inWaveTransition) return;
    if (this.enemies.length === 0 && this.waveEnemiesRemaining <= 0) {
      this.inWaveTransition = true;
      this.wave++;

      const msg = this.commentary.getWaveMessage(this.wave);
      this.sfx.playWaveStart();
      this.showCommentary(msg, 3000);

      this.time.delayedCall(3000, () => {
        this.inWaveTransition = false;
        this.spawnWave(this.wave);
      });
    }
  }

  private triggerGameOver() {
    this.isGameOver = true;
    this.sfx.playGameOver();
    this.spawnParticles(this.playerX, this.playerY, 0x00ff88, 30);
    this.spawnParticles(this.playerX, this.playerY, 0xffffff, 10);
    this.triggerShake(12, 500);

    this.player.destroy();
    this.playerGlow.destroy();

    const deathMsg = this.commentary.getDeathMessage();

    this.time.delayedCall(800, () => {
      this.scene.start("GameOver", {
        score: this.score,
        wave: this.wave,
        deathMessage: deathMsg,
      });
    });
  }
}
