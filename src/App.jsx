import { useState, useCallback } from "react";
import { GameCanvas } from "./components/GameCanvas";
import { Sidebar } from "./components/Sidebar";
import { GameOverlay } from "./components/GameOverlay";
import { DROP_TIERS } from "./game/catalog";
import "./App.css";

const LS_BEST = "fruitmerge_best";
function loadBest() {
  try { return parseInt(localStorage.getItem(LS_BEST) || "0", 10); } catch { return 0; }
}
function saveBest(v) {
  try { localStorage.setItem(LS_BEST, String(v)); } catch {}
}

export default function App() {
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(loadBest);
  const [curTier, setCurTier] = useState(() => Math.floor(Math.random() * DROP_TIERS));
  const [nextTier, setNextTier] = useState(() => Math.floor(Math.random() * DROP_TIERS));
  const [isOver, setIsOver] = useState(false);
  const [gameKey, setGameKey] = useState(0);

  const handleScore = useCallback((s) => {
    setScore(s);
    setBest((b) => { const nb = Math.max(b, s); if (nb > b) saveBest(nb); return nb; });
  }, []);

  const handleGameOver = useCallback((finalScore) => {
    setBest((b) => { const nb = Math.max(b, finalScore); if (nb > b) saveBest(nb); return nb; });
    setIsOver(true);
  }, []);

  // Called by the engine every time a fruit is dropped with the new cur+next tiers
  const handleTierChange = useCallback((cur, next) => {
    setCurTier(cur);
    setNextTier(next);
  }, []);

  const handleRestart = useCallback(() => {
    setScore(0);
    setIsOver(false);
    setCurTier(Math.floor(Math.random() * DROP_TIERS));
    setNextTier(Math.floor(Math.random() * DROP_TIERS));
    setGameKey((k) => k + 1);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <span className="logo">FruitMerge</span>
      </header>
      <main className="game-layout">
        <Sidebar score={score} best={best} curTier={curTier} nextTier={nextTier} />
        <div className="game-area">
          <GameCanvas
            key={gameKey}
            onScore={handleScore}
            onGameOver={handleGameOver}
            onTierChange={handleTierChange}
          />
          {isOver && <GameOverlay score={score} best={best} onRestart={handleRestart} />}
        </div>
      </main>
    </div>
  );
}
