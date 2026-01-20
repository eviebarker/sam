from datetime import datetime
from zoneinfo import ZoneInfo
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.app.db.event_queries import add_event, list_events_for_date
from backend.app.services.event_reminder_service import create_event_reminders_for_date

router = APIRouter()
TZ = ZoneInfo("Europe/London")

class NewEvent(BaseModel):
    title: str
    event_date: str  # YYYY-MM-DD
    start_hhmm: str | None = None  # HH:MM
    end_hhmm: str | None = None  # HH:MM
    all_day: bool = False
    reminder_preset: str | None = "none"

@router.post("/api/events")
def create_event(body: NewEvent):
    preset = body.reminder_preset or "none"
    if not body.all_day:
        if not body.start_hhmm or not body.end_hhmm:
            raise HTTPException(status_code=400, detail="start_hhmm and end_hhmm required")
    event_id = add_event(
        title=body.title,
        event_date=body.event_date,
        start_hhmm=body.start_hhmm,
        end_hhmm=body.end_hhmm,
        all_day=body.all_day,
        reminder_preset=preset,
    )

    today = datetime.now(TZ).date().isoformat()
    if body.event_date >= today:
        create_event_reminders_for_date(today)

    return {"ok": True, "id": event_id}

@router.get("/api/events")
def list_events(date: str):
    events = list_events_for_date(date)
    return {"date": date, "events": [dict(e) for e in events]}
