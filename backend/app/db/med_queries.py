from datetime import datetime, timedelta
from backend.app.db.conn import get_conn

def ensure_default_schedule():
    # Optional: seed one example med time if table empty
    with get_conn() as conn:
        row = conn.execute("SELECT COUNT(*) AS n FROM med_schedule;").fetchone()
        if row["n"] == 0:
            conn.execute("INSERT INTO med_schedule (name, time_hhmm) VALUES (?, ?);", ("Meds", "08:30"))
            conn.commit()

def get_due_active(now_iso: str):
    with get_conn() as conn:
        return conn.execute(
            "SELECT * FROM med_active WHERE status='active' AND next_fire_at <= ? ORDER BY id ASC LIMIT 1;",
            (now_iso,),
        ).fetchone()

def create_or_get_active(med_name: str, next_fire_at: str):
    with get_conn() as conn:
        existing = conn.execute(
            "SELECT * FROM med_active WHERE status='active' AND med_name=? ORDER BY id DESC LIMIT 1;",
            (med_name,),
        ).fetchone()
        if existing:
            return existing
        conn.execute(
            "INSERT INTO med_active (med_name, status, next_fire_at, created_at) VALUES (?, 'active', ?, ?);",
            (med_name, next_fire_at, datetime.now().isoformat(timespec="seconds")),
        )
        conn.commit()
        return conn.execute(
            "SELECT * FROM med_active WHERE status='active' AND med_name=? ORDER BY id DESC LIMIT 1;",
            (med_name,),
        ).fetchone()

def bump_active(active_id: int, minutes: int):
    next_fire = (datetime.now() + timedelta(minutes=minutes)).isoformat(timespec="seconds")
    with get_conn() as conn:
        conn.execute("UPDATE med_active SET next_fire_at=? WHERE id=?;", (next_fire, active_id))
        conn.commit()
    return next_fire

def mark_done(active_id: int):
    with get_conn() as conn:
        conn.execute("UPDATE med_active SET status='done' WHERE id=?;", (active_id,))
        conn.commit()

def log_action(med_name: str, action: str):
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO med_log (med_name, action, ts) VALUES (?, ?, ?);",
            (med_name, action, datetime.now().isoformat(timespec="seconds")),
        )
        conn.commit()
