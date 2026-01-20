from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime

app = FastAPI(title="Sam Kitchen PA")

class Dashboard(BaseModel):
    now: str
    today_summary: str
    alerts: list[str]
    next_task: str | None

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/api/dashboard", response_model=Dashboard)
def dashboard():
    # MVP stub: replace with SQLite reads later
    return Dashboard(
        now=datetime.now().isoformat(timespec="seconds"),
        today_summary="No schedule set yet.",
        alerts=[],
        next_task=None,
    )
