import { useEffect, useState } from "react";
import { getDashboard, getWorkday } from "./api";
import DarkVeil from "./components/DarkVeil";
import Orb from "./components/Orb";
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
  const timeStr = now
    ? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "--:--";
  const dateStr = now
    ? now.toLocaleDateString([], {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "--";

  const workLabel = isWork === null ? "…" : isWork ? "Work day" : "Day off";

  return (
    <div className="page">
      <div className="bg">
        <DarkVeil
          hueShift={0}
          noiseIntensity={0}
          scanlineIntensity={0}
          speed={2}
          scanlineFrequency={0}
          warpAmount={0}
          resolutionScale={1}
        />
      </div>

      <header className="top">
        <div className="topLeft">
          <div className="time">{timeStr}</div>
          <div className="date">{dateStr}</div>
        </div>

        <div className="topRight">
          <span className="glass-pill glass-pill--small">{workLabel}</span>
        </div>
      </header>

      {err && <div className="err glass-soft">Backend error: {err}</div>}

      <main className="grid">
        {/* Left column, row 1 */}
        <section className="card glass-tile slot-l1 card--left">
          <div className="cardHeader">
            <h2>Today</h2>
          </div>
          <p className="body">{data?.today_summary ?? "Loading..."}</p>
        </section>

        {/* Right column, row 1 */}
        <section className="card glass-tile slot-r1 card--right">
          <div className="cardHeader">
            <h2>Next task</h2>
          </div>
          <p className="big">{data?.next_task ?? "None"}</p>
        </section>

        {/* Middle column: Orb (no tile/background) */}
        <div className="orbSlot" aria-hidden="true">
          <div className="orbWrap">
            <Orb
              hue={0}
              hoverIntensity={2}
              rotateOnHover={false}
              forceHoverState={false}
            />
          </div>
        </div>

        {/* Left column, row 2 */}
        <section className="card glass-tile slot-l2 card--left">
          <div className="cardHeader">
            <h2>Alerts</h2>
          </div>
          {data?.alerts?.length ? (
            <ul className="list">
              {data.alerts.map((a, i) => (
                <li key={i}>{a.message}</li>
              ))}
            </ul>
          ) : (
            <p className="big">None</p>
          )}
        </section>

        {/* Right column, row 2 */}
        <section className="card glass-tile slot-r2 card--right">
          <div className="cardHeader">
            <h2>Push to talk</h2>
          </div>
          <button
            className="glass-pill micPill"
            onClick={() => alert("PTT coming soon")}
          >
            Hold to talk
          </button>
          <p className="subtle">v1: button only (no hotword)</p>
        </section>
      </main>
    </div>
  );
}
