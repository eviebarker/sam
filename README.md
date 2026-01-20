# Sam Kitchen PA (MVP)

A kitchen smart-display “PA” for Sam (ADHD-friendly): calendar + tasks + reminders, with voice interaction.

## MVP decisions
- **Push-to-talk** for v1 (no hotword yet)
- **Python-only backend**
- **Local-first storage** (SQLite)
- **OpenAI only for the “brain”** (text reasoning). STT/TTS will be **local/offline** later (e.g. Vosk/whisper.cpp + Piper).
- Frontend is a **kiosk dashboard** (landscape), designed to run on a Pi + monitor.

---

## What the app does (high-level)
- Knows **work/off days** (default pattern **Mon–Wed = work, Thu–Sun = off**, with per-date overrides for swaps), plus locations/days off/holidays/events
- Medication reminders that **repeat until confirmed** (e.g., every 5 min)
- “Remember this in 6 months” reminders with escalating cadence (monthly → weekly → daily → day-of)
- Morning brief (short, actionable, low-noise)
- ADHD-friendly tasks: **one step at a time**, can break big tasks into micro-steps
- Conflict-aware scheduling: warns like **“you’re on holiday then”** before booking

---

## Repo layout

### Backend (Python) — `backend/`
- `backend/app/main.py`  
  App entrypoint. Creates the FastAPI app, mounts routers, lifecycle hooks.  
  **Keep business logic out of here.**

- `backend/app/api/` (API layer: thin routes)
  - `routes_dashboard.py` — `GET /api/dashboard`
  - `routes_tasks.py` — `POST /api/tasks`
  - `routes_reminders.py` — confirm reminders (e.g. `POST /api/reminders/done`)
  - `routes_workdays.py` — set/check work/off overrides (e.g. `POST /api/workdays`, `GET /api/workdays/{date}`)
  - `routes_talk.py` — `POST /api/talk` (push-to-talk flow) *(later)*
  - `routes_stream.py` — SSE/WebSocket stream for proactive prompts *(later)*  
  Routes should: validate input/output → call a service → return a response.

- `backend/app/core/` (shared config + utilities)
  - `config.py` — env vars + settings (timezone, OpenAI key, etc.)
  - `logging.py` — logging setup
  - `time.py` — timezone helpers (Europe/London), “today” boundaries
  - `constants.py` — enums/status strings

- `backend/app/db/` (data layer)
  - `conn.py` — SQLite connection + migrations/bootstrap
  - `schema.sql` — SQLite schema
  - `queries.py` — general SQL helpers (tasks/alerts etc.)
  - `reminder_queries.py` — schedules/active reminders + logs
  - `workday_queries.py` — work/off day lookup + overrides
  - `reminder_seed.py` — seeds default schedules (e.g. “lanny zee”, morning/lunch/evening meds)  
  **SQL lives here**, not sprinkled through routes/services.

- `backend/app/services/` (business logic)
  - `dashboard_service.py` — builds the dashboard view from DB state
  - `scheduler_service.py` — APScheduler jobs:
    - **arms today’s reminders** based on work/off day
    - runs a **nag loop** (repeats every 5 min until “done”)
  - `calendar_service.py` — add events/holidays + conflict checking *(later)*
  - `task_service.py` — one-at-a-time tasks + breakdown *(later)*
  - `reminder_service.py` — escalation rules + reminder state machine *(later)*
  - `relevance_service.py` — “should we speak?” gate + anti-spam *(later)*
  - `voice_service.py` — local STT/TTS wrappers *(later)*
  - `llm_service.py` — OpenAI Responses + tool-calling loop *(later)*

- `backend/requirements.txt`  
  Python dependencies.

### Frontend (kiosk UI) — `frontend/`
- Vite + React + TypeScript (kiosk dashboard UI)
- `frontend/src/App.tsx` — main dashboard screen
- `frontend/src/App.css` — kiosk styling (layout/spacing/colours)
- `frontend/src/api.ts` — calls to backend endpoints
- `frontend/src/components/` — UI/background components (e.g. DarkVeil)

---

## Where do new features go? (rules of thumb)

