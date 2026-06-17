"use client";

import { useEffect, useRef, useState } from "react";
import {
  getHeadView,
  HEAD_VIEW_LABELS,
  type HeadView,
  setHeadView,
  subscribeHeadView,
} from "@/src/lib/headView";

const VIEWS: HeadView[] = ["kanban", "lista", "minhas"];

// The MODO HEAD badge doubles as the board-view switcher: clicking it drops a
// small menu with Kanban / Lista / Minhas tarefas. Replaces the inline buttons.
export function HeadViewBadge() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<HeadView>("kanban");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setView(getHeadView());
    return subscribeHeadView(() => setView(getHeadView()));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [open]);

  const choose = (v: HeadView) => {
    setHeadView(v);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="micro inline-flex items-center gap-1.5 bg-black px-2 py-1 text-white"
      >
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-white" />
        {HEAD_VIEW_LABELS[view]}
        <span className="opacity-70">▾</span>
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1 min-w-[160px] border border-black bg-white shadow-[2px_2px_0_0_#000]">
          {VIEWS.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => choose(v)}
              className={`micro flex w-full items-center justify-between px-3 py-2 text-left hover:bg-black hover:text-white ${
                view === v ? "bg-[#f0f0f0]" : ""
              }`}
            >
              {HEAD_VIEW_LABELS[v]}
              {view === v && <span>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
