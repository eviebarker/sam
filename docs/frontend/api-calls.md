# API calls

Frontend uses thin wrappers in `frontend/src/api.ts`. Key calls and their backend endpoints:

- Dashboard: `getDashboard()` → `GET /api/dashboard`
- Workday status: `getWorkday(date)` → `GET /api/workdays/{date}`
- Reminders: `getReminders(date)` → `GET /api/reminders/active?date=YYYY-MM-DD`
- Mark reminder done: `doneReminder(id, key)` → `POST /api/reminders/done`
- Tasks: `getTasks()` → `GET /api/tasks`; `doneTask(id)` → `POST /api/tasks/{id}/done`
- Events: `getEvents(date)` → `GET /api/events?date=YYYY-MM-DD`
- TTS: `ttsSpeak(text)` → `POST /api/tts` (returns OGG blob)
- STT: `sttTranscribe(blob)` → `POST /api/stt` (multipart upload)
- AI:
  - `aiRespond(text)` → `POST /api/ai/respond`
  - `aiSchedule(text)` → `POST /api/ai/schedule`
  - `aiResolve(text)` → `POST /api/ai/resolve`
  - `aiReclassify(text)` → `POST /api/ai/reclassify`
  - `aiReclassifyConfirm(target, item_type, item_id)` → `POST /api/ai/reclassify/confirm`
  - `aiPriority(text)` → `POST /api/ai/priority`

If backend URLs change, update the fetch bases in `api.ts` or the Vite proxy config. Keep return shapes in sync with backend response models to avoid UI breakage.
