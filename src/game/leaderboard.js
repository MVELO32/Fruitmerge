const API    = "/api/leaderboard";
const LS_KEY = "fruitmerge_leaderboard_v1";
const MAX_LS = 100;

// ── localStorage ─────────────────────────────────────────────────────────────
function lsRead() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
}
function lsWrite(entries) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(entries)); } catch {}
}
function lsSubmit(profile, score) {
  const entries = lsRead();
  const idx = entries.findIndex(
    (e) => e.name === profile.name && e.avatar === profile.avatar
  );
  if (idx >= 0) {
    if (score > entries[idx].score) {
      entries[idx].score = score;
      entries[idx].date  = new Date().toISOString();
    }
  } else {
    entries.push({
      name: profile.name, avatar: profile.avatar,
      score, date: new Date().toISOString(),
    });
  }
  lsWrite(entries.sort((a, b) => b.score - a.score).slice(0, MAX_LS));
}

// ── API ───────────────────────────────────────────────────────────────────────
async function apiGet() {
  const res = await fetch(API, { method: "GET" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text(); // read as text first to debug
  console.log("[leaderboard] raw GET response:", text);
  const data = JSON.parse(text);
  if (!Array.isArray(data.entries)) throw new Error("No entries array in response");
  return data.entries;
}

async function apiPost(profile, score) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: profile.name, avatar: profile.avatar, score }),
  });
  const text = await res.text();
  console.log("[leaderboard] raw POST response:", text);
  return res.ok;
}

// ── Public ────────────────────────────────────────────────────────────────────
export async function loadLeaderboard() {
  try {
    const entries = await apiGet();
    console.log("[leaderboard] loaded from API:", entries);
    return entries;
  } catch (err) {
    console.warn("[leaderboard] API failed, using localStorage:", err);
    return lsRead().sort((a, b) => b.score - a.score);
  }
}

export async function submitScore(profile, score) {
  if (!score || score <= 0) return;
  lsSubmit(profile, score); // always write locally
  try {
    const ok = await apiPost(profile, score);
    console.log("[leaderboard] submit result:", ok);
  } catch (err) {
    console.warn("[leaderboard] submit failed:", err);
  }
}