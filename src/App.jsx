import { useState, useCallback, useRef } from "react";
import { GameCanvas }    from "./components/GameCanvas";
import { Sidebar }       from "./components/Sidebar";
import { GameOverlay }   from "./components/GameOverlay";
import { ProfileSetup }  from "./components/ProfileSetup";
import { ProfileModal }  from "./components/ProfileModal";
import { Leaderboard }   from "./components/Leaderboard";
import { RotationGuard } from "./components/RotationGuard";
import { DROP_TIERS }    from "./game/catalog";
import { loadStats, recordGame } from "./game/profileStats";
import "./App.css";

const LS_PROFILE = "colourmerge_profile_v1";
const LS_BEST    = "colourmerge_best_v1";

const load = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const save = (key, val)      => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

export default function App() {
  const engineRef = useRef(null);

  const [profile,     setProfile]     = useState(() => load(LS_PROFILE, null));
  const [stats,       setStats]       = useState(() => profile ? loadStats(profile) : { gamesPlayed: 0, totalScore: 0, bestScore: 0 });
  const [score,       setScore]       = useState(0);
  const [best,        setBest]        = useState(() => load(LS_BEST, 0));
  const [curTier,     setCurTier]     = useState(() => Math.floor(Math.random() * DROP_TIERS));
  const [nextTier,    setNextTier]    = useState(() => Math.floor(Math.random() * DROP_TIERS));
  const [isOver,      setIsOver]      = useState(false);
  const [showLB,      setShowLB]      = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [lastScore,   setLastScore]   = useState(0);
  const [gameKey,     setGameKey]     = useState(0);

  const handleProfileComplete = useCallback((p) => {
    save(LS_PROFILE, p);
    setProfile(p);
    setStats(loadStats(p));
  }, []);

  const handleProfileSave = useCallback((updated) => {
    save(LS_PROFILE, updated);
    setProfile(updated);
    setStats(loadStats(updated));
  }, []);

  const handleScore = useCallback((s) => {
    setScore(s);
    setBest((b) => { const nb = Math.max(b, s); if (nb > b) save(LS_BEST, nb); return nb; });
  }, []);

  const handleGameOver = useCallback((s) => {
    setBest((b) => { const nb = Math.max(b, s); if (nb > b) save(LS_BEST, nb); return nb; });
    setLastScore(s);
    setIsOver(true);
    setProfile((p) => {
      if (!p) return p;
      const updated = recordGame(p, s);
      setStats(updated);
      return p;
    });
  }, []);

  const handleTierChange = useCallback((cur, next) => {
    setCurTier(cur);
    setNextTier(next);
  }, []);

  const startNew = useCallback(() => {
    setScore(0);
    setIsOver(false);
    setShowLB(false);
    setCurTier(Math.floor(Math.random() * DROP_TIERS));
    setNextTier(Math.floor(Math.random() * DROP_TIERS));
    setGameKey((k) => k + 1);
  }, []);

  if (!profile) return <ProfileSetup onComplete={handleProfileComplete} />;

  return (
    <RotationGuard engineRef={engineRef}>
      <div className="app">
        <header className="app-header">
          <button className="hdr-profile" onClick={() => setShowProfile(true)}>
            <span className="hdr-av">{profile.avatar}</span>
            <span className="hdr-name">{profile.name}</span>
          </button>
          <span className="hdr-logo">ColourMerge</span>
          <button className="hdr-lb" onClick={() => setShowLB(true)} aria-label="Leaderboard">🏆</button>
        </header>

        <main className="game-layout">
          <Sidebar score={score} best={best} curTier={curTier} nextTier={nextTier} />
          <div className="game-area">
            <GameCanvas
              key={gameKey}
              engineRef={engineRef}
              onScore={handleScore}
              onGameOver={handleGameOver}
              onTierChange={handleTierChange}
            />
            {isOver && (
              <GameOverlay
                score={score}
                best={best}
                profile={profile}
                onRestart={startNew}
                onLeaderboard={() => setShowLB(true)}
              />
            )}
          </div>
        </main>

        {showProfile && (
          <ProfileModal
            profile={profile}
            stats={stats}
            onSave={handleProfileSave}
            onClose={() => setShowProfile(false)}
          />
        )}

        {showLB && (
          <Leaderboard
            profile={profile}
            lastScore={isOver ? lastScore : 0}
            onClose={() => setShowLB(false)}
            onPlayAgain={startNew}
          />
        )}
      </div>
    </RotationGuard>
  );
}
