// Draws a visually rich fruit onto a canvas context at (cx, cy) with radius r.

export function drawFruit(ctx, tier, cx, cy, r, angle = 0) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  switch (tier) {
    case 0: drawCherry(ctx, r);      break;
    case 1: drawStrawberry(ctx, r);  break;
    case 2: drawGrapes(ctx, r);      break;
    case 3: drawTangerine(ctx, r);   break;
    case 4: drawLemon(ctx, r);       break;
    case 5: drawApple(ctx, r);       break;
    case 6: drawPear(ctx, r);        break;
    case 7: drawPeach(ctx, r);       break;
    case 8: drawPineapple(ctx, r);   break;
    case 9: drawMelon(ctx, r);       break;
    case 10: drawWatermelon(ctx, r); break;
    default: drawGeneric(ctx, r, "#888"); break;
  }

  ctx.restore();
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function radialGrad(ctx, r, inner, outer) {
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.05, 0, 0, r);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  return g;
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

function shine(ctx, r) {
  // White highlight blob top-left
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.35, 0, -r * 0.2, -r * 0.25, r * 0.45);
  g.addColorStop(0, "rgba(255,255,255,0.55)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  circle(ctx, 0, 0, r);
  ctx.fill();
}

function stem(ctx, r, color = "#4a7c30") {
  ctx.strokeStyle = color;
  ctx.lineWidth   = Math.max(1.5, r * 0.07);
  ctx.lineCap     = "round";
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.85);
  ctx.bezierCurveTo(r * 0.15, -r * 1.3, r * 0.4, -r * 1.2, r * 0.3, -r * 0.95);
  ctx.stroke();
}

// ── Fruits ────────────────────────────────────────────────────────────────────

function drawCherry(ctx, r) {
  // Two cherries side by side
  const off = r * 0.32;
  [-off, off].forEach((dx) => {
    circle(ctx, dx, r * 0.1, r * 0.65);
    ctx.fillStyle = radialGrad(ctx, r * 0.65, "#ff6b7a", "#c0152a");
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.18)";
    ctx.lineWidth = 1;
    ctx.stroke();
    shine(ctx, r * 0.65);
  });
  // Stems
  ctx.strokeStyle = "#4a7c30";
  ctx.lineWidth   = Math.max(1.5, r * 0.07);
  ctx.lineCap     = "round";
  ctx.beginPath();
  ctx.moveTo(-off, -r * 0.55);
  ctx.bezierCurveTo(-off * 0.5, -r * 1.1, off * 0.5, -r * 1.1, off, -r * 0.55);
  ctx.stroke();
}

function drawStrawberry(ctx, r) {
  // Body — teardrop shape
  ctx.beginPath();
  ctx.moveTo(0, r * 0.95);
  ctx.bezierCurveTo(-r * 0.9, r * 0.4,  -r * 0.95, -r * 0.2, 0,      -r * 0.55);
  ctx.bezierCurveTo( r * 0.95, -r * 0.2,  r * 0.9,  r * 0.4,  0,       r * 0.95);
  ctx.fillStyle = radialGrad(ctx, r, "#ff8a8a", "#cc1f1f");
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth = 1;
  ctx.stroke();
  // Seeds
  ctx.fillStyle = "rgba(255,255,210,0.85)";
  const seeds = [[-0.25,-0.15],[0.25,-0.2],[0,-0.0],[-0.3,0.25],[0.3,0.2],[0,0.4],[-0.15,0.6],[0.15,0.55]];
  seeds.forEach(([sx, sy]) => {
    ctx.beginPath();
    ctx.ellipse(sx * r, sy * r, r * 0.055, r * 0.08, 0.3, 0, Math.PI * 2);
    ctx.fill();
  });
  // Leaf
  ctx.fillStyle = "#3a8a20";
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.55);
    ctx.bezierCurveTo(
      Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5 - r * 0.55,
      Math.cos(a) * r * 0.6, Math.sin(a) * r * 0.6 - r * 0.5,
      Math.cos(a) * r * 0.45, Math.sin(a) * r * 0.45 - r * 0.4
    );
    ctx.fill();
  }
  shine(ctx, r);
}

