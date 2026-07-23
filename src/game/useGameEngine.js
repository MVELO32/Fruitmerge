import { useEffect, useRef, useCallback } from "react";
import Matter from "matter-js";
import { getFruits, MAX_TIER, DROP_TIERS } from "./catalog";

const WALL_T  = 20;
const FLOOR_T = 20;
export const DANGER_Y = 72;
export const DROP_Y   = 42;

// Draw a single ball with radial gradient + shine highlight
function drawBall(ctx, f, x, y, r, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;

  // Glow
  ctx.shadowColor = f.glow || f.color;
  ctx.shadowBlur  = r * 0.7;

  // Radial gradient fill
  const grad = ctx.createRadialGradient(
    x - r * 0.3, y - r * 0.3, r * 0.05,
    x, y, r
  );
  grad.addColorStop(0, f.highlight || "#fff");
  grad.addColorStop(1, f.color);

  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Subtle white ring
  ctx.shadowBlur  = 0;
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth   = Math.max(1, r * 0.06);
  ctx.stroke();

  // Shine blob top-left
  const shine = ctx.createRadialGradient(
    x - r * 0.32, y - r * 0.32, 0,
    x - r * 0.2,  y - r * 0.2,  r * 0.55
  );
  shine.addColorStop(0, "rgba(255,255,255,0.55)");
  shine.addColorStop(1, "rgba(255,255,255,0)");
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = shine;
  ctx.fill();

  ctx.restore();
}

// Merge burst: expanding ring + particles
function spawnMergeEffect(effectsRef, x, y, color) {
  effectsRef.current.push({
    x, y, color,
    r: 0,
    maxR: 60,
    alpha: 1,
    born: performance.now(),
    duration: 380,
  });
}

export function useGameEngine({ canvasRef, canvasSize, onScore, onGameOver, onTierChange, engineRef: externalEngineRef }) {
  const internalRef   = useRef(null);
  const engineRef     = externalEngineRef || internalRef;
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
  const fruitsDefRef  = useRef(getFruits(canvasSize.width));
  const effectsRef    = useRef([]); // merge burst effects
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
    const { r } = fruitsDefRef.current[tier];
    const body = Matter.Bodies.circle(x, y, r, {
      restitution: 0.2,
      friction: 0.5,
      frictionAir: 0.01,
      density: 0.003,
      label: "fruit",
      render: { fillStyle: "transparent", strokeStyle: "transparent", lineWidth: 0 },
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

  useEffect(() => {
    sizeRef.current      = canvasSize;
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
    fruitsDefRef.current = getFruits(width);

    const engine = Matter.Engine.create({ gravity: { y: 1.2 } });
    const render = Matter.Render.create({
      canvas, engine,
      options: { width, height, wireframes: false, background: "transparent" },
    });
    const runner = Matter.Runner.create();

    engineRef.current   = engine;
    renderRef.current   = render;
    runnerRef.current   = runner;
    gameOverRef.current = false;
    canDropRef.current  = true;
    fruitsRef.current   = [];
    pendingRef.current  = new Set();
    effectsRef.current  = [];
    scoreRef.current    = 0;
    curTierRef.current  = randTier();
    nextTierRef.current = randTier();
    dropXRef.current    = width / 2;

    const wallOpts = {
      isStatic: true, friction: 0.4, restitution: 0.05,
      render: { fillStyle: "rgba(255,255,255,0.06)" },
    };
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
          // Spawn merge burst effect
          spawnMergeEffect(effectsRef, mx, my, fruitsDefRef.current[tier + 1].color);
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

    // Draw gradient balls + merge effects on top of physics
    Matter.Events.on(render, "afterRender", () => {
      const ctx  = render.canvas.getContext("2d");
      const defs = fruitsDefRef.current;
      const now  = performance.now();

      // Draw each fruit with gradient + glow
      fruitsRef.current.forEach((body) => {
        const f = defs[body.fruitTier];
        drawBall(ctx, f, body.position.x, body.position.y, f.r);
      });

      // Draw merge burst effects
      effectsRef.current = effectsRef.current.filter((fx) => {
        const t = (now - fx.born) / fx.duration;
        if (t >= 1) return false;
        const eased = 1 - Math.pow(1 - t, 2); // ease-out
        const r     = fx.maxR * eased;
        const alpha = 1 - t;

        ctx.save();
        ctx.beginPath();
        ctx.arc(fx.x, fx.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = fx.color;
        ctx.lineWidth   = 3 * (1 - t);
        ctx.globalAlpha = alpha * 0.7;
        ctx.shadowColor = fx.color;
        ctx.shadowBlur  = 12;
        ctx.stroke();
        ctx.restore();
        return true;
      });
    });

    Matter.Runner.run(runner, engine);
    Matter.Render.run(render);

    // Dropper preview with gradient + glow
    const drawDropper = () => {
      if (!canvas) { rafRef.current = requestAnimationFrame(drawDropper); return; }
      const ctx  = canvas.getContext("2d");
      const f    = fruitsDefRef.current[curTierRef.current];
      const dx   = dropXRef.current;
      const { width: w } = sizeRef.current;

      ctx.clearRect(0, 0, w, DANGER_Y + 2);

      if (canDropRef.current && !gameOverRef.current) {
        // Guide line with glow
        ctx.save();
        ctx.strokeStyle = f.color;
        ctx.lineWidth   = 1;
        ctx.globalAlpha = 0.25;
        ctx.shadowColor = f.color;
        ctx.shadowBlur  = 6;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(dx, DROP_Y + f.r + 2);
        ctx.lineTo(dx, DANGER_Y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // Fruit preview
        drawBall(ctx, f, dx, DROP_Y, f.r);
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
