from fastapi import APIRouter
from pydantic import BaseModel
from backend.app.db.reminder_queries import mark_done, log_action

router = APIRouter()

class DoneBody(BaseModel):
    active_id: int
    reminder_key: str

@router.post("/api/reminders/done")
def reminders_done(body: DoneBody):
    mark_done(body.active_id)
    log_action(body.reminder_key, "done")
    return {"ok": True}
