import logging
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from backend.app.db.conn import init_db
from backend.app.services.scheduler_service import start_scheduler
from backend.app.api.routes_dashboard import router as dashboard_router
from backend.app.api.routes_tasks import router as tasks_router
from backend.app.api.routes_reminders import router as reminders_router
from backend.app.api.routes_workdays import router as workdays_router
from backend.app.api.routes_events import router as events_router
from backend.app.api.routes_tts import router as tts_router
from backend.app.api.routes_stt import router as stt_router
from backend.app.api.routes_ai import router as ai_router

load_dotenv()
app = FastAPI(title="Sam Kitchen PA")
_log = logging.getLogger(__name__)
STATIC_DIR = Path(__file__).resolve().parent / "static"

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
app.include_router(tts_router)
app.include_router(stt_router)
app.include_router(ai_router)

if STATIC_DIR.exists():
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
else:
    _log.warning("Static frontend not found at %s; API will serve without UI", STATIC_DIR)

@app.get("/{full_path:path}")
def spa_fallback(full_path: str):
    """Return the SPA index for unmatched paths so client-side routing works."""
    index_file = STATIC_DIR / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    raise HTTPException(status_code=404, detail="Not found")
