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
from backend.app.db.event_queries import add_event, delete_event, list_events_for_date, list_events_from_date
from backend.app.db.queries import add_task, get_tasks, list_open_tasks, mark_task_done
from backend.app.db.workday_queries import get_work_day
from backend.app.db.reminder_queries import (
    create_active_for_date,
    delete_event_reminders,
    list_active_reminders,
    list_recent_reminders,
    mark_done,
)
from backend.app.db.pronunciation_queries import upsert_pronunciation
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


class ReclassifyRequest(BaseModel):
    text: str


class ReclassifyConfirmRequest(BaseModel):
    target: str
    item_type: str
    item_id: int


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


def _parse_reclassify(client: OpenAI, text: str, model: str) -> dict | None:
    system_prompt = (
        "You detect reclassify intents. Return JSON with fields: "
        "target ('task'|'reminder'|'event'|'none') and title (string or null). "
        "If the user says something should be moved to a category, extract the title."
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
                "name": "reclassify_intent",
                "strict": True,
                "schema": {
                    "type": "object",
                    "additionalProperties": False,
                    "properties": {
                        "target": {
                            "type": "string",
                            "enum": ["task", "reminder", "event", "none"],
                        },
                        "title": {"type": ["string", "null"]},
                    },
                    "required": ["target", "title"],
                },
            }
        },
    )
    output_text = response.output_text or ""
    try:
        payload = json.loads(output_text)
    except Exception:
        return None
    return payload


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


def _natural_time(hhmm: str | None) -> str:
    if not hhmm:
        return ""
    try:
        dt = datetime.strptime(hhmm, "%H:%M")
        hour = dt.strftime("%I").lstrip("0") or "12"
        minute = dt.strftime("%M")
        suffix = dt.strftime("%p").lower()
        if minute == "00":
            return f"{hour} {suffix}"
        return f"{hour}:{minute} {suffix}"
    except Exception:
        return hhmm


def _family_summary(memories: list[dict]) -> str:
    family_rels = {
        "wife",
        "husband",
        "partner",
        "son",
        "sons",
        "daughter",
        "daughters",
        "dad",
        "father",
        "mum",
        "mom",
        "mother",
        "sister",
        "sisters",
        "brother",
        "brothers",
    }
    members = ["you (Dad)"]
    def add_names(names: list[str], rel: str) -> None:
        for name in names:
            cleaned = name.strip()
            if cleaned:
                members.append(f"{cleaned} ({rel})")

    for mem in memories:
        summary = mem.get("summary", "")
        match = re.match(
            r"^(?P<name>.+?) is my (?P<rel>[A-Za-z ]+)\.?$",
            summary,
            re.IGNORECASE,
        )
        if match:
            name = match.group("name").strip()
            rel = match.group("rel").strip().lower()
            rel = rel[:-1] if rel.endswith("s") else rel
            if rel in family_rels:
                add_names([name], rel)
            continue
        match = re.match(
            r"^my (?P<rel>[A-Za-z ]+) is (?P<name>.+?)\.?$",
            summary,
            re.IGNORECASE,
        )
        if match:
            name = match.group("name").strip()
            rel = match.group("rel").strip().lower()
            rel = rel[:-1] if rel.endswith("s") else rel
            if rel in family_rels:
                add_names([name], rel)
            continue
        match = re.match(
            r"^(?P<names>.+?) are my (?P<rel>[A-Za-z ]+)\.?$",
            summary,
            re.IGNORECASE,
        )
        if match:
            names = match.group("names")
            rel = match.group("rel").strip().lower()
            rel = rel[:-1] if rel.endswith("s") else rel
            if rel in family_rels:
                add_names(re.split(r",| and ", names), rel)
            continue
        match = re.match(
            r"^my (?P<rel>[A-Za-z ]+) are (?P<names>.+?)\.?$",
            summary,
            re.IGNORECASE,
        )
        if match:
            names = match.group("names")
            rel = match.group("rel").strip().lower()
            rel = rel[:-1] if rel.endswith("s") else rel
            if rel in family_rels:
                add_names(re.split(r",| and ", names), rel)
            continue
        match = re.match(
            r"^the (?P<rel>[A-Za-z ]+) is named (?P<name>.+?)\.?$",
            summary,
            re.IGNORECASE,
        )
        if match:
            name = match.group("name").strip()
            rel = match.group("rel").strip().lower()
            rel = rel[:-1] if rel.endswith("s") else rel
            if rel in family_rels:
                add_names([name], rel)
            continue
        match = re.match(
            r"^the family has (?P<rel>[A-Za-z ]+) named (?P<names>.+?)\.?$",
            summary,
            re.IGNORECASE,
        )
        if match:
            names = match.group("names")
            rel = match.group("rel").strip().lower()
            rel = rel.replace("twin ", "")
            rel = rel[:-1] if rel.endswith("s") else rel
            if rel in family_rels:
                add_names(re.split(r",| and ", names), rel)
    if len(members) == 1:
        return "I don't have any family details saved yet."
    return "Your family includes " + ", ".join(members) + "."


