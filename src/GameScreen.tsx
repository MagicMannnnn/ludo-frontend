import React, { useEffect, useState } from "react";
import type { GameSnapshot, Session } from "./types";
import { Board } from "./Board";
import { Button, Card, Pill } from "./ui";
import { Dice } from "./Dice";

type Props = {
  session: Session;
  snap: GameSnapshot;
  isBusy: boolean;
  canRoll: boolean;
  canChooseMove: boolean;
  legalTokenIds: number[];
  onRoll: () => void;
  onMove: (tokenId: number) => void;
  onLeave: () => void;
};

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 860px)");
    const on = () => setIsMobile(mq.matches);
    on();
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return isMobile;
}

export function GameScreen({
  session,
  snap,
  isBusy,
  canRoll,
  canChooseMove,
  legalTokenIds,
  onRoll,
  onMove,
  onLeave,
}: Props) {
  const me = snap.state.players[session.seat];
  const turn = snap.state.turnSeat;
  const isMobile = useIsMobile();

  const statusPill = !snap.state.started ? (
    <Pill tone="warn">Lobby</Pill>
  ) : turn === session.seat ? (
    <Pill tone="good">Your turn</Pill>
  ) : (
    <Pill tone="neutral">Waiting</Pill>
  );

  // Desktop: no page scroll; Mobile: page can scroll
  return (
    <div
      style={{
        height: isMobile ? "auto" : "100vh",
        overflowY: isMobile ? "auto" : "hidden",
        padding: "16px 14px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", height: isMobile ? "auto" : "100%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 12,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ fontSize: 18, fontWeight: 950, letterSpacing: -0.3 }}>Game {session.code}</div>
              {statusPill}
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>
              You are <b>{me.name}</b> (seat {session.seat}). Turn: seat <b>{turn}</b>.
            </div>
          </div>

          <Button variant="ghost" onClick={onLeave}>
            Leave
          </Button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "minmax(520px, 1fr) 360px",
            gap: 12,
            height: isMobile ? "auto" : "calc(100% - 64px)",
          }}
        >
          {/* Board area (square fit) */}
          <div
            style={{
              minHeight: isMobile ? 340 : 520,
              height: isMobile ? "min(72vh, 620px)" : "100%",
            }}
          >
            <Board state={snap.state} mySeat={session.seat} legalTokenIds={legalTokenIds} onTokenClick={onMove} />
          </div>

          {/* Right side: on desktop, stack controls + players. On mobile it'll be below. */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, height: isMobile ? "auto" : "100%" }}>
            <Card style={{ padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 950 }}>Controls</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.45 }}>
                    {canChooseMove ? (
                      <>Choose a highlighted token to move.</>
                    ) : canRoll ? (
                      <>Roll to take your turn.</>
                    ) : (
                      <>Waiting for another player…</>
                    )}
                  </div>
                </div>
                <Dice value={snap.state.lastRoll} />
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
                <Button disabled={!canRoll || isBusy} onClick={onRoll}>
                  Roll
                </Button>
                <Pill tone={canChooseMove ? "good" : "neutral"}>{canChooseMove ? "Select token" : "Idle"}</Pill>
              </div>

              {canChooseMove ? (
                <div style={{ marginTop: 10, fontSize: 12, color: "var(--muted)" }}>
                  Legal tokens: <b>{legalTokenIds.join(", ") || "none"}</b>
                </div>
              ) : null}
            </Card>

            <Card style={{ padding: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 950, marginBottom: 10 }}>Players</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {snap.state.players.map((p, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 10px",
                      borderRadius: 14,
                      border: "1px solid var(--border)",
                      background: idx === turn ? "rgba(124,58,237,0.12)" : "rgba(255,255,255,0.04)",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <div style={{ fontWeight: 900, fontSize: 13 }}>
                        {p.name} {p.is_ai ? "(AI)" : ""}
                        {idx === session.seat ? " • You" : ""}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>
                        Seat {p.seat} • Waiting: {String(p.waitingForTurn)}
                      </div>
                    </div>
                    <Pill tone={idx === turn ? "good" : "neutral"}>{idx === turn ? "Turn" : "Idle"}</Pill>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
