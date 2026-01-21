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
- Medication reminders that **repeat every 5 min within a 30‑minute window**, then mark **missed**
- “Remember this in 6 months” reminders with escalating cadence (monthly → weekly → daily → day-of)
- Morning brief (short, actionable, low-noise)
- ADHD-friendly tasks: **one step at a time**, can break big tasks into micro-steps
- Conflict-aware scheduling: warns like **“you’re on holiday then”** before booking
- “Daft fact” panel: pulls a random fact and refreshes on **London time slots** (09/13/17/21)
- Events: stored per day with **time ranges** (or all‑day) and shown under Today only for that date
- Workday hours: **per‑date configurable** (defaults to 08:00–16:30)

---

## Repo layout

### Backend (Python) — `backend/`
- `backend/app/main.py`  
  App entrypoint. Creates the FastAPI app, mounts routers, lifecycle hooks.  
  **Keep business logic out of here.**

- `backend/app/api/` (API layer: thin routes)
  - `routes_dashboard.py` — `GET /api/dashboard`
  - `routes_tasks.py` — `GET /api/tasks`, `POST /api/tasks`, `POST /api/tasks/{id}/done`
  - `routes_events.py` — `GET /api/events`, `POST /api/events` (time ranges; reminders opt‑in)
  - `routes_reminders.py` — list/confirm reminders (e.g. `GET /api/reminders/active`, `POST /api/reminders/done`)
  - `routes_workdays.py` — set/check work/off overrides + per‑day hours (e.g. `POST /api/workdays`, `GET /api/workdays/{date}`)
  - `routes_tts.py` — `POST /api/tts` (Piper TTS, returns OGG)
  - `routes_ai.py` — `POST /api/ai/respond` (OpenAI Responses)
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
  - `schema.sql` — SQLite schema (events + workday hours)
  - `queries.py` — general SQL helpers (tasks/alerts etc., task priority ordering)
  - `event_queries.py` — events CRUD + date filtering
  - `reminder_queries.py` — schedules/active reminders + logs
  - `workday_queries.py` — work/off day lookup + per‑day hours
  - `reminder_seed.py` — seeds default schedules (e.g. “lanny zee”, morning/lunch/evening meds)  
  **SQL lives here**, not sprinkled through routes/services.

- `backend/app/services/` (business logic)
  - `dashboard_service.py` — builds the dashboard view from DB state
- `scheduler_service.py` — APScheduler jobs:
  - **arms today’s reminders** based on work/off day
  - runs a **nag loop** (checks every 5s; meds repeat every 5 min until “done” or 30‑minute window ends)
  - `event_reminder_service.py` — event reminder cadence (monthly → weekly → daily → day‑of)
  - `calendar_service.py` — add events/holidays + conflict checking *(later)*
  - `task_service.py` — one-at-a-time tasks + breakdown *(later)*
  - `reminder_service.py` — escalation rules + reminder state machine *(later)*
  - `relevance_service.py` — “should we speak?” gate + anti-spam *(later)*
  - `voice_service.py` — local TTS (Piper) helpers
  - `llm_service.py` — OpenAI Responses + tool-calling loop *(later)*

- `backend/requirements.txt`  
  Python dependencies.

### Frontend (kiosk UI) — `frontend/`
- Vite + React + TypeScript (kiosk dashboard UI)
- `frontend/src/App.tsx` — main dashboard screen
- `frontend/src/App.css` — kiosk styling (layout/spacing/colours)
- `frontend/src/api.ts` — calls to backend endpoints
- `frontend/src/components/` — UI/background components (e.g. DarkVeil, FunFactCard)
- `frontend/src/hooks/` — UI hooks (e.g. `useFunFact`)
- AI assistant responses render top‑center in italics for quick glance feedback

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

---

## Reminder timing (current behavior)
- Reminders only **surface during their 30‑minute window** (from scheduled time to +30 min)
- Med reminders **nag every 5 minutes** during that window
- Non‑med reminders **speak once** at first fire (no nag loop repeats)
- Past the window, reminders are marked **missed** if not done
- UI shows `taken`/`missed` states (greyed) and sorts active‑window items first

## Events (current behavior)
- Events list shows **today only**, with “now” or “in X…” based on the time range
- Event reminders are **opt‑in** (`reminder_preset = standard`); default is **none**

## Fun fact timing (current behavior)
- Stored in `localStorage` to survive refresh (`funFactText`, `funFactFetchedAtISO`)
- Fetch is gated by time slots (Europe/London): **09:00, 13:00, 17:00, 21:00**
- Manual “New fact” button forces a refresh and updates the slot id

