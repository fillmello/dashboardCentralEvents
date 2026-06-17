"use client";

import { useSchedule } from "@/src/hooks/useSchedule";
import { useServerNow } from "@/src/hooks/useServerNow";
import { activeScheduleItemId } from "@/src/services/schedule.service";
import { Countdown } from "./Countdown";

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

// Left rail on the board (Gestão + Painel): countdown + the event programação
// (RF-10..13), read-only. Full management lives on /cronograma.
export function SchedulePanel() {
  const { items, isLoading } = useSchedule();
  const now = useServerNow();
  // The current moment lights up automatically once its time is reached.
  const activeId = activeScheduleItemId(items, now);

  return (
    <aside className="flex w-[310px] shrink-0 flex-col gap-3 overflow-y-auto border-r border-black bg-white p-4">
      <Countdown />

      <div className="micro mt-1 text-[#6a6a6a]">PROGRAMAÇÃO</div>

      {isLoading ? (
        <p className="mono text-[#888]">Carregando...</p>
      ) : items.length === 0 ? (
        <p className="mono text-[#888]">Nenhum momento cadastrado.</p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {items.map((item) => {
            const active = !item.done && item.id === activeId;
            return (
              <li key={item.id} className="flex items-start gap-2">
                <span
                  className={`mt-1 inline-block h-2 w-2 shrink-0 rounded-full ${active ? "animate-pulse" : ""}`}
                  style={{ background: dotColor(item.done, active) }}
                />
                <div>
                  <div
                    className={`text-sm leading-tight ${
                      item.done
                        ? "text-[#888] line-through"
                        : active
                          ? "font-semibold text-black"
                          : "text-black"
                    }`}
                  >
                    {item.name}
                  </div>
                  <div className="mono text-[#888]">
                    {fmtTime(item.plannedTime)}
                    {active && <span className="text-[#2196f3]"> · no ar</span>}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
