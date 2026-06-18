"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type SelectOption = { value: string; label: string };

type Props = {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  id?: string;
  // Renders a hidden input so the value is still picked up by FormData.
  name?: string;
  disabled?: boolean;
  // Shown when no option matches `value`.
  placeholder?: string;
  // Wrapper classes — control width/layout from the call site.
  className?: string;
  ariaLabel?: string;
};

// Dropdown matching the post "Responsável" picker: a bordered trigger that opens
// a black/white option list (hover inverts). Replaces the native <select>, whose
// popup is OS-styled and clashes with the theme (especially in dark mode).
export function Select({
  value,
  options,
  onChange,
  id,
  name,
  disabled = false,
  placeholder = "Selecione…",
  className,
  ariaLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  return (
    <div ref={ref} className={`relative ${className ?? ""}`}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 border border-black bg-white px-3 py-2 text-left text-sm text-black focus:outline-none disabled:opacity-50"
      >
        <span className={`truncate ${selected ? "" : "text-[#6a6a6a]"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-[#6a6a6a] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-auto border border-black bg-white shadow-[2px_2px_0_0_#000]">
          {options.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                onClick={() => choose(o.value)}
                className={`block w-full px-3 py-2 text-left text-sm text-black hover:bg-black hover:text-white ${
                  o.value === value ? "bg-[#f0f0f0]" : ""
                }`}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}

      {name && <input type="hidden" name={name} value={value} />}
    </div>
  );
}
