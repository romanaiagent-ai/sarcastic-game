import { NextRequest, NextResponse } from "next/server";

export interface ScoreEntry {
  name: string;
  score: number;
  wave: number;
  date: number;
}

async function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  try {
    const { Redis } = await import("@upstash/redis");
    return new Redis({ url, token });
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const redis = await getRedis();
    if (!redis) {
      return NextResponse.json({ scores: [], kvAvailable: false });
    }

    const raw = await redis.lrange("sarcastic:scores", 0, 199);
    const scores: ScoreEntry[] = (raw as string[])
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

    const redis = await getRedis();
    if (!redis) {
      return NextResponse.json({ ok: false, error: "Leaderboard not configured" });
    }

    const entry: ScoreEntry = {
      name: String(name).slice(0, 20).trim() || "ANONYMOUS",
      score: Math.max(0, Math.floor(score)),
      wave: Math.max(1, Math.floor(wave)),
      date: Date.now(),
    };

    await redis.lpush("sarcastic:scores", JSON.stringify(entry));
    await redis.ltrim("sarcastic:scores", 0, 199);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to save score" });
  }
}
