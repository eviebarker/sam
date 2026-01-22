"""Dashboard aggregation helpers for the kiosk frontend."""

from datetime import datetime
from backend.app.db import queries

def build_dashboard() -> dict:
    """Return a snapshot of dashboard data for the API."""
    return {
        "now": datetime.now().isoformat(timespec="seconds"),
        "today_summary": "MVP: SQLite connected.",
        "alerts": queries.get_alerts(),
        "next_task": queries.get_next_task(),
    }
