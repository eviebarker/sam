"""Reminder scheduling and nag loop (APScheduler entrypoints)."""

from datetime import datetime, timedelta
import random
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

_ALERT_PREFIXES = [
    "Hey Sam, {text}",
    "Sam, {text}",
    "Hi Sam, {text}",
    "Sam - {text}",
    "Quick reminder, Sam: {text}",
    "{text}, Sam",
    "Just a heads up, Sam: {text}",
    "Reminder, Sam: {text}",
    "Sam, just a heads up: {text}",
    "Hey Sam - {text}",
    "Sam, reminder: {text}",
    "Hey Sam - reminder: {text}",
    "Sam, quick reminder: {text}",
    "Sam, just a reminder: {text}",
    "Just a reminder, Sam: {text}",
    "Hey Sam, just a reminder: {text}",
    "Sam, heads up: {text}",
    "Heads up, Sam: {text}",
    "Sam, FYI: {text}",
    "FYI, Sam: {text}",
    "Sam, note: {text}",
    "Note, Sam: {text}",
    "Sam, a quick note: {text}",
    "Quick note, Sam: {text}",
    "Hey Sam, quick note: {text}",
    "Sam, a heads up: {text}",
    "Just a heads up, Sam - {text}",
    "Hey Sam, heads up: {text}",
    "Sam, reminder for you: {text}",
    "Reminder for you, Sam: {text}",
]

def _format_alert_speech(text: str) -> str:
    """Apply a randomized prefix to the reminder speech text."""
    template = random.choice(_ALERT_PREFIXES)
    return template.format(text=text)

def start_scheduler():
    """Boot the scheduler, arm today's reminders, and register jobs."""
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
        trigger=IntervalTrigger(seconds=5),
        id="nag_tick",
        replace_existing=True,
    )

    scheduler.start()

def arm_today():
    """Load reminder schedules for the day type and create active rows."""
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
    """Every 5s: fire due reminders, speak, and roll next_fire until window ends."""
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
    med_keys = {"lanny_zee", "morning_meds", "lunch_meds", "evening_meds"}
    row_next_fire = datetime.fromisoformat(row["next_fire_at"])
    if row_next_fire.tzinfo is None:
        row_next_fire = row_next_fire.replace(tzinfo=TZ)
    if row["reminder_key"] in med_keys:
        speak_text = _format_alert_speech(row["speak_text"])
        synthesize_and_play_async(speak_text)
    else:
        # Speak once for non-med reminders (first fire only).
        if abs((row_next_fire - due_dt).total_seconds()) <= 60:
            speak_text = _format_alert_speech(row["speak_text"])
            synthesize_and_play_async(speak_text)
    next_fire_dt = row_next_fire + timedelta(minutes=5)
    if next_fire_dt > window_end:
        next_fire_dt = window_end
    set_next_fire(row["id"], next_fire_dt.isoformat(timespec="seconds"))
