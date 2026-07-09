import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const KEY   = "fruitmerge:leaderboard";
const MAX   = 100;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    try {
      const raw = await redis.zrevrangewithscores(KEY, 0, MAX - 1);
      const entries = raw.map(({ member, score }) => {
        try {
          const parsed = typeof member === "string" ? JSON.parse(member) : member;
          return { ...parsed, score: Number(score) };
        } catch { return null; }
      }).filter(Boolean);
      return res.status(200).json({ ok: true, entries });
    } catch (err) {
      console.error("GET error:", err);
      return res.status(500).json({ ok: false, error: String(err) });
    }
  }

  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const { name, avatar, score } = body || {};

      if (!name || typeof name !== "string" || !name.trim() || name.length > 20)
        return res.status(400).json({ ok: false, error: "Invalid name" });
      if (!avatar || typeof avatar !== "string")
        return res.status(400).json({ ok: false, error: "Invalid avatar" });
      if (typeof score !== "number" || score < 0 || score > 1_000_000)
        return res.status(400).json({ ok: false, error: "Invalid score" });

      // Member key is ONLY name+avatar — no date — so the same player
      // always maps to the same Redis key and zadd GT updates their best score
      const member = JSON.stringify({ name: name.trim(), avatar });

      // GT = only update if new score is strictly greater than existing
      await redis.zadd(KEY, { score, member, gt: true });
      await redis.zremrangebyrank(KEY, 0, -(MAX + 1));

      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error("POST error:", err);
      return res.status(500).json({ ok: false, error: String(err) });
    }
  }

  return res.status(405).json({ ok: false, error: "Method not allowed" });
}