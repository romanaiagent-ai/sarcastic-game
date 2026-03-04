"use client";

import { useEffect, useRef } from "react";

export default function PhaserGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<import("phaser").Game | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const initGame = async () => {
      const Phaser = (await import("phaser")).default;
      const { GameScene } = await import("../game/scenes/GameScene");
      const { GameOver } = await import("../game/scenes/GameOver");

      const W = Math.min(window.innerWidth, 900);
      const H = Math.min(window.innerHeight, 700);

      const config: import("phaser").Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: W,
        height: H,
        backgroundColor: "#050510",
        parent: containerRef.current || undefined,
        scene: [GameScene, GameOver],
        physics: {
          default: "arcade",
          arcade: { debug: false },
        },
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        render: {
          antialias: true,
          pixelArt: false,
        },
      };

      gameRef.current = new Phaser.Game(config);
    };

    initGame();

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div
      id="game-container"
      ref={containerRef}
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#000",
        overflow: "hidden",
      }}
    />
  );
}
