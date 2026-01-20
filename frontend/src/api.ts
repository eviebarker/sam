export async function getDashboard() {
  const r = await fetch("/api/dashboard");
  if (!r.ok) throw new Error(`dashboard failed: ${r.status}`);
  return r.json();
}
