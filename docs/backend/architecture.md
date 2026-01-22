# Architecture

The backend is a FastAPI app with a thin API layer, service layer for business logic, and SQLite data layer. Routes validate inputs, delegate to services, and return responses.

## Flow of a request
- Routes live under `backend/app/api/` and expose JSON endpoints.
- Services in `backend/app/services/` implement scheduling, reminders, dashboard assembly, voice helpers, and AI calls.
- Database helpers in `backend/app/db/` own SQL and migrations; services call into them.
- Shared config sits in `backend/app/core/`.

## Key modules
- `main.py`: FastAPI app factory, router registration, scheduler startup, `/health`.
- `api/`: Thin routes (dashboard, tasks, reminders, workdays, events, STT/TTS, AI).
- `services/`: Business logic (reminder cadence, scheduler jobs, dashboard aggregation, voice + STT).
- `db/`: SQLite connection, schema, and query helpers for events, reminders, workdays, and seeds.
- `core/config.py`: Environment-driven settings (timezone, API keys, file paths).

## Background work
- `services/scheduler_service.py` registers APScheduler jobs to arm reminders and run nag loops.
- `services/event_reminder_service.py` handles cadence for event notifications (monthly → weekly → daily → day-of).
- Voice and AI helpers live in `voice_service.py` and `speech_to_text.py`, called by routes.

## API surface
- Health: `GET /health`
- Dashboard: `GET /api/dashboard`
- Tasks: `GET/POST /api/tasks`, `POST /api/tasks/{id}/done`, `POST /api/tasks/{id}/priority`
- Reminders: `GET /api/reminders/active`, `POST /api/reminders/done`
- Workdays: `POST /api/workdays`, `GET /api/workdays/{date}`
- Events: `GET/POST /api/events`
- Voice: `POST /api/tts`, `POST /api/stt`
- AI: `POST /api/ai/respond`
