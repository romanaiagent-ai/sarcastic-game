"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface ScoreEntry {
  name: string;
  score: number;
  wave: number;
  date: number;
}

const MOCK_SCORES: ScoreEntry[] = [
  { name: "xX_L33T_Xx", score: 9420, wave: 12, date: Date.now() - 3600000 * 2 },
  { name: "StarCrusher99", score: 7810, wave: 10, date: Date.now() - 3600000 * 5 },
  { name: "VoidWalker", score: 6200, wave: 9, date: Date.now() - 86400000 },
  { name: "NightHawk", score: 4100, wave: 7, date: Date.now() - 86400000 * 2 },
  { name: "SpacePotatoXD", score: 2850, wave: 5, date: Date.now() - 3600000 * 8 },
  { name: "BadAtGames", score: 1400, wave: 3, date: Date.now() - 3600000 * 12 },
  { name: "TryingMyBest", score: 800, wave: 2, date: Date.now() - 3600000 * 24 },
  { name: "PleaseHelp", score: 420, wave: 1, date: Date.now() - 86400000 * 3 },
  { name: "WhyDoIPlay", score: 150, wave: 1, date: Date.now() - 86400000 * 4 },
  { name: "YOU", score: 0, wave: 0, date: Date.now() - 86400000 * 5 },
];

const snarkyComments: Record<number, string> = {
  0: "OK fine, this one might actually be good.",
  1: "Almost impressive. Almost.",
  2: "Bronze? More like a participation trophy.",
  4: "Wave 5. Your mom would be proud. Maybe.",
  9: "Dead last. This is your legacy.",
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

export default function Leaderboard() {
  const [scores, setScores] = useState<ScoreEntry[]>(MOCK_SCORES);

  useEffect(() => {
    // Try real API, fall back to mock silently
    fetch("/api/scores")
      .then((r) => r.json())
      .then((data) => {
        if (data.kvAvailable && data.scores?.length > 0) {
          setScores(data.scores);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <main
      className="min-h-screen flex flex-col items-center py-16 px-4"
      style={{ background: "#050510" }}
    >
      <div className="w-full max-w-2xl mb-8">
        <Link href="/">
          <button
            style={{
              background: "transparent",
              border: "1px solid #333",
              color: "#555",
              fontFamily: "monospace",
              fontSize: "0.8rem",
              padding: "6px 14px",
              cursor: "pointer",
              letterSpacing: "0.1em",
            }}
          >
            ← BACK TO MAIN MENU
          </button>
        </Link>
      </div>

      <h1
        style={{
          color: "#00ffff",
          textShadow: "0 0 20px #00ffff, 0 0 40px #00ffff",
          fontSize: "clamp(1.8rem, 5vw, 3rem)",
          letterSpacing: "0.1em",
          fontFamily: "Orbitron, sans-serif",
          fontWeight: 900,
          marginBottom: "0.5rem",
        }}
      >
        HALL OF SHAME
      </h1>
      <p
        style={{
          color: "#555",
          fontFamily: "monospace",
          fontSize: "0.8rem",
          letterSpacing: "0.15em",
          marginBottom: "2rem",
        }}
      >
        These people are bad at this game. Especially #10.
      </p>

      <div
        className="w-full max-w-2xl rounded overflow-hidden"
        style={{
          border: "1px solid rgba(0,255,255,0.2)",
          boxShadow: "0 0 20px rgba(0,255,255,0.1)",
        }}
      >
        {/* Header */}
        <div
          className="grid px-4 py-3"
          style={{
            gridTemplateColumns: "2rem 1fr 6rem 4rem 5rem",
            background: "rgba(0,255,255,0.05)",
            borderBottom: "1px solid rgba(0,255,255,0.2)",
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "0.65rem",
            letterSpacing: "0.15em",
            color: "#00ffff",
          }}
        >
          <span>#</span>
          <span>PLAYER</span>
          <span className="text-right">SCORE</span>
          <span className="text-right">WAVE</span>
          <span className="text-right">WHEN</span>
        </div>

        {scores.map((entry, idx) => (
          <div key={idx}>
            <div
              className="grid px-4 py-3 items-center"
              style={{
                gridTemplateColumns: "2rem 1fr 6rem 4rem 5rem",
                background:
                  idx === scores.length - 1
                    ? "rgba(255,0,0,0.04)"
                    : idx % 2 === 0
                    ? "rgba(255,255,255,0.02)"
                    : "transparent",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                fontFamily: "monospace",
                fontSize: "0.85rem",
              }}
            >
              <span
                style={{
                  color: idx === 0 ? "#ffd700" : idx === 1 ? "#c0c0c0" : idx === 2 ? "#cd7f32" : idx === scores.length - 1 ? "#ff4444" : "#555",
                  fontFamily: "Orbitron, sans-serif",
                  fontSize: "0.75rem",
                }}
              >
                {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
              </span>
              <span
                style={{
                  color: idx === scores.length - 1 ? "#ff4444" : idx < 3 ? "#fff" : "#aaa",
                  letterSpacing: "0.05em",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {entry.name}
              </span>
              <span className="text-right" style={{ color: "#00ff88" }}>
                {entry.score.toLocaleString()}
              </span>
              <span className="text-right" style={{ color: "#666" }}>
                {entry.wave}
              </span>
              <span className="text-right" style={{ color: "#444", fontSize: "0.7rem" }}>
                {entry.date ? timeAgo(entry.date) : "—"}
              </span>
            </div>
            {snarkyComments[idx] && (
              <div
                className="px-4 py-1"
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  color: "#444",
                  fontFamily: "monospace",
                  fontSize: "0.65rem",
                  fontStyle: "italic",
                }}
              >
                &gt; {snarkyComments[idx]}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p style={{ color: "#444", fontFamily: "monospace", fontSize: "0.75rem", letterSpacing: "0.1em", marginBottom: "1.5rem" }}>
          Think you can do better? (You can&apos;t.)
        </p>
        <Link href="/game">
          <button
            style={{
              background: "transparent",
              border: "1px solid #00ff88",
              color: "#00ff88",
              fontFamily: "Orbitron, sans-serif",
              fontSize: "0.8rem",
              fontWeight: 700,
              letterSpacing: "0.2em",
              padding: "0.75rem 2rem",
              cursor: "pointer",
              textTransform: "uppercase",
              boxShadow: "0 0 15px rgba(0,255,136,0.3)",
            }}
          >
            ▶ PROVE US WRONG
          </button>
        </Link>
      </div>
    </main>
  );
}
