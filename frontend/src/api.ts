export async function getDashboard() {
  const r = await fetch("/api/dashboard");
  if (!r.ok) throw new Error(`dashboard failed: ${r.status}`);
  return r.json();
}

export async function getWorkday(dateYYYYMMDD: string) {
  const r = await fetch(`/api/workdays/${dateYYYYMMDD}`);
  if (!r.ok) throw new Error(`workday failed: ${r.status}`);
  return r.json() as Promise<{ date: string; is_work: boolean }>;
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
