from datetime import datetime, timedelta
from backend.app.db.conn import get_conn

def get_schedules_for_day_type(day_type: str):
    with get_conn() as conn:
        return conn.execute(
            """SELECT * FROM reminder_schedule
               WHERE enabled=1 AND day_type=?
               ORDER BY time_hhmm ASC;""",
            (day_type,),
        ).fetchall()

def create_active_for_date(reminder_key: str, label: str, speak_text: str, dose_date: str, next_fire_at_iso: str):
    with get_conn() as conn:
        existing = conn.execute(
            """SELECT * FROM reminder_active
               WHERE reminder_key=? AND dose_date=? AND status='active'
               ORDER BY id DESC LIMIT 1;""",
            (reminder_key, dose_date),
        ).fetchone()
        if existing:
            return existing

        conn.execute(
            """INSERT INTO reminder_active
               (reminder_key,label,speak_text,dose_date,status,next_fire_at,created_at)
               VALUES (?,?,?,?, 'active', ?, ?);""",
            (reminder_key, label, speak_text, dose_date, next_fire_at_iso, datetime.now().isoformat(timespec="seconds")),
        )
        conn.commit()
        return conn.execute(
            """SELECT * FROM reminder_active
               WHERE reminder_key=? AND dose_date=? AND status='active'
               ORDER BY id DESC LIMIT 1;""",
            (reminder_key, dose_date),
        ).fetchone()

def get_due_active(now_iso: str):
    with get_conn() as conn:
        return conn.execute(
            """SELECT * FROM reminder_active
               WHERE status='active' AND next_fire_at <= ?
               ORDER BY id ASC LIMIT 1;""",
            (now_iso,),
        ).fetchone()

def bump_next_fire(active_id: int, minutes: int):
    nxt = (datetime.now() + timedelta(minutes=minutes)).isoformat(timespec="seconds")
    with get_conn() as conn:
        conn.execute("UPDATE reminder_active SET next_fire_at=? WHERE id=?;", (nxt, active_id))
        conn.commit()
    return nxt

def mark_done(active_id: int):
    with get_conn() as conn:
        conn.execute("UPDATE reminder_active SET status='done' WHERE id=?;", (active_id,))
        conn.commit()

def log_action(reminder_key: str, action: str):
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO reminder_log (reminder_key, action, ts) VALUES (?, ?, ?);",
            (reminder_key, action, datetime.now().isoformat(timespec="seconds")),
        )
        conn.commit()
