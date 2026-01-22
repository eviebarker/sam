# Development workflow

## Setup
- Install dependencies: `npm install` (or `pnpm install` if you prefer).
- Dev server: `npm run dev` (Vite). The proxy in `vite.config.ts` forwards `/api` + `/health` to `http://127.0.0.1:8000`, so start the backend alongside it.

## Build
- Production bundle: `npm run build` (outputs to `frontend/dist`).
- Preview production build locally: `npm run preview`.

## Notes
- API calls are relative (`/api/...`), so either run the backend at 127.0.0.1:8000 or adjust the Vite proxy if the backend host changes.
- Keep UI tweaks in `App.css`/`index.css`; component-specific styles sit next to components (e.g., `Orb.css`, `DarkVeil.css`).
