// Each fruit has a main color, a lighter highlight, and a glow color
export const FRUITS = [
  { name: "Crimson",   r: 22,  color: "#ff4757", highlight: "#ff6b81", glow: "#ff475788", score: 1   },
  { name: "Ember",     r: 28,  color: "#ff6348", highlight: "#ff8a65", glow: "#ff634888", score: 3   },
  { name: "Violet",    r: 35,  color: "#a55eea", highlight: "#cc99ff", glow: "#a55eea88", score: 6   },
  { name: "Amber",     r: 43,  color: "#ffa502", highlight: "#ffcc02", glow: "#ffa50288", score: 10  },
  { name: "Tangerine", r: 50,  color: "#ffdd59", highlight: "#fff176", glow: "#ffdd5988", score: 15  },
  { name: "Scarlet",   r: 58,  color: "#ff4d8d", highlight: "#ff80ab", glow: "#ff4d8d88", score: 21  },
  { name: "Olive",     r: 67,  color: "#7bed9f", highlight: "#a8f0c6", glow: "#7bed9f88", score: 28  },
  { name: "Marigold",  r: 76,  color: "#eccc68", highlight: "#f9e79f", glow: "#eccc6888", score: 36  },
  { name: "Ochre",     r: 87,  color: "#ff9f43", highlight: "#ffc07a", glow: "#ff9f4388", score: 45  },
  { name: "Jade",      r: 99,  color: "#26de81", highlight: "#78e8a8", glow: "#26de8188", score: 55  },
  { name: "Forest",    r: 113, color: "#20bf6b", highlight: "#58d68d", glow: "#20bf6b88", score: 100 },
];

export const MAX_TIER   = FRUITS.length - 1;
export const DROP_TIERS = 5;

const BASE_WIDTH = 300;
export function getFruits(canvasWidth) {
  const scale = (canvasWidth - 40) / BASE_WIDTH;
  return FRUITS.map((f) => ({
    ...f,
    r: Math.max(8, Math.round(f.r * scale)),
  }));
}
