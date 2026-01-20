from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime
from backend.app.db.med_queries import create_or_get_active, log_action, mark_done, bump_active

router = APIRouter()

class StartMed(BaseModel):
    med_name: str = "Meds"

@router.post("/api/meds/start")
def start_meds(body: StartMed):
    active = create_or_get_active(body.med_name, datetime.now().isoformat(timespec="seconds"))
    return {"ok": True, "active_id": active["id"]}

class ConfirmMed(BaseModel):
    active_id: int
    med_name: str = "Meds"

@router.post("/api/meds/done")
def meds_done(body: ConfirmMed):
    mark_done(body.active_id)
    log_action(body.med_name, "done")
    return {"ok": True}

class SnoozeMed(BaseModel):
    active_id: int
    minutes: int = 10
    med_name: str = "Meds"

@router.post("/api/meds/snooze")
def meds_snooze(body: SnoozeMed):
    nxt = bump_active(body.active_id, body.minutes)
    log_action(body.med_name, "snooze")
    return {"ok": True, "next_fire_at": nxt}
