from datetime import date as Date, datetime
from zoneinfo import ZoneInfo

from backend.app.db.event_queries import list_events_from_date
from backend.app.db.reminder_queries import create_active_for_date

TZ = ZoneInfo("Europe/London")

def _should_remind_today(event_date: Date, today: Date, preset: str) -> bool:
    days_until = (event_date - today).days
    if days_until < 0:
        return False
    if preset != "standard":
        return False
    if days_until == 0:
        return True
    if days_until < 7:
        return True
    if days_until < 30:
        return today.weekday() == event_date.weekday()
    return today.day == event_date.day

def _reminder_time(start_hhmm: str | None, all_day: bool, days_until: int) -> str:
    if days_until == 0 and start_hhmm and not all_day:
        return start_hhmm
    return "09:00"

def create_event_reminders_for_date(date_yyyy_mm_dd: str) -> None:
    today = Date.fromisoformat(date_yyyy_mm_dd)
    events = list_events_from_date(date_yyyy_mm_dd)
    for e in events:
        event_date = Date.fromisoformat(e["event_date"])
        preset = e["reminder_preset"] or "standard"
        if not _should_remind_today(event_date, today, preset):
            continue

        days_until = (event_date - today).days
        scheduled_hhmm = _reminder_time(e["start_hhmm"], bool(e["all_day"]), days_until)
        hh, mm = scheduled_hhmm.split(":")
        fire_dt = datetime.now(TZ).replace(
            year=today.year,
            month=today.month,
            day=today.day,
            hour=int(hh),
            minute=int(mm),
            second=0,
            microsecond=0,
        )
        when = "today" if days_until == 0 else f"in {days_until} day(s)"
        time_range = ""
        if e["start_hhmm"] and e["end_hhmm"]:
            time_range = f" ({e['start_hhmm']}-{e['end_hhmm']})"
        speak_text = f"{e['title']}{time_range} {when}"
        reminder_key = f"event:{e['id']}:{date_yyyy_mm_dd}"
        create_active_for_date(
            reminder_key=reminder_key,
            label=e["title"],
            speak_text=speak_text,
            dose_date=date_yyyy_mm_dd,
            scheduled_hhmm=scheduled_hhmm,
            next_fire_at_iso=fire_dt.isoformat(timespec="seconds"),
        )
