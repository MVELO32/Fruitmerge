import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const KEY = "fruitmerge:leaderboard";
const MAX = 100;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    try {
      const raw = await redis.zrevrangewithscores(KEY, 0, MAX - 1);
      const entries = [];
      for (let i = 0; i < raw.length; i += 2) {
        try {
          const member = typeof raw[i] === "string" ? JSON.parse(raw[i]) : raw[i];
          entries.push({ ...member, score: Number(raw[i + 1]) });
        } catch {}
      }
      return res.status(200).json({ ok: true, entries });
    } catch (err) {
      return res.status(500).json({ ok: false, error: "Failed to load leaderboard" });
    }
  }

  if (req.method === "POST") {
    try {
      const { name, avatar, score } = req.body;
      if (!name || typeof name !== "string" || name.trim().length === 0 || name.length > 20)
        return res.status(400).json({ ok: false, error: "Invalid name" });
      if (!avatar || typeof avatar !== "string")
        return res.status(400).json({ ok: false, error: "Invalid avatar" });
      if (typeof score !== "number" || score < 0 || score > 1_000_000)
        return res.status(400).json({ ok: false, error: "Invalid score" });

      const memberKey = JSON.stringify({ name: name.trim(), avatar, date: new Date().toISOString() });
      await redis.zadd(KEY, { score, member: memberKey, gt: true });
      await redis.zremrangebyrank(KEY, 0, -(MAX + 1));
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ ok: false, error: "Failed to submit score" });
    }
  }

  return res.status(405).json({ ok: false, error: "Method not allowed" });
}
