import os
import json
import math
import uuid
import re
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import OpenAI
from backend.app.db.ai_queries import (
    add_ai_message,
    add_ai_memory,
    list_ai_memories,
    list_ai_messages_since,
    list_ai_memories_with_embeddings,
    prune_ai_memories,
    touch_ai_memories,
)
from backend.app.db.event_queries import add_event, delete_event, list_events_from_date
from backend.app.db.queries import add_task, list_open_tasks, mark_task_done
from backend.app.db.reminder_queries import (
    create_active_for_date,
    delete_event_reminders,
    list_active_reminders,
    list_recent_reminders,
    mark_done,
)
from backend.app.services.event_reminder_service import create_event_reminders_for_date

router = APIRouter()
TZ = ZoneInfo("Europe/London")


class AiRequest(BaseModel):
    text: str


class ScheduleRequest(BaseModel):
    text: str


class ScheduleResult(BaseModel):
    action: str
    title: str
    date: str | None = None
    start_hhmm: str | None = None
    end_hhmm: str | None = None
    all_day: bool = False
    priority: str | None = None


class ResolveRequest(BaseModel):
    text: str


class ResolveResult(BaseModel):
    action: str
    target: str
    title: str | None = None


def get_client() -> OpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not set")
    return OpenAI(api_key=api_key)

def _cosine_similarity(a: list[float], b: list[float]) -> float:
    if len(a) != len(b):
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(y * y for y in b))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return dot / (norm_a * norm_b)


def _embed_text(client: OpenAI, text: str, model: str) -> list[float]:
    response = client.embeddings.create(model=model, input=text)
    return response.data[0].embedding


def _parse_resolve(client: OpenAI, text: str, model: str) -> ResolveResult | None:
    system_prompt = (
        "You detect completion intents. Return JSON with fields: "
        "action ('complete'|'delete'|'none'), target ('task'|'reminder'|'event'|'none'), "
        "title (string or null). "
        "If the user says they did/finished/completed something, action=complete. "
        "If they want to remove/cancel an event, action=delete and target=event. "
        "If no completion intent, action=none."
    )
    response = client.responses.create(
        model=model,
        input=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": text},
        ],
        store=False,
        text={
            "format": {
                "type": "json_schema",
                "name": "resolve_intent",
                "strict": True,
                "schema": {
                    "type": "object",
                    "additionalProperties": False,
                    "properties": {
                        "action": {
                            "type": "string",
                            "enum": ["complete", "delete", "none"],
                        },
                        "target": {
                            "type": "string",
                            "enum": ["task", "reminder", "event", "none"],
                        },
                        "title": {"type": ["string", "null"]},
                    },
                    "required": ["action", "target", "title"],
                },
            }
        },
    )
    output_text = response.output_text or ""
    try:
        payload = json.loads(output_text)
    except Exception:
        return None
    try:
        return ResolveResult(**payload)
    except Exception:
        return None


