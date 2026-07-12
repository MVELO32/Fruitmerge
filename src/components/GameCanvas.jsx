import { useRef, useCallback, useState, useEffect } from "react";
import { useGameEngine, DANGER_Y } from "../game/useGameEngine";

const BOTTOM_MARGIN = 12;

const isMobile = () =>
  "ontouchstart" in window ||
  navigator.maxTouchPoints > 0 ||
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

export function GameCanvas({ onScore, onGameOver, onTierChange, engineRef }) {
  const canvasRef = useRef(null);
  const wrapRef   = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 320, height: 540 });

  useEffect(() => {
    const measure = () => {
      // Never resize the canvas while in landscape on mobile —
      // it corrupts the Matter.js pixel buffer and balls disappear
      if (isMobile() && window.innerWidth > window.innerHeight) return;

      const wrap = wrapRef.current;
      if (!wrap) return;
      const rect   = wrap.getBoundingClientRect();
      const width  = Math.max(240, Math.floor(rect.width));
      const height = Math.max(360, Math.floor(window.innerHeight - rect.top - BOTTOM_MARGIN));
      setCanvasSize({ width, height });
    };

    measure();
    // Use a delay on orientationchange so layout has settled before measuring
    const onOrient = () => setTimeout(measure, 150);

    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", onOrient);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", onOrient);
    };
  }, []);

  const { dropFruit, setDropX, canDrop } = useGameEngine({
    canvasRef, canvasSize, onScore, onGameOver, onTierChange, engineRef,
  });

  const toCanvasX = useCallback((clientX) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return canvasSize.width / 2;
    return (clientX - rect.left) * (canvasSize.width / rect.width);
  }, [canvasSize.width]);

  const handleMouseMove  = useCallback((e) => { setDropX(toCanvasX(e.clientX)); }, [setDropX, toCanvasX]);
  const handleMouseUp    = useCallback(() => { if (canDrop()) dropFruit(); }, [dropFruit, canDrop]);
  const handleTouchStart = useCallback((e) => { setDropX(toCanvasX(e.touches[0].clientX)); }, [setDropX, toCanvasX]);
  const handleTouchMove  = useCallback((e) => { e.preventDefault(); setDropX(toCanvasX(e.touches[0].clientX)); }, [setDropX, toCanvasX]);
  const handleTouchEnd   = useCallback((e) => { e.preventDefault(); if (canDrop()) dropFruit(); }, [dropFruit, canDrop]);

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
