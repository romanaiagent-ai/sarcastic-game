import Phaser from "phaser";

interface GameOverData {
  score: number;
  wave: number;
  deathMessage: string;
}

export class GameOver extends Phaser.Scene {
  constructor() {
    super({ key: "GameOver" });
  }

  init(data: GameOverData) {
    this.data.set("score", data.score ?? 0);
    this.data.set("wave", data.wave ?? 1);
    this.data.set("deathMessage", data.deathMessage ?? "You died.");
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    const score: number = this.data.get("score");
    const wave: number = this.data.get("wave");
    const deathMessage: string = this.data.get("deathMessage");

    // Background overlay
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.85);
    bg.fillRect(0, 0, W, H);

    // Red scanlines effect
    bg.fillStyle(0xff0000, 0.03);
    for (let y = 0; y < H; y += 4) {
      bg.fillRect(0, y, W, 2);
    }

    // Title: GAME OVER
    const title = this.add.text(W / 2, H * 0.18, "GAME OVER", {
      fontFamily: "Orbitron, monospace",
      fontSize: "52px",
      fontStyle: "bold",
      color: "#ff2222",
      stroke: "#ff0000",
      strokeThickness: 2,
    });
    title.setOrigin(0.5);

    // Glow effect on title
    this.tweens.add({
      targets: title,
      alpha: { from: 0.7, to: 1 },
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    // Death message
    const msgBg = this.add.graphics();
    msgBg.fillStyle(0x1a0000, 0.8);
    msgBg.lineStyle(1, 0xff4444, 0.5);
    const msgW = Math.min(W - 80, 560);
    const msgX = (W - msgW) / 2;
    msgBg.fillRoundedRect(msgX, H * 0.3, msgW, 60, 4);
    msgBg.strokeRoundedRect(msgX, H * 0.3, msgW, 60, 4);

    const deathText = this.add.text(W / 2, H * 0.3 + 30, `"${deathMessage}"`, {
      fontFamily: "monospace",
      fontSize: "16px",
      color: "#ff8888",
      align: "center",
      wordWrap: { width: msgW - 30 },
    });
    deathText.setOrigin(0.5);

    // Stats panel
    const panelW = 320;
    const panelX = (W - panelW) / 2;
    const panelY = H * 0.45;

    const statsBg = this.add.graphics();
    statsBg.fillStyle(0x050510, 0.9);
    statsBg.lineStyle(1, 0x00ff88, 0.4);
    statsBg.fillRoundedRect(panelX, panelY, panelW, 140, 4);
    statsBg.strokeRoundedRect(panelX, panelY, panelW, 140, 4);

    // Stats title
    this.add.text(W / 2, panelY + 16, "[ PATHETIC STATS ]", {
      fontFamily: "Orbitron, monospace",
      fontSize: "11px",
      color: "#555",
      letterSpacing: 4,
    }).setOrigin(0.5);

    // Score
    this.add.text(panelX + 20, panelY + 42, "FINAL SCORE", {
      fontFamily: "monospace",
      fontSize: "11px",
      color: "#555",
      letterSpacing: 2,
    });
    this.add.text(panelX + panelW - 20, panelY + 42, score.toLocaleString(), {
      fontFamily: "Orbitron, monospace",
      fontSize: "18px",
      color: "#00ff88",
    }).setOrigin(1, 0);

    // Wave
    this.add.text(panelX + 20, panelY + 76, "WAVE REACHED", {
      fontFamily: "monospace",
      fontSize: "11px",
      color: "#555",
      letterSpacing: 2,
    });
    this.add.text(panelX + panelW - 20, panelY + 76, `${wave}`, {
      fontFamily: "Orbitron, monospace",
      fontSize: "18px",
      color: "#ff8800",
    }).setOrigin(1, 0);

    // Rank
    const rank = score < 500 ? "POTATO" : score < 2000 ? "ACCEPTABLE" : score < 5000 ? "DECENT" : "SUSPICIOUSLY GOOD";
    this.add.text(panelX + 20, panelY + 110, "RANK", {
      fontFamily: "monospace",
      fontSize: "11px",
      color: "#555",
      letterSpacing: 2,
    });
    this.add.text(panelX + panelW - 20, panelY + 110, rank, {
      fontFamily: "Orbitron, monospace",
      fontSize: "13px",
      color: "#00ffff",
    }).setOrigin(1, 0);

    // Submit score button
    const submitY = H * 0.70;
    const submitBg = this.add.graphics();
    submitBg.lineStyle(2, 0xffff00, 1);
    submitBg.fillStyle(0x1a1a00, 1);
    submitBg.fillRoundedRect(W / 2 - 100, submitY - 20, 200, 40, 4);
    submitBg.strokeRoundedRect(W / 2 - 100, submitY - 20, 200, 40, 4);

    const submitText = this.add.text(W / 2, submitY, "⬆ SUBMIT SCORE", {
      fontFamily: "Orbitron, monospace",
      fontSize: "11px",
      color: "#ffff00",
    }).setOrigin(0.5);

    const submitZone = this.add.zone(W / 2, submitY, 200, 40).setInteractive({ useHandCursor: true });
    let submitted = false;
    submitZone.on("pointerover", () => {
      submitBg.clear();
      submitBg.fillStyle(0x333300, 1);
      submitBg.lineStyle(2, 0xffff00, 1);
      submitBg.fillRoundedRect(W / 2 - 100, submitY - 20, 200, 40, 4);
      submitBg.strokeRoundedRect(W / 2 - 100, submitY - 20, 200, 40, 4);
    });
    submitZone.on("pointerout", () => {
      if (submitted) return;
      submitBg.clear();
      submitBg.fillStyle(0x1a1a00, 1);
      submitBg.lineStyle(2, 0xffff00, 1);
      submitBg.fillRoundedRect(W / 2 - 100, submitY - 20, 200, 40, 4);
      submitBg.strokeRoundedRect(W / 2 - 100, submitY - 20, 200, 40, 4);
    });
    submitZone.on("pointerup", () => {
      if (submitted) return;
      const name = window.prompt("Enter your name for the Hall of Shame:", "ANONYMOUS") ?? "";
      if (!name) return;
      submitted = true;
      submitText.setText("⏳ SUBMITTING...");
      submitZone.disableInteractive();
      fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.slice(0, 20), score, wave }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.ok) {
            submitText.setText("✓ SCORE SAVED");
            submitText.setColor("#00ff88");
          } else {
            submitText.setText("✗ " + (data.error ?? "FAILED"));
            submitText.setColor("#ff4444");
          }
        })
        .catch(() => {
          submitText.setText("✗ NETWORK ERROR");
          submitText.setColor("#ff4444");
        });
    });

    // Buttons
    const btnY = H * 0.84;

    // Retry button
    const retryBg = this.add.graphics();
    retryBg.lineStyle(2, 0x00ff88, 1);
    retryBg.fillStyle(0x001a0d, 1);
    retryBg.fillRoundedRect(W / 2 - 180, btnY - 20, 160, 44, 4);
    retryBg.strokeRoundedRect(W / 2 - 180, btnY - 20, 160, 44, 4);

    const retryText = this.add.text(W / 2 - 100, btnY + 2, "▶ TRY AGAIN", {
      fontFamily: "Orbitron, monospace",
      fontSize: "13px",
      color: "#00ff88",
    }).setOrigin(0.5);

    const retryZone = this.add.zone(W / 2 - 100, btnY + 2, 160, 44).setInteractive();
    retryZone.on("pointerover", () => {
      retryBg.clear();
      retryBg.fillStyle(0x004422, 1);
      retryBg.lineStyle(2, 0x00ff88, 1);
      retryBg.fillRoundedRect(W / 2 - 180, btnY - 20, 160, 44, 4);
      retryBg.strokeRoundedRect(W / 2 - 180, btnY - 20, 160, 44, 4);
    });
    retryZone.on("pointerout", () => {
      retryBg.clear();
      retryBg.fillStyle(0x001a0d, 1);
      retryBg.lineStyle(2, 0x00ff88, 1);
      retryBg.fillRoundedRect(W / 2 - 180, btnY - 20, 160, 44, 4);
      retryBg.strokeRoundedRect(W / 2 - 180, btnY - 20, 160, 44, 4);
    });
    retryZone.on("pointerup", () => {
      this.scene.start("GameScene");
    });

    // Main menu button
    const menuBg = this.add.graphics();
    menuBg.lineStyle(2, 0x00ffff, 1);
    menuBg.fillStyle(0x00101a, 1);
    menuBg.fillRoundedRect(W / 2 + 20, btnY - 20, 160, 44, 4);
    menuBg.strokeRoundedRect(W / 2 + 20, btnY - 20, 160, 44, 4);

    this.add.text(W / 2 + 100, btnY + 2, "⌂ MAIN MENU", {
      fontFamily: "Orbitron, monospace",
      fontSize: "13px",
      color: "#00ffff",
    }).setOrigin(0.5);

    const menuZone = this.add.zone(W / 2 + 100, btnY + 2, 160, 44).setInteractive();
    menuZone.on("pointerover", () => {
      menuBg.clear();
      menuBg.fillStyle(0x002233, 1);
      menuBg.lineStyle(2, 0x00ffff, 1);
      menuBg.fillRoundedRect(W / 2 + 20, btnY - 20, 160, 44, 4);
      menuBg.strokeRoundedRect(W / 2 + 20, btnY - 20, 160, 44, 4);
    });
    menuZone.on("pointerout", () => {
      menuBg.clear();
      menuBg.fillStyle(0x00101a, 1);
      menuBg.lineStyle(2, 0x00ffff, 1);
      menuBg.fillRoundedRect(W / 2 + 20, btnY - 20, 160, 44, 4);
      menuBg.strokeRoundedRect(W / 2 + 20, btnY - 20, 160, 44, 4);
    });
    menuZone.on("pointerup", () => {
      // Navigate to home - destroy game and go back
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    });

    // Keyboard: R to retry, M for menu
    this.input.keyboard!.once("keydown-R", () => {
      this.scene.start("GameScene");
    });
    this.input.keyboard!.once("keydown-M", () => {
      if (typeof window !== "undefined") window.location.href = "/";
    });

    // Hint
    this.add.text(W / 2, H - 20, "[R] Retry  •  [M] Menu", {
      fontFamily: "monospace",
      fontSize: "11px",
      color: "#333",
    }).setOrigin(0.5);

    // Particle rain from top
    for (let i = 0; i < 20; i++) {
      this.time.delayedCall(i * 100, () => {
        const x = Math.random() * W;
        const gfx = this.add.graphics();
        const color = [0xff2222, 0xff8800, 0xaa00ff][Math.floor(Math.random() * 3)];
        gfx.fillStyle(color, 0.8);
        gfx.fillCircle(0, 0, Math.random() * 3 + 1);
        gfx.setPosition(x, -10);

        this.tweens.add({
          targets: gfx,
          y: H + 10,
          x: x + (Math.random() - 0.5) * 100,
          alpha: 0,
          duration: 1500 + Math.random() * 1000,
          onComplete: () => gfx.destroy(),
        });
      });
    }
  }
}