def _parse_schedule(client: OpenAI, text: str, model: str) -> ScheduleResult | None:
    today = datetime.now(TZ).date().isoformat()
    system_prompt = (
        "You extract scheduling intents. Today is "
        f"{today} (Europe/London). "
        "Return JSON with fields: action ('event'|'reminder'|'task'|'none'), "
        "title, date (YYYY-MM-DD or null), start_hhmm (HH:MM or null), "
        "end_hhmm (HH:MM or null), all_day (true/false), "
        "priority ('trivial'|'medium'|'vital' or null). "
        "If no time is specified, set all_day=true and times null. "
        "For reminders, the title should be the reminder text. "
        "For tasks, date/time can be null. "
        "If no scheduling intent, set action='none'."
        "Examples: "
        "'I have to fold the laundry later today' -> action=task, title='Fold the laundry'. "
        "'Remind me to call the doctor tomorrow at 10am' -> action=reminder, date=tomorrow. "
        "'Lunch with Alex next Tuesday 1-2pm' -> action=event."
    )
    response = client.responses.create(
        model=model,
        input=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": text},
        ],
        store=False,
        text={
            "format": {
                "type": "json_schema",
                "name": "schedule_intent",
                "strict": True,
                "schema": {
                    "type": "object",
                    "additionalProperties": False,
                    "properties": {
                        "action": {
                            "type": "string",
                            "enum": ["event", "reminder", "task", "none"],
                        },
                        "title": {"type": "string"},
                        "date": {"type": ["string", "null"]},
                        "start_hhmm": {"type": ["string", "null"]},
                        "end_hhmm": {"type": ["string", "null"]},
                        "all_day": {"type": "boolean"},
                        "priority": {
                            "type": ["string", "null"],
                            "enum": ["trivial", "medium", "vital", None],
                        },
                    },
                    "required": [
                        "action",
                        "title",
                        "date",
                        "start_hhmm",
                        "end_hhmm",
                        "all_day",
                        "priority",
                    ],
                },
            }
        },
    )
    output_text = response.output_text or ""
    try:
        payload = json.loads(output_text)
    except Exception:
        return None
    try:
        return ScheduleResult(**payload)
    except Exception:
        return None


@router.post("/api/ai/respond")
def ai_respond(body: AiRequest):
    prompt = body.text.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="text is required")

    client = get_client()
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    memory_model = os.getenv("OPENAI_MEMORY_MODEL", model)
    embedding_model = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")
    top_k = int(os.getenv("AI_MEMORY_TOP_K", "8"))
    now = datetime.utcnow()
    since = (now - timedelta(days=1)).isoformat(timespec="seconds")

    history = list_ai_messages_since(since)
    memories = []
    memories_with_embeddings = list_ai_memories_with_embeddings()
    selected_memory_ids = []
    if memories_with_embeddings:
        try:
            prompt_embedding = _embed_text(client, prompt, embedding_model)
            scored = []
            for memory in memories_with_embeddings:
                try:
                    emb = json.loads(memory["embedding"])
                except Exception:
                    continue
                score = _cosine_similarity(prompt_embedding, emb)
                scored.append((score, memory))
            scored.sort(key=lambda item: item[0], reverse=True)
            memories = [m for _, m in scored[:top_k]]
            selected_memory_ids = [m["id"] for m in memories]
        except Exception:
            memories = []
    if not memories:
        memories = list_ai_memories(limit=20)
    if selected_memory_ids:
        touch_ai_memories(selected_memory_ids)

    system_prompt = os.getenv(
        "AI_SYSTEM_PROMPT",
        "You are Sam, a warm, helpful assistant. Keep responses concise and kind.",
    )

    messages = [{"role": "system", "content": system_prompt}]
    if memories:
        memory_lines = "\n".join(f"- {m['summary']}" for m in memories)
        messages.append({"role": "system", "content": f"Profile memory:\n{memory_lines}"})
    messages.extend({"role": m["role"], "content": m["content"]} for m in history)
    messages.append({"role": "user", "content": prompt})

    try:
        response = client.responses.create(
            model=model,
            input=messages,
            store=False,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"AI failed: {exc}") from exc

    output_text = response.output_text
    if not output_text:
        raise HTTPException(status_code=500, detail="AI returned empty response")

    add_ai_message("user", prompt, now.isoformat(timespec="seconds"))
    add_ai_message("assistant", output_text, datetime.utcnow().isoformat(timespec="seconds"))

    try:
        memory_prompt = (
            "Extract long-term memories worth saving about projects, relationships, "
            "preferences (likes/dislikes), or ongoing goals. Do NOT save schedules, "
            "calendar details, or workday swaps. Return a JSON array of sentences; "
            "short memories should be under 50 words. Longer memories can be any length. "
            "If none, return []."
        )
        memory_resp = client.responses.create(
            model=memory_model,
            input=[
                {"role": "system", "content": memory_prompt},
                {"role": "user", "content": prompt},
            ],
            store=False,
        )
        mem_text = memory_resp.output_text or "[]"
        items = json.loads(mem_text)
        if isinstance(items, list):
            for item in items:
                if isinstance(item, str):
                    cleaned = item.strip()
                    if cleaned:
                        try:
                            emb = _embed_text(client, cleaned, embedding_model)
                        except Exception:
                            emb = None
                        add_ai_memory(cleaned, embedding=emb)
            prune_ai_memories("short", 300)
            prune_ai_memories("long", 200)
    except Exception:
        pass

    return {"text": output_text}


