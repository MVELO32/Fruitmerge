import { useEffect, useRef, useCallback } from "react";
import Matter from "matter-js";
import { getFruits, MAX_TIER, DROP_TIERS } from "./catalog";

const WALL_T  = 20;
const FLOOR_T = 20;
export const DANGER_Y = 72;
export const DROP_Y   = 42;

export function useGameEngine({ canvasRef, canvasSize, onScore, onGameOver, onTierChange }) {
  const engineRef     = useRef(null);
  const runnerRef     = useRef(null);
  const renderRef     = useRef(null);
  const fruitsRef     = useRef([]);
  const wallsRef      = useRef({ floor: null, left: null, right: null });
  const pendingRef    = useRef(new Set());
  const gameOverRef   = useRef(false);
  const canDropRef    = useRef(true);
  const dropXRef      = useRef(0);
  const curTierRef    = useRef(0);
  const nextTierRef   = useRef(0);
  const scoreRef      = useRef(0);
  const sizeRef       = useRef(canvasSize);
  // Scaled fruits for the current canvas width — recalculated on resize
  const fruitsDefRef  = useRef(getFruits(canvasSize.width));
  const onScoreRef    = useRef(onScore);
  const onGameOverRef = useRef(onGameOver);
  const onTierRef     = useRef(onTierChange);
  const rafRef        = useRef(null);

  useEffect(() => { onScoreRef.current    = onScore;      }, [onScore]);
  useEffect(() => { onGameOverRef.current = onGameOver;   }, [onGameOver]);
  useEffect(() => { onTierRef.current     = onTierChange; }, [onTierChange]);

  const randTier = () => Math.floor(Math.random() * DROP_TIERS);

  const clampX = useCallback((x) => {
    const { width } = sizeRef.current;
    const r = fruitsDefRef.current[curTierRef.current].r;
    return Math.max(WALL_T + r, Math.min(width - WALL_T - r, x));
  }, []);

  const spawnFruit = useCallback((tier, x, y, merged = false) => {
    const engine = engineRef.current;
    if (!engine) return null;
    const { r, color } = fruitsDefRef.current[tier];
    const body = Matter.Bodies.circle(x, y, r, {
      restitution: 0.15,
      friction: 0.5,
      frictionAir: 0.01,
      density: 0.003,
      label: "fruit",
      render: { fillStyle: color, strokeStyle: "rgba(255,255,255,0.18)", lineWidth: 1.5 },
    });
    body.fruitTier    = tier;
    body.isFalling    = !merged;
    body.settleFrames = 0;
    Matter.World.add(engine.world, body);
    fruitsRef.current.push(body);
    if (!merged) Matter.Body.setVelocity(body, { x: 0, y: 3 });
    return body;
  }, []);

  const triggerGameOver = useCallback(() => {
    if (gameOverRef.current) return;
    gameOverRef.current = true;
    canDropRef.current  = false;
    onGameOverRef.current(scoreRef.current);
  }, []);

  const checkDanger = useCallback((body) => {
    if (gameOverRef.current) return;
    const engine = engineRef.current;
    if (!engine || !Matter.Composite.get(engine.world, body.id, "body")) return;
    const r = fruitsDefRef.current[body.fruitTier].r;
    if (body.position.y - r < DANGER_Y) triggerGameOver();
  }, [triggerGameOver]);

  const setDropX = useCallback((x) => { dropXRef.current = clampX(x); }, [clampX]);
  const canDrop  = useCallback(() => canDropRef.current, []);

  const dropFruit = useCallback(() => {
    if (!canDropRef.current || gameOverRef.current) return;
    canDropRef.current = false;
    spawnFruit(curTierRef.current, dropXRef.current, DROP_Y);
    curTierRef.current  = nextTierRef.current;
    nextTierRef.current = randTier();
    onTierRef.current?.(curTierRef.current, nextTierRef.current);
    dropXRef.current = clampX(sizeRef.current.width / 2);
    setTimeout(() => { if (!gameOverRef.current) canDropRef.current = true; }, 600);
  }, [spawnFruit, clampX]);

  // Resize canvas + walls when viewport changes
  useEffect(() => {
    sizeRef.current = canvasSize;
    // Recalculate fruit sizes for the new canvas width
    fruitsDefRef.current = getFruits(canvasSize.width);

    const engine = engineRef.current;
    const render  = renderRef.current;
    const walls   = wallsRef.current;
    if (!engine || !render || !walls.floor) return;

    const { width, height } = canvasSize;
    render.canvas.width   = width;
    render.canvas.height  = height;
    render.options.width  = width;
    render.options.height = height;
    Matter.Body.setPosition(walls.floor,  { x: width / 2,          y: height + FLOOR_T / 2 });
    Matter.Body.setVertices(walls.floor,
      Matter.Bodies.rectangle(width / 2, height + FLOOR_T / 2, width + WALL_T * 2, FLOOR_T).vertices);
    Matter.Body.setPosition(walls.left,   { x: -WALL_T / 2,        y: height / 2 });
    Matter.Body.setPosition(walls.right,  { x: width + WALL_T / 2, y: height / 2 });
    dropXRef.current = clampX(width / 2);
  }, [canvasSize, clampX]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { width, height } = sizeRef.current;

    // Scale fruits to initial canvas width
    fruitsDefRef.current = getFruits(width);

    const engine = Matter.Engine.create({ gravity: { y: 1.2 } });
    const render = Matter.Render.create({
      canvas, engine,
      options: { width, height, wireframes: false, background: "#0f0f12" },
    });
    const runner = Matter.Runner.create();

    engineRef.current   = engine;
    renderRef.current   = render;
    runnerRef.current   = runner;
    gameOverRef.current = false;
    canDropRef.current  = true;
    fruitsRef.current   = [];
    pendingRef.current  = new Set();
    scoreRef.current    = 0;
    curTierRef.current  = randTier();
    nextTierRef.current = randTier();
    dropXRef.current    = width / 2;

    const wallOpts = { isStatic: true, friction: 0.4, restitution: 0.05, render: { fillStyle: "#1e1e24" } };
    const floor = Matter.Bodies.rectangle(width / 2, height + FLOOR_T / 2, width + WALL_T * 2, FLOOR_T, wallOpts);
    const left  = Matter.Bodies.rectangle(-WALL_T / 2, height / 2, WALL_T, height * 2, wallOpts);
    const right = Matter.Bodies.rectangle(width + WALL_T / 2, height / 2, WALL_T, height * 2, wallOpts);
    wallsRef.current = { floor, left, right };
    Matter.World.add(engine.world, [floor, left, right]);

    Matter.Events.on(engine, "collisionStart", (e) => {
      e.pairs.forEach(({ bodyA: a, bodyB: b }) => {
        if (a.fruitTier === undefined || b.fruitTier === undefined) return;
        if (a.fruitTier !== b.fruitTier || a.fruitTier >= MAX_TIER) return;
        const key = [a.id, b.id].sort().join("-");
        if (pendingRef.current.has(key)) return;
        pendingRef.current.add(key);
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
          scoreRef.current += fruitsDefRef.current[tier + 1].score;
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
        if (body.settleFrames > 25) { body.isFalling = false; checkDanger(body); }
      });
    });

    Matter.Runner.run(runner, engine);
    Matter.Render.run(render);

    // Dropper preview
    const drawDropper = () => {
      if (!canvas) { rafRef.current = requestAnimationFrame(drawDropper); return; }
      const ctx = canvas.getContext("2d");
      const f   = fruitsDefRef.current[curTierRef.current];
      const dx  = dropXRef.current;
      const { width: w } = sizeRef.current;

      ctx.clearRect(0, 0, w, DANGER_Y + 2);

      if (canDropRef.current && !gameOverRef.current) {
        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,0.12)";
        ctx.lineWidth   = 1;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(dx, DROP_Y + f.r + 2);
        ctx.lineTo(dx, DANGER_Y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        ctx.beginPath();
        ctx.arc(dx, DROP_Y, f.r, 0, Math.PI * 2);
        ctx.fillStyle   = f.color;
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.lineWidth   = 1.5;
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(drawDropper);
    };
    rafRef.current = requestAnimationFrame(drawDropper);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      Matter.Runner.stop(runner);
      Matter.Render.stop(render);
      Matter.Engine.clear(engine);
    };
  }, [canvasRef, spawnFruit, checkDanger]);

  return { dropFruit, setDropX, canDrop };
}