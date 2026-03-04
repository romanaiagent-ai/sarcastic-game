"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const PhaserGame = dynamic(() => import("../../components/PhaserGame"), {
  ssr: false,
  loading: () => (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: "#000", color: "#00ff88", fontFamily: "monospace" }}
    >
      <p style={{ letterSpacing: "0.2em", fontSize: "1.2rem" }}>
        LOADING YOUR DOOM...
      </p>
      <p style={{ color: "#444", marginTop: "1rem", fontSize: "0.8rem" }}>
        (The game is taking longer to load than your survival time will be)
      </p>
    </div>
  ),
});

export default function GamePage() {
  return (
    <div style={{ background: "#000", minHeight: "100vh" }}>
      <div
        style={{
          position: "fixed",
          top: "10px",
          left: "10px",
          zIndex: 100,
        }}
      >
        <Link href="/">
          <button
            style={{
              background: "transparent",
              border: "1px solid #333",
              color: "#555",
              fontFamily: "monospace",
              fontSize: "0.7rem",
              padding: "4px 10px",
              cursor: "pointer",
              letterSpacing: "0.1em",
            }}
          >
            ← QUIT (COWARD)
          </button>
        </Link>
      </div>
      <PhaserGame />
    </div>
  );
}
