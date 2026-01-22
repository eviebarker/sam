"""Dashboard endpoint exposing the current kiosk view state."""

from fastapi import APIRouter
from pydantic import BaseModel
from backend.app.services.dashboard_service import build_dashboard

router = APIRouter()

class Dashboard(BaseModel):
    now: str
    today_summary: str
    alerts: list[str]
    next_task: str | None

@router.get("/api/dashboard", response_model=Dashboard)
def dashboard():
    """Return the current dashboard payload (alerts, next task, timestamp)."""
    return build_dashboard()
