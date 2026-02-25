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

  const iAmFinished = typeof me.finishingPosition === "number";

  // Auto-roll toggle (never disables itself)
  const [autoRoll, setAutoRoll] = useState(false);

  useEffect(() => {
    if (!autoRoll) return;
    if (!canRoll) return;
    if (isBusy) return;

    const t = window.setTimeout(() => {
      onRoll();
    }, 800);

    return () => window.clearTimeout(t);
  }, [autoRoll, canRoll, isBusy, onRoll]);

  const statusPill = !snap.state.started ? (
    <Pill tone="warn">Lobby</Pill>
  ) : iAmFinished ? (
    <Pill tone="good">Finished</Pill>
  ) : turn === session.seat ? (
    <Pill tone="good">Your turn</Pill>
  ) : (
    <Pill tone="neutral">Waiting</Pill>
  );

  return (
    <div
      style={{
        height: isMobile ? "auto" : "100vh",
        overflowY: isMobile ? "auto" : "hidden",
        padding: "16px 14px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", height: isMobile ? "auto" : "100%" }}>
        {/* Header */}
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
              <div style={{ fontSize: 18, fontWeight: 950, letterSpacing: -0.3 }}>
                Game {session.code}
              </div>
              {statusPill}
              {snap.state.finished ? <Pill tone="good">Game Over</Pill> : null}
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>
              You are <b>{me.name}</b> (seat {session.seat}).{" "}
              {iAmFinished ? (
                <>
                  Final: <b>#{me.finishingPosition}</b>
                </>
              ) : (
                <>
                  Turn: seat <b>{turn}</b>.
                </>
              )}
            </div>
          </div>

          <Button variant="ghost" onClick={onLeave}>
            Leave
          </Button>
        </div>

        {snap.state.finished ? (
          <div style={{ marginBottom: 12 }}>
            <Card style={{ padding: 12 }}>
              <div style={{ fontWeight: 950, fontSize: 14 }}>Game finished</div>
              <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 6 }}>
                Players are locked. Start a new game to play again.
              </div>
            </Card>
          </div>
        ) : null}

        {/* Main */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "minmax(520px, 1fr) 360px",
            gap: 12,
            height: isMobile ? "auto" : "calc(100% - 64px)",
          }}
        >
          {/* Board */}
          <div
            style={{
              minHeight: isMobile ? 340 : 520,
              height: isMobile ? "min(72vh, 620px)" : "100%",
            }}
          >
            <Board
              state={snap.state}
              mySeat={session.seat}
              legalTokenIds={legalTokenIds}
              onTokenClick={onMove}
              activeSeat={snap.state.turnSeat}
            />
          </div>

          {/* Side panels */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, height: isMobile ? "auto" : "100%" }}>
            {/* Controls */}
            <Card style={{ padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 950 }}>Controls</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.45 }}>
                    {snap.state.finished ? (
                      <>Game over.</>
                    ) : iAmFinished ? (
                      <>You’ve finished — waiting for others.</>
                    ) : canChooseMove ? (
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
                <Button disabled={!canRoll || isBusy || iAmFinished || !!snap.state.finished} onClick={onRoll}>
                  Roll
                </Button>

                <Button
                  variant="ghost"
                  disabled={iAmFinished || !!snap.state.finished}
                  onClick={() => setAutoRoll((v) => !v)}
                >
                  {autoRoll ? "Auto-roll: ON" : "Auto-roll: OFF"}
                </Button>

                <Pill tone={canChooseMove ? "good" : "neutral"}>
                  {snap.state.finished ? "Over" : iAmFinished ? "Finished" : canChooseMove ? "Select token" : "Idle"}
                </Pill>
              </div>

              {canChooseMove ? (
                <div style={{ marginTop: 10, fontSize: 12, color: "var(--muted)" }}>
                  Legal tokens: <b>{legalTokenIds.join(", ") || "none"}</b>
                </div>
              ) : null}
            </Card>

            {/* Players */}
            <Card style={{ padding: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 950, marginBottom: 10 }}>Players</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {snap.state.players.map((p, idx) => {
                  const finished = typeof p.finishingPosition === "number";
                  const isTurn = idx === turn;

                  return (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 10px",
                        borderRadius: 14,
                        border: "1px solid var(--border)",
                        background: finished
                          ? "rgba(34,197,94,0.10)"
                          : isTurn
                          ? "rgba(255,255,255,0.06)"
                          : "rgba(255,255,255,0.04)",
                        opacity: finished ? 0.95 : 1,
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

                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {finished ? (
                          <Pill tone="good">FINISHED #{p.finishingPosition}</Pill>
                        ) : (
                          <Pill tone={isTurn ? "good" : "neutral"}>{isTurn ? "Turn" : "Idle"}</Pill>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}