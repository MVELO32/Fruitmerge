import { useEffect, useRef, useCallback } from "react";
import Matter from "matter-js";
import { FRUITS, MAX_TIER, DROP_TIERS } from "./catalog";

const CW = 320;
const CH = 540;
const WALL_T = 20;
const FLOOR_T = 20;
export const DANGER_Y = 72;
export const DROP_Y = 38;
export const CANVAS_W = CW;
export const CANVAS_H = CH;

export function useGameEngine({ canvasRef, onScore, onGameOver, onTierChange }) {
  const engineRef = useRef(null);
  const runnerRef = useRef(null);
  const renderRef = useRef(null);
  const fruitsRef = useRef([]);
  const pendingMergesRef = useRef(new Set());
  const gameOverRef = useRef(false);
  const canDropRef = useRef(true);
  const dropXRef = useRef(CW / 2);
  const curTierRef = useRef(0);
  const nextTierRef = useRef(0);
  const scoreRef = useRef(0);
  const onScoreRef = useRef(onScore);
  const onGameOverRef = useRef(onGameOver);
  const onTierChangeRef = useRef(onTierChange);
  const dropperRAFRef = useRef(null);

  useEffect(() => { onScoreRef.current = onScore; }, [onScore]);
  useEffect(() => { onGameOverRef.current = onGameOver; }, [onGameOver]);
  useEffect(() => { onTierChangeRef.current = onTierChange; }, [onTierChange]);

  const randTier = () => Math.floor(Math.random() * DROP_TIERS);

  const spawnFruit = useCallback((tier, x, y, isMergeSpawn = false) => {
    const engine = engineRef.current;
    if (!engine) return null;
    const f = FRUITS[tier];
    const body = Matter.Bodies.circle(x, y, f.r, {
      restitution: 0.15,
      friction: 0.5,
      frictionAir: 0.01,
      density: 0.003,
      label: "fruit",
      render: {
        fillStyle: f.color,
        strokeStyle: "rgba(255,255,255,0.18)",
        lineWidth: 1.5,
      },
    });
    body.fruitTier = tier;
    body.isFalling = !isMergeSpawn;
    body.settleFrames = 0;
    Matter.World.add(engine.world, body);
    fruitsRef.current.push(body);
    if (!isMergeSpawn) Matter.Body.setVelocity(body, { x: 0, y: 3 });
    return body;
  }, []);

  const triggerGameOver = useCallback(() => {
    if (gameOverRef.current) return;
    gameOverRef.current = true;
    canDropRef.current = false;
    onGameOverRef.current(scoreRef.current);
  }, []);

  const checkDanger = useCallback((body) => {
    if (gameOverRef.current) return;
    const engine = engineRef.current;
    if (!engine) return;
    if (!Matter.Composite.get(engine.world, body.id, "body")) return;
    const f = FRUITS[body.fruitTier];
    if (body.position.y - f.r < DANGER_Y) triggerGameOver();
  }, [triggerGameOver]);

  const dropFruit = useCallback(() => {
    if (!canDropRef.current || gameOverRef.current) return;
    canDropRef.current = false;
    spawnFruit(curTierRef.current, dropXRef.current, DROP_Y);
    curTierRef.current = nextTierRef.current;
    nextTierRef.current = randTier();
    onTierChangeRef.current?.(curTierRef.current, nextTierRef.current);
    setTimeout(() => {
      if (!gameOverRef.current) canDropRef.current = true;
    }, 650);
    return { cur: curTierRef.current, next: nextTierRef.current };
  }, [spawnFruit]);

  const setDropX = useCallback((x) => {
    const clampL = WALL_T + FRUITS[curTierRef.current].r;
    const clampR = CW - WALL_T - FRUITS[curTierRef.current].r;
    dropXRef.current = Math.max(clampL, Math.min(clampR, x));
  }, []);

  const getCurTier = useCallback(() => curTierRef.current, []);
  const getNextTier = useCallback(() => nextTierRef.current, []);
  const canDrop = useCallback(() => canDropRef.current, []);
  const getDropX = useCallback(() => dropXRef.current, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = Matter.Engine.create({ gravity: { y: 1.2 } });
    const render = Matter.Render.create({
      canvas,
      engine,
      options: {
        width: CW,
        height: CH,
        wireframes: false,
        background: "#0f0f12",
      },
    });
    const runner = Matter.Runner.create();

    engineRef.current = engine;
    renderRef.current = render;
    runnerRef.current = runner;
    gameOverRef.current = false;
    canDropRef.current = true;
    fruitsRef.current = [];
    pendingMergesRef.current = new Set();
    scoreRef.current = 0;
    curTierRef.current = randTier();
    nextTierRef.current = randTier();
    dropXRef.current = CW / 2;

    const wallOpts = {
      isStatic: true,
      friction: 0.4,
      restitution: 0.05,
      render: { fillStyle: "#1e1e24" },
    };
    Matter.World.add(engine.world, [
      Matter.Bodies.rectangle(CW / 2, CH + FLOOR_T / 2, CW + WALL_T * 2, FLOOR_T, wallOpts),
      Matter.Bodies.rectangle(-WALL_T / 2, CH / 2, WALL_T, CH * 2, wallOpts),
      Matter.Bodies.rectangle(CW + WALL_T / 2, CH / 2, WALL_T, CH * 2, wallOpts),
    ]);

    Matter.Events.on(engine, "collisionStart", (e) => {
      e.pairs.forEach((p) => {
        const a = p.bodyA;
        const b = p.bodyB;
        if (a.fruitTier === undefined || b.fruitTier === undefined) return;
        if (a.fruitTier !== b.fruitTier) return;
        if (a.fruitTier >= MAX_TIER) return;
        const key = [a.id, b.id].sort().join("-");
        if (pendingMergesRef.current.has(key)) return;
        pendingMergesRef.current.add(key);
        const mx = (a.position.x + b.position.x) / 2;
        const my = (a.position.y + b.position.y) / 2;
        const tier = a.fruitTier;
        setTimeout(() => {
          if (gameOverRef.current) return;
          const eng = engineRef.current;
          if (!eng) return;
          if (!Matter.Composite.get(eng.world, a.id, "body")) return;
          if (!Matter.Composite.get(eng.world, b.id, "body")) return;
          Matter.World.remove(eng.world, a);
          Matter.World.remove(eng.world, b);
          fruitsRef.current = fruitsRef.current.filter((f) => f !== a && f !== b);
          spawnFruit(tier + 1, mx, my, true);
          const pts = FRUITS[tier + 1].score;
          scoreRef.current += pts;
          onScoreRef.current(scoreRef.current);
        }, 40);
      });
    });

    Matter.Events.on(engine, "afterUpdate", () => {
      if (gameOverRef.current) return;
      fruitsRef.current.forEach((body) => {
        if (!body.isFalling) return;
        if (body.speed < 0.4) body.settleFrames++;
        else body.settleFrames = 0;
        if (body.settleFrames > 25) {
          body.isFalling = false;
          checkDanger(body);
        }
      });
    });

    Matter.Runner.run(runner, engine);
    Matter.Render.run(render);

    const drawDropper = () => {
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const f = FRUITS[curTierRef.current];
      const dx = dropXRef.current;

      ctx.clearRect(0, 0, CW, DANGER_Y + 2);

      if (canDropRef.current && !gameOverRef.current) {
        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,0.12)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(dx, DROP_Y + f.r + 2);
        ctx.lineTo(dx, DANGER_Y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        ctx.beginPath();
        ctx.arc(dx, DROP_Y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = f.color;
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.22)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = "rgba(255,255,255,0.75)";
        ctx.font = `${Math.max(9, Math.floor(f.r * 0.42))}px system-ui`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(f.name[0], dx, DROP_Y);
      }

      dropperRAFRef.current = requestAnimationFrame(drawDropper);
    };
    dropperRAFRef.current = requestAnimationFrame(drawDropper);

    return () => {
      if (dropperRAFRef.current) cancelAnimationFrame(dropperRAFRef.current);
      Matter.Runner.stop(runner);
      Matter.Render.stop(render);
      Matter.Engine.clear(engine);
    };
  }, [canvasRef, spawnFruit, checkDanger]);

  return { dropFruit, setDropX, getCurTier, getNextTier, canDrop, getDropX };
}
