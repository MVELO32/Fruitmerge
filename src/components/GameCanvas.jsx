import { useRef, useCallback, useState, useEffect } from "react";
import { useGameEngine, DANGER_Y } from "../game/useGameEngine";

const BOTTOM_MARGIN = 12;

export function GameCanvas({ onScore, onGameOver, onTierChange }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 320, height: 540 });

  // Measure available space so canvas always fills to bottom of viewport
  useEffect(() => {
    const measure = () => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      const width  = Math.max(240, Math.floor(rect.width));
      const height = Math.max(360, Math.floor(window.innerHeight - rect.top - BOTTOM_MARGIN));
      setCanvasSize({ width, height });
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, []);

  const { dropFruit, setDropX, canDrop } = useGameEngine({
    canvasRef,
    canvasSize,
    onScore,
    onGameOver,
    onTierChange,
  });

  // Convert a clientX position to canvas-space x
  const toCanvasX = useCallback((clientX) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return canvasSize.width / 2;
    return (clientX - rect.left) * (canvasSize.width / rect.width);
  }, [canvasSize.width]);

  // ── Mouse ──────────────────────────────────────────────
  // Move: slides the dropper preview
  const handleMouseMove = useCallback((e) => {
    setDropX(toCanvasX(e.clientX));
  }, [setDropX, toCanvasX]);

  // Release: drops wherever the dropper is
  const handleMouseUp = useCallback(() => {
    if (canDrop()) dropFruit();
  }, [dropFruit, canDrop]);

  // ── Touch ──────────────────────────────────────────────
  // A touch that doesn't move counts as a tap → drop at that x immediately.
  // A touch that moves slides the dropper; lifting releases it.
  const touchMovedRef = useRef(false);

  const handleTouchStart = useCallback((e) => {
    touchMovedRef.current = false;
    // Prime the dropper position at the touch-down point so the
    // ball snaps to the finger before the user even moves.
    setDropX(toCanvasX(e.touches[0].clientX));
  }, [setDropX, toCanvasX]);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    touchMovedRef.current = true;
    setDropX(toCanvasX(e.touches[0].clientX));
  }, [setDropX, toCanvasX]);

  const handleTouchEnd = useCallback((e) => {
    e.preventDefault();
    // Whether the user tapped or slid, lifting the finger always drops
    if (canDrop()) dropFruit();
  }, [dropFruit, canDrop]);

  return (
    <div className="canvas-wrap" ref={wrapRef}>
      <div className="danger-line" style={{ top: DANGER_Y }} />
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="game-canvas"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
    </div>
  );
}
