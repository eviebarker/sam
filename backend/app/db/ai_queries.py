from datetime import datetime
from typing import Iterable
from backend.app.db.conn import get_conn


def add_ai_message(role: str, content: str, created_at: str | None = None) -> None:
    ts = created_at or datetime.utcnow().isoformat(timespec="seconds")
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO ai_messages (role, content, created_at) VALUES (?, ?, ?)",
            (role, content, ts),
        )
        conn.commit()


def list_ai_messages_since(since_iso: str) -> list[dict]:
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT role, content, created_at FROM ai_messages "
            "WHERE created_at >= ? ORDER BY created_at ASC",
            (since_iso,),
        ).fetchall()
    return [dict(r) for r in rows]


def add_ai_memory(summary: str, created_at: str | None = None) -> None:
    ts = created_at or datetime.utcnow().isoformat(timespec="seconds")
    with get_conn() as conn:
        conn.execute(
            "INSERT OR IGNORE INTO ai_memories (summary, created_at) VALUES (?, ?)",
            (summary, ts),
        )
        conn.commit()


def list_ai_memories(limit: int = 20) -> list[dict]:
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT summary, created_at FROM ai_memories "
            "ORDER BY created_at DESC LIMIT ?",
            (limit,),
        ).fetchall()
    return [dict(r) for r in rows]
