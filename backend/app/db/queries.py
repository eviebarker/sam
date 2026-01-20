from datetime import datetime
from backend.app.db.conn import get_conn

def get_alerts() -> list[str]:
    with get_conn() as conn:
        rows = conn.execute("SELECT message FROM alerts ORDER BY id DESC LIMIT 10;").fetchall()
    return [r["message"] for r in rows]

def get_next_task() -> str | None:
    with get_conn() as conn:
        row = conn.execute(
            "SELECT title FROM tasks WHERE status='todo' ORDER BY id ASC LIMIT 1;"
        ).fetchone()
    return row["title"] if row else None

def add_task(title: str) -> None:
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO tasks (title, status, created_at) VALUES (?, 'todo', ?);",
            (title, datetime.now().isoformat(timespec="seconds")),
        )
        conn.commit()
