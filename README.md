# Sam Kitchen PA

A kitchen smart-display assistant: dashboard for calendar, tasks, reminders, and voice interaction.

## Quick start
- Backend: `python -m venv .venv && source .venv/bin/activate && pip install -r backend/requirements.txt && uvicorn backend.app.main:app --reload`
- Frontend: `npm install && npm run dev` (Vite proxy points `/api` to `127.0.0.1:8000`)
- Docs: `python -m venv .venv-docs && source .venv-docs/bin/activate && pip install -r docs/requirements.txt && make -C docs html` (open `docs/_build/html/index.html`)

## What’s included
- **Backend (FastAPI + SQLite)**: routes under `backend/app/api/`, services in `backend/app/services/`, data layer in `backend/app/db/`, config in `backend/app/core/`.
- **Frontend (Vite + React + TS)**: main app `frontend/src/App.tsx`, API wrappers in `frontend/src/api.ts`, kiosk styling in `App.css`, components in `components/`.
- **Docs**: Sphinx site under `docs/` with backend/frontend overviews and generated API reference.

## Behavior & architecture
- High-level architecture and runtime behavior (reminders, events, AI, fun facts) are documented in the Sphinx site (`docs/backend/architecture.md`, `docs/backend/behavior.md`).
- For API details, see the generated reference (`docs/reference/index.md` after building).

## Contribution notes
- Keep routes thin; business logic belongs in services, SQL in `backend/app/db/`.
- Add docstrings when touching APIs/services/DB helpers so the reference stays readable.
- Update docs and run `make -C docs html` before opening PRs to catch breakage.
- “What’s the next task?” cycles the Tasks card to the next task and reads it out.
- “What other tasks have I got?” reads the next task and asks if you want the next one, continuing on “yes/next.”
- Tasks view defaults to **show all tasks** each day; you can switch to **one‑at‑a‑time** with phrases like “focus mode / one task at a time,” and switch back with “show all tasks.”
- “Top priority task / most important thing today” jumps to the highest‑priority open task and reads it.
- Rules:
  - “Remind me …”, “set a reminder …”, “alert me …”, “ping/nudge me …” → reminder (alert).
  - “I need to / I have to / add a task / todo …” → task.
  - Appointment-like phrasing with a time (including “in X hours”) → event.
- Reminders without a time default to **now + 1 hour**.
- Relative times like **“in 1 minute/hour”** are parsed and scheduled correctly.
- Reminders create **alerts** (not events), so they appear in the Alerts card.
- Events appear in the Today card and include **standard reminders by default** (non‑work).
- Date ranges like **“Dec 7 to Dec 9”** expand into **daily events for each date** in the range.
- Durations like **“for 6 days”** expand into **daily events** starting from the given date.
- UI acknowledgement for adds uses a **short randomized confirmation** (e.g., “Got it, I added the event.”) instead of repeating the full event/reminder text.
### Today summary phrasing (`/api/ai/respond`)
- “What have I got today?” and similar phrases return a summary of today’s events, work hours, tasks, and non‑med alerts.
- Time windows are spoken as “start until end” (e.g., “8 am until 4:30 pm”) for natural TTS.
- Alerts in the summary are **de‑duplicated by label** (keeps the earliest time for each label).
- Only **open (todo) tasks** appear in the summary.

### Completion intent (`/api/ai/resolve`)
- Detects “I did/finished/completed/called/took …” and tries to **resolve** items.
- “Mark all my tasks as complete” marks all open tasks done.
- List completion works (comma/“and”):  
  - “I’ve done wash up, ordered pet food, and called the electrician.”
- Cancel intents delete events (e.g., “my dentist appointment is cancelled”).

### Event reminder generation (timing)
- Event reminders are **created on the day they’re due**, not at event creation time.
- Each day the scheduler evaluates the cadence rules for that date and only then inserts the `event:*` reminder for that day.
- Med resolution rules:
  - If the text mentions **morning/lunch/evening/lanny/lansoprazole**, it marks that specific med.
  - Otherwise it picks the **closest due med** within its 30‑minute window.
  - If none are due, it asks **“Which meds did you take?”**.
- Resolution is **cross‑type** (tasks + reminders + events), not dependent on model target.
- Matching uses token overlap (e.g. “docs” ↔ “doctors”) and falls back to recent reminders.
- Actions:
  - Tasks → mark done
  - Reminders → delete
  - Events → delete (and remove their reminders)
  - “Cancel/remove/delete that alert/reminder” → delete the most recent alert

### Reclassify intent (`/api/ai/reclassify`)
- Moves an existing item into a different bucket (task/reminder/event).
- If multiple items match closely, the API returns options and the UI asks for a numeric choice.
- Confirm via `/api/ai/reclassify/confirm` with `item_type`, `item_id`, and `target`.

### 8) New config knob?
Add it to `core/config.py` (with defaults), don’t scatter constants across files.

---

## Dev quickstart

### DB migration note
If you pull recent changes, restart the backend so `init_db()` can add new columns:
- `events.start_hhmm/end_hhmm` (time ranges)
- `work_days.start_hhmm/end_hhmm` (per‑day work hours)
And create new tables:
- `ai_messages` (short-term AI context)
- `ai_memories` (long-term profile memory)
Plus new columns:
- `ai_memories.embedding` (vector JSON)
- `ai_memories.last_used_at` (LRU pruning)

### Env setup (local)
Create a `.env` file in repo root:
```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
OPENAI_MEMORY_MODEL=gpt-4o-mini
AI_SYSTEM_PROMPT=You are Sam, a warm, helpful assistant. Keep responses concise and kind.
```
`OPENAI_MEMORY_MODEL` is used for extracting long-term memories. `.env` is gitignored.

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
