import React from "react";
import { Landing } from "./Landing";
import { GameScreen } from "./GameScreen";
import { ToastProvider } from "./toast";
import { useGameController } from "./useGame";

export function LudoApp() {
  return (
    <ToastProvider>
      <Inner />
    </ToastProvider>
  );
}

function Inner() {
  const g = useGameController();

  if (!g.session || !g.snap) {
    return <Landing isBusy={g.isBusy} onHost={g.host} onJoin={g.join} />;
  }

  return (
    <GameScreen
      session={g.session}
      snap={g.snap}
      isBusy={g.isBusy}
      canRoll={g.canRoll}
      canChooseMove={g.canChooseMove}
      legalTokenIds={g.legalTokenIds}
      onRoll={g.roll}
      onMove={g.move}
      onLeave={g.leave}
    />
  );
}
