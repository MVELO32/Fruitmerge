import { useRef, useCallback } from "react";
import { useGameEngine, DANGER_Y, CANVAS_W, CANVAS_H } from "../game/useGameEngine";

export function GameCanvas({ onScore, onGameOver, onTierChange }) {
  const canvasRef = useRef(null);

  const { dropFruit, setDropX, canDrop } = useGameEngine({
    canvasRef,
    onScore,
    onGameOver,
    onTierChange,
  });

  const getCanvasX = useCallback((clientX) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return CANVAS_W / 2;
    return (clientX - rect.left) * (CANVAS_W / rect.width);
  }, []);

  const handleMouseMove = useCallback((e) => {
    setDropX(getCanvasX(e.clientX));
  }, [setDropX, getCanvasX]);

  const handleMouseUp = useCallback(() => {
    if (canDrop()) dropFruit();
  }, [dropFruit, canDrop]);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    setDropX(getCanvasX(e.touches[0].clientX));
  }, [setDropX, getCanvasX]);

  const handleTouchEnd = useCallback((e) => {
    e.preventDefault();
    if (canDrop()) dropFruit();
  }, [dropFruit, canDrop]);

  return (
    <div className="canvas-wrap">
      <div className="danger-line" style={{ top: DANGER_Y }} />
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="game-canvas"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
    </div>
  );
}
