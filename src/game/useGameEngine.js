import { useEffect, useRef, useCallback } from "react";
import Matter from "matter-js";
import { FRUITS, MAX_TIER, DROP_TIERS } from "./catalog";

const WALL_T  = 16;
const FLOOR_T = 16;
export const DANGER_Y = 68;
export const DROP_Y   = 38;

export function useGameEngine({ canvasRef, canvasSize, onScore, onGameOver, onTierChange, onMerge }) {
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
  const onScoreRef    = useRef(onScore);
  const onGameOverRef = useRef(onGameOver);
  const onTierRef     = useRef(onTierChange);
  const onMergeRef    = useRef(onMerge);
  const rafRef        = useRef(null);
  const mergeFlashRef = useRef([]); // [{x,y,r,color,t}]

  useEffect(() => { onScoreRef.current    = onScore;      }, [onScore]);
  useEffect(() => { onGameOverRef.current = onGameOver;   }, [onGameOver]);
  useEffect(() => { onTierRef.current     = onTierChange; }, [onTierChange]);
  useEffect(() => { onMergeRef.current    = onMerge;      }, [onMerge]);

  const randTier = () => Math.floor(Math.random() * DROP_TIERS);

  const clampX = useCallback((x) => {
    const { width } = sizeRef.current;
    const r = FRUITS[curTierRef.current].r;
    return Math.max(WALL_T + r, Math.min(width - WALL_T - r, x));
  }, []);

  const spawnFruit = useCallback((tier, x, y, merged = false) => {
    const engine = engineRef.current;
    if (!engine) return null;
    const { r, color } = FRUITS[tier];

    const body = Matter.Bodies.circle(x, y, r, {
      restitution: 0.15,
      friction: 0.5,
      frictionAir: 0.011,
      density: 0.003,
      label: "fruit",
      render: {
        fillStyle: color,
        strokeStyle: "rgba(255,255,255,0.2)",
        lineWidth: 1.5,
      },
    });
    body.fruitTier    = tier;
    body.isFalling    = !merged;
    body.settleFrames = 0;
    Matter.World.add(engine.world, body);
    fruitsRef.current.push(body);
    if (!merged) Matter.Body.setVelocity(body, { x: 0, y: 2.5 });
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
    if (body.position.y - FRUITS[body.fruitTier].r < DANGER_Y) triggerGameOver();
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
    setTimeout(() => { if (!gameOverRef.current) canDropRef.current = true; }, 580);
  }, [spawnFruit, clampX]);

  useEffect(() => {
    sizeRef.current = canvasSize;
    const engine = engineRef.current;
    const render  = renderRef.current;
    const walls   = wallsRef.current;
    if (!engine || !render || !walls.floor) return;
    const { width, height } = canvasSize;
    render.canvas.width  = width;
    render.canvas.height = height;
    render.options.width  = width;
    render.options.height = height;
    Matter.Body.setPosition(walls.floor, { x: width / 2, y: height + FLOOR_T / 2 });
    Matter.Body.setVertices(walls.floor,
      Matter.Bodies.rectangle(width / 2, height + FLOOR_T / 2, width + WALL_T * 2, FLOOR_T).vertices);
    Matter.Body.setPosition(walls.left,  { x: -WALL_T / 2,        y: height / 2 });
    Matter.Body.setPosition(walls.right, { x: width + WALL_T / 2, y: height / 2 });
    dropXRef.current = clampX(width / 2);
  }, [canvasSize, clampX]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { width, height } = sizeRef.current;

    const engine = Matter.Engine.create({ gravity: { y: 1.2 } });
    const render = Matter.Render.create({
      canvas, engine,
      options: { width, height, wireframes: false, background: "#0d0d10" },
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
    mergeFlashRef.current = [];
    curTierRef.current  = randTier();
    nextTierRef.current = randTier();
    dropXRef.current    = width / 2;

    const wallOpts = { isStatic: true, friction: 0.4, restitution: 0.05, render: { fillStyle: "#1a1a22" } };
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
        const mx   = (a.position.x + b.position.x) / 2;
        const my   = (a.position.y + b.position.y) / 2;
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
          const newFruit = spawnFruit(tier + 1, mx, my, true);
          const pts = FRUITS[tier + 1].score;
          scoreRef.current += pts;
          onScoreRef.current(scoreRef.current);
          // Queue a merge flash at this position
          mergeFlashRef.current.push({
            x: mx, y: my,
            r: FRUITS[tier + 1].r,
            color: FRUITS[tier + 1].glow,
            t: 1.0,
          });
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

    // Draw merge flash circles + shimmer on each fruit after Matter renders
    Matter.Events.on(render, "afterRender", () => {
      const ctx = render.canvas.getContext("2d");

      // Subtle radial highlight on each fruit to give depth
      fruitsRef.current.forEach((body) => {
        const { r, color } = FRUITS[body.fruitTier];
        ctx.save();
        const grad = ctx.createRadialGradient(
          body.position.x - r * 0.3, body.position.y - r * 0.3, r * 0.05,
          body.position.x, body.position.y, r
        );
        grad.addColorStop(0, "rgba(255,255,255,0.22)");
        grad.addColorStop(0.5, "rgba(255,255,255,0)");
        grad.addColorStop(1, "rgba(0,0,0,0.18)");
        ctx.beginPath();
        ctx.arc(body.position.x, body.position.y, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      });

      // Merge flash burst — expands and fades
      mergeFlashRef.current = mergeFlashRef.current.filter((f) => f.t > 0);
      mergeFlashRef.current.forEach((f) => {
        const expandR = f.r * (1 + (1 - f.t) * 1.2);
        ctx.save();
        ctx.globalAlpha = f.t * 0.7;
        ctx.beginPath();
        ctx.arc(f.x, f.y, expandR, 0, Math.PI * 2);
        ctx.strokeStyle = f.color;
        ctx.lineWidth   = 3;
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.restore();
        f.t -= 0.07;
      });
    });

    Matter.Runner.run(runner, engine);
    Matter.Render.run(render);

    // Dropper preview with shimmer
    const drawDropper = () => {
      if (!canvas) { rafRef.current = requestAnimationFrame(drawDropper); return; }
      const ctx = canvas.getContext("2d");
      const f   = FRUITS[curTierRef.current];
      const dx  = dropXRef.current;
      const { width: w } = sizeRef.current;

      ctx.clearRect(0, 0, w, DANGER_Y + 2);

      if (canDropRef.current && !gameOverRef.current) {
        // Dashed guide line
        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,0.1)";
        ctx.lineWidth   = 1;
        ctx.setLineDash([3, 7]);
        ctx.beginPath();
        ctx.moveTo(dx, DROP_Y + f.r + 2);
        ctx.lineTo(dx, DANGER_Y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // Outer glow
        ctx.save();
        ctx.shadowColor = f.glow;
        ctx.shadowBlur  = 18;
        ctx.beginPath();
        ctx.arc(dx, DROP_Y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = f.color;
        ctx.fill();
        ctx.restore();

        // Stroke
        ctx.beginPath();
        ctx.arc(dx, DROP_Y, f.r, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.25)";
        ctx.lineWidth   = 1.5;
        ctx.stroke();

        // Shimmer highlight
        const grad = ctx.createRadialGradient(dx - f.r * 0.3, DROP_Y - f.r * 0.3, f.r * 0.05, dx, DROP_Y, f.r);
        grad.addColorStop(0, "rgba(255,255,255,0.28)");
        grad.addColorStop(0.5, "rgba(255,255,255,0)");
        grad.addColorStop(1, "rgba(0,0,0,0.15)");
        ctx.beginPath();
        ctx.arc(dx, DROP_Y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
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
