import { useEffect, useState } from "react";
import {
  getDashboard,
  getWorkday,
  getReminders,
  doneReminder,
  getTasks,
  doneTask,
  getEvents,
  ttsSpeak,
  aiRespond,
} from "./api";
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

type EventItem = {
  id: number;
  title: string;
  event_date: string;
  start_hhmm: string | null;
  end_hhmm: string | null;
  all_day: number | boolean;
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
  const [workStart, setWorkStart] = useState<string | null>(null);
  const [workEnd, setWorkEnd] = useState<string | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTaskId, setCurrentTaskId] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [aiInput, setAiInput] = useState("");
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  async function refresh() {
    try {
      setErr(null);

      const dash = await getDashboard();
      setData(dash);

      const dateStr = ymdLocal(new Date(dash.now));

      const wd = await getWorkday(dateStr);
      setIsWork(wd.is_work);
      setWorkStart(wd.start_hhmm ?? "08:00");
      setWorkEnd(wd.end_hhmm ?? "16:30");

      const rr: RemindersResp = await getReminders(dateStr);
      setReminders(rr.reminders ?? []);

      const ev = await getEvents(dateStr);
      setEvents(ev.events ?? []);

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
  const nowMs = nowForWindow.getTime();
  let workStatus = "";
  let workFinished = false;
  if (isWork && hasNow && workStart && workEnd) {
    const [wsH, wsM] = workStart.split(":").map(Number);
    const [weH, weM] = workEnd.split(":").map(Number);
    const workStartDt = new Date(nowForWindow);
    workStartDt.setHours(wsH, wsM, 0, 0);
    const workEndDt = new Date(nowForWindow);
    workEndDt.setHours(weH, weM, 0, 0);
    if (nowMs < workStartDt.getTime()) {
      const diffMins = Math.round((workStartDt.getTime() - nowMs) / 60000);
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      workStatus = hours > 0 ? `in ${hours}h ${mins}m` : `in ${mins} mins`;
    } else if (nowMs <= workEndDt.getTime()) {
      workStatus = "now";
    } else {
      workFinished = true;
    }
  }
  const hasTodayItems = Boolean(isWork) || events.length > 0;
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
  const visibleAlerts = sortedReminders.filter((r) => !r.reminder_key.startsWith("event:"));

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

  async function handleTtsClick() {
    try {
      setErr(null);
      const blob = await ttsSpeak("Time to take your meds, Sam.");
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      const cleanup = () => URL.revokeObjectURL(url);
      audio.onended = cleanup;
      audio.onerror = cleanup;
      await audio.play();
    } catch (e: any) {
      setErr(e?.message ?? "failed");
    }
  }

  async function handleAiSubmit() {
    const prompt = aiInput.trim();
    if (!prompt) return;
    try {
      setErr(null);
      setAiLoading(true);
      const res = await aiRespond(prompt);
      setAiOutput(res.text);
    } catch (e: any) {
      setErr(e?.message ?? "failed");
    } finally {
      setAiLoading(false);
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
          {hasTodayItems ? (
            <ul className="list list--flush">
              {isWork ? (
                <li className={`eventRow${workFinished ? " eventRow--done" : ""}`}>
                  <span>
                    <strong>{workStart && workEnd ? `${workStart}-${workEnd}` : "Work"}</strong>{" "}
                    Work
                  </span>
                  {workStatus ? <span className="eventMeta">{workStatus}</span> : null}
                </li>
              ) : null}
              {events.map((e) => {
                const isAllDay = Boolean(e.all_day);
                const timeLabel = isAllDay
                  ? "All day"
                  : e.start_hhmm && e.end_hhmm
                    ? `${e.start_hhmm}-${e.end_hhmm}`
                    : e.start_hhmm ?? "TBD";
                let relativeLabel = "";
                let isNow = false;
                let isUpcoming = false;
                let isDone = false;
                if (isAllDay) {
                  relativeLabel = "now";
                  isNow = true;
                } else if (e.start_hhmm) {
                  const eventStart = new Date(`${e.event_date}T${e.start_hhmm}:00`);
                  const eventStartMs = eventStart.getTime();
                  let eventEndMs = eventStartMs;
                  if (e.end_hhmm) {
                    const eventEnd = new Date(`${e.event_date}T${e.end_hhmm}:00`);
                    eventEndMs = eventEnd.getTime();
                  }
                  const diffMs = eventStartMs - nowMs;
                  const diffMins = Math.round(diffMs / 60000);
                  if (nowMs >= eventStartMs && nowMs <= eventEndMs) {
                    relativeLabel = "now";
                    isNow = true;
                  } else if (diffMins >= 0) {
                    const hours = Math.floor(diffMins / 60);
                    const mins = diffMins % 60;
                    relativeLabel =
                      hours > 0 ? `in ${hours}h ${mins}m` : `in ${mins} mins`;
                    isUpcoming = true;
                  } else {
                    isDone = true;
                  }
                }
                return (
                  <li key={e.id} className={`eventRow${isDone ? " eventRow--done" : ""}`}>
                    <span>
                      <strong>{timeLabel}</strong> {e.title}
                    </span>
                    {relativeLabel ? (
                      <span
                        className={`eventMeta${
                          isNow || isUpcoming ? " reminderStatus" : ""
                        }${isUpcoming ? " reminderStatus--done" : ""}${
                          isNow ? " reminderStatus--missed" : ""
                        }${isDone ? " eventMeta--done" : ""}`}
                      >
                        {relativeLabel}
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : null}
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

        <div className="funFactDock">
          <FunFactCard />
        </div>

        {/* Left column, row 2 */}
        <section className="card glass-tile slot-l2 card--left">
          <div className="cardHeader">
            <h2>Alerts</h2>
          </div>

          {/* Med reminders (active) */}
          {visibleAlerts.length ? (
            <div className="reminders">
              {visibleAlerts.map((r) => {
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
            <ul className="list list--pills">
              {data.alerts.map((a, i) => (
                <li key={i}>{a.message}</li>
              ))}
            </ul>
          ) : (
            <p className="big">{visibleAlerts.length ? "" : "None"}</p>
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
          <button className="glass-pill glass-pill--small ttsButton" onClick={handleTtsClick}>
            Test speak
          </button>
          <p className="subtle">v1: button only (no hotword)</p>

          <div className="aiBlock">
            <div className="aiLabel">Ask Sam</div>
            <textarea
              className="aiInput"
              rows={3}
              placeholder="Type a prompt..."
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
            />
            <div className="aiActions">
              <button
                className="glass-pill glass-pill--small"
                onClick={handleAiSubmit}
                disabled={aiLoading}
              >
                {aiLoading ? "Thinking..." : "Ask"}
              </button>
            </div>
            {aiOutput ? <div className="aiResponse">{aiOutput}</div> : null}
          </div>
        </section>
      </main>

    </div>
  );
}
