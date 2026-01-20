from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel

from backend.app.db.reminder_queries import mark_done, log_action, list_for_date

router = APIRouter()
TZ = ZoneInfo("Europe/London")

class DoneBody(BaseModel):
    active_id: int
    reminder_key: str

@router.post("/api/reminders/done")
def reminders_done(body: DoneBody):
    mark_done(body.active_id)
    log_action(body.reminder_key, "done")
    return {"ok": True}

@router.get("/api/reminders/active")
def reminders_active(date: Optional[str] = None):
    # date = YYYY-MM-DD (optional). Defaults to today in Europe/London.
    now_dt = datetime.now(TZ)
    dose_date = date or now_dt.date().isoformat()
    now_iso = now_dt.isoformat(timespec="seconds")

    rows = list_for_date(dose_date)
    reminders = []
    for r in rows:
        hh, mm = r["scheduled_hhmm"].split(":")
        due_dt = datetime(
            year=int(r["dose_date"][:4]),
            month=int(r["dose_date"][5:7]),
            day=int(r["dose_date"][8:10]),
            hour=int(hh),
            minute=int(mm),
            tzinfo=TZ,
        )
        window_end = due_dt + timedelta(minutes=30)
        reminders.append({
            "id": r["id"],
            "reminder_key": r["reminder_key"],
            "label": r["label"],
            "speak_text": r["speak_text"],
            "dose_date": r["dose_date"],
            "scheduled_hhmm": r["scheduled_hhmm"],
            "next_fire_at": r["next_fire_at"],
            "status": r["status"],
            "due_now": r["status"] == "active" and due_dt <= now_dt <= window_end,
        })

    return {"date": dose_date, "now": now_iso, "reminders": reminders}
