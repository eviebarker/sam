from fastapi import APIRouter
from pydantic import BaseModel
from backend.app.db.queries import add_task, get_tasks, mark_task_done

router = APIRouter()

class NewTask(BaseModel):
    title: str
    priority: str | None = "medium"

@router.post("/api/tasks")
def create_task(body: NewTask):
    priority = body.priority or "medium"
    if priority not in {"trivial", "medium", "vital"}:
        priority = "medium"
    add_task(body.title, priority)
    return {"ok": True}

@router.get("/api/tasks")
def list_tasks():
    return {"tasks": get_tasks()}

@router.post("/api/tasks/{task_id}/done")
def complete_task(task_id: int):
    mark_task_done(task_id)
    return {"ok": True}
