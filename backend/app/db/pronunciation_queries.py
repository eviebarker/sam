from datetime import datetime
from backend.app.db.conn import get_conn


def upsert_pronunciation(term: str, pronunciation: str) -> None:
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
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT term, pronunciation FROM pronunciations ORDER BY updated_at DESC;"
        ).fetchall()
    return [dict(r) for r in rows]
