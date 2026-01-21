import { useEffect, useMemo, useState } from "react";
import { useFunFact } from "../hooks/useFunFact";

export default function FunFactCard() {
  const { text, fetchedAt } = useFunFact();
  const [animate, setAnimate] = useState(false);

  const updatedLabel = useMemo(() => {
    if (!fetchedAt) return "Updated --:--";
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return `Updated ${formatter.format(fetchedAt)}`;
  }, [fetchedAt]);

  useEffect(() => {
    setAnimate(false);
    const id = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(id);
  }, [text, fetchedAt]);

  return (
    <div className={`funFact${animate ? " funFact--animate" : ""}`}>
      <div className="funFactTitle">Daft fact</div>
      <div className="funFactBody">{text ?? "Fetching a fresh fact..."}</div>
      <div className="funFactMeta">
        <span>{updatedLabel}</span>
      </div>
    </div>
  );
}
