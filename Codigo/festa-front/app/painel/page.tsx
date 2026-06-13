"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert } from "@/app/components/Alert";
import { useRouteGuard } from "@/src/hooks/useRouteGuard";
import { getAccessToken } from "@/src/lib/auth-client";
import {
  PIPELINE,
  POST_TYPE_LABELS,
  POST_TYPES,
  STATUS_COLOR,
  STATUS_LABELS,
} from "@/src/lib/domain";
import { getSocket } from "@/src/lib/socket";
import {
  type CollaboratorKpi,
  type GeneralKpis,
  metricsService,
  type StageTimes,
} from "@/src/services/metrics.service";

const POST_EVENTS = ["post:created", "post:updated", "post:deleted"] as const;

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "—";
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return s ? `${m}m ${s}s` : `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

export default function PainelPage() {
  const { isChecking } = useRouteGuard("view-all");
  const [general, setGeneral] = useState<GeneralKpis | null>(null);
  const [collaborators, setCollaborators] = useState<CollaboratorKpi[]>([]);
  const [stageTimes, setStageTimes] = useState<StageTimes | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [g, c, s] = await Promise.all([
        metricsService.general(),
        metricsService.collaborators(),
        metricsService.stageTimes(),
      ]);
      setGeneral(g);
      setCollaborators(c);
      setStageTimes(s);
      setError(null);
    } catch (e) {
      setError(Array.isArray(e) ? e[0] : "Erro ao carregar as métricas");
    }
  }, []);

  useEffect(() => {
    if (isChecking) return;
    void load();
    const socket = getSocket();
    let timer: ReturnType<typeof setTimeout> | null = null;
    const onChange = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => void load(), 200);
    };
    POST_EVENTS.forEach((evt) => socket.on(evt, onChange));
    return () => {
      if (timer) clearTimeout(timer);
      POST_EVENTS.forEach((evt) => socket.off(evt, onChange));
    };
  }, [isChecking, load]);

  const downloadCsv = async () => {
    try {
      const res = await fetch(metricsService.exportCsvUrl(), {
        headers: { Authorization: `Bearer ${getAccessToken() ?? ""}` },
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "mapa-de-posts.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Não foi possível exportar o CSV");
    }
  };

  if (isChecking) return null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="display text-xl">PAINEL DE KPIs</h1>
        <button
          type="button"
          onClick={downloadCsv}
          className="micro border border-black px-3 py-2 text-black hover:bg-black hover:text-white"
        >
          EXPORTAR CSV
        </button>
      </div>

      {error && <Alert message={error} className="mb-4" />}

      {/* RF-14: general counters */}
      <div className="mb-8 grid grid-cols-2 border border-black sm:grid-cols-4">
        {[
          { label: "TOTAL", value: general?.total ?? 0 },
          { label: "PUBLICADOS", value: `${general?.publishedPct ?? 0}%` },
          { label: "EM ANDAMENTO", value: general?.inProgress ?? 0 },
          { label: "NÃO INICIADOS", value: general?.notStarted ?? 0 },
        ].map((kpi, i) => (
          <div
            key={kpi.label}
            className="px-4 py-5"
            style={{ borderLeft: i > 0 ? "1px solid #000" : "none" }}
          >
            <div className="micro text-[#6a6a6a]">{kpi.label}</div>
            <div className="display mt-1 text-2xl">{kpi.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* By type */}
        <section>
          <h2 className="micro mb-3 text-black">POR TIPO</h2>
          <div className="border border-black">
            {POST_TYPES.map((t) => (
              <div
                key={t}
                className="flex items-center justify-between border-b border-[#eee] px-4 py-2 last:border-b-0"
              >
                <span className="text-sm">{POST_TYPE_LABELS[t]}</span>
                <span className="mono">{general?.byType[t] ?? 0}</span>
              </div>
            ))}
          </div>

          {/* RF-16: average time per stage */}
          <h2 className="micro mb-3 mt-6 text-black">TEMPO MÉDIO POR ETAPA</h2>
          <div className="border border-black">
            {PIPELINE.map((s) => (
              <div
                key={s}
                className="flex items-center justify-between border-b border-[#eee] px-4 py-2 last:border-b-0"
              >
                <span className="inline-flex items-center gap-2 text-sm">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ background: STATUS_COLOR[s] }}
                  />
                  {STATUS_LABELS[s]}
                </span>
                <span className="mono text-[#555]">
                  {formatDuration(stageTimes?.[s] ?? null)}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* RF-15: per-collaborator delivery (assigned vs published) */}
        <section>
          <h2 className="micro mb-3 text-black">PRODUÇÃO POR PESSOA</h2>
          <div className="flex flex-col gap-3">
            {collaborators.length === 0 && (
              <p className="mono text-[#888]">Nenhum colaborador.</p>
            )}
            {collaborators.map((c) => {
              const pct = c.assigned ? (c.published / c.assigned) * 100 : 0;
              return (
                <div key={c.userId}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm">{c.fullName}</span>
                    <span className="mono text-[#555]">
                      {c.published}/{c.assigned}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#eee]">
                    <div
                      className="h-2 bg-black"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
