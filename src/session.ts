import type { Session } from "./types";

const KEY = "ludo_session_v1";

export function saveSession(s: Session) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Session;
    if (!s.code || !s.playerId || typeof s.seat !== "number") return null;
    return s;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(KEY);
}
