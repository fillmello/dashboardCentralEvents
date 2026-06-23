"use client";

import { EVENT_START } from "@/src/lib/domain";
import type { ScheduleItem } from "@/src/services/schedule.service";

const pad = (n: number) => String(n).padStart(2, "0");

// MM:SS, or H:MM:SS once it passes an hour.
function fmtStage(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

type Props = {
  items: ScheduleItem[];
  // Server-corrected "now" (RF-18), ticked by the parent so the countdown and
  // the schedule list share a single clock.
  now: number;
};

// Before the programação starts, this counts down to EVENT_START. Once the event
// is live it turns into a timer to the next stage of the schedule (the next
// pending moment); with no upcoming moments left it just shows "AO VIVO".
export function Countdown({ items, now }: Props) {
  const started = now >= EVENT_START.getTime();

  if (!started) {
    const totalSec = Math.floor((EVENT_START.getTime() - now) / 1000);
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
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

  // Live: count down to the next pending stage of the programação.
  const nextUpcoming =
    items.find((i) => !i.done && new Date(i.plannedTime).getTime() > now) ??
    null;

  if (!nextUpcoming) {
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

  return (
    <div className="border border-black bg-black px-3 py-2.5 text-white">
      <div className="micro inline-flex items-center gap-1.5 text-white/70">
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
        PRÓXIMA ETAPA EM
      </div>
      <div className="display mt-0.5 text-lg tabular-nums">
        {fmtStage(new Date(nextUpcoming.plannedTime).getTime() - now)}
      </div>
      <div className="mono mt-0.5 truncate text-white/60">
        {nextUpcoming.name}
      </div>
    </div>
  );
}
