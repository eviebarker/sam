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
