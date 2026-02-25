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
    <div style={{ minHeight: "100vh", padding: "28px 14px" }}>
      <div style={{ maxWidth: 980, margin: "0 auto", display: "grid", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 14, background: "rgba(255,255,255,0.10)" }} />
          <div>
            <div style={{ fontSize: 22, fontWeight: 950, letterSpacing: -0.4 }}>Ludo Online</div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>
              Host a room, share the code, play in realtime.
            </div>
          </div>
        </div>

        <Card style={{ padding: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 950 }}>Your name</div>
              <Pill tone="neutral">Socket synced</Pill>
            </div>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. George" />

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
              <Button disabled={isBusy} onClick={() => onHost(name.trim() || "Player")}>
                Host game
              </Button>

              <div style={{ display: "flex", gap: 10 }}>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Game code"
                />
                <Button
                  variant="ghost"
                  disabled={isBusy || upperCode.length < 4}
                  onClick={() => onJoin(upperCode, name.trim() || "Player")}
                >
                  Join
                </Button>
              </div>
            </div>

            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              Unfilled seats remain AI. Open two tabs to test.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}