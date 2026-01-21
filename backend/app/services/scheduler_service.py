from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

from backend.app.db.reminder_seed import seed_defaults_if_empty
from backend.app.db.workday_queries import is_work_day
from backend.app.services.event_reminder_service import create_event_reminders_for_date
from backend.app.services.voice_service import synthesize_and_play_async
from backend.app.db.reminder_queries import (
    get_schedules_for_day_type,
    create_active_for_date,
    get_due_active,
    set_next_fire,
    log_action,
    mark_missed,
)

TZ = ZoneInfo("Europe/London")
scheduler = BackgroundScheduler(timezone=TZ)

def start_scheduler():
    seed_defaults_if_empty()
    arm_today()

    scheduler.add_job(
        func=arm_today,
        trigger=CronTrigger(hour=0, minute=1, timezone=TZ),
        id="arm_today",
        replace_existing=True,
    )

    scheduler.add_job(
        func=_nag_tick,
        trigger=IntervalTrigger(seconds=20),
        id="nag_tick",
        replace_existing=True,
    )

    scheduler.start()

def arm_today():
    today = datetime.now(TZ).date().isoformat()
    day_type = "work" if is_work_day(today) else "off"

    schedules = get_schedules_for_day_type(day_type)
    for s in schedules:
        hh, mm = s["time_hhmm"].split(":")
        fire_dt = datetime.now(TZ).replace(hour=int(hh), minute=int(mm), second=0, microsecond=0)
        create_active_for_date(
            reminder_key=s["reminder_key"],
            label=s["label"],
            speak_text=s["speak_text"],
            dose_date=today,
            scheduled_hhmm=s["time_hhmm"],
            next_fire_at_iso=fire_dt.isoformat(timespec="seconds"),
        )

    create_event_reminders_for_date(today)

def _nag_tick():
    now_dt = datetime.now(TZ)
    now_iso = now_dt.isoformat(timespec="seconds")
    row = get_due_active(now_iso)
    if not row:
        return

    hh, mm = row["scheduled_hhmm"].split(":")
    due_dt = datetime(
        year=int(row["dose_date"][:4]),
        month=int(row["dose_date"][5:7]),
        day=int(row["dose_date"][8:10]),
        hour=int(hh),
        minute=int(mm),
        tzinfo=TZ,
    )
    window_end = due_dt + timedelta(minutes=30)
    if now_dt > window_end:
        mark_missed(row["id"])
        log_action(row["reminder_key"], "missed")
        return

    print(f"[REMINDER] active_id={row['id']} | due={row['scheduled_hhmm']} | {row['label']} - {row['speak_text']}")
    log_action(row["reminder_key"], "fired")
    if row["reminder_key"] in {"lanny_zee", "morning_meds", "lunch_meds", "evening_meds"}:
        speak_text = f"Hey Sam, {row['speak_text']}"
        synthesize_and_play_async(speak_text)
    row_next_fire = datetime.fromisoformat(row["next_fire_at"])
    if row_next_fire.tzinfo is None:
        row_next_fire = row_next_fire.replace(tzinfo=TZ)
    next_fire_dt = row_next_fire + timedelta(minutes=5)
    if next_fire_dt > window_end:
        next_fire_dt = window_end
    set_next_fire(row["id"], next_fire_dt.isoformat(timespec="seconds"))
