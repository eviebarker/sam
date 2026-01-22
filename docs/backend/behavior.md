# Behavior overview

Current runtime behavior for reminders, events, AI, and fun facts.

## Reminders
- Active only during a 30-minute window from the scheduled time; marked missed after the window.
- Medication reminders nag every 5 minutes during the window; non-med reminders speak once.
- Event reminders skip events titled “Work”.
- Voice output uses randomized prefixes (e.g., “Hey Sam,”, “Heads up, Sam:”).

## Events
- Event list shows today only.
- Reminders are opt-in (`reminder_preset = standard`); manual creates default to none.
- Standard cadence: monthly (2+ months out), weekly in the final month (28/21/14), then day-before only within 7 days (no day-of alerts).
- Multi-day events are stored as one row per day.

## Fun facts
- Cached in `localStorage` to survive refresh.
- Fetched on fixed London time slots every 2 hours (00:00, 02:00, …, 22:00); no manual refresh.

## AI + TTS
- `/api/ai/respond` uses the last 24h of chat + selected profile memories from `ai_memories`.
- Memories saved via “remember …”, identity/relation heuristics, and condition capture.
- TTS (`/api/tts`) returns OGG/Opus; frontend auto-speaks AI responses.

### AI memory
- Short-term context: last 24h of chat messages.
- Long-term memories stored in `ai_memories` with embeddings for relevance ranking (top‑K inject; fallback to latest).
- Limits: short memories <50 words (up to 300), long memories >=50 words (up to 200); least-used pruned via `last_used_at`.
- Schedules/workday swaps are not stored as memories.

## AI scheduling + completion
- `/api/ai/schedule`: parses events, reminders, tasks, and workday updates from natural language; supports mixed items and task priority hints.
- `/api/ai/resolve`: detects completion/cancellation intents across tasks/reminders/events (avoids med cancellations unless explicitly mentioned).
- `/api/ai/reclassify` (+ `/confirm`): move items between task/reminder/event categories.
- `/api/ai/priority`: change task priority based on intent or explicit title matches.
