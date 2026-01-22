"""Task CRUD endpoints for the dashboard."""

from fastapi import APIRouter
from pydantic import BaseModel
from backend.app.db.queries import add_task, get_tasks, mark_task_done, update_task_priority

router = APIRouter()

class NewTask(BaseModel):
    title: str
    priority: str | None = "medium"

class TaskPriorityBody(BaseModel):
    priority: str | None = "medium"

@router.post("/api/tasks")
def create_task(body: NewTask):
    """Create a task with an optional priority (trivial/medium/vital)."""
    priority = body.priority or "medium"
    if priority not in {"trivial", "medium", "vital"}:
        priority = "medium"
    add_task(body.title, priority)
    return {"ok": True}

@router.get("/api/tasks")
def list_tasks():
    """List all tasks (open + completed)."""
    return {"tasks": get_tasks()}

@router.post("/api/tasks/{task_id}/done")
def complete_task(task_id: int):
    """Mark a task as done."""
    mark_task_done(task_id)
    return {"ok": True}


@router.post("/api/tasks/{task_id}/priority")
def set_task_priority(task_id: int, body: TaskPriorityBody):
    """Update a task's priority, defaulting to medium if invalid/missing."""
    priority = body.priority or "medium"
    if priority not in {"trivial", "medium", "vital"}:
        priority = "medium"
    update_task_priority(task_id, priority)
    return {"ok": True, "priority": priority}
