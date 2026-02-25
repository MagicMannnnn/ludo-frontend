import React, { useMemo } from "react";
import type { GameState } from "./backendTypes";
import { computeLayout } from "./boardLayout";

type Props = {
  state: GameState;
  mySeat: number | null;
  legalTokenIds: number[];
  onTokenClick: (tokenId: number) => void;
};

export function Board({ state, mySeat, legalTokenIds, onTokenClick }: Props) {
  const layout = useMemo(() => computeLayout(state.board), [state.board]);

  const cellPx = 36;
  const gap = 4;
  const sizePx = layout.gridSize * cellPx + (layout.gridSize - 1) * gap;

  // Build a lookup of positions -> list of tokens to render there
  const tokensAt: Record<string, { seat: number; tokenId: number; isMine: boolean; clickable: boolean }[]> = {};

  const pushToken = (x: number, y: number, token: { seat: number; tokenId: number; isMine: boolean; clickable: boolean }) => {
    const key = `${x},${y}`;
    if (!tokensAt[key]) tokensAt[key] = [];
    tokensAt[key].push(token);
  };

  for (let seat = 0; seat < 4; seat++) {
    const p = state.players[seat];

    for (const t of p.tokens) {
      const isMine = mySeat === seat;
      const clickable = isMine && state.turnSeat === seat && p.waitingForTurn && legalTokenIds.includes(t.id);

      if (t.position === -1) {
        const pt = layout.base[seat][t.id - 1];
        pushToken(pt.x, pt.y, { seat, tokenId: t.id, isMine, clickable });
      } else if (t.position >= 0 && t.position < state.board.mainLoopLength) {
        const pt = layout.loop[t.position];
        if (pt) pushToken(pt.x, pt.y, { seat, tokenId: t.id, isMine, clickable });
      } else if (t.position >= state.board.mainLoopLength + 1) {
        const step = t.position - state.board.mainLoopLength; // 1..homeColumnLength
        const pt = layout.home[seat][step - 1];
        if (pt) pushToken(pt.x, pt.y, { seat, tokenId: t.id, isMine, clickable });
      }
    }
  }

  const renderCell = (x: number, y: number) => {
    const key = `${x},${y}`;
    const tokens = tokensAt[key] ?? [];
    const isLoop = layout.loop.some((p) => p.x === x && p.y === y);
    const isHome = layout.home.some((col) => col.some((p) => p.x === x && p.y === y));
    const isBase = layout.base.some((b) => b.some((p) => p.x === x && p.y === y));

    const bg =
      isBase ? "rgba(17,24,39,0.03)" :
      isHome ? "rgba(99,102,241,0.04)" :
      isLoop ? "#F9FAFB" :
      "transparent";

    return (
      <div
        key={key}
        style={{
          width: cellPx,
          height: cellPx,
          borderRadius: 10,
          border: isLoop || isHome || isBase ? "1px solid rgba(0,0,0,0.10)" : "1px solid transparent",
          background: bg,
          position: "relative",
          overflow: "visible",
        }}
      >
        {tokens.slice(0, 4).map((t, i) => {
          const color = layout.seatColors[t.seat] ?? "#111";
          const ring = t.clickable ? "0 0 0 3px rgba(99,102,241,0.45)" : "0 0 0 1px rgba(0,0,0,0.10)";
          const offset = [
            { dx: 8, dy: 8 },
            { dx: 18, dy: 8 },
            { dx: 8, dy: 18 },
            { dx: 18, dy: 18 },
          ][i];

          return (
            <button
              key={`${t.seat}-${t.tokenId}`}
              onClick={() => t.clickable && onTokenClick(t.tokenId)}
              title={`Seat ${t.seat} token ${t.tokenId}`}
              disabled={!t.clickable}
              style={{
                position: "absolute",
                left: offset.dx,
                top: offset.dy,
                width: 12,
                height: 12,
                borderRadius: 999,
                background: color,
                border: t.isMine ? "2px solid #fff" : "1px solid rgba(255,255,255,0.65)",
                boxShadow: ring,
                cursor: t.clickable ? "pointer" : "default",
                padding: 0,
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ width: sizePx }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${layout.gridSize}, ${cellPx}px)`,
          gridAutoRows: `${cellPx}px`,
          gap,
          background: "#fff",
          padding: 14,
          borderRadius: 22,
          border: "1px solid rgba(0,0,0,0.10)",
          boxShadow: "0 12px 36px rgba(0,0,0,0.06)",
        }}
      >
        {Array.from({ length: layout.gridSize }).map((_, y) =>
          Array.from({ length: layout.gridSize }).map((__, x) => renderCell(x, y))
        )}
      </div>
    </div>
  );
}
