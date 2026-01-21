export async function getDashboard() {
  const r = await fetch("/api/dashboard");
  if (!r.ok) throw new Error(`dashboard failed: ${r.status}`);
  return r.json();
}

export async function getWorkday(dateYYYYMMDD: string) {
  const r = await fetch(`/api/workdays/${dateYYYYMMDD}`);
  if (!r.ok) throw new Error(`workday failed: ${r.status}`);
  return r.json() as Promise<{
    date: string;
    is_work: boolean;
    start_hhmm: string;
    end_hhmm: string;
  }>;
}

export async function getReminders(dateYYYYMMDD: string) {
  const r = await fetch(`/api/reminders/active?date=${encodeURIComponent(dateYYYYMMDD)}`);
  if (!r.ok) throw new Error(`reminders failed: ${r.status}`);
  return r.json() as Promise<{
    date: string;
    now: string;
    reminders: {
      id: number;
      reminder_key: string;
      label: string;
      speak_text: string;
      dose_date: string;
      scheduled_hhmm: string;
      next_fire_at: string;
      status: "active" | "done" | "missed";
      due_now: boolean;
    }[];
  }>;
}

export async function doneReminder(active_id: number, reminder_key: string) {
  const r = await fetch(`/api/reminders/done`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ active_id, reminder_key }),
  });
  if (!r.ok) throw new Error(`done failed: ${r.status}`);
  return r.json() as Promise<{ ok: boolean }>;
}

export async function getTasks() {
  const r = await fetch("/api/tasks");
  if (!r.ok) throw new Error(`tasks failed: ${r.status}`);
  return r.json() as Promise<{
    tasks: { id: number; title: string; priority: "trivial" | "medium" | "vital" }[];
  }>;
}

export async function doneTask(task_id: number) {
  const r = await fetch(`/api/tasks/${task_id}/done`, { method: "POST" });
  if (!r.ok) throw new Error(`task done failed: ${r.status}`);
  return r.json() as Promise<{ ok: boolean }>;
}

export async function getEvents(dateYYYYMMDD: string) {
  const r = await fetch(`/api/events?date=${encodeURIComponent(dateYYYYMMDD)}`);
  if (!r.ok) throw new Error(`events failed: ${r.status}`);
  return r.json() as Promise<{
    date: string;
    events: {
      id: number;
      title: string;
      event_date: string;
      start_hhmm: string | null;
      end_hhmm: string | null;
      all_day: number | boolean;
    }[];
  }>;
}

export async function ttsSpeak(text: string) {
  const r = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!r.ok) throw new Error(`tts failed: ${r.status}`);
  return r.blob();
}

export async function aiRespond(text: string) {
  const r = await fetch("/api/ai/respond", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!r.ok) throw new Error(`ai failed: ${r.status}`);
  return r.json() as Promise<{ text: string }>;
}

export async function aiSchedule(text: string) {
  const r = await fetch("/api/ai/schedule", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!r.ok) throw new Error(`ai schedule failed: ${r.status}`);
  return r.json() as Promise<{
    ok: boolean;
    message?: string;
    action?: "event" | "reminder" | "task";
    event?: {
      title: string;
      date: string | null;
      start_hhmm: string | null;
      end_hhmm: string | null;
      all_day: boolean;
    };
    reminder?: {
      title: string;
      date: string;
      scheduled_hhmm: string;
    };
    task?: { title: string; priority: string };
  }>;
}

export async function aiResolve(text: string) {
  const r = await fetch("/api/ai/resolve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!r.ok) throw new Error(`ai resolve failed: ${r.status}`);
  return r.json() as Promise<{
    ok: boolean;
    message?: string;
    action?: "complete" | "delete";
    target?: "task" | "reminder" | "event";
    task?: { title: string };
    reminder?: { label: string; scheduled_hhmm?: string; dose_date?: string };
    event?: { title: string; event_date?: string };
  }>;
}
