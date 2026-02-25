import React, { useEffect, useMemo, useRef, useState } from "react";
import type { GameState } from "./backendTypes";
import { computeLayout } from "./boardLayout";

type Props = {
  state: GameState;
  mySeat: number | null;
  legalTokenIds: number[];
  onTokenClick: (tokenId: number) => void;
};

type TokenDraw = {
  seat: number;
  tokenId: number;
  isMine: boolean;
  clickable: boolean;
  x: number;
  y: number;
};

function useSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setSize({ w: r.width, h: r.height });
    });
    ro.observe(el);
    const r = el.getBoundingClientRect();
    setSize({ w: r.width, h: r.height });
    return () => ro.disconnect();
  }, []);

  return { ref, size };
}

export function Board({ state, mySeat, legalTokenIds, onTokenClick }: Props) {
  const layout = useMemo(() => computeLayout(state.board), [state.board]);

  // Design size (scaled to fit container)
  const cellPx = 34;
  const gap = 4;
  const padPx = 14;
  const innerSizePx = layout.gridSize * cellPx + (layout.gridSize - 1) * gap;
  const designSize = innerSizePx + padPx * 2;

  const { ref, size } = useSize<HTMLDivElement>();
  const containerSize = Math.min(size.w || 0, size.h || 0);
  const scale = containerSize > 0 ? Math.min(1, containerSize / designSize) : 1;

  const spawnIndexToSeat = useMemo(() => {
    const m = new Map<number, number>();
    state.board.seatsStartingIndex.forEach((idx, seat) => m.set(idx, seat));
    return m;
  }, [state.board.seatsStartingIndex]);

  const loopCoordToIndex = useMemo(() => {
    const m = new Map<string, number>();
    layout.loop.forEach((p, idx) => m.set(`${p.x},${p.y}`, idx));
    return (x: number, y: number) => m.get(`${x},${y}`) ?? null;
  }, [layout.loop]);

  const homeSeatAt = useMemo(() => {
    const map = new Map<string, number>();
    for (let seat = 0; seat < 4; seat++) {
      for (const p of layout.home[seat]) map.set(`${p.x},${p.y}`, seat);
    }
    return (x: number, y: number) => map.get(`${x},${y}`) ?? null;
  }, [layout.home]);

  const isLoopCell = useMemo(() => {
    const set = new Set(layout.loop.map((p) => `${p.x},${p.y}`));
    return (x: number, y: number) => set.has(`${x},${y}`);
  }, [layout.loop]);

  const tokens: TokenDraw[] = useMemo(() => {
    const out: TokenDraw[] = [];

    for (let seat = 0; seat < 4; seat++) {
      const p = state.players[seat];

      for (const t of p.tokens) {
        const isMine = mySeat === seat;
        const clickable =
          isMine &&
          state.turnSeat === seat &&
          p.waitingForTurn &&
          legalTokenIds.includes(t.id);

        let pt: { x: number; y: number } | null = null;

        if (t.position === -1) {
          pt = layout.base[seat][t.id - 1] ?? null;
        } else if (t.position >= 0 && t.position < state.board.mainLoopLength) {
          pt = layout.loop[t.position] ?? null;
        } else if (t.position >= state.board.mainLoopLength + 1) {
          const step = t.position - state.board.mainLoopLength; // 1..homeColumnLength
          pt = layout.home[seat][step - 1] ?? null;
        }

        if (!pt) continue;

        out.push({ seat, tokenId: t.id, isMine, clickable, x: pt.x, y: pt.y });
      }
    }

    return out;
  }, [state, mySeat, legalTokenIds, layout]);

  const cellLeftTop = (x: number, y: number) => {
    const left = padPx + x * (cellPx + gap);
    const top = padPx + y * (cellPx + gap);
    return { left, top };
  };

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height: "100%",
        minHeight: 300,
        borderRadius: 22,
        border: "1px solid var(--border)",
        background: "rgba(255,255,255,0.04)",
        boxShadow: "var(--shadow)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: designSize,
          height: designSize,
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: "center",
        }}
      >
        {/* Grid */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: designSize,
            height: designSize,
            padding: padPx,
            display: "grid",
            gridTemplateColumns: `repeat(${layout.gridSize}, ${cellPx}px)`,
            gridAutoRows: `${cellPx}px`,
            gap,
          }}
        >
          {Array.from({ length: layout.gridSize }).map((_, y) =>
            Array.from({ length: layout.gridSize }).map((__, x) => {
              const loop = isLoopCell(x, y);
              const homeSeat = homeSeatAt(x, y);

              let border = "1px solid transparent";
              let bg = "transparent";

              if (loop || homeSeat != null) {
                border = "1px solid rgba(255,255,255,0.10)";
                bg = "rgba(255,255,255,0.04)";
              }

              // Home tint
              if (homeSeat != null) bg = layout.seatTints[homeSeat];

              // Spawn tint on loop squares
              if (loop) {
                const idx = loopCoordToIndex(x, y);
                if (idx != null) {
                  const seat = spawnIndexToSeat.get(idx);
                  if (seat != null) bg = layout.seatTints[seat];
                }
              }

              return (
                <div
                  key={`${x},${y}`}
                  style={{
                    width: cellPx,
                    height: cellPx,
                    borderRadius: 10,
                    border,
                    background: bg,
                  }}
                />
              );
            })
          )}
        </div>

        {/* Token overlay with movement animation */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: designSize,
            height: designSize,
            pointerEvents: "none",
          }}
        >
          {tokens.map((t) => {
            const color = layout.seatColors[t.seat];
            const { left, top } = cellLeftTop(t.x, t.y);

            const size = 14;
            const cx = left + (cellPx - size) / 2;
            const cy = top + (cellPx - size) / 2;

            return (
              <button
                key={`${t.seat}-${t.tokenId}`}
                onClick={() => t.clickable && onTokenClick(t.tokenId)}
                disabled={!t.clickable}
                title={`Seat ${t.seat} token ${t.tokenId}`}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: size,
                  height: size,
                  borderRadius: 999,
                  background: color,
                  border: t.isMine ? "2px solid rgba(255,255,255,0.92)" : "1px solid rgba(255,255,255,0.55)",
                  boxShadow: t.clickable
                    ? "0 0 0 3px rgba(124,58,237,0.55), 0 10px 20px rgba(0,0,0,0.35)"
                    : "0 8px 18px rgba(0,0,0,0.35)",
                  transform: `translate(${cx}px, ${cy}px)`,
                  transition: "transform 220ms ease",
                  cursor: t.clickable ? "pointer" : "default",
                  pointerEvents: t.clickable ? "auto" : "none",
                  padding: 0,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
