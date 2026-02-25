import { io, type Socket } from "socket.io-client";
import { getApiBaseUrl } from "./env";
import type { ApiResponse, GameSnapshot } from "./types";

type Handlers = {
  onSnapshot: (snap: GameSnapshot) => void;
  onError: (message: string) => void;
};

function normalizeSnapshot(payload: any): GameSnapshot | null {
  if (!payload) return null;
  const game = payload.game;
  const players = payload.players;
  const state = payload.state;
  if (!game || !players || !state) return null;
  return { game, players, state };
}

export function connectGameSocket(code: string, handlers: Handlers): Socket {
  const socket = io(getApiBaseUrl(), { transports: ["websocket", "polling"] });

  socket.on("connect", () => {
    socket.emit("subscribe_game", { code });
  });

  socket.on("game_state", (payload: ApiResponse | any) => {
    const snap = normalizeSnapshot(payload);
    console.log("Received game state:", snap);
    if (snap) handlers.onSnapshot(snap);
  });

  socket.on("error", (e: any) => {
    handlers.onError(typeof e === "string" ? e : (e?.message ?? "Socket error"));
  });

  socket.on("connect_error", (e: any) => {
    handlers.onError(e?.message ?? "Socket connect error");
  });

  return socket;
}
