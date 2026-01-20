from datetime import date as Date
from backend.app.db.conn import get_conn

# Default pattern if no override exists in DB:
# Mon/Tue/Wed = work, Thu/Fri/Sat/Sun = off
DEFAULT_WORK_WEEKDAYS = {0, 1, 2}  # Monday=0

def set_work_day(date_yyyy_mm_dd: str, is_work: bool) -> None:
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO work_days (date, is_work) VALUES (?, ?) "
            "ON CONFLICT(date) DO UPDATE SET is_work=excluded.is_work;",
            (date_yyyy_mm_dd, 1 if is_work else 0),
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
