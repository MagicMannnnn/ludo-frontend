import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GameSnapshot, Session } from "./types";
import { api } from "./api";
import { connectGameSocket } from "./socket";
import { clearSession, loadSession, saveSession } from "./session";
import type { Socket } from "socket.io-client";
import { useToast } from "./toast";

function isSnap(x: any): x is GameSnapshot {
  return !!x?.game && !!x?.players && !!x?.state;
}

export function useGameController() {
  const { push } = useToast();
  const [session, setSession] = useState<Session | null>(() => loadSession());
  const [snap, setSnap] = useState<GameSnapshot | null>(null);
  const [isBusy, setBusy] = useState(false);

  const socketRef = useRef<Socket | null>(null);

  const code = session?.code ?? null;
  const mySeat = session?.seat ?? null;

  const connect = useCallback((codeToJoin: string) => {
    socketRef.current?.disconnect();
    socketRef.current = connectGameSocket(codeToJoin, {
      onSnapshot: (s) => setSnap(s),
      onError: (m) => push(m),
    });
  }, [push]);

  useEffect(() => {
    if (code) connect(code);
    return () => socketRef.current?.disconnect();
  }, [code, connect]);

  const host = useCallback(async (name: string) => {
    setBusy(true);
    try {
      const res = await api.host(name);
      if (!res.code || !res.playerId || typeof res.seat !== "number") throw new Error("Bad host response");
      saveSession({ code: res.code, playerId: res.playerId, seat: res.seat });
      setSession({ code: res.code, playerId: res.playerId, seat: res.seat });
      if (isSnap(res)) setSnap(res);
      connect(res.code);
    } catch (e: any) {
      push(e?.message ?? "Host failed");
    } finally {
      setBusy(false);
    }
  }, [connect, push]);

  const join = useCallback(async (codeInput: string, name: string) => {
    setBusy(true);
    try {
      const res = await api.join(codeInput, name);
      if (!res.code || !res.playerId || typeof res.seat !== "number") throw new Error("Bad join response");
      saveSession({ code: res.code, playerId: res.playerId, seat: res.seat });
      setSession({ code: res.code, playerId: res.playerId, seat: res.seat });
      if (isSnap(res)) setSnap(res);
      connect(res.code);
    } catch (e: any) {
      push(e?.message ?? "Join failed");
    } finally {
      setBusy(false);
    }
  }, [connect, push]);

  const leave = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    clearSession();
    setSession(null);
    setSnap(null);
  }, []);

  const canRoll = useMemo(() => {
    if (!snap || mySeat == null) return false;
    const state = snap.state;
    return state.turnSeat === mySeat && state.players[mySeat].waitingForTurn === false;
  }, [snap, mySeat]);

  const canChooseMove = useMemo(() => {
    if (!snap || mySeat == null) return false;
    const state = snap.state;
    return state.turnSeat === mySeat && state.players[mySeat].waitingForTurn === true;
  }, [snap, mySeat]);

  const legalTokenIds = useMemo(() => {
    if (!snap || mySeat == null) return [];
    const st = snap.state;
    const me = st.players[mySeat];
    if (!canChooseMove) return [];
    const roll = st.lastRoll ?? 0;

    return me.tokens
      .filter((t) => !t.madeItHome)
      .filter((t) => {
        if (roll === 6) return true;
        return t.position !== -1;
      })
      .map((t) => t.id);
  }, [snap, mySeat, canChooseMove]);

  const roll = useCallback(async () => {
    if (!session) return;
    setBusy(true);
    try {
      const res = await api.roll(session.code, session.playerId);
      if (isSnap(res)) setSnap(res);
    } catch (e: any) {
      push(e?.message ?? "Roll failed");
    } finally {
      setBusy(false);
    }
  }, [session, push]);

  const move = useCallback(async (tokenId: number) => {
    if (!session) return;
    setBusy(true);
    try {
      const res = await api.move(session.code, session.playerId, tokenId);
      if (isSnap(res)) setSnap(res);
    } catch (e: any) {
      push(e?.message ?? "Move failed");
    } finally {
      setBusy(false);
    }
  }, [session, push]);

  return {
    session,
    snap,
    isBusy,
    host,
    join,
    leave,
    roll,
    move,
    canRoll,
    canChooseMove,
    legalTokenIds,
  };
}
