import json
from datetime import datetime
from backend.app.db.conn import get_conn

SHORT_MAX_WORDS = 50


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


def add_ai_memory(
    summary: str,
    embedding: list[float] | None = None,
    created_at: str | None = None,
) -> None:
    words = summary.split()
    word_count = len(words)
    if word_count == 0:
        return
    kind = "short" if word_count <= SHORT_MAX_WORDS else "long"
    ts = created_at or datetime.utcnow().isoformat(timespec="seconds")
    embedding_json = json.dumps(embedding) if embedding else None
    with get_conn() as conn:
        conn.execute(
            "INSERT OR IGNORE INTO ai_memories "
            "(summary, kind, word_count, embedding, created_at) "
            "VALUES (?, ?, ?, ?, ?)",
            (summary, kind, word_count, embedding_json, ts),
        )
        conn.commit()


def list_ai_memories(limit: int = 20) -> list[dict]:
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT summary, kind, word_count, created_at FROM ai_memories "
            "ORDER BY created_at DESC LIMIT ?",
            (limit,),
        ).fetchall()
    return [dict(r) for r in rows]


def list_ai_memories_with_embeddings() -> list[dict]:
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT id, summary, kind, word_count, embedding, last_used_at, created_at "
            "FROM ai_memories "
            "WHERE embedding IS NOT NULL ORDER BY created_at DESC"
        ).fetchall()
    return [dict(r) for r in rows]


def prune_ai_memories(kind: str, max_count: int) -> None:
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT id FROM ai_memories WHERE kind = ? "
            "ORDER BY COALESCE(last_used_at, created_at) DESC",
            (kind,),
        ).fetchall()
        if len(rows) <= max_count:
            return
        delete_ids = [r["id"] for r in rows[max_count:]]
        conn.executemany(
            "DELETE FROM ai_memories WHERE id = ?",
            [(i,) for i in delete_ids],
        )
        conn.commit()


def touch_ai_memories(memory_ids: list[int]) -> None:
    if not memory_ids:
        return
    ts = datetime.utcnow().isoformat(timespec="seconds")
    with get_conn() as conn:
        conn.executemany(
            "UPDATE ai_memories SET last_used_at = ? WHERE id = ?",
            [(ts, mem_id) for mem_id in memory_ids],
        )
        conn.commit()
