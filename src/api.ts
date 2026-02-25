import type { ApiResponse } from "./types";
import { getApiBaseUrl } from "./env";

const API = getApiBaseUrl();

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (json as any)?.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return json as T;
}

export const api = {
  host: (name: string) => post<ApiResponse>("/api/host", { name }),
  join: (code: string, name: string) => post<ApiResponse>("/api/join", { code, name }),
  roll: (code: string, playerId: string) => post<ApiResponse>("/api/roll", { code, playerId }),
  move: (code: string, playerId: string, tokenId: number) =>
    post<ApiResponse>("/api/move", { code, playerId, tokenId }),
};
