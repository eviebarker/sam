import { useEffect, useState } from "react";
import { getDashboard, getWorkday, getReminders, doneReminder } from "./api";
import DarkVeil from "./components/DarkVeil";
import Orb from "./components/Orb";
import "./App.css";

type Dashboard = {
  now: string;
  today_summary: string;
  alerts: { message: string }[];
  next_task: string | null;
};

type Reminder = {
  id: number;
  reminder_key: string;
  label: string;
  speak_text: string;
  dose_date: string;
  scheduled_hhmm: string;
  next_fire_at: string;
  due_now: boolean;
};

type RemindersResp = {
  date: string;
  now: string;
  reminders: Reminder[];
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
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    try {
      setErr(null);

      const dash = await getDashboard();
      setData(dash);

      const dateStr = ymdLocal(new Date(dash.now));

      const wd = await getWorkday(dateStr);
      setIsWork(wd.is_work);

      const rr: RemindersResp = await getReminders(dateStr);
      setReminders(rr.reminders ?? []);
    } catch (e: any) {
      setErr(e?.message ?? "failed");
    }
  }

  async function markDone(r: Reminder) {
    try {
      setErr(null);
      await doneReminder(r.id, r.reminder_key);
      // refresh right away so it disappears instantly
      await refresh();
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
  const dateStrPretty = now
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
          <div className="date">{dateStrPretty}</div>
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
            <Orb hue={0} hoverIntensity={2} rotateOnHover={false} forceHoverState={false} />
          </div>
        </div>

        {/* Left column, row 2 */}
        <section className="card glass-tile slot-l2 card--left">
          <div className="cardHeader">
            <h2>Alerts</h2>
          </div>

          {/* Med reminders (active) */}
          {reminders.length ? (
            <div className="reminders">
              {reminders.map((r) => (
                <div
                  key={r.id}
                  className={`reminderRow ${r.due_now ? "reminderRow--due" : ""}`}
                >
                  <div className="reminderText">
                    <div className="reminderTop">
                      <strong>{r.label}</strong>{" "}
                      <span className="subtle">due {r.scheduled_hhmm}</span>
                    </div>
                    <div className="subtle">{r.speak_text}</div>
                  </div>

                  <button
                    className="glass-pill glass-pill--small"
                    onClick={() => markDone(r)}
                  >
                    Done
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          {/* Normal alerts */}
          {data?.alerts?.length ? (
            <ul className="list">
              {data.alerts.map((a, i) => (
                <li key={i}>{a.message}</li>
              ))}
            </ul>
          ) : (
            <p className="big">{reminders.length ? "" : "None"}</p>
          )}
        </section>

        {/* Right column, row 2 */}
        <section className="card glass-tile slot-r2 card--right">
          <div className="cardHeader">
            <h2>Push to talk</h2>
          </div>
          <button className="glass-pill micPill" onClick={() => alert("PTT coming soon")}>
            Hold to talk
          </button>
          <p className="subtle">v1: button only (no hotword)</p>
        </section>
      </main>
    </div>
  );
}
