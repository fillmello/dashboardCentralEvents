// Shared "how should the Head see the board" preference. Lives here (localStorage
// + a window event) because the control (a dropdown on the MODO HEAD badge in the
// Nav) and the consumer (the dashboard) are separate component trees.

export type HeadView = "kanban" | "lista" | "minhas";

export const HEAD_VIEW_LABELS: Record<HeadView, string> = {
  kanban: "Kanban",
  lista: "Lista",
  minhas: "Pessoal",
};

const KEY = "praca:head-view";
const EVENT = "head-view-change";

export function getHeadView(): HeadView {
  if (typeof window === "undefined") return "kanban";
  const v = window.localStorage.getItem(KEY);
  return v === "lista" || v === "minhas" ? v : "kanban";
}

export function setHeadView(view: HeadView): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, view);
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeHeadView(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}
