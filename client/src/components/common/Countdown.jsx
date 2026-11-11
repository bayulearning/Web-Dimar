import { useEffect, useState } from "react";

function diffParts(targetTime) {
  const distance = Math.max(targetTime - Date.now(), 0);
  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((distance / (1000 * 60)) % 60),
    seconds: Math.floor((distance / 1000) % 60),
    ended: distance <= 0,
  };
}

const pad = (value) => String(value).padStart(2, "0");

export function Countdown({ target, label }) {
  const targetTime = new Date(target).getTime();
  const [parts, setParts] = useState(() => diffParts(targetTime));

  useEffect(() => {
    const timer = setInterval(() => setParts(diffParts(targetTime)), 1000);
    return () => clearInterval(timer);
  }, [targetTime]);

  if (parts.ended) {
    return (
      <div className="bg-accent px-4 py-2 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-black">
        Drop telah berakhir
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 bg-accent px-4 py-2 text-center text-[11px] font-bold uppercase tracking-wider text-black">
      <span>{label}</span>
      <span className="inline-flex items-center gap-1" role="timer" aria-live="off">
        <span className="rounded bg-black/15 px-1.5 py-0.5">{pad(parts.days)}h</span>
        <span>:</span>
        <span className="rounded bg-black/15 px-1.5 py-0.5">{pad(parts.hours)}j</span>
        <span>:</span>
        <span className="rounded bg-black/15 px-1.5 py-0.5">{pad(parts.minutes)}m</span>
        <span>:</span>
        <span className="rounded bg-black/15 px-1.5 py-0.5">{pad(parts.seconds)}d</span>
      </span>
    </div>
  );
}
