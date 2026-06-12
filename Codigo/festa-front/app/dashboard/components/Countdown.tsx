"use client";

import { useEffect, useState } from "react";
import { EVENT_START } from "@/src/lib/domain";

function remainingMs(): number {
  return EVENT_START.getTime() - Date.now();
}

// Countdown to the start of the programação (RF). Once it hits zero the event
// is "AO VIVO".
export function Countdown() {
  const [ms, setMs] = useState(remainingMs);

  useEffect(() => {
    const id = setInterval(() => setMs(remainingMs()), 1000);
    return () => clearInterval(id);
  }, []);

  if (ms <= 0) {
    return (
      <div className="border border-black bg-black px-3 py-2.5 text-white">
        <div className="micro text-white/70">PROGRAMAÇÃO</div>
        <div className="display mt-0.5 inline-flex items-center gap-2 text-lg">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-white" />
          AO VIVO
        </div>
      </div>
    );
  }

  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="border border-black px-3 py-2.5">
      <div className="micro text-[#6a6a6a]">COMEÇA EM</div>
      <div className="display mt-0.5 text-lg tabular-nums">
        {days > 0 && `${days}d `}
        {pad(hours)}:{pad(minutes)}:{pad(seconds)}
      </div>
      <div className="mono mt-0.5 text-[#888]">
        {EVENT_START.toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
  );
}
