# FruitMerge

A Suika Game clone built with React + Matter.js.

## Setup

```bash
npm install
npm run dev
```

## Shared Leaderboard (Upstash Redis)

The leaderboard uses a Vercel serverless function + Upstash Redis for cross-device scores.

### 1. Create a free Upstash database
1. Go to https://upstash.com and sign up (free)
2. Create a new Redis database → choose a region close to your users
3. Copy the **REST URL** and **REST Token** from the database page

### 2. Add environment variables to Vercel
In your Vercel project → Settings → Environment Variables, add:

| Name | Value |
|------|-------|
| `UPSTASH_REDIS_REST_URL` | Your Upstash REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Your Upstash REST token |

### 3. Redeploy
```bash
git add -A
git commit -m "Add leaderboard"
git push
```

Vercel auto-deploys. Without the env vars the leaderboard falls back to localStorage (per-device only).

## Deploy

```bash
npm run build
vercel --prod
```