def _extract_pronunciation(text: str) -> tuple[str | None, str | None]:
    cleaned = text.strip()
    patterns = [
        r"\bpronounce\s+(?P<term>.+?)\s+(?:as|like)\s+(?P<pron>.+)",
        r"\b(?P<term>.+?)\s+is\s+pronounced\s+(?P<pron>.+)",
        r"\b(?P<term>.+?)\s+should\s+be\s+pronounced\s+(?P<pron>.+)",
        r"\b(it'?s|it is)\s+pronounced\s+(?P<pron>.+)",
        r"\byou\s+should\s+pronounce\s+it\s+(?P<pron>.+)",
    ]
    for pattern in patterns:
        match = re.search(pattern, cleaned, flags=re.IGNORECASE)
        if match:
            term = match.groupdict().get("term")
            pronunciation = match.groupdict().get("pron")
            pronunciation = pronunciation.strip("\"'“”").strip()
            term = term.strip("\"'“”").strip() if term else None
            pronunciation = re.sub(r"[.?!]+$", "", pronunciation).strip()
            return term, pronunciation
    return None, None


def _infer_term_from_history(history: list[dict]) -> str | None:
    for msg in reversed(history[-5:]):
        if msg.get("role") != "user":
            continue
        text = msg.get("content") or ""
        for pattern in (
            r"\bmy name is\s+(?P<term>[A-Za-z][\w'-]*)",
            r"\bi am\s+(?P<term>[A-Za-z][\w'-]*)",
            r"\bi'm\s+(?P<term>[A-Za-z][\w'-]*)",
            r"\bim\s+(?P<term>[A-Za-z][\w'-]*)",
            r"\bwho is\s+(?P<term>[A-Za-z][\w'-]*)",
            r"\bwho's\s+(?P<term>[A-Za-z][\w'-]*)",
            r"\bwho\s+(?P<term>[A-Za-z][\w'-]*)\s+is\b",
            r"\bmy daughter is\s+(?P<term>[A-Za-z][\w'-]*)",
            r"\bmy son is\s+(?P<term>[A-Za-z][\w'-]*)",
        ):
            match = re.search(pattern, text, flags=re.IGNORECASE)
            if match:
                return match.group("term")
    return None


def _infer_possessive_relation(history: list[dict]) -> str | None:
    for msg in reversed(history[-5:]):
        if msg.get("role") != "user":
            continue
        text = msg.get("content") or ""
        match = re.search(
            r"\bmy\s+(wife|husband|partner|son|daughter|dad|father|mum|mom|mother|sister|brother)\s+is\s+([A-Za-z][\w'-]*)\b",
            text,
            flags=re.IGNORECASE,
        )
        if match:
            relation = match.group(1).lower()
            return f"my {relation}"
    return None


