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

CREATE TABLE IF NOT EXISTS med_schedule (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  time_hhmm TEXT NOT NULL,          -- e.g. "08:30"
  enabled INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS med_active (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  med_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',  -- active|snoozed|done
  next_fire_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS med_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  med_name TEXT NOT NULL,
  action TEXT NOT NULL,             -- fired|snooze|done
  ts TEXT NOT NULL
);
