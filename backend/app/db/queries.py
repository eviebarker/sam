"""Task and alert query helpers for the dashboard/API."""

from datetime import datetime
from backend.app.db.conn import get_conn

def get_alerts() -> list[str]:
    """Return the latest alert messages (max 10)."""
    with get_conn() as conn:
        rows = conn.execute("SELECT message FROM alerts ORDER BY id DESC LIMIT 10;").fetchall()
    return [r["message"] for r in rows]

def get_next_task() -> str | None:
    """Return the highest-priority todo task title (or None)."""
    with get_conn() as conn:
        row = conn.execute(
            """
            SELECT title
            FROM tasks
            WHERE status='todo'
            ORDER BY
              CASE priority
                WHEN 'vital' THEN 0
                WHEN 'medium' THEN 1
                WHEN 'trivial' THEN 2
                ELSE 3
              END,
              id ASC
            LIMIT 1;
            """
        ).fetchone()
    return row["title"] if row else None

def get_tasks() -> list[dict]:
    """List todo tasks ordered by priority then id."""
    with get_conn() as conn:
        rows = conn.execute(
            """
            SELECT id, title, priority, status, created_at
            FROM tasks
            WHERE status='todo'
            ORDER BY
              CASE priority
                WHEN 'vital' THEN 0
                WHEN 'medium' THEN 1
                WHEN 'trivial' THEN 2
                ELSE 3
              END,
              id ASC;
            """
        ).fetchall()
    return [dict(r) for r in rows]

def add_task(title: str, priority: str = "medium") -> None:
    """Insert a new task with status=todo."""
    with get_conn() as conn:
        conn.execute(
            """
            INSERT INTO tasks (title, priority, status, created_at)
            VALUES (?, ?, 'todo', ?);
            """,
            (title, priority, datetime.now().isoformat(timespec="seconds")),
        )
        conn.commit()

def mark_task_done(task_id: int) -> None:
    """Mark a task as done by id."""
    with get_conn() as conn:
        conn.execute("UPDATE tasks SET status='done' WHERE id = ?;", (task_id,))
        conn.commit()

def mark_all_tasks_done() -> int:
    """Mark all todo tasks as done; returns count updated."""
    with get_conn() as conn:
        cur = conn.execute("UPDATE tasks SET status='done' WHERE status='todo';")
        conn.commit()
        return cur.rowcount

def update_task_priority(task_id: int, priority: str) -> None:
    """Update a task's priority."""
    with get_conn() as conn:
        conn.execute(
            "UPDATE tasks SET priority = ? WHERE id = ?;", (priority, task_id)
        )
        conn.commit()


def list_open_tasks() -> list[dict]:
    """List open tasks (status=todo) ordered by priority then id."""
    with get_conn() as conn:
        rows = conn.execute(
            """
            SELECT id, title, priority, status, created_at
            FROM tasks
            WHERE status='todo'
            ORDER BY
              CASE priority
                WHEN 'vital' THEN 0
                WHEN 'medium' THEN 1
                WHEN 'trivial' THEN 2
                ELSE 3
              END,
              id ASC;
            """
        ).fetchall()
    return [dict(r) for r in rows]
