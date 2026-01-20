import { useEffect, useState } from "react";
import { getDashboard, getWorkday, getReminders, doneReminder, getTasks, doneTask } from "./api";
import DarkVeil from "./components/DarkVeil";
import Orb from "./components/Orb";
import FunFactCard from "./components/FunFactCard";
import "./App.css";

type Dashboard = {
  now: string;
  today_summary: string;
  alerts: { message: string }[];
  next_task: string | null;
};

type ReminderStatus = "active" | "done" | "missed";

type TaskPriority = "trivial" | "medium" | "vital";

type Task = {
  id: number;
  title: string;
  priority: TaskPriority;
};

type Reminder = {
  id: number;
  reminder_key: string;
  label: string;
  speak_text: string;
  dose_date: string;
  scheduled_hhmm: string;
  next_fire_at: string;
  status: ReminderStatus;
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTaskId, setCurrentTaskId] = useState<number | null>(null);
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

      const tr = await getTasks();
      const nextTasks = tr.tasks ?? [];
      setTasks(nextTasks);
      setCurrentTaskId((prevId) => {
        if (!nextTasks.length) return null;
        if (prevId && nextTasks.some((t) => t.id === prevId)) return prevId;
        return nextTasks[0].id;
      });
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
  const hasNow = Boolean(now);
  const nowForWindow = now ?? new Date();
  const remindersWithWindow = reminders.map((r) => {
    const dueAt = new Date(`${r.dose_date}T${r.scheduled_hhmm}:00`);
    const windowEnd = new Date(dueAt.getTime() + 30 * 60 * 1000);
    const inWindow = hasNow ? nowForWindow >= dueAt && nowForWindow <= windowEnd : false;
    const overdue = hasNow ? nowForWindow > windowEnd : false;
    const derivedStatus: ReminderStatus =
      r.status === "active" && overdue ? "missed" : r.status;
    return { ...r, dueAt, windowEnd, inWindow, overdue, derivedStatus };
  });
  const visibleReminders = remindersWithWindow.filter((r) => {
    if (!hasNow) return true;
    if (r.status === "active") {
      return r.inWindow || r.overdue;
    }
    return true;
  });
  const sortedReminders = [...visibleReminders].sort((a, b) => {
    const aPriority = a.inWindow ? 0 : 1;
    const bPriority = b.inWindow ? 0 : 1;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return a.dueAt.getTime() - b.dueAt.getTime();
  });

  const taskIndex =
    currentTaskId === null ? -1 : tasks.findIndex((t) => t.id === currentTaskId);
  const currentTask =
    taskIndex >= 0 ? tasks[taskIndex] : tasks.length ? tasks[0] : null;

  function cycleTask() {
    if (tasks.length <= 1) return;
    const idx = taskIndex >= 0 ? taskIndex : 0;
    const nextTask = tasks[(idx + 1) % tasks.length];
    setCurrentTaskId(nextTask.id);
  }

  async function markTaskDone() {
    if (!currentTask) return;
    try {
      setErr(null);
      await doneTask(currentTask.id);
      await refresh();
    } catch (e: any) {
      setErr(e?.message ?? "failed");
    }
  }

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
            <h2>Tasks</h2>
            {currentTask ? (
              <span className={`taskPriority taskPriority--${currentTask.priority}`}>
                {currentTask.priority}
              </span>
            ) : null}
          </div>
          {currentTask ? (
            <>
              <p className="big">{currentTask.title}</p>
              <div className="taskControls">
                <button className="glass-pill glass-pill--small" onClick={cycleTask}>
                  Next
                </button>
                <button className="glass-pill glass-pill--small" onClick={markTaskDone}>
                  Done
                </button>
              </div>
            </>
          ) : (
            <p className="big">Excellent work. Congrats on completing your tasks!</p>
          )}
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
          {sortedReminders.length ? (
            <div className="reminders">
              {sortedReminders.map((r) => {
                const statusLabel =
                  r.derivedStatus === "done"
                    ? "Taken"
                    : r.derivedStatus === "missed"
                      ? "Missed"
                      : null;
                const showDone = r.derivedStatus === "active" && r.inWindow;
                return (
                  <div
                    key={r.id}
                    className={`reminderRow${r.inWindow ? " reminderRow--due" : ""}${
                      r.derivedStatus !== "active" ? " reminderRow--inactive" : ""
                    }${r.derivedStatus === "missed" ? " reminderRow--missed" : ""}${
                      r.derivedStatus === "done" ? " reminderRow--done" : ""
                    }`}
                  >
                    <div className="reminderText">
                      <div className="reminderTop">
                        <strong>{r.label}</strong>{" "}
                        <span className="subtle">due {r.scheduled_hhmm}</span>
                        {statusLabel ? (
                          <span
                            className={`reminderStatus reminderStatus--${r.derivedStatus}`}
                          >
                            {statusLabel}
                          </span>
                        ) : null}
                      </div>
                      <div className="subtle">{r.speak_text}</div>
                    </div>

                    {showDone ? (
                      <button
                        className="glass-pill glass-pill--small"
                        onClick={() => markDone(r)}
                      >
                        Done
                      </button>
                    ) : null}
                  </div>
                );
              })}
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
            <p className="big">{sortedReminders.length ? "" : "None"}</p>
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

      <div className="funFactDock">
        <FunFactCard />
      </div>
    </div>
  );
}
