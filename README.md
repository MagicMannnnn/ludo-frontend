# Ludo Online (Frontend) — Production-ready Starter (React + TS + Vite)

A polished UI frontend for the Ludo backend (Express + Socket.IO + Postgres).

## Run
```bash
npm install
cp .env.example .env
npm run dev
```

## Env
`.env`:
```env
VITE_API_URL=http://localhost:3000
```

## Gameplay flow (interactive)
- Click **Roll**
- Dice result appears
- Click a highlighted token to **Move**
- If no legal tokens, frontend will **auto-pass** (requires tiny backend patch)

## Backend patch (needed for auto-pass)
Your current backend does not have an endpoint to "pass turn" when a player has no legal moves after rolling.
This frontend includes a tiny patch you can apply:

See: `backend-patch/PASS_ENDPOINT_PATCH.md`
