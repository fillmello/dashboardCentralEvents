// Light/dark theme preference. The active theme is the source-of-truth `.dark`
// class on <html> (set pre-paint by the inline script in app/layout.tsx to
// avoid a flash); this module reads/flips that class and mirrors it to
// localStorage. A window event keeps the Nav toggle in sync across trees.

export type Theme = "light" | "dark";

const KEY = "praca:theme";
const EVENT = "theme-change";

export function getTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function setTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    window.localStorage.setItem(KEY, theme);
  } catch {
    // best-effort persistence
  }
  window.dispatchEvent(new Event(EVENT));
}

export function toggleTheme(): void {
  setTheme(getTheme() === "dark" ? "light" : "dark");
}

export function subscribeTheme(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}
