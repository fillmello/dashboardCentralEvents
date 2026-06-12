"use client";

import { useEffect, useState } from "react";

type TimerState = {
  running: boolean;
  startedAt: number | null; // epoch ms when the current run started
  accumulated: number; // ms accumulated from previous runs
};

const KEY = "praca:event-timer";

function load(): TimerState {
  if (typeof window === "undefined")
    return { running: false, startedAt: null, accumulated: 0 };
  try {
    return (
      (JSON.parse(localStorage.getItem(KEY) ?? "") as TimerState) ?? {
        running: false,
        startedAt: null,
        accumulated: 0,
      }
    );
  } catch {
    return { running: false, startedAt: null, accumulated: 0 };
  }
}

function save(state: TimerState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // best-effort persistence
  }
}

function format(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

// RF-19: dedicated event timer (elapsed time) with Start / Pause / Reset.
export function EventTimer() {
  const [state, setState] = useState<TimerState>({
    running: false,
    startedAt: null,
    accumulated: 0,
  });
  const [, tick] = useState(0);

  // Hydrate from localStorage on the client only (avoids SSR mismatch).
  useEffect(() => {
    setState(load());
  }, []);

  useEffect(() => {
    save(state);
    if (!state.running) return;
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [state]);

  const elapsed =
    state.accumulated +
    (state.running && state.startedAt ? Date.now() - state.startedAt : 0);

  const start = () =>
    setState((s) =>
      s.running ? s : { ...s, running: true, startedAt: Date.now() },
    );
  const pause = () =>
    setState((s) =>
      s.running && s.startedAt
        ? {
            running: false,
            startedAt: null,
            accumulated: s.accumulated + (Date.now() - s.startedAt),
          }
        : s,
    );
  const reset = () =>
    setState({ running: false, startedAt: null, accumulated: 0 });

  return (
    <div className="flex flex-col">
      <span className="micro text-[#6a6a6a]">TEMPO DE EVENTO</span>
      <div className="flex items-center gap-3">
        <span className="display text-2xl tabular-nums">{format(elapsed)}</span>
        <div className="flex gap-1">
          {!state.running ? (
            <button
              type="button"
              onClick={start}
              className="micro bg-black px-2 py-1 text-white hover:opacity-90"
            >
              INICIAR
            </button>
          ) : (
            <button
              type="button"
              onClick={pause}
              className="micro border border-black px-2 py-1 text-black hover:bg-black hover:text-white"
            >
              PAUSAR
            </button>
          )}
          <button
            type="button"
            onClick={reset}
            className="micro border border-black px-2 py-1 text-black hover:bg-black hover:text-white"
          >
            ZERAR
          </button>
        </div>
      </div>
    </div>
  );
}