function drawGrapes(ctx, r) {
  const positions = [
    [-0.35,-0.35],[0.35,-0.35],[0,-0.1],
    [-0.35, 0.15],[0.35, 0.15],[0, 0.38],
    [0, 0.65],
  ];
  const gr = r * 0.38;
  positions.forEach(([px, py]) => {
    circle(ctx, px * r, py * r, gr);
    ctx.fillStyle = radialGrad(ctx, gr, "#c084fc", "#6d28d9");
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.lineWidth = 0.8;
    ctx.stroke();
    const sg = ctx.createRadialGradient(px*r - gr*0.3, py*r - gr*0.35, 0, px*r, py*r, gr);
    sg.addColorStop(0, "rgba(255,255,255,0.5)");
    sg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = sg;
    ctx.fill();
  });
  stem(ctx, r, "#4a7c30");
}

function drawTangerine(ctx, r) {
  circle(ctx, 0, 0, r);
  ctx.fillStyle = radialGrad(ctx, r, "#ffa040", "#e05a00");
  ctx.fill();
  // Segments hint
  ctx.strokeStyle = "rgba(255,200,100,0.3)";
  ctx.lineWidth = Math.max(1, r * 0.04);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    ctx.stroke();
  }
  shine(ctx, r);
  stem(ctx, r);
}

function drawLemon(ctx, r) {
  // Oval
  ctx.save();
  ctx.scale(1.25, 0.85);
  circle(ctx, 0, 0, r);
  ctx.fillStyle = radialGrad(ctx, r, "#fff176", "#f9a825");
  ctx.fill();
  ctx.restore();
  // Tip bumps
  ctx.fillStyle = "#f9a825";
  circle(ctx, r * 1.05, 0, r * 0.18); ctx.fill();
  circle(ctx, -r * 1.05, 0, r * 0.18); ctx.fill();
  ctx.save();
  ctx.scale(1.25, 0.85);
  shine(ctx, r);
  ctx.restore();
}

function drawApple(ctx, r) {
  circle(ctx, 0, r * 0.05, r * 0.92);
  ctx.fillStyle = radialGrad(ctx, r, "#ff6060", "#b91c1c");
  ctx.fill();
  // Indent at top
  ctx.fillStyle = "#0a0a0d";
  circle(ctx, 0, -r * 0.85, r * 0.12); ctx.fill();
  shine(ctx, r);
  stem(ctx, r * 0.9, "#4a3000");
  // Leaf
  ctx.fillStyle = "#16a34a";
  ctx.beginPath();
  ctx.moveTo(r * 0.05, -r * 0.85);
  ctx.bezierCurveTo(r * 0.5, -r * 1.3, r * 0.7, -r * 0.9, r * 0.25, -r * 0.75);
  ctx.fill();
}

function drawPear(ctx, r) {
  // Bottom bulb
  circle(ctx, 0, r * 0.2, r * 0.78);
  ctx.fillStyle = radialGrad(ctx, r * 0.78, "#d4ed7a", "#7ab317");
  ctx.fill();
  // Top neck
  ctx.beginPath();
  ctx.ellipse(0, -r * 0.35, r * 0.38, r * 0.52, 0, 0, Math.PI * 2);
  ctx.fillStyle = radialGrad(ctx, r * 0.4, "#d4ed7a", "#7ab317");
  ctx.fill();
  shine(ctx, r);
  stem(ctx, r * 0.8, "#4a3000");
}

function drawPeach(ctx, r) {
  circle(ctx, 0, 0, r);
  ctx.fillStyle = radialGrad(ctx, r, "#ffcba4", "#f97316");
  ctx.fill();
  // Crease line
  ctx.strokeStyle = "rgba(200,80,30,0.35)";
  ctx.lineWidth   = Math.max(1, r * 0.05);
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.95);
  ctx.bezierCurveTo(r * 0.1, 0, -r * 0.1, 0, 0, r * 0.95);
  ctx.stroke();
  shine(ctx, r);
  stem(ctx, r, "#4a3000");
}

