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
    return build_dashboard()
