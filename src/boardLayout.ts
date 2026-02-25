// src/boardLayout.ts
// Classic Ludo "star/cross" layout on a 15x15 grid.
//
// Exposes:
// - gridSize
// - loop[mainLoopLength] (52 points)
// - home[4][homeColumnLength]
// - base[4][4]
// - seatColors / seatTints
//
// Seat convention used throughout:
// 0 = RED (top-left yard, home column downwards)
// 1 = GREEN (top-right yard, home column leftwards)
// 2 = YELLOW (bottom-right yard, home column upwards)
// 3 = BLUE (bottom-left yard, home column rightwards)

export type Pt = { x: number; y: number };

export type Layout = {
  gridSize: number;
  loop: Pt[];
  home: Pt[][];
  base: Pt[][];
  seatColors: string[];
  seatTints: string[];
};

export type BoardStateLike = {
  mainLoopLength: number; // 52
  homeColumnLength: number; // 6
  seatsStartingIndex: number[];
  seatsEndIndex: number[];
  safeZoneIndex?: number[];
};

const P = (x: number, y: number): Pt => ({ x, y });

function rotateLoop(loop: Pt[], k: number) {
  const n = loop.length;
  const kk = ((k % n) + n) % n;
  if (kk === 0) return loop;
  return loop.slice(kk).concat(loop.slice(0, kk));
}

/**
 * 52-step loop for classic Ludo cross layout (15x15).
 *
 * This loop is clockwise and built to be exactly 52 unique cells.
 *
 * If you need to align index 0 to a different “start square” for your backend,
 * rotate with rotateLoop(loop, k).
 */
function buildClassicLoop52(): Pt[] {
  const loop: Pt[] = [
    // TOP ARM (red side) downwards (6 cells)
    P(6, 0),
    P(6, 1),
    P(6, 2),
    P(6, 3),
    P(6, 4),
    P(6, 5),

    // LEFT ARM (towards blue side) to the left (6 cells)
    P(5, 6),
    P(4, 6),
    P(3, 6),
    P(2, 6),
    P(1, 6),
    P(0, 6),

    // LEFT TURN (1 cell)
    P(0, 7),

    // LEFT ARM (lower part) to the right (6 cells)
    P(0, 8),
    P(1, 8),
    P(2, 8),
    P(3, 8),
    P(4, 8),
    P(5, 8),

    // BOTTOM ARM (towards yellow side) downwards (6 cells)
    P(6, 9),
    P(6, 10),
    P(6, 11),
    P(6, 12),
    P(6, 13),
    P(6, 14),

    // BOTTOM TURN (1 cell)
    P(7, 14),

    // BOTTOM ARM (right side) upwards (6 cells)
    P(8, 14),
    P(8, 13),
    P(8, 12),
    P(8, 11),
    P(8, 10),
    P(8, 9),

    // RIGHT ARM (towards green side) to the right (6 cells)
    P(9, 8),
    P(10, 8),
    P(11, 8),
    P(12, 8),
    P(13, 8),
    P(14, 8),

    // RIGHT TURN (1 cell)
    P(14, 7),

    // RIGHT ARM (upper part) to the left (6 cells)
    P(14, 6),
    P(13, 6),
    P(12, 6),
    P(11, 6),
    P(10, 6),
    P(9, 6),

    // TOP ARM (green side) upwards (6 cells)
    P(8, 5),
    P(8, 4),
    P(8, 3),
    P(8, 2),
    P(8, 1),
    P(8, 0),

    // TOP TURN (1 cell)
    P(7, 0),
  ];

  if (loop.length !== 52) {
    throw new Error(`Classic loop must be 52 points, got ${loop.length}`);
  }
  return loop;
}

function buildHomeColumns(homeLen: number): Pt[][] {
  // Home columns move toward the center (7,7) but do NOT include the center cell.
  return [
    // RED: down into center along x=7 (y=1..homeLen)
    Array.from({ length: homeLen }, (_, i) => P(7, 1 + i)),

    // GREEN: left into center along y=7 (x=13..13-homeLen+1)
    Array.from({ length: homeLen }, (_, i) => P(13 - i, 7)),

    // YELLOW: up into center along x=7 (y=13..13-homeLen+1)
    Array.from({ length: homeLen }, (_, i) => P(7, 13 - i)),

    // BLUE: right into center along y=7 (x=1..homeLen)
    Array.from({ length: homeLen }, (_, i) => P(1 + i, 7)),
  ];
}

function buildBases(): Pt[][] {
  // 4 parking spots per seat in each corner yard (2x2)
  return [
    // RED yard (top-left)
    [P(2, 2), P(4, 2), P(2, 4), P(4, 4)],
    // GREEN yard (top-right)
    [P(10, 2), P(12, 2), P(10, 4), P(12, 4)],
    // YELLOW yard (bottom-right)
    [P(10, 10), P(12, 10), P(10, 12), P(12, 12)],
    // BLUE yard (bottom-left)
    [P(2, 10), P(4, 10), P(2, 12), P(4, 12)],
  ];
}

// Brighter but still dark-theme-friendly palette
// IMPORTANT: seat index order must match your backend/front-end everywhere
// 0=Red, 1=Green, 2=Yellow, 3=Blue
const seatColors = [
  "#f87171", // red
  "#4ade80", // green
  "#facc15", // yellow
  "#60a5fa", // blue
];

const seatTints = [
  "rgba(248,113,113,0.30)", // red tint
  "rgba(74,222,128,0.30)",  // green tint
  "rgba(250,204,21,0.30)",  // yellow tint
  "rgba(96,165,250,0.30)",  // blue tint
];

export function computeLayout(board: BoardStateLike): Layout {
  const gridSize = 15;

  let loop = buildClassicLoop52();
  const start = loop[0];
loop = loop.slice().reverse();
const k = loop.findIndex((p) => p.x === start.x && p.y === start.y);
loop = rotateLoop(loop, k);

  // If your backend assumes a different cell is index 0, rotate here.
  // Example:
  // loop = rotateLoop(loop, 1);

  // Safety: ensure loop length matches backend config.
  if (board.mainLoopLength !== loop.length) {
    // Prefer matching backend to 52; this slice is just a guard.
    loop = loop.slice(0, board.mainLoopLength);
  }

  const home = buildHomeColumns(board.homeColumnLength);
  const base = buildBases();

  return {
    gridSize,
    loop,
    home,
    base,
    seatColors,
    seatTints,
  };
}