function drawPineapple(ctx, r) {
  // Body oval
  ctx.save();
  ctx.scale(0.78, 1.1);
  circle(ctx, 0, r * 0.1, r * 0.82);
  ctx.fillStyle = radialGrad(ctx, r, "#fbbf24", "#b45309");
  ctx.fill();
  // Diamond pattern
  ctx.strokeStyle = "rgba(120,60,0,0.3)";
  ctx.lineWidth = Math.max(1, r * 0.04);
  for (let row = -3; row <= 3; row++) {
    for (let col = -2; col <= 2; col++) {
      const ox = col * r * 0.38 + (row % 2 === 0 ? 0 : r * 0.19);
      const oy = row * r * 0.28 + r * 0.1;
      ctx.beginPath();
      ctx.moveTo(ox, oy - r * 0.13);
      ctx.lineTo(ox + r * 0.13, oy);
      ctx.lineTo(ox, oy + r * 0.13);
      ctx.lineTo(ox - r * 0.13, oy);
      ctx.closePath();
      ctx.stroke();
    }
  }
  ctx.restore();
  shine(ctx, r * 0.85);
  // Crown leaves
  ctx.fillStyle = "#15803d";
  for (let i = 0; i < 5; i++) {
    const a = ((i / 5) - 0.5) * Math.PI * 0.9 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.72);
    ctx.bezierCurveTo(
      Math.cos(a) * r * 0.3, Math.sin(a) * r * 0.3 - r * 0.72,
      Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5 - r * 0.5,
      Math.cos(a) * r * 0.35, Math.sin(a) * r * 0.35 - r * 0.4
    );
    ctx.fillStyle = i === 2 ? "#15803d" : "#16a34a";
    ctx.fill();
  }
}

function drawMelon(ctx, r) {
  circle(ctx, 0, 0, r);
  ctx.fillStyle = radialGrad(ctx, r, "#86efac", "#15803d");
  ctx.fill();
  // Stripe lines
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth   = Math.max(1, r * 0.05);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    ctx.bezierCurveTo(
      Math.cos(a + 0.3) * r * 0.4, Math.sin(a + 0.3) * r * 0.4,
      Math.cos(a - 0.3) * r * 0.4, Math.sin(a - 0.3) * r * 0.4,
      Math.cos(a + Math.PI) * r, Math.sin(a + Math.PI) * r
    );
    ctx.stroke();
  }
  shine(ctx, r);
  stem(ctx, r, "#4a3000");
}

function drawWatermelon(ctx, r) {
  // Outer rind
  circle(ctx, 0, 0, r);
  ctx.fillStyle = radialGrad(ctx, r, "#86efac", "#15803d");
  ctx.fill();
  // Dark stripes
  ctx.strokeStyle = "#166534";
  ctx.lineWidth   = Math.max(2, r * 0.09);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r * 0.98, Math.sin(a) * r * 0.98);
    ctx.bezierCurveTo(
      Math.cos(a + 0.25) * r * 0.3, Math.sin(a + 0.25) * r * 0.3,
      Math.cos(a - 0.25) * r * 0.3, Math.sin(a - 0.25) * r * 0.3,
      Math.cos(a + Math.PI) * r * 0.98, Math.sin(a + Math.PI) * r * 0.98
    );
    ctx.stroke();
  }
  // Red flesh inside
  circle(ctx, 0, 0, r * 0.78);
  ctx.fillStyle = radialGrad(ctx, r * 0.78, "#fca5a5", "#dc2626");
  ctx.fill();
  // Seeds
  ctx.fillStyle = "#1c1917";
  const seeds = [[-0.3,-0.1],[0.3,-0.2],[0,0.1],[-0.2,0.35],[0.25,0.3],[0,-0.35]];
  seeds.forEach(([sx, sy]) => {
    ctx.save();
    ctx.translate(sx * r, sy * r);
    ctx.rotate(Math.random() * 0.5);
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.05, r * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
  shine(ctx, r);
}

function drawGeneric(ctx, r, color) {
  circle(ctx, 0, 0, r);
  ctx.fillStyle = color;
  ctx.fill();
  shine(ctx, r);
}