@router.post("/api/ai/respond")
def ai_respond(body: AiRequest):
    prompt = body.text.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="text is required")

    lowered = prompt.lower()
    now = datetime.utcnow()
    since = (now - timedelta(days=1)).isoformat(timespec="seconds")
    history = list_ai_messages_since(since)
    if "family" in lowered:
        memories = list_ai_memories(limit=200)
        return {"text": _family_summary(memories)}
    if lowered.startswith("remember "):
        memory_text = prompt[len("remember ") :].strip()
        if memory_text:
            add_ai_memory(memory_text)
            return {"text": "Got it. I'll remember that."}

    identity_match = re.search(
        r"\b([A-Za-z][\w'-]*)\s+is\s+my\s+(son|daughter|wife|husband|partner|dad|father|mum|mom|mother|sister|brother|boyfriend|girlfriend)\b",
        prompt,
        flags=re.IGNORECASE,
    )
    if identity_match:
        name = identity_match.group(1)
        relation = identity_match.group(2)
        add_ai_memory(f"{name} is my {relation}.")
        return {"text": "Got it. I'll remember that."}

    relation_match = re.search(
        r"\b(my|his|her)\s+(friend|boss|coworker|colleague|teacher|doctor|partner|boyfriend|girlfriend|dog|cat)\s+is\s+([A-Za-z][\w'-]*)\b",
        prompt,
        flags=re.IGNORECASE,
    )
    if relation_match:
        owner = relation_match.group(1).lower()
        rel = relation_match.group(2).lower()
        name = relation_match.group(3)
        if owner == "my":
            add_ai_memory(f"{name} is my {rel}.")
            return {"text": "Got it. I'll remember that."}
        possessive = _infer_possessive_relation(history)
        if possessive:
            add_ai_memory(f"{name} is {possessive}'s {rel}.")
            return {"text": "Got it. I'll remember that."}

    possessive_pet = re.search(
        r"\bmy\s+([A-Za-z][\w'-]*)'s\s+(dog|cat)\s+is\s+([A-Za-z][\w'-]*)\b",
        prompt,
        flags=re.IGNORECASE,
    )
    if possessive_pet:
        owner = possessive_pet.group(1)
        pet = possessive_pet.group(2).lower()
        name = possessive_pet.group(3)
        add_ai_memory(f"{name} is {owner}'s {pet}.")
        return {"text": "Got it. I'll remember that."}

    shared_condition = re.search(
        r"\b(me|i)\s+and\s+my\s+(son|daughter|wife|husband|partner|dad|father|mum|mom|mother|sister|brother)\s+have\s+(diagnosed\s+)?(.+)",
        prompt,
        flags=re.IGNORECASE,
    )
    if shared_condition:
        relation = shared_condition.group(2).lower()
        condition = shared_condition.group(4).strip().rstrip(".")
        add_ai_memory(f"Sam has {condition}.")
        add_ai_memory(f"Sam's {relation} has {condition}.")
        return {"text": "Got it. I'll remember that."}

    descriptor_match = re.search(
        r"\b([A-Za-z][\w'-]*)\s+is\s+a[n]?\s+([A-Za-z][\w' -]{2,})\b",
        prompt,
        flags=re.IGNORECASE,
    )
    if descriptor_match:
        name = descriptor_match.group(1)
        descriptor = descriptor_match.group(2).strip()
        add_ai_memory(f"{name} is a {descriptor}.")
        return {"text": "Got it. I'll remember that."}

    term, pronunciation = _extract_pronunciation(prompt)
    if pronunciation:
        if not term:
            term = _infer_term_from_history(history)
        if term:
            upsert_pronunciation(term.lower(), pronunciation)
            return {"text": "Got it."}
    if any(
        phrase in lowered
        for phrase in (
            "what have i got today",
            "what have i got on today",
            "what do i have today",
            "what have i got",
            "what do i have",
            "what's on today",
            "whats on today",
            "what is on today",
            "what is on my schedule today",
            "what's my schedule today",
            "whats my schedule today",
            "what events do i have today",
            "what tasks do i have today",
            "what alerts do i have today",
            "what's happening today",
            "whats happening today",
            "what am i doing today",
            "what am i doing later",
            "what do i have later",
            "what events",
            "what tasks",
            "today's events",
            "todays events",
            "today's tasks",
            "todays tasks",
        )
    ):
        today = datetime.now(TZ).date().isoformat()
        events = list_events_for_date(today)
        tasks = get_tasks()
        workday = get_work_day(today)
        alerts = [
            r
            for r in list_active_reminders()
            if not r["reminder_key"].startswith("event:")
            and r["reminder_key"]
            not in {"lanny_zee", "morning_meds", "lunch_meds", "evening_meds"}
        ]
        event_lines = []
        if workday and workday.get("is_work"):
            work_start = _natural_time(workday.get("start_hhmm") or "08:00")
            work_end = _natural_time(workday.get("end_hhmm") or "16:30")
            event_lines.append(f"{work_start} until {work_end} — Work")
        for e in events:
            if e["all_day"]:
                when = "all day"
            elif e["start_hhmm"] and e["end_hhmm"]:
                start = _natural_time(e["start_hhmm"])
                end = _natural_time(e["end_hhmm"])
                when = f"{start} until {end}"
            else:
                when = _natural_time(e["start_hhmm"]) or "time TBD"
            event_lines.append(f"{when} — {e['title']}")
        task_lines = [t["title"] for t in tasks]
        events_text = ", ".join(event_lines) if event_lines else "none"
        tasks_text = ", ".join(task_lines) if task_lines else "none"
        alert_lines = [
            f"{a['label']} ({_natural_time(a['scheduled_hhmm'])})" for a in alerts
        ]
        alerts_text = ", ".join(alert_lines) if alert_lines else "none"
        summary = (
            f"Today: Events: {events_text}. "
            f"Tasks: {tasks_text}. "
            f"Alerts: {alerts_text}."
        )
        return {"text": summary}

    client = get_client()
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    memory_model = os.getenv("OPENAI_MEMORY_MODEL", model)
    embedding_model = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")
    top_k = int(os.getenv("AI_MEMORY_TOP_K", "8"))
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
        "You are Sam, a warm, helpful assistant. Keep responses concise and kind. "
        "Do not add pronunciation clarifications unless explicitly asked.",
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
            "preferences (likes/dislikes), ongoing goals, and identity facts (who people are, "
            "and how they relate to Dad). Do NOT save schedules, calendar details, workday swaps, "
            "or pronunciation instructions. Return a JSON array of sentences; short memories "
            "should be under 50 words. Longer memories can be any length. If none, return []."
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


