export function getApiBaseUrl(): string {
  // Vite
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const v = (import.meta as any)?.env?.VITE_API_URL as string | undefined;

  console.log("API base URL:", v ?? "not set, using default");
  if (v) return v.replace(/\/$/, "");



  // CRA fallback
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c = (globalThis as any)?.process?.env?.REACT_APP_API_URL as string | undefined;
  if (c) return c.replace(/\/$/, "");

  return "http://localhost:3000";
}