def _match_by_title(candidates: list[dict], title: str | None, key: str) -> dict | None:
    if not candidates:
        return None
    if not title:
        return candidates[0]
    lowered = title.lower()
    for item in candidates:
        value = str(item.get(key, "")).lower()
        if lowered in value:
            return item
    return candidates[0]


def _tokenize(text: str) -> list[str]:
    normalized = text.lower()
    normalized = normalized.replace("docs", "doctors")
    normalized = normalized.replace("doc", "doctor")
    return re.findall(r"[a-z0-9']+", normalized)


def _best_match(prompt: str, candidates: list[dict], key: str) -> dict | None:
    if not candidates:
        return None
    prompt_tokens = set(_tokenize(prompt))
    best = None
    best_score = 0.0
    for item in candidates:
        title = str(item.get(key, ""))
        title_tokens = set(_tokenize(title))
        if not title_tokens:
            continue
        overlap = prompt_tokens.intersection(title_tokens)
        score = len(overlap) / max(len(title_tokens), 1)
        if score > best_score:
            best_score = score
            best = item
    if best_score >= 0.3:
        return best
    return None


@router.post("/api/ai/resolve")
def ai_resolve(body: ResolveRequest):
    prompt = body.text.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="text is required")

    client = get_client()
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    parsed = _parse_resolve(client, prompt, model)
    if not parsed or parsed.action == "none":
        completion_words = {"done", "did", "finished", "completed", "called", "took"}
        if any(word in _tokenize(prompt) for word in completion_words):
            tasks = list_open_tasks()
            reminders = list_active_reminders()
            today = datetime.now(TZ).date().isoformat()
            events = [dict(e) for e in list_events_from_date(today)]

            task_match = _best_match(prompt, tasks, "title")
            reminder_match = _best_match(prompt, reminders, "label")
            if not reminder_match:
                reminder_match = _best_match(prompt, list_recent_reminders(), "label")
            event_match = _best_match(prompt, events, "title")

            if reminder_match:
                if reminder_match.get("status") != "done":
                    mark_done(reminder_match["id"])
                return {
                    "ok": True,
                    "action": "complete",
                    "target": "reminder",
                    "reminder": reminder_match,
                }
            if task_match:
                mark_task_done(task_match["id"])
                return {
                    "ok": True,
                    "action": "complete",
                    "target": "task",
                    "task": task_match,
                }
            if event_match:
                delete_event_reminders(event_match["id"])
                delete_event(event_match["id"])
                return {
                    "ok": True,
                    "action": "delete",
                    "target": "event",
                    "event": event_match,
                }
        return {"ok": False, "message": "No completion intent detected."}

    # Match across tasks + reminders + events regardless of model target.
    tasks = list_open_tasks()
    reminders = list_active_reminders()
    reminders_recent = list_recent_reminders()
    today = datetime.now(TZ).date().isoformat()
    events = [dict(e) for e in list_events_from_date(today)]

    task_match = _best_match(prompt, tasks, "title") or _match_by_title(tasks, parsed.title, "title")
    reminder_match = (
        _best_match(prompt, reminders, "label")
        or _best_match(prompt, reminders_recent, "label")
        or _match_by_title(reminders, parsed.title, "label")
        or _match_by_title(reminders_recent, parsed.title, "label")
    )
    event_match = _best_match(prompt, events, "title") or _match_by_title(events, parsed.title, "title")

    if reminder_match:
        if reminder_match.get("status") != "done":
            mark_done(reminder_match["id"])
        return {
            "ok": True,
            "action": "complete",
            "target": "reminder",
            "reminder": reminder_match,
        }
    if task_match:
        mark_task_done(task_match["id"])
        return {"ok": True, "action": "complete", "target": "task", "task": task_match}
    if event_match:
        delete_event_reminders(event_match["id"])
        delete_event(event_match["id"])
        return {"ok": True, "action": "delete", "target": "event", "event": event_match}

    return {"ok": False, "message": "No matching item found."}


