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

-- Dynamic work/off day mapping (can be edited per date)
CREATE TABLE IF NOT EXISTS work_days (
  date TEXT PRIMARY KEY,          -- "YYYY-MM-DD"
  is_work INTEGER NOT NULL        -- 1=work day, 0=off day
);

-- Reminder schedules by day type (work/off), NOT fixed weekdays
CREATE TABLE IF NOT EXISTS reminder_schedule (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reminder_key TEXT NOT NULL,     -- lanny_zee | morning_meds | lunch_meds | evening_meds
  label TEXT NOT NULL,            -- what shows on screen
  speak_text TEXT NOT NULL,       -- what Sam says
  time_hhmm TEXT NOT NULL,        -- "08:30"
  day_type TEXT NOT NULL,         -- "work" or "off"
  repeat_every_min INTEGER NOT NULL DEFAULT 5,
  enabled INTEGER NOT NULL DEFAULT 1
);

-- Active reminders (one per key per day)
CREATE TABLE IF NOT EXISTS reminder_active (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reminder_key TEXT NOT NULL,
  label TEXT NOT NULL,
  speak_text TEXT NOT NULL,
  dose_date TEXT NOT NULL,        -- "YYYY-MM-DD"
  status TEXT NOT NULL DEFAULT 'active', -- active|done
  next_fire_at TEXT NOT NULL,     -- ISO datetime
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reminder_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reminder_key TEXT NOT NULL,
  action TEXT NOT NULL,           -- fired|done|snooze
  ts TEXT NOT NULL
);
