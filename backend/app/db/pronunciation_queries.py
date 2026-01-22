"""Pronunciation overrides for TTS (term -> phonetic hint)."""

from datetime import datetime
from backend.app.db.conn import get_conn


def upsert_pronunciation(term: str, pronunciation: str) -> None:
    """Insert or update a pronunciation mapping."""
    now = datetime.utcnow().isoformat(timespec="seconds")
    with get_conn() as conn:
        conn.execute(
            """
            INSERT INTO pronunciations (term, pronunciation, created_at, updated_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(term) DO UPDATE SET
              pronunciation=excluded.pronunciation,
              updated_at=excluded.updated_at;
            """,
            (term, pronunciation, now, now),
        )
        conn.commit()


def list_pronunciations() -> list[dict]:
    """Return pronunciations ordered by latest update."""
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT term, pronunciation FROM pronunciations ORDER BY updated_at DESC;"
        ).fetchall()
    return [dict(r) for r in rows]
