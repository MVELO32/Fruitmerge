export function GameOverlay({ score, best, onRestart }) {
  return (
    <div className="overlay">
      <div className="overlay-card">
        <h2 className="overlay-title">Game over</h2>
        <p className="overlay-score">{score}</p>
        <p className="overlay-best">Best: {best}</p>
        <button className="restart-btn" onClick={onRestart}>
          Play again
        </button>
      </div>
    </div>
  );
}
