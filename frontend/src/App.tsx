import { useEffect, useState } from "react";
import { getDashboard, getWorkday } from "./api";
import "./App.css";

type Dashboard = {
  now: string;
  today_summary: string;
  alerts: { message: string }[];
  next_task: string | null;
};

function ymdLocal(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function App() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [isWork, setIsWork] = useState<boolean | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    try {
      setErr(null);
      const dash = await getDashboard();
      setData(dash);

      const dateStr = ymdLocal(new Date(dash.now));
      const wd = await getWorkday(dateStr);
      setIsWork(wd.is_work);
    } catch (e: any) {
      setErr(e?.message ?? "failed");
    }
  }

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, []);

  const nowStr = data?.now ? new Date(data.now).toLocaleString() : "--";

  return (
    <div className="page">
      <header className="top">
        <div className="clock">{nowStr}</div>
        <button className="btn" onClick={refresh}>Refresh</button>
      </header>

      {err && <div className="err">Backend error: {err}</div>}

      <main className="grid">
        <section className="card">
          <h2>Today</h2>
          <p>{data?.today_summary ?? "Loading..."}</p>
        </section>

        <section className="card">
          <h2>Workday</h2>
          <p className="big">
            {isWork === null ? "Loading..." : (isWork ? "Work day" : "Day off")}
          </p>
          <p className="hint">Default: Mon–Wed work unless overridden</p>
        </section>

        <section className="card">
          <h2>Next task</h2>
          <p className="big">{data?.next_task ?? "None"}</p>
        </section>

        <section className="card">
          <h2>Alerts</h2>
          {data?.alerts?.length ? (
            <ul>
              {data.alerts.map((a, i) => <li key={i}>{a.message}</li>)}
            </ul>
          ) : (
            <p className="big">None</p>
          )}
        </section>

        <section className="card">
          <h2>Push to talk</h2>
          <button className="mic" onClick={() => alert("PTT coming soon")}>
            Hold to talk
          </button>
          <p className="hint">v1: button only (no hotword)</p>
        </section>
      </main>
    </div>
  );
}
