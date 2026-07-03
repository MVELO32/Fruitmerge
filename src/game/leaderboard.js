// Calls the Vercel serverless function at /api/leaderboard.
// Falls back to localStorage if the API is unavailable (local dev without env vars).

const API = "/api/leaderboard";

async function apiFetch(method, body) {
  const res = await fetch(API, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── localStorage fallback ─────────────────────────────────────────────────────
const LS_KEY = "fruitmerge_leaderboard_v1";
const MAX_LS  = 100;

function lsRead()        { try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; } }
function lsWrite(e)      { try { localStorage.setItem(LS_KEY, JSON.stringify(e)); } catch {} }

function lsSubmit(profile, score) {
  const entries = lsRead();
  const idx = entries.findIndex((e) => e.name === profile.name && e.avatar === profile.avatar);
  if (idx >= 0) {
    if (score > entries[idx].score) { entries[idx].score = score; entries[idx].date = new Date().toISOString(); }
  } else {
    entries.push({ name: profile.name, avatar: profile.avatar, score, date: new Date().toISOString() });
  }
  lsWrite(entries.sort((a, b) => b.score - a.score).slice(0, MAX_LS));
}

// ── Public API ────────────────────────────────────────────────────────────────
export async function loadLeaderboard() {
  try {
    const data = await apiFetch("GET");
    if (data.ok) return data.entries;
  } catch {}
  // fallback
  return lsRead().sort((a, b) => b.score - a.score);
}

export async function submitScore(profile, score) {
  if (score <= 0) return;
  try {
    await apiFetch("POST", { name: profile.name, avatar: profile.avatar, score });
  } catch {}
  // Always write locally too so it shows up instantly if API is slow
  lsSubmit(profile, score);
}
