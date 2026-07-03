export function GameOverlay({ score, best, profile, onRestart, onLeaderboard }) {
  const isPB = score > 0 && score >= best;
  return (
    <div className="go-wrap">
      <div className="go-card">
        <span className="go-av">{profile?.avatar}</span>
        <h2 className="go-title">Game Over</h2>
        <p className="go-score">{score.toLocaleString()}</p>
        {isPB && <p className="go-pb">✨ New personal best!</p>}
        <p className="go-best">Best: {best.toLocaleString()}</p>
        <div className="go-btns">
          <button className="go-play" onClick={onRestart}>Play again</button>
          <button className="go-lb"   onClick={onLeaderboard}>🏆 Leaderboard</button>
        </div>
      </div>
    </div>
  );
}
