import { useState } from "react";

const AVATARS = ["🍉","🍎","🍊","🍋","🍇","🍓","🍒","🍑","🍐","🍍","🍈"];

export function ProfileModal({ profile, stats, onSave, onClose }) {
  const [editing, setEditing]  = useState(false);
  const [name,    setName]     = useState(profile.name);
  const [avatar,  setAvatar]   = useState(profile.avatar);
  const [error,   setError]    = useState("");

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed)            return setError("Name can't be empty");
    if (trimmed.length > 20) return setError("Max 20 characters");
    onSave({ name: trimmed, avatar });
    setEditing(false);
    setError("");
  };

  const handleCancel = () => {
    setName(profile.name);
    setAvatar(profile.avatar);
    setError("");
    setEditing(false);
  };

  return (
    <div className="pm-wrap" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="pm-card">

        {/* Header */}
        <div className="pm-header">
          <h2 className="pm-title">Profile</h2>
          <button className="pm-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Avatar + name */}
        {editing ? (
          <div className="pm-edit">
            <p className="pm-section-label">Choose avatar</p>
            <div className="pm-avatars">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  className={`pm-av-btn ${avatar === a ? "pm-av-btn--on" : ""}`}
                  onClick={() => setAvatar(a)}
                >
                  {a}
                </button>
              ))}
            </div>

            <p className="pm-section-label" style={{ marginTop: 16 }}>Display name</p>
            <input
              className="pm-input"
              value={name}
              maxLength={20}
              autoFocus
              onChange={(e) => { setName(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
            {error && <p className="pm-err">{error}</p>}

            <div className="pm-edit-btns">
              <button className="pm-save-btn"   onClick={handleSave}>Save</button>
              <button className="pm-cancel-btn" onClick={handleCancel}>Cancel</button>
            </div>
          </div>
        ) : (
          <div className="pm-identity">
            <div className="pm-big-av">{profile.avatar}</div>
            <p className="pm-name">{profile.name}</p>
            <button className="pm-edit-btn" onClick={() => setEditing(true)}>
              ✏️ Edit profile
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="pm-stats">
          <div className="pm-stat">
            <span className="pm-stat-val">{stats.gamesPlayed}</span>
            <span className="pm-stat-label">Games played</span>
          </div>
          <div className="pm-stat-divider" />
          <div className="pm-stat">
            <span className="pm-stat-val">{stats.bestScore.toLocaleString()}</span>
            <span className="pm-stat-label">Best score</span>
          </div>
          <div className="pm-stat-divider" />
          <div className="pm-stat">
            <span className="pm-stat-val">
              {stats.gamesPlayed > 0
                ? Math.round(stats.totalScore / stats.gamesPlayed).toLocaleString()
                : "—"}
            </span>
            <span className="pm-stat-label">Avg score</span>
          </div>
        </div>

      </div>
    </div>
  );
}
