"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getTheme,
  subscribeTheme,
  type Theme,
  toggleTheme,
} from "@/src/lib/theme";

// Sun/moon switch for the Nav. Renders nothing until mounted so the icon matches
// the client-resolved theme (the `.dark` class is set pre-paint, before React).
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTheme(getTheme());
    return subscribeTheme(() => setTheme(getTheme()));
  }, []);

  if (!mounted) return null;

  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={dark ? "Ativar modo claro" : "Ativar modo escuro"}
      title={dark ? "Modo claro" : "Modo escuro"}
      className="text-[#6a6a6a] transition-colors hover:text-black"
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
