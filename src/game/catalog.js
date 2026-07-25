export const FRUITS = [
  { name: "Crimson",   r: 22,  color: "#e03131", score: 1   },
  { name: "Ember",     r: 28,  color: "#e8590c", score: 3   },
  { name: "Violet",    r: 35,  color: "#7048e8", score: 6   },
  { name: "Amber",     r: 43,  color: "#f59f00", score: 10  },
  { name: "Tangerine", r: 50,  color: "#ffd43b", score: 15  },
  { name: "Scarlet",   r: 58,  color: "#c2255c", score: 21  },
  { name: "Olive",     r: 67,  color: "#5c940d", score: 28  },
  { name: "Marigold",  r: 76,  color: "#f08c00", score: 36  },
  { name: "Ochre",     r: 87,  color: "#e67700", score: 45  },
  { name: "Jade",      r: 99,  color: "#2f9e44", score: 55  },
  { name: "Forest",    r: 113, color: "#1a7a3a", score: 100 },
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