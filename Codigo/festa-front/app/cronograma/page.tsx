"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/app/components/Alert";
import { IconPlus, IconTrash } from "@/app/components/icons";
import { useRouteGuard } from "@/src/hooks/useRouteGuard";
import { useSchedule } from "@/src/hooks/useSchedule";
import { useServerNow } from "@/src/hooks/useServerNow";
import { getAuthState } from "@/src/lib/auth-client";
import {
  activeScheduleItemId,
  type ScheduleItem,
  scheduleService,
} from "@/src/services/schedule.service";
import { EventClock } from "./components/EventClock";
import { EventTimer } from "./components/EventTimer";

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Start delay vs the planned time (RF-11): late (+), early (−) or on time. The
// current moment (by clock) shows as "Em andamento" automatically.
function startDelayLabel(
  item: ScheduleItem,
  isActive: boolean,
): { text: string; tone: string } {
  if (isActive && !item.actualStartTime)
    return { text: "Em andamento", tone: "text-[#2196f3]" };
  if (!item.actualStartTime) {
    if (Date.now() > new Date(item.plannedTime).getTime() && !item.done)
      return { text: "Atrasado", tone: "text-red-600" };
    return { text: "Previsto", tone: "text-[#888]" };
  }
  const diffMin = Math.round(
    (new Date(item.actualStartTime).getTime() -
      new Date(item.plannedTime).getTime()) /
      60000,
  );
  if (diffMin >= 2)
    return { text: `Atrasado +${diffMin}min`, tone: "text-red-600" };
  if (diffMin <= -2)
    return { text: `Adiantado ${diffMin}min`, tone: "text-green-700" };
  return { text: "No horário", tone: "text-green-700" };
}

export default function CronogramaPage() {
  const { isChecking } = useRouteGuard("view-all");
  const [isGestao, setIsGestao] = useState(false);
  const { items, isLoading, error, reload } = useSchedule();
  const now = useServerNow();
  const activeId = activeScheduleItemId(items, now);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    setIsGestao(getAuthState().isGestao);
  }, []);

  const run = async (id: number, fn: () => Promise<unknown>) => {
    setBusyId(id);
    setActionError(null);
    try {
      await fn();
      await reload();
    } catch (e) {
      setActionError(Array.isArray(e) ? e[0] : "Ação não concluída");
    } finally {
      setBusyId(null);
    }
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = (fd.get("name") as string).trim();
    const local = fd.get("plannedTime") as string;
    if (!name || !local) return;
    setActionError(null);
    try {
      await scheduleService.create({
        name,
        plannedTime: new Date(local).toISOString(),
      });
      form.reset();
      await reload();
    } catch (e) {
      setActionError(Array.isArray(e) ? e[0] : "Erro ao adicionar o momento");
    }
  };

  if (isChecking) return null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="display mb-2 text-xl">CRONOGRAMA</h1>

      {!isGestao && (
        <p className="micro mb-5 text-[#6a6a6a]">
          Somente leitura — apenas a Coordenação edita o cronograma.
        </p>
      )}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-6 border border-black px-5 py-4">
        <EventClock />
        <EventTimer />
      </div>

      {(error || actionError) && (
        <Alert message={error ?? actionError ?? ""} className="mb-4" />
      )}

      {isGestao && (
        <form
          onSubmit={handleCreate}
          className="mb-6 flex flex-wrap items-end gap-3 border border-black p-4"
        >
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="name" className="micro text-[#6a6a6a]">
              MOMENTO
            </label>
            <input
              id="name"
              name="name"
              required
              placeholder="Ex.: Abertura do palco"
              className="border border-black px-3 py-2 text-sm focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="plannedTime" className="micro text-[#6a6a6a]">
              HORÁRIO PREVISTO
            </label>
            <input
              id="plannedTime"
              name="plannedTime"
              type="datetime-local"
              required
              className="border border-black px-3 py-2 text-sm focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="micro inline-flex items-center gap-1.5 bg-black px-3 py-2.5 text-white hover:opacity-90"
          >
            <IconPlus size={12} /> ADICIONAR
          </button>
        </form>
      )}

      {isLoading ? (
        <p className="mono text-[#6a6a6a]">Carregando...</p>
      ) : items.length === 0 ? (
        <p className="mono text-[#6a6a6a]">Nenhum momento cadastrado.</p>
      ) : (
        <div className="border border-black">
          {items.map((item) => {
            const active = !item.done && item.id === activeId;
            const delay = startDelayLabel(item, active);
            return (
              <div
                key={item.id}
                className={`flex items-center gap-4 border-b border-[#eee] px-4 py-3 last:border-b-0 ${
                  active
                    ? "border-l-4 border-l-[#2196f3] bg-[#eef6ff]"
                    : item.done
                      ? "bg-[#fafafa]"
                      : ""
                }`}
              >
                <div className="w-14 shrink-0">
                  <div className="display text-lg tabular-nums">
                    {fmtTime(item.plannedTime)}
                  </div>
                </div>
                <div className="flex-1">
                  <div
                    className={`text-sm ${item.done ? "text-[#888] line-through" : "text-black"}`}
                  >
                    {item.name}
                  </div>
                  <div className="mono flex gap-3">
                    <span className={delay.tone}>{delay.text}</span>
                    {item.actualStartTime && (
                      <span className="text-[#888]">
                        início {fmtTime(item.actualStartTime)}
                      </span>
                    )}
                    {item.actualEndTime && (
                      <span className="text-[#888]">
                        fim {fmtTime(item.actualEndTime)}
                      </span>
                    )}
                  </div>
                </div>
                {isGestao && (
                  <div className="flex shrink-0 items-center gap-1.5">
                    {!item.actualStartTime && !item.done && (
                      <button
                        type="button"
                        disabled={busyId === item.id}
                        onClick={() =>
                          run(item.id, () => scheduleService.start(item.id))
                        }
                        className="micro border border-black px-2 py-1 hover:bg-black hover:text-white disabled:opacity-50"
                      >
                        INICIAR
                      </button>
                    )}
                    {!item.done && (
                      <button
                        type="button"
                        disabled={busyId === item.id}
                        onClick={() =>
                          run(item.id, () => scheduleService.conclude(item.id))
                        }
                        className="micro bg-black px-2 py-1 text-white hover:opacity-90 disabled:opacity-50"
                      >
                        CONCLUIR
                      </button>
                    )}
                    {item.done && (
                      <button
                        type="button"
                        disabled={busyId === item.id}
                        onClick={() =>
                          run(item.id, () => scheduleService.restart(item.id))
                        }
                        className="micro border border-black px-2 py-1 hover:bg-black hover:text-white disabled:opacity-50"
                      >
                        REINICIAR
                      </button>
                    )}
                    <button
                      type="button"
                      aria-label="Remover"
                      disabled={busyId === item.id}
                      onClick={() =>
                        run(item.id, () => scheduleService.remove(item.id))
                      }
                      className="text-[#6a6a6a] hover:text-red-600 disabled:opacity-50"
                    >
                      <IconTrash size={14} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
