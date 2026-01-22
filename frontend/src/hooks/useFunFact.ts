import { useCallback, useEffect, useRef, useState } from "react";

type FunFactState = {
  text: string | null;
  fetchedAt: Date | null;
};

const FACT_TEXT_KEY = "funFactText";
const FACT_FETCHED_AT_KEY = "funFactFetchedAtISO";
const FACT_LAST_SLOT_KEY = "funFactLastSlotId";

const SLOT_HOURS = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
const SLOT_CHECK_MS = 60_000;

function getLondonParts(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
}

export function getSlotId(now: Date): string {
  const parts = getLondonParts(now);
  const slotHour = SLOT_HOURS[Math.floor(parts.hour / 2)] ?? SLOT_HOURS[0];
  return `${parts.year}-${parts.month}-${parts.day}-${String(slotHour).padStart(2, "0")}`;
}

async function fetchFunFact(): Promise<{ text: string; fetchedAt: Date }> {
  const r = await fetch("https://uselessfacts.jsph.pl/api/v2/facts/random?language=en");
  if (!r.ok) throw new Error(`fun fact failed: ${r.status}`);
  const data = (await r.json()) as { text: string };
  return { text: data.text, fetchedAt: new Date() };
}

export function useFunFact() {
  const [state, setState] = useState<FunFactState>({ text: null, fetchedAt: null });
  const lastSlotIdRef = useRef<string | null>(null);
  const inFlightRef = useRef(false);

  const persist = useCallback((text: string, fetchedAt: Date, slotId: string) => {
    localStorage.setItem(FACT_TEXT_KEY, text);
    localStorage.setItem(FACT_FETCHED_AT_KEY, fetchedAt.toISOString());
    localStorage.setItem(FACT_LAST_SLOT_KEY, slotId);
    lastSlotIdRef.current = slotId;
  }, []);

  const refresh = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    try {
      const { text, fetchedAt } = await fetchFunFact();
      const slotId = getSlotId(new Date());
      persist(text, fetchedAt, slotId);
      setState({ text, fetchedAt });
    } finally {
      inFlightRef.current = false;
    }
  }, [persist]);

  const maybeFetchForSlot = useCallback(async () => {
    const slotId = getSlotId(new Date());
    const lastSlot = lastSlotIdRef.current ?? localStorage.getItem(FACT_LAST_SLOT_KEY);
    if (slotId !== lastSlot) {
      await refresh();
    }
  }, [refresh]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedText = localStorage.getItem(FACT_TEXT_KEY);
    const savedAt = localStorage.getItem(FACT_FETCHED_AT_KEY);
    const savedSlot = localStorage.getItem(FACT_LAST_SLOT_KEY);
    if (savedText) {
      setState({ text: savedText, fetchedAt: savedAt ? new Date(savedAt) : null });
    }
    lastSlotIdRef.current = savedSlot;

    void maybeFetchForSlot();
    const id = setInterval(() => {
      void maybeFetchForSlot();
    }, SLOT_CHECK_MS);
    return () => clearInterval(id);
  }, [maybeFetchForSlot]);

  return {
    text: state.text,
    fetchedAt: state.fetchedAt,
    refresh,
  };
}