def _best_match_with_score(prompt: str, candidates: list[dict], key: str) -> tuple[dict | None, float]:
    if not candidates:
        return None, 0.0
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
        return best, best_score
    return None, 0.0


def _rank_matches(prompt: str, candidates: list[dict], key: str) -> list[dict]:
    prompt_tokens = set(_tokenize(prompt))
    ranked = []
    for item in candidates:
        title = str(item.get(key, ""))
        title_tokens = set(_tokenize(title))
        if not title_tokens:
            continue
        overlap = prompt_tokens.intersection(title_tokens)
        score = len(overlap) / max(len(title_tokens), 1)
        ranked.append({"score": score, "item": item})
    ranked.sort(key=lambda r: r["score"], reverse=True)
    return ranked


def _add_minutes(hhmm: str, minutes: int) -> str:
    hh, mm = hhmm.split(":")
    base = datetime.now(TZ).replace(hour=int(hh), minute=int(mm), second=0, microsecond=0)
    return (base + timedelta(minutes=minutes)).strftime("%H:%M")


def _reclassify_item(item_type: str, item: dict, target: str) -> dict:
    now_dt = datetime.now(TZ)
    today = now_dt.date().isoformat()

    if target == "task":
        add_task(item.get("title") or item.get("label") or "Untitled", "medium")
        if item_type == "reminder":
            if item.get("status") != "done":
                mark_done(item["id"])
        elif item_type == "event":
            delete_event_reminders(item["id"])
            delete_event(item["id"])
        return {"target": "task"}

    if target == "reminder":
        if item_type == "event":
            reminder_date = item["event_date"]
            scheduled_hhmm = item["start_hhmm"] or "09:00"
            label = item["title"]
        else:
            reminder_date = today
            scheduled_hhmm = (now_dt + timedelta(hours=1)).strftime("%H:%M")
            label = item.get("title") or item.get("label") or "Reminder"
            if item_type == "task":
                mark_task_done(item["id"])
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
            label=label,
            speak_text=label,
            dose_date=reminder_date,
            scheduled_hhmm=scheduled_hhmm,
            next_fire_at_iso=fire_dt.isoformat(timespec="seconds"),
        )
        if item_type == "event":
            delete_event_reminders(item["id"])
            delete_event(item["id"])
        return {"target": "reminder", "date": reminder_date, "time": scheduled_hhmm}

    if target == "event":
        if item_type == "reminder":
            reminder_date = item["dose_date"]
            start_hhmm = item["scheduled_hhmm"]
            end_hhmm = _add_minutes(start_hhmm, 30)
            title = item["label"]
        else:
            reminder_date = today
            start_hhmm = None
            end_hhmm = None
            title = item.get("title") or item.get("label") or "Event"
            if item_type == "task":
                mark_task_done(item["id"])
        add_event(
            title=title,
            event_date=reminder_date,
            start_hhmm=start_hhmm,
            end_hhmm=end_hhmm,
            all_day=start_hhmm is None,
            reminder_preset="none",
        )
        if item_type == "reminder":
            if item.get("status") != "done":
                mark_done(item["id"])
        return {"target": "event", "date": reminder_date}

    return {"target": "none"}


