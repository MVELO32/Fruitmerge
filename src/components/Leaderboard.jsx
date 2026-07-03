import { useEffect, useState, useRef } from "react";
import { loadLeaderboard, submitScore } from "../game/leaderboard";

const MEDALS = ["🥇", "🥈", "🥉"];

export function Leaderboard({ profile, lastScore, onClose, onPlayAgain }) {
  const [entries,  setEntries]  = useState([]);
  const [status,   setStatus]   = useState("loading"); // loading | done | error
  const submitted = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        if (lastScore > 0 && !submitted.current) {
          submitted.current = true;
          await submitScore(profile, lastScore);
        }
        const board = await loadLeaderboard();
        setEntries(board);
        setStatus("done");
      } catch {
        setStatus("error");
      }
    })();
  }, []);

  const myIdx = entries.findIndex(
    (e) => e.name === profile.name && e.avatar === profile.avatar
  );

  return (
    <div className="lb-wrap" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="lb-card">

        {/* Header */}
        <div className="lb-top">
          <h2 className="lb-heading">🏆 Leaderboard</h2>
          <button className="lb-x" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Your score banner */}
        {lastScore > 0 && (
          <div className="lb-mine">
            <span className="lb-mine-av">{profile.avatar}</span>
            <div className="lb-mine-info">
              <span className="lb-mine-name">{profile.name}</span>
              <span className="lb-mine-score">{lastScore.toLocaleString()} pts</span>
            </div>
            {myIdx >= 0 && (
              <span className="lb-mine-rank">
                {myIdx < 3 ? MEDALS[myIdx] : `#${myIdx + 1}`}
              </span>
            )}
          </div>
        )}

        {/* List */}
        <div className="lb-body">
          {status === "loading" && (
            <div className="lb-state">Loading scores…</div>
          )}
          {status === "error" && (
            <div className="lb-state lb-state--err">Couldn't load scores. Check your connection.</div>
          )}
          {status === "done" && entries.length === 0 && (
            <div className="lb-state">No scores yet — you could be first! 🎉</div>
          )}
          {status === "done" && entries.length > 0 && (
            <ol className="lb-list">
              {entries.map((e, i) => {
                const isMe = e.name === profile.name && e.avatar === profile.avatar;
                return (
                  <li key={i} className={`lb-row ${isMe ? "lb-row--me" : ""}`}>
                    <span className="lb-pos">{i < 3 ? MEDALS[i] : `#${i + 1}`}</span>
                    <span className="lb-av">{e.avatar}</span>
                    <span className="lb-nm">{e.name}</span>
                    <span className="lb-sc">{e.score.toLocaleString()}</span>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* Footer */}
        <div className="lb-foot">
          <button className="lb-play" onClick={onPlayAgain}>Play again</button>
          <button className="lb-dismiss" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
