import React, { useMemo } from "react";
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

  const statusPill = useMemo(() => {
    if (!snap.state.started) return <Pill tone="warn">Lobby</Pill>;
    if (turn === session.seat) return <Pill tone="good">Your turn</Pill>;
    return <Pill tone="neutral">Waiting</Pill>;
  }, [snap.state.started, turn, session.seat]);

  return (
    <div style={{ minHeight: "100vh", background: "#F6F7FB" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "26px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.3 }}>Game {session.code}</div>
              {statusPill}
            </div>
            <div style={{ fontSize: 13, color: "rgba(0,0,0,0.65)" }}>
              You are <b>{me.name}</b> (seat {session.seat}). Turn: seat <b>{turn}</b>.
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Button variant="ghost" onClick={onLeave}>
              Leave
            </Button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16, marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Board state={snap.state} mySeat={session.seat} legalTokenIds={legalTokenIds} onTokenClick={onMove} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Card style={{ padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 900 }}>Controls</div>
                  <div style={{ fontSize: 12, color: "rgba(0,0,0,0.65)", lineHeight: 1.4 }}>
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

              <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                <Button disabled={!canRoll || isBusy} onClick={onRoll}>
                  Roll
                </Button>
                <Pill tone={canChooseMove ? "good" : "neutral"}>
                  {canChooseMove ? "Select token" : "Not selecting"}
                </Pill>
              </div>

              {canChooseMove ? (
                <div style={{ marginTop: 12, fontSize: 12, color: "rgba(0,0,0,0.65)" }}>
                  Legal tokens: <b>{legalTokenIds.join(", ") || "none"}</b>
                </div>
              ) : null}
            </Card>

            <Card style={{ padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 8 }}>Players</div>
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
                      border: "1px solid rgba(0,0,0,0.10)",
                      background: idx === turn ? "rgba(99,102,241,0.06)" : "#fff",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <div style={{ fontWeight: 800, fontSize: 13 }}>
                        {p.name} {p.is_ai ? "(AI)" : ""}
                        {idx === session.seat ? " • You" : ""}
                      </div>
                      <div style={{ fontSize: 12, color: "rgba(0,0,0,0.65)" }}>
                        Seat {p.seat} • WaitingForTurn: {String(p.waitingForTurn)}
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
