import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const KEY   = "fruitmerge:leaderboard";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET")
    return res.status(405).json({ ok: false, error: "Method not allowed" });

  const { name } = req.query;
  if (!name || typeof name !== "string" || !name.trim())
    return res.status(400).json({ ok: false, error: "Name required" });

  try {
    // Scan all members and check if any share this name (case-insensitive)
    // We use zrange to get all members then filter in JS
    const raw = await redis.zrange(KEY, 0, -1);
    const nameLower = name.trim().toLowerCase();

    const taken = raw.some((member) => {
      try {
        const parsed = typeof member === "string" ? JSON.parse(member) : member;
        return parsed.name?.toLowerCase() === nameLower;
      } catch { return false; }
    });

    return res.status(200).json({ ok: true, taken });
  } catch (err) {
    // If Redis is unavailable, allow the name (fail open)
    console.error("check error:", err);
    return res.status(200).json({ ok: true, taken: false });
  }
}
