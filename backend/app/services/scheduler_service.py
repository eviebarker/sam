from datetime import datetime
from zoneinfo import ZoneInfo
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

from backend.app.db.reminder_seed import seed_defaults_if_empty
from backend.app.db.workday_queries import is_work_day
from backend.app.db.reminder_queries import (
    get_schedules_for_day_type,
    create_active_for_date,
    get_due_active,
    bump_next_fire,
    log_action,
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

def _nag_tick():
    now = datetime.now(TZ).isoformat(timespec="seconds")
    row = get_due_active(now)
    if not row:
        return

    print(f"[REMINDER] active_id={row['id']} | due={row['scheduled_hhmm']} | {row['label']} - {row['speak_text']}")
    log_action(row["reminder_key"], "fired")
    bump_next_fire(row["id"], minutes=5)
