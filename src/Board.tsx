import React, { useEffect, useMemo, useRef, useState } from "react";
import type { GameState } from "./backendTypes";
import { computeLayout } from "./boardLayout";

type Props = {
  state: GameState;
  mySeat: number | null;
  legalTokenIds: number[];
  onTokenClick: (tokenId: number) => void;
  activeSeat?: number;
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

export function Board({ state, mySeat, legalTokenIds, onTokenClick, activeSeat }: Props) {
  const layout = useMemo(() => computeLayout(state.board), [state.board]);

  const cellPx = 34;
  const gap = 4;
  const padPx = 14;
  const innerSizePx = layout.gridSize * cellPx + (layout.gridSize - 1) * gap;
  const designSize = innerSizePx + padPx * 2;

  const { ref, size } = useSize<HTMLDivElement>();
  const containerSize = Math.min(size.w || 0, size.h || 0);
  const scale = containerSize > 0 ? Math.min(1, containerSize / designSize) : 1;

  const seatStarts = state.board.seatsStartingIndex ?? [];
  const safeZones = state.board.safeZoneIndex ?? [];

  const spawnIndexToSeat = useMemo(() => {
    const m = new Map<number, number>();
    seatStarts.forEach((idx, seat) => m.set(idx, seat));
    return m;
  }, [seatStarts]);

  const safeIndexSet = useMemo(() => new Set<number>(safeZones), [safeZones]);

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
      const isFinished = typeof p.finishingPosition === "number";

      for (const t of p.tokens) {
        const clickable =
          !isFinished &&
          mySeat === seat &&
          state.turnSeat === seat &&
          p.waitingForTurn &&
          legalTokenIds.includes(t.id);

        let pt: { x: number; y: number } | null = null;

        if (t.position === -1) {
          pt = layout.base[seat][t.id - 1] ?? null;
        } else if (t.position >= 0 && t.position < state.board.mainLoopLength) {
          pt = layout.loop[t.position] ?? null;
        } else if (t.position >= state.board.mainLoopLength + 1) {
          const step = t.position - state.board.mainLoopLength;
          pt = layout.home[seat][step - 1] ?? null;
        }

        if (!pt) continue;

        out.push({ seat, tokenId: t.id, isMine: mySeat === seat, clickable, x: pt.x, y: pt.y });
      }
    }

    return out;
  }, [state, mySeat, legalTokenIds, layout]);

  const grouped = useMemo(() => {
    const map = new Map<string, TokenDraw[]>();
    for (const t of tokens) {
      const k = `${t.x},${t.y}`;
      const arr = map.get(k) ?? [];
      arr.push(t);
      map.set(k, arr);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => (a.seat - b.seat) || (a.tokenId - b.tokenId));
    }
    return map;
  }, [tokens]);

  const cellLeftTop = (x: number, y: number) => {
    const left = padPx + x * (cellPx + gap);
    const top = padPx + y * (cellPx + gap);
    return { left, top };
  };

  const active = activeSeat ?? state.turnSeat;
  const activeColor = layout.seatColors[active] ?? "#ffffff";

  // Brighter dark theme palette
  const surfaceBg = "rgba(30, 34, 44, 0.98)";        // main board surface (lighter than before)
  const cellBorder = "rgba(255,255,255,0.14)";       // clearer cell edges
  const loopCellBg = "rgba(255,255,255,0.075)";      // loop squares brighter
  const emptyBg = "rgba(255,255,255,0.0)";          // empty grid area
  const outerShadow = "0 18px 50px rgba(0,0,0,0.45)";

  // Safe zone styling: brighter accent
  const safeBg = "rgba(167,139,250,0.28)";
  const safeRing = "inset 0 0 0 2px rgba(167,139,250,0.55)";

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height: "100%",
        minHeight: 300,
        borderRadius: 22,
        border: `3px solid ${activeColor}`, // border-only tint
        boxShadow: `${outerShadow}, 0 0 16px ${activeColor}33`,
        background: surfaceBg,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* subtle “happy” highlight gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(900px 500px at 20% 10%, rgba(255,255,255,0.10), rgba(255,255,255,0.00) 60%)," +
            "radial-gradient(700px 500px at 90% 20%, rgba(167,139,250,0.09), rgba(255,255,255,0.00) 55%)",
          pointerEvents: "none",
        }}
      />

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
              let bg = emptyBg;
              let extraShadow: string | undefined;

              if (loop || homeSeat != null) {
                border = `1px solid ${cellBorder}`;
                bg = loopCellBg;
              }

              // Home tint (seat-specific, slightly stronger so it reads)
              if (homeSeat != null) {
                bg = layout.seatTints[homeSeat]; // your tints are already “soft”
                border = `1px solid rgba(255,255,255,0.16)`;
              }

              if (loop) {
                const idx = loopCoordToIndex(x, y);
                if (idx != null) {
                  // Spawn tint on loop squares (seat start)
                  const seat = spawnIndexToSeat.get(idx);
                  if (seat != null) {
                    bg = layout.seatTints[seat];
                    border = `1px solid rgba(255,255,255,0.18)`;
                  }

                  // Safe zones override
                  if (safeIndexSet.has(idx)) {
                    bg = safeBg;
                    extraShadow = safeRing;
                    border = `1px solid rgba(167,139,250,0.55)`;
                  }
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
                    boxShadow: extraShadow,
                  }}
                />
              );
            })
          )}
        </div>

        {/* Tokens */}
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
          {Array.from(grouped.entries()).flatMap(([key, arr]) => {
            const [xStr, yStr] = key.split(",");
            const x = Number(xStr);
            const y = Number(yStr);

            const { left, top } = cellLeftTop(x, y);

            const sizeTok = 15; // slightly larger for better readability
            const centerX = left + (cellPx - sizeTok) / 2;
            const centerY = top + (cellPx - sizeTok) / 2;

            const offsets: Array<{ dx: number; dy: number }> = [
              { dx: -8, dy: -8 },
              { dx: 8, dy: -8 },
              { dx: -8, dy: 8 },
              { dx: 8, dy: 8 },
              { dx: 0, dy: -11 },
              { dx: 11, dy: 0 },
              { dx: 0, dy: 11 },
              { dx: -11, dy: 0 },
            ];

            return arr.map((t, idx) => {
              const off = offsets[idx] ?? { dx: 0, dy: 0 };
              const cx = centerX + off.dx * 0.6;
              const cy = centerY + off.dy * 0.6;

              const color = layout.seatColors[t.seat];

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
                    width: sizeTok,
                    height: sizeTok,
                    borderRadius: 999,
                    background: color,
                    border: t.isMine
                      ? "2px solid rgba(255,255,255,0.95)"
                      : "1px solid rgba(255,255,255,0.65)",
                    boxShadow: t.clickable
                      ? "0 0 0 3px rgba(124,58,237,0.55), 0 10px 18px rgba(0,0,0,0.35)"
                      : "0 8px 16px rgba(0,0,0,0.35)",
                    transform: `translate(${cx}px, ${cy}px)`,
                    transition: "transform 220ms ease",
                    cursor: t.clickable ? "pointer" : "default",
                    pointerEvents: t.clickable ? "auto" : "none",
                    padding: 0,
                  }}
                />
              );
            });
          })}
        </div>
      </div>
    </div>
  );
}