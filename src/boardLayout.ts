import type { BoardState } from "./backendTypes";

export type Pt = { x: number; y: number };

export type Layout = {
  gridSize: number;
  loop: Pt[];
  home: Pt[][];
  base: Pt[][];
  seatColors: string[];
  seatTints: string[];
};

function buildLoop(sideCells: number): Pt[] {
  const pts: Pt[] = [];
  const max = sideCells - 1;

  for (let x = 0; x <= max; x++) pts.push({ x, y: 0 });
  for (let y = 1; y <= max; y++) pts.push({ x: max, y });
  for (let x = max - 1; x >= 0; x--) pts.push({ x, y: max });
  for (let y = max - 1; y >= 1; y--) pts.push({ x: 0, y });

  return pts;
}

function inwardDir(p: Pt, sideCells: number): Pt {
  const max = sideCells - 1;
  if (p.y === 0) return { x: 0, y: 1 };
  if (p.x === max) return { x: -1, y: 0 };
  if (p.y === max) return { x: 0, y: -1 };
  return { x: 1, y: 0 };
}

export function computeLayout(board: BoardState): Layout {
  const sideCells = Math.floor(board.mainLoopLength / 4) + 1;
  const loop = buildLoop(sideCells);

  const pad = 2;
  const gridSize = sideCells + pad * 2;

  const shift = (p: Pt): Pt => ({ x: p.x + pad, y: p.y + pad });
  const loopShifted = loop.map(shift);

  const home: Pt[][] = [[], [], [], []];
  for (let seat = 0; seat < 4; seat++) {
    const endIdx = board.seatsEndIndex[seat];
    const endPt0 = loop[endIdx];
    const dir = inwardDir(endPt0, sideCells);
    const start = { x: endPt0.x + dir.x, y: endPt0.y + dir.y };

    const pts: Pt[] = [];
    for (let step = 1; step <= board.homeColumnLength; step++) {
      pts.push(shift({ x: start.x + dir.x * (step - 1), y: start.y + dir.y * (step - 1) }));
    }
    home[seat] = pts;
  }

  const base: Pt[][] = [[], [], [], []];
  const corners: Pt[] = [
    { x: 0, y: 0 },
    { x: gridSize - 2, y: 0 },
    { x: gridSize - 2, y: gridSize - 2 },
    { x: 0, y: gridSize - 2 },
  ];

  for (let seat = 0; seat < 4; seat++) {
    const c = corners[seat];
    base[seat] = [
      { x: c.x, y: c.y },
      { x: c.x + 1, y: c.y },
      { x: c.x, y: c.y + 1 },
      { x: c.x + 1, y: c.y + 1 },
    ];
  }

  const seatColors = ["var(--seat0)", "var(--seat1)", "var(--seat2)", "var(--seat3)"];
  const seatTints = ["var(--seat0Tint)", "var(--seat1Tint)", "var(--seat2Tint)", "var(--seat3Tint)"];

  return { gridSize, loop: loopShifted, home, base, seatColors, seatTints };
}