@router.post("/api/ai/schedule")
def ai_schedule(body: ScheduleRequest):
    prompt = body.text.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="text is required")

    client = get_client()
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    parsed = _parse_schedule(client, prompt, model)
    if not parsed or parsed.action == "none":
        return {"ok": False, "message": "No scheduling intent detected."}

    lowered = prompt.lower()
    if lowered.startswith("remind me"):
        parsed.action = "reminder"
    elif any(phrase in lowered for phrase in ("i need to", "i have to", "add a task", "todo")):
        parsed.action = "task"

    if parsed.action == "task":
        priority = parsed.priority or "medium"
        if priority not in {"trivial", "medium", "vital"}:
            priority = "medium"
        add_task(parsed.title, priority)
        return {
            "ok": True,
            "action": parsed.action,
            "task": {"title": parsed.title, "priority": priority},
        }

    if parsed.action == "reminder":
        today = datetime.now(TZ).date().isoformat()
        reminder_date = parsed.date or today
        if reminder_date < today:
            raise HTTPException(status_code=400, detail="date must be today or later")
        scheduled_hhmm = parsed.start_hhmm
        relative_match = re.search(
            r"\bin\s+(\d+)\s*(minute|minutes|hour|hours)\b", lowered
        )
        if relative_match:
            amount = int(relative_match.group(1))
            unit = relative_match.group(2)
            delta = timedelta(minutes=amount) if "minute" in unit else timedelta(hours=amount)
            target_dt = datetime.now(TZ) + delta
            reminder_date = target_dt.date().isoformat()
            scheduled_hhmm = target_dt.strftime("%H:%M")
        if not scheduled_hhmm:
            now_dt = datetime.now(TZ) + timedelta(hours=1)
            scheduled_hhmm = now_dt.strftime("%H:%M")
        hh, mm = scheduled_hhmm.split(":")
        fire_dt = datetime.now(TZ).replace(
            year=int(reminder_date[:4]),
            month=int(reminder_date[5:7]),
            day=int(reminder_date[8:10]),
            hour=int(hh),
            minute=int(mm),
            second=0,
            microsecond=0,
        )
        reminder_key = f"adhoc:{uuid.uuid4()}"
        create_active_for_date(
            reminder_key=reminder_key,
            label=parsed.title,
            speak_text=parsed.title,
            dose_date=reminder_date,
            scheduled_hhmm=scheduled_hhmm,
            next_fire_at_iso=fire_dt.isoformat(timespec="seconds"),
        )
        return {
            "ok": True,
            "action": parsed.action,
            "reminder": {
                "title": parsed.title,
                "date": reminder_date,
                "scheduled_hhmm": scheduled_hhmm,
            },
        }

    reminder_preset = "standard" if parsed.action == "reminder" else "none"
    if not parsed.date:
        raise HTTPException(status_code=400, detail="date is required")
    if not parsed.all_day:
        if not parsed.start_hhmm or not parsed.end_hhmm:
            raise HTTPException(
                status_code=400, detail="start_hhmm and end_hhmm required"
            )

    event_id = add_event(
        title=parsed.title,
        event_date=parsed.date,
        start_hhmm=parsed.start_hhmm,
        end_hhmm=parsed.end_hhmm,
        all_day=parsed.all_day,
        reminder_preset=reminder_preset,
    )

    today = datetime.now(TZ).date().isoformat()
    if parsed.date >= today:
        create_event_reminders_for_date(today)

    return {
        "ok": True,
        "id": event_id,
        "action": parsed.action,
        "event": parsed.model_dump(),
    }