@router.post("/api/ai/resolve")
def ai_resolve(body: ResolveRequest):
    prompt = body.text.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="text is required")

    client = get_client()
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    parsed = _parse_resolve(client, prompt, model)
    if not parsed or parsed.action == "none":
        completion_words = {"done", "did", "finished", "completed", "called", "took", "taken"}
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

    completion_tokens = set(_tokenize(prompt))
    med_keys = {"lanny_zee", "morning_meds", "lunch_meds", "evening_meds"}
    allow_meds = any(
        t in completion_tokens
        for t in {
            "med",
            "meds",
            "medication",
            "medicine",
            "pill",
            "tablets",
            "lanny",
            "zee",
            "lansoprazole",
            "lanzoprazole",
        }
    )
    reminders_filtered = [
        r for r in reminders if allow_meds or r.get("reminder_key") not in med_keys
    ]
    reminders_recent_filtered = [
        r for r in reminders_recent if allow_meds or r.get("reminder_key") not in med_keys
    ]

    task_match, task_score = _best_match_with_score(prompt, tasks, "title")
    reminder_match, reminder_score = _best_match_with_score(prompt, reminders_filtered, "label")
    if not reminder_match:
        reminder_match, reminder_score = _best_match_with_score(
            prompt, reminders_recent_filtered, "label"
        )
    event_match, event_score = _best_match_with_score(prompt, events, "title")

    if not task_match:
        task_match = _match_by_title(tasks, parsed.title, "title")
    if not reminder_match:
        reminder_match = _match_by_title(reminders_filtered, parsed.title, "label")
        if not reminder_match:
            reminder_match = _match_by_title(reminders_recent_filtered, parsed.title, "label")
    if not event_match:
        event_match = _match_by_title(events, parsed.title, "title")

    # If user says meds without specifying which, pick the closest due med.
    if allow_meds:
        med_hint = None
        if "morning" in completion_tokens:
            med_hint = "morning_meds"
        elif "lunch" in completion_tokens:
            med_hint = "lunch_meds"
        elif "evening" in completion_tokens or "night" in completion_tokens:
            med_hint = "evening_meds"
        elif (
            "lanny" in completion_tokens
            or "zee" in completion_tokens
            or "lansoprazole" in completion_tokens
            or "lanzoprazole" in completion_tokens
        ):
            med_hint = "lanny_zee"

        if med_hint:
            hint = next(
                (r for r in reminders if r.get("reminder_key") == med_hint), None
            )
            if hint:
                if hint.get("status") != "done":
                    mark_done(hint["id"])
                return {
                    "ok": True,
                    "action": "complete",
                    "target": "reminder",
                    "reminder": hint,
                }

        now_dt = datetime.now(TZ)
        due = []
        for r in reminders:
            if r.get("reminder_key") not in med_keys:
                continue
            try:
                hh, mm = r["scheduled_hhmm"].split(":")
                due_dt = now_dt.replace(hour=int(hh), minute=int(mm), second=0, microsecond=0)
                window_end = due_dt + timedelta(minutes=30)
                if now_dt <= window_end:
                    delta = abs((now_dt - due_dt).total_seconds())
                    due.append((delta, r))
            except Exception:
                continue
        if due:
            due.sort(key=lambda item: item[0])
            choice = due[0][1]
            if choice.get("status") != "done":
                mark_done(choice["id"])
            return {
                "ok": True,
                "action": "complete",
                "target": "reminder",
                "reminder": choice,
            }

        return {"ok": False, "message": "Which meds did you take?"}

    best_target = max(
        [("task", task_score), ("reminder", reminder_score), ("event", event_score)],
        key=lambda item: item[1],
    )[0]

    if best_target == "reminder" and reminder_match:
        if reminder_match.get("status") != "done":
            mark_done(reminder_match["id"])
        return {
            "ok": True,
            "action": "complete",
            "target": "reminder",
            "reminder": reminder_match,
        }
    if best_target == "task" and task_match:
        mark_task_done(task_match["id"])
        return {"ok": True, "action": "complete", "target": "task", "task": task_match}
    if best_target == "event" and event_match:
        delete_event_reminders(event_match["id"])
        delete_event(event_match["id"])
        return {"ok": True, "action": "delete", "target": "event", "event": event_match}

    return {"ok": False, "message": "No matching item found."}


