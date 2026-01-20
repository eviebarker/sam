from datetime import date as Date
from backend.app.db.conn import get_conn

# Default pattern if no override exists in DB:
# Mon/Tue/Wed = work, Thu/Fri/Sat/Sun = off
DEFAULT_WORK_WEEKDAYS = {0, 1, 2}  # Monday=0
DEFAULT_WORK_START = "08:00"
DEFAULT_WORK_END = "16:30"

def set_work_day(
    date_yyyy_mm_dd: str,
    is_work: bool,
    start_hhmm: str | None = None,
    end_hhmm: str | None = None,
) -> None:
    start_val = start_hhmm or DEFAULT_WORK_START
    end_val = end_hhmm or DEFAULT_WORK_END
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO work_days (date, is_work, start_hhmm, end_hhmm) VALUES (?, ?, ?, ?) "
            "ON CONFLICT(date) DO UPDATE SET is_work=excluded.is_work, start_hhmm=excluded.start_hhmm, end_hhmm=excluded.end_hhmm;",
            (date_yyyy_mm_dd, 1 if is_work else 0, start_val, end_val),
        )
        conn.commit()

def is_work_day(date_yyyy_mm_dd: str) -> bool:
    # 1) Explicit override wins
    with get_conn() as conn:
        row = conn.execute(
            "SELECT is_work FROM work_days WHERE date=?;",
            (date_yyyy_mm_dd,),
        ).fetchone()
    if row is not None:
        return bool(row["is_work"])

    # 2) Otherwise use default pattern
    y, m, d = map(int, date_yyyy_mm_dd.split("-"))
    wd = Date(y, m, d).weekday()
    return wd in DEFAULT_WORK_WEEKDAYS

def get_work_day(date_yyyy_mm_dd: str) -> dict:
    with get_conn() as conn:
        row = conn.execute(
            "SELECT is_work, start_hhmm, end_hhmm FROM work_days WHERE date=?;",
            (date_yyyy_mm_dd,),
        ).fetchone()
    if row is not None:
        return {
            "is_work": bool(row["is_work"]),
            "start_hhmm": row["start_hhmm"] or DEFAULT_WORK_START,
            "end_hhmm": row["end_hhmm"] or DEFAULT_WORK_END,
        }

    y, m, d = map(int, date_yyyy_mm_dd.split("-"))
    wd = Date(y, m, d).weekday()
    return {
        "is_work": wd in DEFAULT_WORK_WEEKDAYS,
        "start_hhmm": DEFAULT_WORK_START,
        "end_hhmm": DEFAULT_WORK_END,
    }
