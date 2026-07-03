// Compound circle definitions for each fruit tier.
// Each entry is an array of { x, y, r } circles in normalised space
// where 1.0 = the fruit's bounding radius.
// Multiple overlapping circles approximate the actual fruit shape.
// Physics is stable because circles never have decomposition gaps.

export const SHAPES = [
  // 0 Cherry - round with small stem bump at top
  [
    { x: 0,     y: 0.1,  r: 0.85 },
    { x: 0,     y: -0.6, r: 0.35 },
  ],

  // 1 Strawberry - wider top, pointy bottom
  [
    { x: 0,     y: -0.1, r: 0.85 },
    { x: 0,     y: 0.45, r: 0.55 },
    { x: 0,     y: -0.55,r: 0.45 },
  ],

  // 2 Grapes - cluster of 4 circles
  [
    { x: -0.35, y: -0.3, r: 0.55 },
    { x:  0.35, y: -0.3, r: 0.55 },
    { x: -0.35, y:  0.3, r: 0.55 },
    { x:  0.35, y:  0.3, r: 0.55 },
    { x:  0,    y:  0,   r: 0.45 },
  ],

  // 3 Tangerine - round, slightly flat top/bottom
  [
    { x: 0,    y: 0,    r: 0.9  },
    { x: 0,    y: -0.5, r: 0.55 },
  ],

  // 4 Lemon - oval, pointy ends
  [
    { x: 0,    y: 0,    r: 0.75 },
    { x: -0.5, y: 0,    r: 0.55 },
    { x:  0.5, y: 0,    r: 0.55 },
  ],

  // 5 Apple - round with top indent and bottom bump
  [
    { x: 0,    y: 0.05, r: 0.88 },
    { x:-0.25, y:-0.6,  r: 0.40 },
    { x: 0.25, y:-0.6,  r: 0.40 },
  ],

  // 6 Pear - small top, big round bottom
  [
    { x: 0,    y:  0.25, r: 0.80 },
    { x: 0,    y: -0.35, r: 0.52 },
    { x: 0,    y: -0.68, r: 0.30 },
  ],

  // 7 Peach - round with crease (two overlapping circles)
  [
    { x:-0.12, y: 0,    r: 0.82 },
    { x: 0.12, y: 0,    r: 0.82 },
  ],

  // 8 Pineapple - tall oval body
  [
    { x: 0,    y:  0.15, r: 0.75 },
    { x: 0,    y: -0.25, r: 0.65 },
    { x: 0,    y:  0.6,  r: 0.45 },
    { x: 0,    y: -0.65, r: 0.38 },
  ],

  // 9 Melon - wide round
  [
    { x: 0,    y: 0,    r: 0.92 },
    { x:-0.45, y: 0,    r: 0.60 },
    { x: 0.45, y: 0,    r: 0.60 },
  ],

  // 10 Watermelon - big oval
  [
    { x: 0,    y: 0,    r: 0.88 },
    { x:-0.35, y: 0,    r: 0.70 },
    { x: 0.35, y: 0,    r: 0.70 },
    { x: 0,    y:-0.3,  r: 0.65 },
    { x: 0,    y: 0.3,  r: 0.65 },
  ],
];
