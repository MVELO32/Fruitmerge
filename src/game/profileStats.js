// Tracks per-profile stats: games played, total score, best score.
// Stored under a key derived from name+avatar so each profile
// has its own record even on a shared device.

const key = (profile) =>
  `fruitmerge_stats_${profile.name}_${profile.avatar}`;

export function loadStats(profile) {
  try {
    return JSON.parse(localStorage.getItem(key(profile))) ?? {
      gamesPlayed: 0,
      totalScore:  0,
      bestScore:   0,
    };
  } catch {
    return { gamesPlayed: 0, totalScore: 0, bestScore: 0 };
  }
}

export function recordGame(profile, score) {
  const stats = loadStats(profile);
  stats.gamesPlayed += 1;
  stats.totalScore  += score;
  stats.bestScore    = Math.max(stats.bestScore, score);
  try {
    localStorage.setItem(key(profile), JSON.stringify(stats));
  } catch {}
  return stats;
}