@router.post("/api/ai/reclassify")
def ai_reclassify(body: ReclassifyRequest):
    prompt = body.text.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="text is required")

    client = get_client()
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    parsed = _parse_reclassify(client, prompt, model)
    if not parsed or parsed.get("target") == "none":
        return {"ok": False, "message": "No reclassify intent detected."}

    target = parsed.get("target")
    title = parsed.get("title")
    if not target:
        return {"ok": False, "message": "No target specified."}

    tasks = list_open_tasks()
    reminders = list_active_reminders()
    reminders_recent = list_recent_reminders()
    today = datetime.now(TZ).date().isoformat()
    events = [dict(e) for e in list_events_from_date(today)]

    ranked = []
    ranked += [{"type": "task", **r} for r in _rank_matches(prompt, tasks, "title")]
    ranked += [{"type": "reminder", **r} for r in _rank_matches(prompt, reminders, "label")]
    ranked += [{"type": "reminder", **r} for r in _rank_matches(prompt, reminders_recent, "label")]
    ranked += [{"type": "event", **r} for r in _rank_matches(prompt, events, "title")]
    ranked.sort(key=lambda r: r["score"], reverse=True)

    if not ranked or ranked[0]["score"] < 0.3:
        if title:
            # Try direct title match as fallback.
            for item in tasks:
                if title.lower() in item["title"].lower():
                    return {
                        "ok": True,
                        "result": _reclassify_item("task", item, target),
                    }
        return {"ok": False, "message": "No matching item found."}

    top = ranked[:3]
    if len(top) > 1 and top[1]["score"] >= top[0]["score"] * 0.85:
        options = []
        for entry in top:
            item = entry["item"]
            label = item.get("title") or item.get("label")
            options.append(
                {
                    "item_type": entry["type"],
                    "item_id": item["id"],
                    "label": label,
                }
            )
        return {"ok": False, "needs_confirmation": True, "target": target, "options": options}

    choice = ranked[0]
    result = _reclassify_item(choice["type"], choice["item"], target)
    return {"ok": True, "result": result}


@router.post("/api/ai/reclassify/confirm")
def ai_reclassify_confirm(body: ReclassifyConfirmRequest):
    target = body.target
    item_type = body.item_type
    item_id = body.item_id
    if target not in {"task", "reminder", "event"}:
        raise HTTPException(status_code=400, detail="invalid target")
    if item_type not in {"task", "reminder", "event"}:
        raise HTTPException(status_code=400, detail="invalid item_type")

    if item_type == "task":
        tasks = list_open_tasks()
        item = next((t for t in tasks if t["id"] == item_id), None)
    elif item_type == "reminder":
        reminders = list_active_reminders() + list_recent_reminders()
        item = next((r for r in reminders if r["id"] == item_id), None)
    else:
        today = datetime.now(TZ).date().isoformat()
        events = [dict(e) for e in list_events_from_date(today)]
        item = next((e for e in events if e["id"] == item_id), None)

    if not item:
        return {"ok": False, "message": "Item not found."}

    result = _reclassify_item(item_type, item, target)
    return {"ok": True, "result": result}


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
        if not parsed.start_hhmm:
            raise HTTPException(status_code=400, detail="start_hhmm required")
        if not parsed.end_hhmm:
            parsed.end_hhmm = _add_minutes(parsed.start_hhmm, 30)

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
