# Architecture

- **Stack**: Vite + React + TypeScript. Entry is `frontend/src/main.tsx`, which renders `App` (`frontend/src/App.tsx`).
- **Layout**: `App.tsx` owns the dashboard view and state; styling lives in `App.css` and global rules in `index.css`.
- **Data layer**: `frontend/src/api.ts` wraps backend endpoints; `App.tsx` calls these to pull dashboard, workday, reminders, events, tasks, STT/TTS, and AI actions.
- **Components**: `components/Orb*` drives the animated orb/audio visualiser; `components/DarkVeil*` is the background overlay; `FunFactCard` renders the fact panel. Shared hooks live under `hooks/`.
- **Assets**: `assets/` holds static files (e.g., images). `lib/` is available for shared helpers if needed.
- **Theming**: Kiosk-style CSS is centralized in `App.css` (colors, spacing, responsive tweaks). Prefer extending existing variables/classes instead of sprinkling inline styles.
