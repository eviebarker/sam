from fastapi import APIRouter
from pydantic import BaseModel
from backend.app.db.workday_queries import set_work_day, is_work_day

router = APIRouter()

class WorkDayBody(BaseModel):
    date: str      # "YYYY-MM-DD"
    is_work: bool

@router.post("/api/workdays")
def set_day(body: WorkDayBody):
    set_work_day(body.date, body.is_work)
    return {"ok": True, "date": body.date, "is_work": body.is_work}

@router.get("/api/workdays/{date}")
def get_day(date: str):
    return {"date": date, "is_work": is_work_day(date)}
