from fastapi import APIRouter
from pydantic import BaseModel
from backend.app.db.queries import add_task

router = APIRouter()

class NewTask(BaseModel):
    title: str

@router.post("/api/tasks")
def create_task(body: NewTask):
    add_task(body.title)
    return {"ok": True}
