import type { BoardState } from "./backendTypes";

export type CellKey =
  | { kind: "loop"; index: number }
  | { kind: "home"; seat: number; step: number } // step 1..homeColumnLength
  | { kind: "base"; seat: number; tokenId: number };

export type Pt = { x: number; y: number };

export type Layout = {
  gridSize: number; // number of cells per side in rendered grid
  loop: Pt[]; // loop[index] -> coord
  home: Pt[][]; // home[seat][step-1] -> coord
  base: Pt[][]; // base[seat][tokenId-1] -> coord
  seatColors: string[]; // UI only
};

function buildLoop(sideCells: number): Pt[] {
  const pts: Pt[] = [];
  const max = sideCells - 1;

  // top row left->right
  for (let x = 0; x <= max; x++) pts.push({ x, y: 0 });
  // right col top->bottom (excluding top corner)
  for (let y = 1; y <= max; y++) pts.push({ x: max, y });
  // bottom row right->left (excluding bottom-right corner)
  for (let x = max - 1; x >= 0; x--) pts.push({ x, y: max });
  // left col bottom->top (excluding bottom-left and top-left corners)
  for (let y = max - 1; y >= 1; y--) pts.push({ x: 0, y });

  return pts;
}

function inwardDir(p: Pt, sideCells: number): Pt {
  const max = sideCells - 1;
  if (p.y === 0) return { x: 0, y: 1 }; // from top, go down
  if (p.x === max) return { x: -1, y: 0 }; // from right, go left
  if (p.y === max) return { x: 0, y: -1 }; // from bottom, go up
  return { x: 1, y: 0 }; // from left, go right
}

export function computeLayout(board: BoardState): Layout {
  // perimeter length = 4*sideCells - 4  => sideCells = loop/4 + 1
  const sideCells = Math.floor(board.mainLoopLength / 4) + 1;

  const loop = buildLoop(sideCells);

  // grid grows to allow base tokens outside loop and a center area for home columns
  // We'll pad by 2 cells around.
  const pad = 2;
  const gridSize = sideCells + pad * 2;

  const shift = (p: Pt): Pt => ({ x: p.x + pad, y: p.y + pad });

  const loopShifted = loop.map(shift);

  // Home columns per seat: from seatsEndIndex cell, step inward
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

  // Base tokens: 2x2 block in each corner outside loop area (within pad region)
  const base: Pt[][] = [[], [], [], []];
  // seat mapping to corners (UI decision). This doesn't affect API correctness.
  // seat0: top-left, seat1: top-right, seat2: bottom-right, seat3: bottom-left
  const corners: Pt[] = [
    { x: 0, y: 0 },
    { x: gridSize - 2, y: 0 },
    { x: gridSize - 2, y: gridSize - 2 },
    { x: 0, y: gridSize - 2 },
  ];

  for (let seat = 0; seat < 4; seat++) {
    const c = corners[seat];
    // 2x2 positions
    base[seat] = [
      { x: c.x, y: c.y },
      { x: c.x + 1, y: c.y },
      { x: c.x, y: c.y + 1 },
      { x: c.x + 1, y: c.y + 1 },
    ];
  }

  const seatColors = ["#DC2626", "#16A34A", "#2563EB", "#F59E0B"];

  return {
    gridSize,
    loop: loopShifted,
    home,
    base,
    seatColors,
  };
}
