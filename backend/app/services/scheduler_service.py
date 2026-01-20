from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from backend.app.services.meds_service import check_and_fire_due_meds
from backend.app.db.med_queries import ensure_default_schedule

scheduler = BackgroundScheduler()

def start_scheduler():
    ensure_default_schedule()

    # Poll for due active meds (MVP). Later we’ll do proper scheduled triggers.
    scheduler.add_job(
        func=_tick,
        trigger=IntervalTrigger(seconds=30),
        id="tick",
        replace_existing=True,
    )
    scheduler.start()

def _tick():
    event = check_and_fire_due_meds()
    if event:
        # MVP: print to console. Next we’ll push via SSE to the frontend.
        print("[PROMPT]", event)
