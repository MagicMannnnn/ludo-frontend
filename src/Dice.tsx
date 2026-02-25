import React from "react";

export function Dice({ value }: { value: number | null }) {
  const v = value ?? 0;
  const dots: Record<number, [number, number][]> = {
    0: [],
    1: [[2, 2]],
    2: [
      [1, 1],
      [3, 3],
    ],
    3: [
      [1, 1],
      [2, 2],
      [3, 3],
    ],
    4: [
      [1, 1],
      [1, 3],
      [3, 1],
      [3, 3],
    ],
    5: [
      [1, 1],
      [1, 3],
      [2, 2],
      [3, 1],
      [3, 3],
    ],
    6: [
      [1, 1],
      [1, 2],
      [1, 3],
      [3, 1],
      [3, 2],
      [3, 3],
    ],
  };

  return (
    <div
      aria-label={value ? `Dice: ${value}` : "Dice"}
      style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        border: "1px solid rgba(0,0,0,0.18)",
        background: "#fff",
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gridTemplateRows: "repeat(3, 1fr)",
        padding: 6,
        boxShadow: "0 8px 18px rgba(0,0,0,0.08)",
      }}
    >
      {Array.from({ length: 9 }).map((_, i) => {
        const x = (i % 3) + 1;
        const y = Math.floor(i / 3) + 1;
        const on = dots[v]?.some(([dx, dy]) => dx === x && dy === y);
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            {on ? (
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 999,
                  background: "#111",
                }}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
