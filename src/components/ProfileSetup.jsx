import { useState } from "react";

const AVATARS = ["🍉","🍎","🍊","🍋","🍇","🍓","🍒","🍑","🍐","🍍","🍈"];

async function checkNameTaken(name) {
  try {
    const res = await fetch(`/api/check?name=${encodeURIComponent(name)}`);
    if (!res.ok) return false; // fail open if API down
    const data = await res.json();
    return data.taken === true;
  } catch {
    return false; // fail open if no network
  }
}

export function ProfileSetup({ onComplete, existingName = null }) {
  const [name,     setName]     = useState(existingName || "");
  const [avatar,   setAvatar]   = useState("🍉");
  const [error,    setError]    = useState("");
  const [checking, setChecking] = useState(false);

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed)             return setError("Enter a display name");
    if (trimmed.length > 20)  return setError("Max 20 characters");
    if (trimmed.length < 2)   return setError("At least 2 characters");

    setChecking(true);
    setError("");

    // Skip uniqueness check if the player is keeping their existing name
    if (trimmed.toLowerCase() !== existingName?.toLowerCase()) {
      const taken = await checkNameTaken(trimmed);
      if (taken) {
        setChecking(false);
        return setError("That name is already taken — try another");
      }
    }

    setChecking(false);
    onComplete({ name: trimmed, avatar });
  };

  return (
    <div className="ps-wrap">
      <div className="ps-card">
        <div className="ps-logo">🍉</div>
        <h1 className="ps-title">FruitMerge</h1>
        <p className="ps-sub">Pick an avatar and a unique name to join the global leaderboard</p>

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
          placeholder="Your unique name..."
          value={name}
          maxLength={20}
          autoFocus
          onChange={(e) => { setName(e.target.value); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && !checking && submit()}
        />
        {error && <p className="ps-err">{error}</p>}

        <button className="ps-btn" onClick={submit} disabled={checking}>
          {checking ? "Checking name…" : "Start playing →"}
        </button>
      </div>
    </div>
  );
}