## AI + TTS (current behavior)
- `POST /api/ai/respond` calls OpenAI Responses with:
  - last 24h of messages from `ai_messages`
  - injected profile memory from `ai_memories` (relevance-based selection)
- After each user prompt, the server tries to extract long-term memories and save them.
- `POST /api/tts` returns an OGG/Opus file generated by Piper.
- Frontend auto-speaks AI responses via `/api/tts` (can be toggled later).
- Med reminders speak via Piper every 5 minutes during the 30-minute window using their `speak_text`, prefixed with “Hey Sam,”.
- Non‑med reminders speak once (first fire only) and are also prefixed with “Hey Sam,”.

### AI memory (short-term + long-term)
- **Short-term context**: last 24 hours of user/assistant messages from `ai_messages`.
- **Long-term profile memory**: facts saved in `ai_memories` (projects, relationships, preferences, ongoing goals).
  - **Short memories**: under 50 words, up to 300 stored.
  - **Long memories**: over 50 words, up to 200 stored.
- Least-recently-used memories are pruned when caps are exceeded (uses `last_used_at`).
- Schedules/workday swaps should not be stored here.
- Manual memory: say “remember …” to save an explicit fact.
- Identity capture: “X is my son/daughter/…” is saved immediately.
- Relation capture: “Her friend is Nichola” is saved using recent context (e.g., “my wife is Deb”).
- Descriptor capture: “X is a/an …” is saved as a memory (e.g., “Roddy is a border collie”).

### Relevance selection (embeddings + cosine similarity)
To avoid sending *all* memories every time, the server picks the most relevant ones:
- Each memory stores an **embedding** (a numeric vector representing meaning).
- Each new user prompt is also embedded.
- **Cosine similarity** compares the prompt vector with each memory vector:
  - Score near **1.0** = very similar meaning
  - Score near **0.0** = unrelated
- The server injects only the **top‑K** memories (default 8).
  - If embedding lookup fails, it falls back to the latest memories.

### Example workflow (Dad preference)
User: “Dad hates loud alarms; he prefers gentle reminders.”
1) **Main response call** generates the assistant reply.
2) **Memory extraction call** decides this is worth saving.
3) **Memory embedding call** stores a vector for “Dad prefers gentle reminders.”

Later, user: “What reminder style should I use?”
1) **Prompt embedding call** embeds the new question.
2) **Similarity search** picks the “gentle reminders” memory.
3) **Main response call** replies using that memory.

### OpenAI call counts per interaction
- **A) Message, no memories saved**
  - main response (1)
  - memory extraction (1)
  - prompt embedding (1)
  - **Total: 3 calls**
- **B) Message, 1 memory saved**
  - main response (1)
  - memory extraction (1)
  - prompt embedding (1)
  - memory embedding (1)
  - **Total: 4 calls**
- **C) Message, 3 memories saved**
  - main response (1)
  - memory extraction (1)
  - prompt embedding (1)
  - memory embedding (3)
  - **Total: 6 calls**
- **D) If embeddings are disabled**
  - main response (1)
  - memory extraction (1)
  - **Total: 2 calls**

## AI scheduling + completion (current behavior)
### Schedule intent (`/api/ai/schedule`)
- Detects **events**, **reminders**, and **tasks** from natural language.
- Rules:
  - “Remind me …” → reminder (alert).
  - “I need to / I have to / add a task / todo …” → task.
- Reminders without a time default to **now + 1 hour**.
- Relative times like **“in 1 minute/hour”** are parsed and scheduled correctly.
- Reminders create **alerts** (not events), so they appear in the Alerts card.
- Events appear in the Today card and can optionally create reminders via presets.
### Today summary phrasing (`/api/ai/respond`)
- “What have I got today?” and similar phrases return a summary of today’s events, work hours, tasks, and non‑med alerts.
- Time windows are spoken as “start until end” (e.g., “8 am until 4:30 pm”) for natural TTS.

### Completion intent (`/api/ai/resolve`)
- Detects “I did/finished/completed/called/took …” and tries to **resolve** items.
- Resolution is **cross‑type** (tasks + reminders + events), not dependent on model target.
- Matching uses token overlap (e.g. “docs” ↔ “doctors”) and falls back to recent reminders.
- Actions:
  - Tasks → mark done
  - Reminders → mark done
  - Events → delete (and remove their reminders)

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
