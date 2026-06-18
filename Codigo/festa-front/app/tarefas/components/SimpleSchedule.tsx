"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useSchedule } from "@/src/hooks/useSchedule";
import { useServerNow } from "@/src/hooks/useServerNow";
import {
  activeScheduleItemId,
  type ScheduleItem,
} from "@/src/services/schedule.service";

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// done → green, em andamento → blue (active), pendente → gray.
function dotColor(done: boolean, active: boolean): string {
  if (done) return "#2a622a";
  if (active) return "#2196f3";
  return "#c0c0c0";
}

// Compact, read-only cronograma for the Operativo's mobile screen (/tarefas).
// Collapsed it shows only the current moment and the next one; the chevron
// expands it to the full list. The current moment lights up automatically once
// its planned time is reached (RF-18).
export function SimpleSchedule() {
  const { items, isLoading } = useSchedule();
  const now = useServerNow();
  const activeId = activeScheduleItemId(items, now);
  const [expanded, setExpanded] = useState(false);

  // Collapsed view: the current (active) moment and the next pending one. Before
  // anything is active, the first pending moment shows as "A SEGUIR".
  const activeIndex =
    activeId == null ? -1 : items.findIndex((i) => i.id === activeId);
  const current = activeIndex >= 0 ? items[activeIndex] : null;
  const next =
    (activeIndex >= 0
      ? items.slice(activeIndex + 1).find((i) => !i.done)
      : items.find((i) => !i.done)) ?? null;

  const renderItem = (item: ScheduleItem, label?: string) => {
    const active = !item.done && item.id === activeId;
    return (
      <li key={item.id} className="flex items-start gap-3">
        <span className="mono w-12 shrink-0 pt-px text-[#888] tabular-nums">
          {fmtTime(item.plannedTime)}
        </span>
        <span
          className={`mt-1 inline-block h-2 w-2 shrink-0 rounded-full ${active ? "animate-pulse" : ""}`}
          style={{ background: dotColor(item.done, active) }}
        />
        <span
          className={`flex-1 text-sm leading-tight ${
            item.done
              ? "text-[#888] line-through"
              : active
                ? "font-semibold text-black"
                : "text-black"
          }`}
        >
          {item.name}
          {label && (
            <span
              className={`micro ml-2 ${label === "AGORA" ? "text-[#2196f3]" : "text-[#6a6a6a]"}`}
            >
              {label}
            </span>
          )}
        </span>
      </li>
    );
  };

  return (
    <section className="mt-8 border border-black">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <span className="micro text-[#6a6a6a]">CRONOGRAMA</span>
        <ChevronDown
          size={16}
          className={`text-[#6a6a6a] transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      <div className="border-t border-[#eee] px-4 py-3">
        {isLoading ? (
          <p className="mono text-[#888]">Carregando...</p>
        ) : items.length === 0 ? (
          <p className="mono text-[#888]">Nenhum momento cadastrado.</p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {expanded ? (
              items.map((item) =>
                renderItem(
                  item,
                  !item.done && item.id === activeId ? "AGORA" : undefined,
                ),
              )
            ) : current || next ? (
              <>
                {current && renderItem(current, "AGORA")}
                {next && renderItem(next, "A SEGUIR")}
              </>
            ) : (
              <li className="mono text-[#888]">Nenhum momento em andamento.</li>
            )}
          </ul>
        )}
      </div>
    </section>
  );
}
