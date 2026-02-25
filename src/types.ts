import type { GameRow, PlayerRow, GameState } from "./backendTypes";

export type GameSnapshot = {
  game: GameRow;
  players: PlayerRow[];
  state: GameState;
};

// What your /api routes return on host/join/roll/move in your draft.
export type ApiResponse = Partial<{
  code: string;
  playerId: string;
  seat: number;
}> & GameSnapshot;

export type Session = {
  code: string;
  playerId: string;
  seat: number;
};
