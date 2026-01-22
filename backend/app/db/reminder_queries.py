"""Reminder schedule + active reminder CRUD helpers."""

from datetime import datetime, timedelta
from backend.app.db.conn import get_conn

def get_schedules_for_day_type(day_type: str):
    """Return reminder schedules for a given day type ('work'|'off')."""
    with get_conn() as conn:
        return conn.execute(
            """SELECT * FROM reminder_schedule
               WHERE enabled=1 AND day_type=?
               ORDER BY time_hhmm ASC;""",
            (day_type,),
        ).fetchall()

def create_active_for_date(reminder_key: str, label: str, speak_text: str, dose_date: str, scheduled_hhmm: str, next_fire_at_iso: str):
    """Create an active reminder instance for a date unless one already exists."""
    with get_conn() as conn:
        existing = conn.execute(
            """SELECT * FROM reminder_active
               WHERE reminder_key=? AND dose_date=?
               ORDER BY id DESC LIMIT 1;""",
            (reminder_key, dose_date),
        ).fetchone()
        if existing:
            return existing

        conn.execute(
            """INSERT INTO reminder_active
               (reminder_key,label,speak_text,dose_date,scheduled_hhmm,status,next_fire_at,created_at)
               VALUES (?,?,?,?,?, 'active', ?, ?);""",
            (reminder_key, label, speak_text, dose_date, scheduled_hhmm, next_fire_at_iso, datetime.now().isoformat(timespec="seconds")),
        )
        conn.commit()
        return conn.execute(
            """SELECT * FROM reminder_active
               WHERE reminder_key=? AND dose_date=? AND status='active'
               ORDER BY id DESC LIMIT 1;""",
            (reminder_key, dose_date),
        ).fetchone()

def get_due_active(now_iso: str):
    """Fetch the next due active reminder at/ before `now_iso`."""
    with get_conn() as conn:
        return conn.execute(
            """SELECT * FROM reminder_active
               WHERE status='active' AND next_fire_at <= ?
               ORDER BY id ASC LIMIT 1;""",
            (now_iso,),
        ).fetchone()

def bump_next_fire(active_id: int, minutes: int):
    """Advance next_fire_at by N minutes and return the new ISO timestamp."""
    nxt = (datetime.now() + timedelta(minutes=minutes)).isoformat(timespec="seconds")
    with get_conn() as conn:
        conn.execute("UPDATE reminder_active SET next_fire_at=? WHERE id=?;", (nxt, active_id))
        conn.commit()
    return nxt

def set_next_fire(active_id: int, next_fire_at_iso: str):
    """Set next_fire_at explicitly and return the value."""
    with get_conn() as conn:
        conn.execute("UPDATE reminder_active SET next_fire_at=? WHERE id=?;", (next_fire_at_iso, active_id))
        conn.commit()
    return next_fire_at_iso

def mark_done(active_id: int):
    """Mark an active reminder as done."""
    with get_conn() as conn:
        conn.execute("UPDATE reminder_active SET status='done' WHERE id=?;", (active_id,))
        conn.commit()

def delete_active_reminder(active_id: int):
    """Delete an active reminder by id."""
    with get_conn() as conn:
        conn.execute("DELETE FROM reminder_active WHERE id=?;", (active_id,))
        conn.commit()

def mark_missed(active_id: int):
    """Mark an active reminder as missed."""
    with get_conn() as conn:
        conn.execute("UPDATE reminder_active SET status='missed' WHERE id=?;", (active_id,))
        conn.commit()

def log_action(reminder_key: str, action: str):
    """Insert a reminder action log row."""
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO reminder_log (reminder_key, action, ts) VALUES (?, ?, ?);",
            (reminder_key, action, datetime.now().isoformat(timespec="seconds")),
        )
        conn.commit()

def list_for_date(dose_date: str):
    """List latest active/missed/done reminder rows per key for a given date."""
    with get_conn() as conn:
        return conn.execute(
            """SELECT id, reminder_key, label, speak_text, dose_date, scheduled_hhmm, next_fire_at, status
               FROM reminder_active
               WHERE id IN (
                 SELECT MAX(id)
                 FROM reminder_active
                 WHERE dose_date=?
                 GROUP BY reminder_key
               )
               ORDER BY scheduled_hhmm ASC;""",
            (dose_date,),
        ).fetchall()


def list_active_reminders() -> list[dict]:
    """List all active reminders ordered by date then time."""
    with get_conn() as conn:
        rows = conn.execute(
            """SELECT id, reminder_key, label, speak_text, dose_date, scheduled_hhmm, status
               FROM reminder_active
               WHERE status='active'
               ORDER BY dose_date DESC, scheduled_hhmm ASC;"""
        ).fetchall()
    return [dict(r) for r in rows]


def list_recent_reminders(limit: int = 20) -> list[dict]:
    """List recent reminders regardless of status (default last 20)."""
    with get_conn() as conn:
        rows = conn.execute(
            """SELECT id, reminder_key, label, speak_text, dose_date, scheduled_hhmm, status
               FROM reminder_active
               ORDER BY dose_date DESC, scheduled_hhmm DESC
               LIMIT ?;""",
            (limit,),
        ).fetchall()
    return [dict(r) for r in rows]


def delete_event_reminders(event_id: int) -> None:
    """Delete reminder_active rows for a given event id prefix."""
    prefix = f"event:{event_id}:"
    with get_conn() as conn:
        conn.execute(
            "DELETE FROM reminder_active WHERE reminder_key LIKE ?;",
            (f"{prefix}%",),
        )
        conn.commit()
