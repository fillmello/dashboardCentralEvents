"use client";

import { useSchedule } from "@/src/hooks/useSchedule";
import { useServerNow } from "@/src/hooks/useServerNow";
import { activeScheduleItemId } from "@/src/services/schedule.service";

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

// Compact, read-only cronograma for the Operativo's mobile screen (/tarefas):
// just time + moment + a status dot, no delay math or edit controls. The current
// moment lights up automatically once its planned time is reached (RF-18).
export function SimpleSchedule() {
  const { items, isLoading } = useSchedule();
  const now = useServerNow();
  const activeId = activeScheduleItemId(items, now);

  return (
    <section className="mb-8 border border-black p-4">
      <h2 className="micro mb-3 text-[#6a6a6a]">CRONOGRAMA</h2>

      {isLoading ? (
        <p className="mono text-[#888]">Carregando...</p>
      ) : items.length === 0 ? (
        <p className="mono text-[#888]">Nenhum momento cadastrado.</p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {items.map((item) => {
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
                  {active && (
                    <span className="micro ml-2 text-[#2196f3]">AGORA</span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
