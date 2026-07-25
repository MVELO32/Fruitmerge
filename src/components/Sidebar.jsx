import { FRUITS } from "../game/catalog";

export function Sidebar({ score, best, curTier, nextTier }) {
  const cur  = FRUITS[curTier];
  const next = FRUITS[nextTier];

  return (
    <aside className="sidebar">
      <div className="sc-card">
        <span className="sc-label">Score</span>
        <span className="sc-val">{score.toLocaleString()}</span>
      </div>

      <div className="sc-card">
        <span className="sc-label">Best</span>
        <span className="sc-val">{best.toLocaleString()}</span>
      </div>

      <div className="sc-card sc-next">
        <span className="sc-label">Now</span>
        <div className="sc-dot" style={{ background: cur.color, width: Math.min(50, cur.r * 1.1), height: Math.min(50, cur.r * 1.1) }} />
        <span className="sc-name">{cur.name}</span>
      </div>

      <div className="sc-card sc-next">
        <span className="sc-label">Next</span>
        <div className="sc-dot" style={{ background: next.color, width: Math.min(50, next.r * 1.1), height: Math.min(50, next.r * 1.1), opacity: 0.55 }} />
        <span className="sc-name">{next.name}</span>
      </div>

      <div className="sc-card sc-tiers">
        <span className="sc-label" style={{ marginBottom: 6, display: "block" }}>Colours</span>
        {FRUITS.map((f, i) => (
          <div key={i} className="sc-tier" style={{ opacity: i === curTier ? 1 : 0.38 }}>
            <span className="sc-tier-dot" style={{ background: f.color, width: Math.max(7, f.r * 0.18), height: Math.max(7, f.r * 0.18) }} />
            <span className="sc-tier-name" style={{ color: i === curTier ? "#fff" : undefined }}>{f.name}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
