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

  const now = data?.now ? new Date(data.now) : null;
  const timeStr = now ? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--";
  const dateStr = now ? now.toLocaleDateString([], { weekday: "long", day: "2-digit", month: "long", year: "numeric" }) : "--";

  return (
    <div className="page">
      <header className="top">
        <div className="topLeft">
          <div className="time">{timeStr}</div>
          <div className="date">{dateStr}</div>
        </div>

        <div className="topRight">
          <button className="btn" onClick={refresh}>Refresh</button>
        </div>
      </header>

      {err && <div className="err">Backend error: {err}</div>}

      <main className="grid">
        <section className="card">
          <div className="cardHeader">
            <h2>Today</h2>
          </div>
          <p className="body">{data?.today_summary ?? "Loading..."}</p>
        </section>

        <section className="card">
          <div className="cardHeader">
            <h2>Workday</h2>
            <span
              className={
                "pill " +
                (isWork === null ? "pillNeutral" : isWork ? "pillWork" : "pillOff")
              }
            >
              {isWork === null ? "…" : isWork ? "Work day" : "Day off"}
            </span>
          </div>
          <p className="subtle">Default: Mon–Wed work unless overridden</p>
        </section>

        <section className="card">
          <div className="cardHeader">
            <h2>Next task</h2>
          </div>
          <p className="big">{data?.next_task ?? "None"}</p>
        </section>

        <section className="card">
          <div className="cardHeader">
            <h2>Alerts</h2>
          </div>
          {data?.alerts?.length ? (
            <ul className="list">
              {data.alerts.map((a, i) => <li key={i}>{a.message}</li>)}
            </ul>
          ) : (
            <p className="big">None</p>
          )}
        </section>

        <section className="card">
          <div className="cardHeader">
            <h2>Push to talk</h2>
          </div>
          <button className="mic" onClick={() => alert("PTT coming soon")}>
            Hold to talk
          </button>
          <p className="subtle">v1: button only (no hotword)</p>
        </section>
      </main>
    </div>
  );
}
