import sqlite3
from pathlib import Path
from backend.app.core.config import settings

def get_conn() -> sqlite3.Connection:
    Path(settings.db_path).parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(settings.db_path)
    conn.row_factory = sqlite3.Row
    return conn

def init_db() -> None:
    schema_path = Path(__file__).with_name("schema.sql")
    with get_conn() as conn:
        conn.executescript(schema_path.read_text())
        columns = [r["name"] for r in conn.execute("PRAGMA table_info(tasks);")]
        if "priority" not in columns:
            conn.execute(
                "ALTER TABLE tasks ADD COLUMN priority TEXT NOT NULL DEFAULT 'medium';"
            )
        event_columns = [r["name"] for r in conn.execute("PRAGMA table_info(events);")]
        if "start_hhmm" not in event_columns:
            conn.execute("ALTER TABLE events ADD COLUMN start_hhmm TEXT;")
        if "end_hhmm" not in event_columns:
            conn.execute("ALTER TABLE events ADD COLUMN end_hhmm TEXT;")
        if "event_time" in event_columns:
            if "event_time_legacy" not in event_columns:
                conn.execute("ALTER TABLE events ADD COLUMN event_time_legacy TEXT;")
                conn.execute("UPDATE events SET event_time_legacy = event_time;")
            conn.execute(
                "UPDATE events SET start_hhmm = COALESCE(start_hhmm, event_time) "
                "WHERE event_time IS NOT NULL;"
            )
            conn.execute(
                "UPDATE events SET end_hhmm = COALESCE(end_hhmm, time(event_time, '+30 minutes')) "
                "WHERE event_time IS NOT NULL;"
            )
        workday_columns = [r["name"] for r in conn.execute("PRAGMA table_info(work_days);")]
        if "start_hhmm" not in workday_columns:
            conn.execute("ALTER TABLE work_days ADD COLUMN start_hhmm TEXT;")
        if "end_hhmm" not in workday_columns:
            conn.execute("ALTER TABLE work_days ADD COLUMN end_hhmm TEXT;")
        memory_columns = [r["name"] for r in conn.execute("PRAGMA table_info(ai_memories);")]
        if "kind" not in memory_columns:
            conn.execute(
                "ALTER TABLE ai_memories ADD COLUMN kind TEXT NOT NULL DEFAULT 'short';"
            )
        if "word_count" not in memory_columns:
            conn.execute(
                "ALTER TABLE ai_memories ADD COLUMN word_count INTEGER NOT NULL DEFAULT 0;"
            )
        if "embedding" not in memory_columns:
            conn.execute("ALTER TABLE ai_memories ADD COLUMN embedding TEXT;")
        if "last_used_at" not in memory_columns:
            conn.execute("ALTER TABLE ai_memories ADD COLUMN last_used_at TEXT;")
        pronunciation_columns = [
            r["name"] for r in conn.execute("PRAGMA table_info(pronunciations);")
        ]
        if pronunciation_columns:
            if "updated_at" not in pronunciation_columns:
                conn.execute("ALTER TABLE pronunciations ADD COLUMN updated_at TEXT;")
        conn.commit()
