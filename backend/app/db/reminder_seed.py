"""Default reminder schedules for work/off days."""

from backend.app.db.conn import get_conn

DEFAULT_SCHEDULES = [
    # Work day
    ("lanny_zee",    "Lanny zee",    "Did you take your lanny zee?", "07:00", "work", 5),
    ("morning_meds", "Morning meds", "Time for morning meds.",       "07:30", "work", 5),
    ("evening_meds", "Evening meds", "Time for evening meds.",       "18:00", "work", 5),

    # Off day
    ("lanny_zee",    "Lanny zee",    "Did you take your lanny zee?", "08:00", "off", 5),
    ("morning_meds", "Morning meds", "Time for morning meds.",       "08:30", "off", 5),
    ("lunch_meds",   "Lunch meds",   "Time for lunch meds.",         "13:00", "off", 5),
    ("evening_meds", "Evening meds", "Time for evening meds.",       "18:00", "off", 5),
]

def seed_defaults_if_empty() -> None:
    """Insert default reminder schedules if the table is empty."""
    with get_conn() as conn:
        n = conn.execute("SELECT COUNT(*) AS n FROM reminder_schedule;").fetchone()["n"]
        if n > 0:
            return
        conn.executemany(
            """INSERT INTO reminder_schedule
               (reminder_key,label,speak_text,time_hhmm,day_type,repeat_every_min,enabled)
               VALUES (?,?,?,?,?,?,1);""",
            DEFAULT_SCHEDULES,
        )
        conn.commit()
