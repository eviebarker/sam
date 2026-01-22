import { useEffect, useRef, useState } from "react";
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
  aiSchedule,
  aiResolve,
  aiReclassify,
  aiReclassifyConfirm,
  aiPriority,
  sttTranscribe,
} from "./api";
import DarkVeil from "./components/DarkVeil";
import Orb from "./components/Orb";
import FunFactCard from "./components/FunFactCard";
import FoodHub from "./pages/FoodHub";
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
  const [activePage, setActivePage] = useState<"dashboard" | "food-hub">(
    "dashboard"
  );
  const [isWork, setIsWork] = useState<boolean | null>(null);
  const [workStart, setWorkStart] = useState<string | null>(null);
  const [workEnd, setWorkEnd] = useState<string | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTaskId, setCurrentTaskId] = useState<number | null>(null);
  const [taskBrowseActive, setTaskBrowseActive] = useState(false);
  const [tasksViewMode, setTasksViewMode] = useState<"all" | "single">("all");
  const lastTasksDayRef = useRef<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [aiInput, setAiInput] = useState("");
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [aiDisplay, setAiDisplay] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speakingCountRef = useRef(0);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const analyserDataRef = useRef<Uint8Array | null>(null);
  const audioSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioRafRef = useRef<number | null>(null);
  const audioRelaxRafRef = useRef<number | null>(null);
  const lastLevelUpdateRef = useRef(0);
  const audioEnvRef = useRef(0);
  const lastRelaxUpdateRef = useRef(0);

  const gate = Math.min(1, Math.max(0, (audioLevel - 0.015) / 0.12));
  const pulseLevel = audioLevel * gate * gate;
  const audioPulse = Math.min(1, Math.max(0, pulseLevel * 2.4));
  const isVisualSpeaking = isSpeaking || audioLevel > 0.005;

  function stopRelax() {
    if (audioRelaxRafRef.current != null) {
      cancelAnimationFrame(audioRelaxRafRef.current);
      audioRelaxRafRef.current = null;
    }
  }

  function stopAudioMeter() {
    if (audioRafRef.current != null) {
      cancelAnimationFrame(audioRafRef.current);
      audioRafRef.current = null;
    }
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.disconnect();
      } catch {
        // Ignore disconnect errors for already-closed nodes.
      }
      audioSourceRef.current = null;
    }
    stopRelax();
    lastRelaxUpdateRef.current = 0;
    const relaxDecayPerSec = 1.6;
    const relaxTick = (t: number) => {
      audioRelaxRafRef.current = requestAnimationFrame(relaxTick);
      const last = lastRelaxUpdateRef.current || t;
      const dtSec = Math.max(0.01, (t - last) / 1000);
      lastRelaxUpdateRef.current = t;
      const env = audioEnvRef.current * Math.exp(-relaxDecayPerSec * dtSec);
      audioEnvRef.current = env;
      if (env < 0.001) {
        audioEnvRef.current = 0;
        setAudioLevel(0);
        stopRelax();
        return;
      }
      setAudioLevel(env);
    };
    audioRelaxRafRef.current = requestAnimationFrame(relaxTick);
  }

  function startAudioMeter(audio: HTMLAudioElement) {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
      analyserRef.current = audioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = 1024;
      analyserDataRef.current = new Uint8Array(analyserRef.current.fftSize);
    }
    const ctx = audioCtxRef.current;
    const analyser = analyserRef.current;
    const data = analyserDataRef.current;
    if (!ctx || !analyser || !data) return;

    ctx.resume().catch(() => undefined);
    stopAudioMeter();
    stopRelax();
    audioSourceRef.current = ctx.createMediaElementSource(audio);
    audioSourceRef.current.connect(analyser);
    analyser.connect(ctx.destination);

    const tick = (t: number) => {
      audioRafRef.current = requestAnimationFrame(tick);
      const lastUpdate = lastLevelUpdateRef.current;
      if (t - lastUpdate < 16) return;
      lastLevelUpdateRef.current = t;
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i += 1) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / data.length);
      const level = Math.min(1, rms * 3.0);
      const env = audioEnvRef.current;
      const dtSec = Math.max(0.01, (t - lastUpdate) / 1000);
      const attack = 0.35;
      const decayPerSec = 12.0;
      let nextEnv = env;
      if (level > env) {
        nextEnv = env + (level - env) * attack;
      } else {
        nextEnv = env * Math.exp(-decayPerSec * dtSec);
      }
      audioEnvRef.current = nextEnv;
      setAudioLevel(nextEnv);
    };
    audioRafRef.current = requestAnimationFrame(tick);
  }
  const [reclassifyOptions, setReclassifyOptions] = useState<
    { item_type: "task" | "reminder" | "event"; item_id: number; label: string; target: "task" | "reminder" | "event" }[]
  >([]);
  const [isRecording, setIsRecording] = useState(false);
  const [sttTranscript, setSttTranscript] = useState<string | null>(null);
  const [sttStatus, setSttStatus] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const sttAudioCtxRef = useRef<AudioContext | null>(null);
  const sttProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sttSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const sttGainRef = useRef<GainNode | null>(null);
  const sttBuffersRef = useRef<Float32Array[]>([]);
  const sttSampleRateRef = useRef<number>(16000);
  const sttManualRef = useRef(false);

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

  useEffect(() => {
    if (!data?.now) return;
    const day = ymdLocal(new Date(data.now));
    if (lastTasksDayRef.current && lastTasksDayRef.current !== day) {
      setTasksViewMode("all");
      setTaskBrowseActive(false);
    }
    lastTasksDayRef.current = day;
  }, [data?.now]);

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

  useEffect(() => {
    if (!aiOutput) {
      setAiDisplay(null);
      return;
    }
    const tokens = aiOutput.trim().split(/\s+/);
    let idx = 1;
    if (!tokens.length) {
      setAiDisplay("");
      return;
    }
    setAiDisplay(tokens[0]);
    const id = window.setInterval(() => {
      if (idx >= tokens.length) {
        window.clearInterval(id);
        return;
      }
      setAiDisplay(tokens.slice(0, idx + 1).join(" "));
      idx += 1;
    }, 200);
    return () => window.clearInterval(id);
  }, [aiOutput]);

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

  function advanceTaskAndGet(): string | null {
    if (!tasks.length) return null;
    if (tasks.length === 1) {
      setCurrentTaskId(tasks[0].id);
      return tasks[0].title;
    }
    const idx = taskIndex >= 0 ? taskIndex : 0;
    const nextTask = tasks[(idx + 1) % tasks.length];
    setCurrentTaskId(nextTask.id);
    return nextTask.title;
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
    await playTts("Time to take your meds, Sam.");
  }

  async function playTts(text: string) {
    if (!text.trim()) return;
    try {
      setErr(null);
      const blob = await ttsSpeak(text);
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      const cleanup = () => URL.revokeObjectURL(url);
      audio.preload = "auto";
      const finish = () => {
        cleanup();
        speakingCountRef.current = Math.max(0, speakingCountRef.current - 1);
        if (speakingCountRef.current === 0) {
          setIsSpeaking(false);
        }
        stopAudioMeter();
        if (activeAudioRef.current === audio) {
          activeAudioRef.current = null;
        }
      };
      audio.onplaying = () => {
        speakingCountRef.current += 1;
        setIsSpeaking(true);
        startAudioMeter(audio);
      };
      audio.onended = finish;
      audio.onpause = finish;
      audio.onerror = finish;
      activeAudioRef.current = audio;
      await audio.play();
    } catch (e: any) {
      setErr(e?.message ?? "failed");
      speakingCountRef.current = 0;
      setIsSpeaking(false);
      stopAudioMeter();
    }
  }

  async function handleAiSubmit(overridePrompt?: string) {
    const prompt = (overridePrompt ?? aiInput).trim();
    if (!prompt) return;
    try {
      setErr(null);
      setAiLoading(true);
      if (reclassifyOptions.length) {
        const selected = Number(prompt);
        const option = reclassifyOptions[selected - 1];
        if (option) {
          const res = await aiReclassifyConfirm(
            option.target,
            option.item_type,
            option.item_id
          );
          if (res.ok) {
            const ack = `Moved: ${option.label} to ${option.target}`;
            setAiOutput(ack);
            await playTts(ack);
            setReclassifyOptions([]);
            await refresh();
            return;
          }
        }
        setAiOutput("Please reply with a valid option number.");
        return;
      }
      const nextTaskTrigger = /\b(next task|what'?s the next task|show me the next task)\b/i;
      const topPriorityTrigger =
        /\b(top priority task|top priority today|highest priority task|most important task|most important thing|most important thing i need to do|what do i need to do today|what should i do today|what'?s the most important thing i need to do today|what'?s the most important task today|what'?s the top thing today|what'?s my top task today|what should i tackle first|what do i tackle first|what should i do first|what do i do first|what'?s the highest priority thing today|what'?s the most urgent task|what is the most urgent thing)\b/i;
      const otherTasksTrigger =
        /\b(what other tasks|what else do i have|any other tasks|more tasks)\b/i;
      const continueTasksTrigger = /\b(yes|yeah|yep|next|keep going|more)\b/i;
      const stopTasksTrigger = /\b(no|nope|stop|that's all|done)\b/i;
      const singleTasksTrigger =
        /\b(one task at a time|one task at a time please|focus mode|low overwhelm mode|reduce overwhelm|show one task|single task mode)\b/i;
      const allTasksTrigger =
        /\b(show all tasks|show all my tasks|list all tasks|show tasks list|all tasks view|show me all tasks|show me all my tasks)\b/i;

      if (singleTasksTrigger.test(prompt)) {
        setTasksViewMode("single");
        const title = currentTask?.title ?? advanceTaskAndGet();
        const ack = title
          ? `Okay, one task at a time. Next task: ${title}.`
          : "Okay, one task at a time. You have no tasks.";
        setAiOutput(ack);
        await playTts(ack);
        return;
      }

      if (allTasksTrigger.test(prompt)) {
        setTasksViewMode("all");
        setTaskBrowseActive(false);
        const ack = "Okay, showing all tasks.";
        setAiOutput(ack);
        await playTts(ack);
        return;
      }

      if (taskBrowseActive) {
        if (continueTasksTrigger.test(prompt)) {
          const title = advanceTaskAndGet();
          if (title) {
            const ack = `Next task: ${title}. Want to hear the next one?`;
            setAiOutput(ack);
            await playTts(ack);
          } else {
            const ack = "You have no tasks.";
            setAiOutput(ack);
            await playTts(ack);
            setTaskBrowseActive(false);
          }
          return;
        }
        if (stopTasksTrigger.test(prompt)) {
          setTaskBrowseActive(false);
          const ack = "Okay.";
          setAiOutput(ack);
          await playTts(ack);
          return;
        }
      }

      if (nextTaskTrigger.test(prompt)) {
        setTasksViewMode("single");
        const title = advanceTaskAndGet();
        const ack = title ? `Next task: ${title}.` : "You have no tasks.";
        setAiOutput(ack);
        await playTts(ack);
        return;
      }

      if (otherTasksTrigger.test(prompt)) {
        setTasksViewMode("single");
        const title = advanceTaskAndGet();
        if (title) {
          const ack = `Next task: ${title}. Want to hear the next one?`;
          setAiOutput(ack);
          await playTts(ack);
          setTaskBrowseActive(true);
        } else {
          const ack = "You have no tasks.";
          setAiOutput(ack);
          await playTts(ack);
        }
        return;
      }

      if (topPriorityTrigger.test(prompt)) {
        setTasksViewMode("single");
        const topTask = tasks.length ? tasks[0] : null;
        if (topTask) {
          setCurrentTaskId(topTask.id);
        }
        const ack = topTask
          ? `Top priority task: ${topTask.title}.`
          : "You have no tasks.";
        setAiOutput(ack);
        await playTts(ack);
        return;
      }

      const resolveRes = await aiResolve(prompt);
      if (resolveRes.ok) {
        const completionAcks = [
          "Ok, I'll mark it as done.",
          "Got it, marking that as done.",
          "All set, I marked it as done.",
          "Done. I've marked it.",
          "No problem, it's marked as done.",
          "Okay, marked as done.",
          "Sure, I'll mark it done.",
          "Understood. Marked as done.",
          "Got it. Marked as done.",
          "Okay, I'll mark that as done.",
          "Done. I've got it marked.",
          "All right, it's marked as done.",
          "Consider it done.",
          "Done and marked.",
          "Marked it as done.",
          "Okay, done.",
          "Yep, marking it as done now.",
          "Done. Marked it.",
          "Got it, that's done.",
          "All done. Marked.",
          "Sorted. Marked as done.",
          "Done, I'll mark it.",
          "Okay, I'll mark it.",
          "Great, it's marked as done.",
          "Got it. I'll mark it as done.",
          "All right, I'll mark it as done.",
          "Done — marked as done.",
          "No worries, I marked it done.",
          "Sure thing, it's marked as done.",
          "Okay, that's marked as done.",
        ];
        const ack =
          completionAcks[Math.floor(Math.random() * completionAcks.length)];
        setAiOutput(ack);
        await playTts(ack);
        await refresh();
        return;
      }
      const reclassifyTrigger = /(?:\bmove\b|\breclassif(?:y|y)\b|\bshould be\b|\bmake\b.*\b(task|reminder|event)\b)/i;
      if (reclassifyTrigger.test(prompt)) {
        const reclassifyRes = await aiReclassify(prompt);
        if (reclassifyRes.needs_confirmation && reclassifyRes.options?.length) {
          const target = reclassifyRes.target ?? "task";
          const nextOptions = reclassifyRes.options.map((o) => ({
            ...o,
            target,
          }));
          setReclassifyOptions(nextOptions);
          const optionsText = nextOptions
            .map((o, i) => `${i + 1}) ${o.label} (${o.item_type})`)
            .join("\n");
          setAiOutput(`Which one should I move to ${target}?\n${optionsText}`);
          return;
        }
        if (reclassifyRes.ok) {
          const ack = "Moved it.";
          setAiOutput(ack);
          await playTts(ack);
          await refresh();
          return;
        }
      }
      const priorityTrigger =
        /\b(priority|prioritis(?:e|e)|urgent|important|vital|high|low|medium)\b/i;
      if (priorityTrigger.test(prompt)) {
        const priorityRes = await aiPriority(prompt);
        if (priorityRes.ok && priorityRes.priority) {
          const priorityAcks = [
            `Okay, set it to ${priorityRes.priority}.`,
            `Got it, it’s now ${priorityRes.priority}.`,
            `Done, priority set to ${priorityRes.priority}.`,
            `All set, marked as ${priorityRes.priority}.`,
            `Okay, updated to ${priorityRes.priority}.`,
            `Got it — ${priorityRes.priority} priority.`,
            `Done — ${priorityRes.priority}.`,
            `Updated. It’s ${priorityRes.priority} now.`,
          ];
          const ack =
            priorityAcks[Math.floor(Math.random() * priorityAcks.length)];
          setAiOutput(ack);
          await playTts(ack);
          await refresh();
          return;
        }
      }
      const scheduleRes = await aiSchedule(prompt);
      if (scheduleRes.ok) {
        const action = scheduleRes.action ?? "event";
        const addAcks = [
          "Got it, I added the {type}.",
          "Okay, I added the {type}.",
          "Done — I added the {type}.",
          "All set, the {type} is added.",
          "Sorted, I added the {type}.",
          "Great, I’ve added the {type}.",
          "No problem, I added the {type}.",
          "Okay, the {type} is in.",
          "Added the {type}.",
          "That {type} is added now.",
          "Got it — added the {type}.",
          "All good, I added the {type}.",
          "Consider the {type} added.",
          "Done, the {type} is added.",
          "Noted and added the {type}.",
          "Added the {type} for you.",
          "Got it, that {type} is added.",
          "Okay, that {type} is added.",
          "Sure, I added the {type}.",
          "Done, added the {type}.",
          "Alright, I added the {type}.",
          "Okay, I’ve put the {type} in.",
          "All set — added the {type}.",
          "No worries, the {type} is added.",
          "Added the {type}, all set.",
          "Done, the {type} is in.",
          "Got it, the {type} is now added.",
          "Alright, the {type} is added.",
          "Okay, you’re set — the {type} is added.",
          "Got it — the {type} is added now.",
        ];
        const pickAddAck = (type: "event" | "task" | "tasks" | "alert") =>
          addAcks[Math.floor(Math.random() * addAcks.length)].replace(
            "{type}",
            type
          );
        const workdayAcks = [
          "Got it, I've updated your work schedule.",
          "Okay, your workdays are updated.",
          "All set, I updated your work schedule.",
          "Done — I updated your workdays.",
          "Sorted, I've updated your work schedule.",
          "Okay, I've made those workday changes.",
          "Got it, your workday changes are saved.",
          "All good, your work schedule is updated.",
        ];
        const pickWorkdayAck =
          workdayAcks[Math.floor(Math.random() * workdayAcks.length)];
        const mixedAcks = [
          "Got it, I added everything.",
          "All set, I added those.",
          "Okay, I added all of that.",
          "Done — I added everything.",
          "Sorted, I added those items.",
          "All good, I added it all.",
          "Got it, everything’s added.",
          "Okay, those are added.",
        ];
        const pickMixedAck =
          mixedAcks[Math.floor(Math.random() * mixedAcks.length)];
        let ack = "Done.";
        if (action === "task" && scheduleRes.task) {
          const totalTasks = scheduleRes.tasks?.length ?? 1;
          ack = totalTasks > 1 ? pickAddAck("tasks") : pickAddAck("task");
        } else if (action === "reminder" && scheduleRes.reminder) {
          ack = pickAddAck("alert");
        } else if (action === "workday") {
          ack = pickWorkdayAck;
        } else if (action === "mixed") {
          const mixedCounts = {
            tasks: scheduleRes.tasks?.length ?? 0,
            reminders: scheduleRes.reminders?.length ?? 0,
            events: scheduleRes.events?.length ?? 0,
            workdays: scheduleRes.workdays?.length ?? 0,
          };
          const total =
            mixedCounts.tasks +
            mixedCounts.reminders +
            mixedCounts.events +
            mixedCounts.workdays;
          if (total === 1) {
            if (mixedCounts.tasks) {
              ack = pickAddAck("task");
            } else if (mixedCounts.reminders) {
              ack = pickAddAck("alert");
            } else if (mixedCounts.events) {
              ack = pickAddAck("event");
            } else if (mixedCounts.workdays) {
              ack = pickWorkdayAck;
            } else {
              ack = pickMixedAck;
            }
          } else {
            ack = pickMixedAck;
          }
        } else if (scheduleRes.event) {
          ack = pickAddAck("event");
        }
        setAiOutput(ack);
        await playTts(ack);
        await refresh();
        return;
      }
      const res = await aiRespond(prompt);
      setAiOutput(res.text);
      await playTts(res.text);
    } catch (e: any) {
      setErr(e?.message ?? "failed");
    } finally {
      setAiLoading(false);
    }
  }

  function cleanupManualRecording() {
    if (sttProcessorRef.current) {
      try {
        sttProcessorRef.current.disconnect();
      } catch {
        // Ignore disconnect errors for already-closed nodes.
      }
    }
    if (sttSourceRef.current) {
      try {
        sttSourceRef.current.disconnect();
      } catch {
        // Ignore disconnect errors for already-closed nodes.
      }
    }
    if (sttGainRef.current) {
      try {
        sttGainRef.current.disconnect();
      } catch {
        // Ignore disconnect errors for already-closed nodes.
      }
    }
    sttProcessorRef.current = null;
    sttSourceRef.current = null;
    sttGainRef.current = null;
    if (sttAudioCtxRef.current) {
      try {
        void sttAudioCtxRef.current.close();
      } catch {
        // Ignore close errors for already-closed contexts.
      }
      sttAudioCtxRef.current = null;
    }
    sttManualRef.current = false;
  }

  function encodeWav(samples: Float32Array, sampleRate: number) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i += 1) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, samples.length * 2, true);

    let offset = 44;
    for (let i = 0; i < samples.length; i += 1) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      offset += 2;
    }

    return buffer;
  }

  function buildWavBlob(buffers: Float32Array[], sampleRate: number) {
    const totalLength = buffers.reduce((sum, b) => sum + b.length, 0);
    const merged = new Float32Array(totalLength);
    let offset = 0;
    buffers.forEach((b) => {
      merged.set(b, offset);
      offset += b.length;
    });
    const wav = encodeWav(merged, sampleRate);
    return new Blob([wav], { type: "audio/wav" });
  }

  function startManualRecording(stream: MediaStream) {
    const AudioCtx =
      window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) {
      return false;
    }
    try {
      const ctx = new AudioCtx();
      sttAudioCtxRef.current = ctx;
      sttSampleRateRef.current = ctx.sampleRate;
      const source = ctx.createMediaStreamSource(stream);
      const processor = ctx.createScriptProcessor(4096, 1, 1);
      const gain = ctx.createGain();
      gain.gain.value = 0;
      sttBuffersRef.current = [];
      processor.onaudioprocess = (evt) => {
        const input = evt.inputBuffer.getChannelData(0);
        sttBuffersRef.current.push(new Float32Array(input));
      };
      source.connect(processor);
      processor.connect(gain);
      gain.connect(ctx.destination);
      sttSourceRef.current = source;
      sttProcessorRef.current = processor;
      sttGainRef.current = gain;
      sttManualRef.current = true;
      void ctx.resume();
      setIsRecording(true);
      return true;
    } catch {
      cleanupManualRecording();
      return false;
    }
  }

  async function transcribeBlob(blob: Blob) {
    if (!blob.size) {
      setSttStatus("No audio captured.");
      return;
    }
    try {
      setSttStatus("Transcribing...");
      const res = await sttTranscribe(blob);
      const transcriptText = (res.text || "").trim();
      setSttTranscript(transcriptText || "(no text)");
      if (transcriptText) {
        setAiInput(transcriptText);
        if (!aiLoading) {
          void handleAiSubmit(transcriptText);
        }
      }
      setSttStatus(res.language ? `Language: ${res.language}` : "Done");
    } catch (e: any) {
      setErr(e?.message ?? "failed");
      setSttStatus(null);
    }
  }

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      cleanupManualRecording();
    };
  }, []);

  async function startRecording() {
    if (isRecording) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setErr("Microphone not supported in this browser.");
      return;
    }
    try {
      setErr(null);
      setSttTranscript(null);
      setSttStatus("Listening...");
      const stream =
        streamRef.current ?? (await navigator.mediaDevices.getUserMedia({ audio: true }));
      streamRef.current = stream;
      if (!stream.getAudioTracks().length) {
        setErr("No audio track available from microphone.");
        setSttStatus(null);
        return;
      }
      let recorder: MediaRecorder | null = null;
      const candidates: Array<string | null> = [
        "audio/ogg;codecs=opus",
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        null,
      ];
      const candidateErrors: string[] = [];
      for (const candidate of candidates) {
        if (candidate && !MediaRecorder.isTypeSupported(candidate)) {
          continue;
        }
        try {
          recorder = candidate
            ? new MediaRecorder(stream, { mimeType: candidate })
            : new MediaRecorder(stream);
          recorder.start();
          break;
        } catch (e: any) {
          candidateErrors.push(
            `${candidate ?? "default"}: ${e?.message ?? "unknown error"}`
          );
          recorder = null;
        }
      }
      if (!recorder) {
        const manualStarted = startManualRecording(stream);
        if (manualStarted) {
          mediaRecorderRef.current = null;
          return;
        }
        const supported = candidates
          .filter((t): t is string => Boolean(t) && MediaRecorder.isTypeSupported(t))
          .join(", ");
        const ua = navigator.userAgent || "unknown";
        setErr(
          `MediaRecorder start failed (supported: ${supported || "none"}, attempts: ${
            candidateErrors.join(" | ") || "none"
          }, ua: ${ua})`
        );
        setSttStatus(null);
        return;
      }
      chunksRef.current = [];
      recorder.ondataavailable = (evt) => {
        if (evt.data && evt.data.size > 0) {
          chunksRef.current.push(evt.data);
        }
      };
      recorder.onstop = async () => {
        setIsRecording(false);
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        chunksRef.current = [];
        await transcribeBlob(blob);
      };
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (e: any) {
      setErr(e?.message ?? "Microphone failed");
      setSttStatus(null);
    }
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;
    if (recorder) {
      if (recorder.state !== "inactive") {
        setSttStatus("Processing...");
        recorder.stop();
      }
      return;
    }
    if (sttManualRef.current) {
      setSttStatus("Processing...");
      const buffers = sttBuffersRef.current;
      sttBuffersRef.current = [];
      const sampleRate = sttSampleRateRef.current;
      cleanupManualRecording();
      setIsRecording(false);
      if (!buffers.length) {
        setSttStatus("No audio captured.");
        return;
      }
      const blob = buildWavBlob(buffers, sampleRate);
      void transcribeBlob(blob);
    }
  }

  const isFoodHub = activePage === "food-hub";

  const renderTodayCard = (
    slotClass: string,
    alignClass: string,
    extraClass?: string
  ) => (
    <section
      className={`card glass-tile ${slotClass} ${alignClass}${
        extraClass ? ` ${extraClass}` : ""
      }`}
    >
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
              {workStatus ? (
                <span
                  className={`eventMeta${
                    workFinished ? " eventMeta--done" : " reminderStatus"
                  }${workStatus === "now" ? " reminderStatus--missed" : ""}${
                    workStatus !== "now" && !workFinished ? " reminderStatus--done" : ""
                  }`}
                >
                  {workStatus}
                </span>
              ) : null}
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
                relativeLabel = hours > 0 ? `in ${hours}h ${mins}m` : `in ${mins} mins`;
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
  );

  const renderTasksCard = (slotClass: string, alignClass: string) => (
    <section className={`card glass-tile ${slotClass} ${alignClass}`}>
      <div className="cardHeader">
        <h2>Tasks</h2>
        {tasksViewMode === "single" && currentTask ? (
          <span className={`taskPriority taskPriority--${currentTask.priority}`}>
            {currentTask.priority}
          </span>
        ) : null}
      </div>
      {tasksViewMode === "all" ? (
        tasks.length ? (
          <ul className="taskList">
            {tasks.map((t) => (
              <li key={t.id} className="taskRow">
                <span className={`taskPriority taskPriority--${t.priority}`}>
                  {t.priority}
                </span>
                <span>{t.title}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="big">Excellent work. Congrats on completing your tasks!</p>
        )
      ) : currentTask ? (
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
  );

  const renderAlertsCard = (
    slotClass: string,
    alignClass: string,
    extraClass?: string
  ) => (
    <section
      className={`card glass-tile ${slotClass} ${alignClass}${
        extraClass ? ` ${extraClass}` : ""
      }`}
    >
      <div className="cardHeader">
        <h2>Alerts</h2>
      </div>

      {/* Med reminders (active) */}
      {visibleAlerts.length ? (
        <div className="reminders">
          {visibleAlerts.map((r) => {
            const isMedReminder = ["lanny_zee", "morning_meds", "lunch_meds", "evening_meds"].includes(
              r.reminder_key
            );
            const statusLabel =
              r.derivedStatus === "done"
                ? isMedReminder
                  ? "Taken"
                  : "Done"
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
  );

  const renderPushToTalkCard = (slotClass: string, alignClass: string) => (
    <section className={`card glass-tile ${slotClass} ${alignClass}`}>
      <div className="cardHeader">
        <h2>Push to talk</h2>
      </div>
      <button
        className={`glass-pill micPill${isRecording ? " micPill--recording" : ""}`}
        onMouseDown={(e) => {
          e.preventDefault();
          startRecording();
        }}
        onMouseUp={(e) => {
          e.preventDefault();
          stopRecording();
        }}
        onMouseLeave={() => {
          if (isRecording) stopRecording();
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          startRecording();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          stopRecording();
        }}
      >
        {isRecording ? "Listening..." : "Hold to talk"}
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
      </div>
    </section>
  );

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
          <div className="dateRow">
            <div className="date">{dateStrPretty}</div>
            {!isFoodHub ? (
              <span className="glass-pill glass-pill--small">{workLabel}</span>
            ) : null}
            {isFoodHub ? (
              <button
                className={`glass-pill glass-pill--small micPill micPill--compact${
                  isRecording ? " micPill--recording" : ""
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  startRecording();
                }}
                onMouseUp={(e) => {
                  e.preventDefault();
                  stopRecording();
                }}
                onMouseLeave={() => {
                  if (isRecording) stopRecording();
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  startRecording();
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  stopRecording();
                }}
              >
                {isRecording ? "Listening..." : "Push to talk"}
              </button>
            ) : null}
          </div>
        </div>

        <div className="topRight">
          <button
            type="button"
            className={`glass-pill glass-pill--small navPill${
              !isFoodHub ? " navPill--active" : ""
            }`}
            onClick={() => setActivePage("dashboard")}
            aria-current={!isFoodHub ? "page" : undefined}
          >
            Dashboard
          </button>
          <button
            type="button"
            className={`glass-pill glass-pill--small navPill${
              isFoodHub ? " navPill--active" : ""
            }`}
            onClick={() => setActivePage("food-hub")}
            aria-current={isFoodHub ? "page" : undefined}
          >
            Food Hub
          </button>
        </div>
      </header>
      {aiOutput ? <div className="aiResponse">{aiDisplay ?? aiOutput}</div> : null}

      {err && <div className="err glass-soft">Backend error: {err}</div>}

      {isFoodHub ? (
        <FoodHub
          rightTop={renderTodayCard("slot-r1", "card--right", "card--slim")}
          rightBottom={renderAlertsCard("slot-r2", "card--right", "card--slim")}
        />
      ) : (
        <main className="grid">
          {renderTodayCard("slot-l1", "card--left")}
          {renderTasksCard("slot-r1", "card--right")}

          {/* Middle column: Orb (no tile/background) */}
          <div className="orbSlot" aria-hidden="true">
            <div className={`orbWrap${isVisualSpeaking ? " orbWrap--speaking" : ""}`}>
              <Orb
                hue={0}
                hoverIntensity={isVisualSpeaking ? audioPulse * 2.2 : 0.35}
                rotateOnHover
                forceHoverState={false}
                pulse={0}
                pulseSpeed={16.5}
                autoHover={isVisualSpeaking}
                autoHoverIntensity={isVisualSpeaking ? audioPulse * 1.1 : 1.0}
                autoHoverSpeed={6.0}
                speaking={isVisualSpeaking}
              />
            </div>
          </div>

          <div className="funFactDock">
            <FunFactCard />
          </div>

          {renderAlertsCard("slot-l2", "card--left")}
          {renderPushToTalkCard("slot-r2", "card--right")}
        </main>
      )}

    </div>
  );
}
