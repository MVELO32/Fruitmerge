// Base radii are calibrated for a 300px wide play area.
// At runtime, getFruits(canvasWidth) scales them proportionally.

const BASE_WIDTH = 270;

const BASE_FRUITS = [
  { name: "Cherry",     r: 22,  color: "#e03131", score: 1   },
  { name: "Strawberry", r: 28,  color: "#e8590c", score: 3   },
  { name: "Grapes",     r: 35,  color: "#7048e8", score: 6   },
  { name: "Tangerine",  r: 43,  color: "#f59f00", score: 10  },
  { name: "Lemon",      r: 50,  color: "#ffd43b", score: 15  },
  { name: "Apple",      r: 58,  color: "#c2255c", score: 21  },
  { name: "Pear",       r: 67,  color: "#5c940d", score: 28  },
  { name: "Peach",      r: 76,  color: "#f08c00", score: 36  },
  { name: "Pineapple",  r: 87,  color: "#e67700", score: 45  },
  { name: "Melon",      r: 99,  color: "#2f9e44", score: 55  },
  { name: "Watermelon", r: 113, color: "#1a7a3a", score: 100 },
];

export const MAX_TIER   = BASE_FRUITS.length - 1;
export const DROP_TIERS = 5;

// Returns fruit definitions with radii scaled to the current canvas width.
// Call this once when the canvas size is known and pass the result to the engine.
export function getFruits(canvasWidth) {
  const scale = (canvasWidth - 40) / BASE_WIDTH; // subtract wall thickness
  return BASE_FRUITS.map((f) => ({
    ...f,
    r: Math.max(8, Math.round(f.r * scale)),
  }));
}

// Static fallback used before canvas size is known (sidebar previews etc.)
// Components that show fruit should call getFruits(canvasWidth) instead.
export const FRUITS = BASE_FRUITS;