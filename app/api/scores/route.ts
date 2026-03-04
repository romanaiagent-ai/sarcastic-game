import { NextRequest, NextResponse } from "next/server";

// Gracefully import Vercel KV — works in prod, falls back in dev/no-config
async function getKV() {
  try {
    const { kv } = await import("@vercel/kv");
    // Test connection with a ping-style op
    await kv.ping();
    return kv;
  } catch {
    return null;
  }
}

export interface ScoreEntry {
  name: string;
  score: number;
  wave: number;
  date: number;
}

export async function GET() {
  try {
    const kv = await getKV();
    if (!kv) {
      return NextResponse.json({ scores: [], kvAvailable: false });
    }

    const raw = await kv.lrange("sarcastic:scores", 0, 199);
    const scores: ScoreEntry[] = raw
      .map((s) => (typeof s === "string" ? JSON.parse(s) : s))
      .sort((a: ScoreEntry, b: ScoreEntry) => b.score - a.score)
      .slice(0, 10);

    return NextResponse.json({ scores, kvAvailable: true });
  } catch {
    return NextResponse.json({ scores: [], kvAvailable: false });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, score, wave } = body;

    if (!name || typeof score !== "number" || typeof wave !== "number") {
      return NextResponse.json({ ok: false, error: "Invalid data" }, { status: 400 });
    }

    const kv = await getKV();
    if (!kv) {
      return NextResponse.json({ ok: false, error: "Leaderboard not configured" });
    }

    const entry: ScoreEntry = {
      name: String(name).slice(0, 20).trim() || "ANONYMOUS",
      score: Math.max(0, Math.floor(score)),
      wave: Math.max(1, Math.floor(wave)),
      date: Date.now(),
    };

    await kv.lpush("sarcastic:scores", JSON.stringify(entry));
    await kv.ltrim("sarcastic:scores", 0, 199); // keep last 200

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to save score" });
  }
}
