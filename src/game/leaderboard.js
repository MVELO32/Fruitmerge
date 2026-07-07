// Leaderboard — tries the Vercel API first, falls back to localStorage silently.
// The localStorage fallback means it always works, even without Upstash configured.

const API    = "/api/leaderboard";
const LS_KEY = "fruitmerge_leaderboard_v1";
const MAX_LS = 100;

// ── localStorage helpers ──────────────────────────────────────────────────────
function lsRead() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
}
function lsWrite(entries) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(entries)); } catch {}
}
function lsSubmit(profile, score) {
  const entries = lsRead();
  const idx = entries.findIndex((e) => e.name === profile.name && e.avatar === profile.avatar);
  if (idx >= 0) {
    if (score > entries[idx].score) {
      entries[idx].score = score;
      entries[idx].date  = new Date().toISOString();
    }
  } else {
    entries.push({ name: profile.name, avatar: profile.avatar, score, date: new Date().toISOString() });
  }
  lsWrite(entries.sort((a, b) => b.score - a.score).slice(0, MAX_LS));
}

// ── API helpers ───────────────────────────────────────────────────────────────
// Returns null (not throws) on any failure so callers can silently fall back
async function apiGet() {
  try {
    const res = await fetch(API, { method: "GET" });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return null;
    const data = await res.json();
    return data.ok ? data.entries : null;
  } catch {
    return null;
  }
}

async function apiPost(profile, score) {
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: profile.name, avatar: profile.avatar, score }),
    });
    if (!res.ok) return false;
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return false;
    const data = await res.json();
    return data.ok === true;
  } catch {
    return false;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────
export async function loadLeaderboard() {
  const remote = await apiGet();
  if (remote) return remote;
  // Fall back to local scores
  return lsRead().sort((a, b) => b.score - a.score);
}

export async function submitScore(profile, score) {
  if (!score || score <= 0) return;
  // Write locally immediately so it shows up even if API is slow / down
  lsSubmit(profile, score);
  // Best-effort remote submit — failures are silently ignored
  await apiPost(profile, score);
}
