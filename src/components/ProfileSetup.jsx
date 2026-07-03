import { useState } from "react";

const AVATARS = ["🍉","🍎","🍊","🍋","🍇","🍓","🍒","🍑","🍐","🍍","🍈"];

export function ProfileSetup({ onComplete }) {
  const [name,   setName]   = useState("");
  const [avatar, setAvatar] = useState("🍉");
  const [error,  setError]  = useState("");

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed)          return setError("Enter a display name");
    if (trimmed.length > 20) return setError("Max 20 characters");
    onComplete({ name: trimmed, avatar });
  };

  return (
    <div className="ps-wrap">
      <div className="ps-card">
        <div className="ps-logo">🍉</div>
        <h1 className="ps-title">FruitMerge</h1>
        <p className="ps-sub">Pick an avatar and enter your name to join the global leaderboard</p>

        <p className="ps-label">Choose your avatar</p>
        <div className="ps-avatars">
          {AVATARS.map((a) => (
            <button key={a} className={`ps-av ${avatar === a ? "ps-av--on" : ""}`} onClick={() => setAvatar(a)}>
              {a}
            </button>
          ))}
        </div>

        <p className="ps-label">Display name</p>
        <input
          className="ps-input"
          type="text"
          placeholder="Your name..."
          value={name}
          maxLength={20}
          autoFocus
          onChange={(e) => { setName(e.target.value); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        {error && <p className="ps-err">{error}</p>}

        <button className="ps-btn" onClick={submit}>Start playing →</button>
      </div>
    </div>
  );
}