### 1) New endpoint?
Add a route file in `backend/app/api/`.  
Keep it thin: parse → call service → return.

### 2) New behaviour / logic?
Put it in `backend/app/services/`.  
Example: “repeat meds every 5 minutes until confirmed” belongs in
`scheduler_service.py` (job scheduling) + reminder logic services.

### 3) New data to store?
Add/alter tables + query functions in `backend/app/db/`.  
Don’t write raw SQL inside routes.

### 4) New timed/background behaviour?
Add an APScheduler job in `scheduler_service.py`, but have it call normal service functions
(so it’s testable and reusable).

### 5) Voice features?
STT/TTS code lives in `voice_service.py`. Routes call it; it returns text/audio.

### 6) “AI decides what to do” features?
OpenAI call + tool loop lives in `llm_service.py`.  
Tools should be normal service functions (calendar/task/reminder services).  
**Backend services enforce rules** (conflicts, relevance, logging) — not the model.

### 7) UI feature?
Add React components in `frontend/src/components/`.  
If it needs new data, extend the dashboard response in `dashboard_service.py`.

### 8) New config knob?
Add it to `core/config.py` (with defaults), don’t scatter constants across files.

---

## Dev quickstart

### Run backend
```bash
cd ~/Documents/PA_APP
source .venv/bin/activate
uvicorn backend.app.main:app --reload --port 8000
```

### Run frontend
```bash
cd ~/Documents/PA_APP/frontend
npm install
npm run dev
```

---

## Frontend proxy to backend (Vite)
To avoid CORS during dev, set a proxy in `frontend/vite.config.ts`:
```ts
server: {
  proxy: {
    "/api": "http://127.0.0.1:8000",
    "/health": "http://127.0.0.1:8000"
  }
}
```

---

## Tailwind + shadcn (for React Bits components)
We installed Tailwind mainly to satisfy **shadcn/ui** tooling (even if most styling is plain CSS).

Key files:
- `frontend/tailwind.config.cjs` — should use `module.exports = { ... }`
- `frontend/postcss.config.cjs` — should use `module.exports = { ... }`
- `frontend/src/index.css` — should include Tailwind directives:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### PostCSS config fix (CommonJS)
If you see `Unexpected token 'export'` from PostCSS, ensure `postcss.config.cjs` is:
```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### Import alias (required by shadcn)
shadcn checks `frontend/tsconfig.json`, so add:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

And ensure Vite supports it:
```bash
npm i -D vite-tsconfig-paths
```

`frontend/vite.config.ts` should include:
```ts
import tsconfigPaths from "vite-tsconfig-paths";
// ...
plugins: [react(), tsconfigPaths()],
```

### Adding React Bits DarkVeil background
After `npx shadcn@latest init -y`, add:
```bash
npx shadcn@latest add @react-bits/DarkVeil-JS-CSS -y --path src/components
```

This creates:
- `frontend/src/components/DarkVeil.jsx`
- `frontend/src/components/DarkVeil.css`

We wrap it for TS usage:
- `frontend/src/components/DarkVeil.tsx` (wrapper that imports `DarkVeil.jsx` + `DarkVeil.css`)

Mount it in `App.tsx`:
```tsx
<div className="bg"><DarkVeil ... /></div>
```

And add to `App.css`:
```css
.bg{
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  width: 100vw;
  height: 100vh;
}
```

---

## How to change a swapped work day (override)

### Get today’s date string
```bash
date +%F
```

### Mark a date as a **work day**
```bash
curl -X POST http://localhost:8000/api/workdays \
  -H "Content-Type: application/json" \
  -d '{"date":"2026-01-20","is_work":true}'
```

### Mark a date as a **day off**
```bash
curl -X POST http://localhost:8000/api/workdays \
  -H "Content-Type: application/json" \
  -d '{"date":"2026-01-20","is_work":false}'
```

### Check if a date is work/off
```bash
curl http://localhost:8000/api/workdays/2026-01-20
```

Notes:
- If a date has no override, the default is **Mon–Wed work**, **Thu–Sun off**.
- Overrides always win (useful for swaps).
