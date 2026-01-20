from fastapi import APIRouter
from pydantic import BaseModel
from backend.app.db.workday_queries import set_work_day, is_work_day, get_work_day

router = APIRouter()

class WorkDayBody(BaseModel):
    date: str      # "YYYY-MM-DD"
    is_work: bool
    start_hhmm: str | None = None
    end_hhmm: str | None = None

@router.post("/api/workdays")
def set_day(body: WorkDayBody):
    set_work_day(body.date, body.is_work, body.start_hhmm, body.end_hhmm)
    return {
        "ok": True,
        "date": body.date,
        "is_work": body.is_work,
        "start_hhmm": body.start_hhmm,
        "end_hhmm": body.end_hhmm,
    }

@router.get("/api/workdays/{date}")
def get_day(date: str):
    work = get_work_day(date)
    return {"date": date, **work}
