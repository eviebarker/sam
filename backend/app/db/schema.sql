-- Existing MVP tables (tasks + alerts)
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'todo',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- Dynamic work/off day mapping
CREATE TABLE IF NOT EXISTS work_days (
  date TEXT PRIMARY KEY,
  is_work INTEGER NOT NULL
);

-- Reminder schedules by day type (work/off)
CREATE TABLE IF NOT EXISTS reminder_schedule (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reminder_key TEXT NOT NULL,
  label TEXT NOT NULL,
  speak_text TEXT NOT NULL,
  time_hhmm TEXT NOT NULL,
  day_type TEXT NOT NULL,
  repeat_every_min INTEGER NOT NULL DEFAULT 5,
  enabled INTEGER NOT NULL DEFAULT 1
);

-- Active reminders (one per key per day)
CREATE TABLE IF NOT EXISTS reminder_active (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reminder_key TEXT NOT NULL,
  label TEXT NOT NULL,
  speak_text TEXT NOT NULL,
  dose_date TEXT NOT NULL,
  scheduled_hhmm TEXT NOT NULL,        -- original due time (e.g. "08:00")
  status TEXT NOT NULL DEFAULT 'active',
  next_fire_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reminder_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reminder_key TEXT NOT NULL,
  action TEXT NOT NULL,
  ts TEXT NOT NULL
);
