from fastapi import FastAPI
from backend.app.db.conn import init_db
from backend.app.services.scheduler_service import start_scheduler
from backend.app.api.routes_dashboard import router as dashboard_router
from backend.app.api.routes_tasks import router as tasks_router
from backend.app.api.routes_reminders import router as reminders_router
from backend.app.api.routes_workdays import router as workdays_router
from backend.app.api.routes_events import router as events_router

app = FastAPI(title="Sam Kitchen PA")

@app.on_event("startup")
def _startup():
    init_db()
    start_scheduler()

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(dashboard_router)
app.include_router(tasks_router)
app.include_router(reminders_router)
app.include_router(workdays_router)
app.include_router(events_router)
