import React, { useMemo, useState } from "react";
import { Button, Card, Input, Pill } from "./ui";

type Props = {
  isBusy: boolean;
  onHost: (name: string) => void;
  onJoin: (code: string, name: string) => void;
};

export function Landing({ isBusy, onHost, onJoin }: Props) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const upperCode = useMemo(() => code.trim().toUpperCase(), [code]);

  return (
    <div style={{ minHeight: "100vh", background: "#F6F7FB" }}>
      <div
        style={{
          maxWidth: 980,
          margin: "0 auto",
          padding: "56px 16px",
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: 18,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: "#111",
              }}
            />
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.4 }}>Ludo Online</div>
              <div style={{ fontSize: 13, color: "rgba(0,0,0,0.65)" }}>
                Host a room, share the code, and play instantly.
              </div>
            </div>
          </div>

          <Card style={{ padding: 18 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 14, fontWeight: 800 }}>Your name</div>
                <Pill tone="neutral">Realtime</Pill>
              </div>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. George" />

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Button disabled={isBusy} onClick={() => onHost(name.trim() || "Player")}>
                  Host game
                </Button>
                <Button
                  variant="ghost"
                  disabled={isBusy || upperCode.length < 4}
                  onClick={() => onJoin(upperCode, name.trim() || "Player")}
                >
                  Join game
                </Button>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Game code (e.g. A1B2C3)"
                    style={{ marginTop: 8 }}
                  />
                </div>
              </div>

              <div style={{ fontSize: 12, color: "rgba(0,0,0,0.6)" }}>
                Host generates a share code. Any unfilled seats remain AI.
              </div>
            </div>
          </Card>

          <div style={{ fontSize: 12, color: "rgba(0,0,0,0.55)" }}>
            Tip: open the game in two tabs to test realtime updates.
          </div>
        </div>

        <Card style={{ padding: 18, height: "fit-content" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 800 }}>How it works</div>
            <div style={{ fontSize: 13, color: "rgba(0,0,0,0.7)", lineHeight: 1.4 }}>
              <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                <li>Host or join with a code.</li>
                <li>Host’s first roll starts the match.</li>
                <li>Roll a 6 to release a token from base.</li>
                <li>When prompted, click a highlighted token to move.</li>
                <li>Moves and turns sync instantly via websockets.</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
