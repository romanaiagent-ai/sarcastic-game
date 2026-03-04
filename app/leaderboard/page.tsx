"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface ScoreEntry {
  name: string;
  score: number;
  wave: number;
  date: number;
}

const snarkyComments: Record<number, string> = {
  0: "OK fine, this one might actually be good.",
  1: "Almost impressive. Almost.",
  2: "Bronze? More like participation trophy.",
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
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [kvAvailable, setKvAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/scores")
      .then((r) => r.json())
      .then((data) => {
        setScores(data.scores || []);
        setKvAvailable(data.kvAvailable ?? false);
      })
      .catch(() => {
        setScores([]);
        setKvAvailable(false);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main
      className="min-h-screen flex flex-col items-center py-16 px-4"
      style={{ background: "#050510" }}
    >
      {/* Back button */}
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
        className="orbitron font-black mb-2"
        style={{
          color: "#00ffff",
          textShadow: "0 0 20px #00ffff, 0 0 40px #00ffff",
          fontSize: "clamp(1.8rem, 5vw, 3rem)",
          letterSpacing: "0.1em",
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
        These people are bad at this game. Maybe you too.
      </p>

      {/* Status bar */}
      {!loading && (
        <div
          style={{
            fontFamily: "monospace",
            fontSize: "0.7rem",
            color: kvAvailable ? "#00ff88" : "#ff8800",
            marginBottom: "1rem",
            letterSpacing: "0.1em",
          }}
        >
          {kvAvailable
            ? "● LIVE GLOBAL SCORES"
            : "⚠ LOCAL MODE — Add Vercel KV to enable global scores"}
        </div>
      )}

      {/* Table */}
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

        {/* Rows */}
        {loading ? (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              fontFamily: "monospace",
              color: "#444",
              fontSize: "0.85rem",
            }}
          >
            Loading scores... (or there are none because everyone rage-quit)
          </div>
        ) : scores.length === 0 ? (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              fontFamily: "monospace",
              color: "#444",
              fontSize: "0.85rem",
            }}
          >
            No scores yet. Be the first to embarrass yourself.
          </div>
        ) : (
          scores.map((entry, idx) => (
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
                    color:
                      idx === 0
                        ? "#ffd700"
                        : idx === 1
                        ? "#c0c0c0"
                        : idx === 2
                        ? "#cd7f32"
                        : idx === scores.length - 1
                        ? "#ff4444"
                        : "#555",
                    fontFamily: "Orbitron, sans-serif",
                    fontSize: "0.75rem",
                  }}
                >
                  {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                </span>
                <span
                  style={{
                    color:
                      idx === scores.length - 1
                        ? "#ff4444"
                        : idx < 3
                        ? "#fff"
                        : "#aaa",
                    letterSpacing: "0.05em",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {entry.name}
                </span>
                <span
                  className="text-right"
                  style={{ color: "#00ff88", letterSpacing: "0.05em" }}
                >
                  {entry.score.toLocaleString()}
                </span>
                <span className="text-right" style={{ color: "#666" }}>
                  {entry.wave}
                </span>
                <span
                  className="text-right"
                  style={{ color: "#444", fontSize: "0.7rem" }}
                >
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
                    letterSpacing: "0.05em",
                  }}
                >
                  &gt; {snarkyComments[idx]}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* CTA */}
      <div className="mt-12 text-center">
        <p
          style={{
            color: "#444",
            fontFamily: "monospace",
            fontSize: "0.75rem",
            letterSpacing: "0.1em",
            marginBottom: "1.5rem",
          }}
        >
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
