import { FRUITS } from "../game/catalog";

export function Sidebar({ score, best, curTier, nextTier }) {
  const cur = FRUITS[curTier];
  const next = FRUITS[nextTier];

  return (
    <aside className="sidebar">
      <div className="stat-card">
        <span className="stat-label">Score</span>
        <span className="stat-value">{score}</span>
      </div>

      <div className="stat-card">
        <span className="stat-label">Best</span>
        <span className="stat-value">{best}</span>
      </div>

      <div className="stat-card next-card">
        <span className="stat-label">Now</span>
        <div
          className="next-circle"
          style={{
            background: cur.color,
            width: Math.min(52, cur.r * 1.1),
            height: Math.min(52, cur.r * 1.1),
          }}
        >
          <span className="next-initial">{cur.name[0]}</span>
        </div>
        <span className="next-name">{cur.name}</span>
      </div>

      <div className="stat-card next-card">
        <span className="stat-label">Next</span>
        <div
          className="next-circle"
          style={{
            background: next.color,
            width: Math.min(52, next.r * 1.1),
            height: Math.min(52, next.r * 1.1),
            opacity: 0.7,
          }}
        >
          <span className="next-initial">{next.name[0]}</span>
        </div>
        <span className="next-name">{next.name}</span>
      </div>

      <div className="tier-list-card">
        <span className="stat-label" style={{ marginBottom: 8, display: "block" }}>Fruits</span>
        {FRUITS.map((f, i) => (
          <div key={i} className="tier-row">
            <span
              className="tier-dot"
              style={{
                background: f.color,
                width: Math.max(7, f.r * 0.2),
                height: Math.max(7, f.r * 0.2),
                outline: i === curTier ? `1.5px solid white` : "none",
                outlineOffset: 1,
              }}
            />
            <span className="tier-name" style={{ color: i === curTier ? "rgba(255,255,255,0.9)" : undefined }}>
              {f.name}
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
}
