export function getApiBaseUrl(): string {
  // Vite
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const v = import.meta.env?.VITE_API_URL as string | undefined;

  console.log("API base URL:", v ?? "not set, using default");
  if (v) return v.replace(/\/$/, "");


  //return "https://api.george.richmond.gg";
  return "http://localhost:3000";
}
