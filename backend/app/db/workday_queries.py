from backend.app.db.conn import get_conn

def set_work_day(date_yyyy_mm_dd: str, is_work: bool) -> None:
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO work_days (date, is_work) VALUES (?, ?) "
            "ON CONFLICT(date) DO UPDATE SET is_work=excluded.is_work;",
            (date_yyyy_mm_dd, 1 if is_work else 0),
        )
        conn.commit()

def is_work_day(date_yyyy_mm_dd: str) -> bool:
    with get_conn() as conn:
        row = conn.execute(
            "SELECT is_work FROM work_days WHERE date=?;",
            (date_yyyy_mm_dd,),
        ).fetchone()
    # Default: off day if not explicitly set
    return bool(row["is_work"]) if row else False
