from datetime import datetime
from backend.app.db.conn import get_conn

def add_event(
    title: str,
    event_date: str,
    start_hhmm: str | None,
    end_hhmm: str | None,
    all_day: bool,
    reminder_preset: str,
) -> int:
    with get_conn() as conn:
        cur = conn.execute(
            """
            INSERT INTO events (title, event_date, start_hhmm, end_hhmm, all_day, reminder_preset, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?);
            """,
            (
                title,
                event_date,
                start_hhmm,
                end_hhmm,
                1 if all_day else 0,
                reminder_preset,
                datetime.now().isoformat(timespec="seconds"),
            ),
        )
        conn.commit()
        return int(cur.lastrowid)

def list_events_for_date(event_date: str):
    with get_conn() as conn:
        return conn.execute(
            """
            SELECT id, title, event_date, start_hhmm, end_hhmm, all_day, reminder_preset
            FROM events
            WHERE event_date = ?
            ORDER BY all_day DESC, start_hhmm ASC;
            """,
            (event_date,),
        ).fetchall()

def list_events_from_date(event_date: str):
    with get_conn() as conn:
        return conn.execute(
            """
            SELECT id, title, event_date, start_hhmm, end_hhmm, all_day, reminder_preset
            FROM events
            WHERE event_date >= ?
            ORDER BY event_date ASC;
            """,
            (event_date,),
        ).fetchall()


def delete_event(event_id: int) -> None:
    with get_conn() as conn:
        conn.execute("DELETE FROM events WHERE id = ?;", (event_id,))
        conn.commit()
