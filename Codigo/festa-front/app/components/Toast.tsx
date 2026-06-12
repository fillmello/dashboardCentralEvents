"use client";

import { useEffect } from "react";

type ToastVariant = "success" | "error";

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: "bg-zinc-900 text-white",
  error: "bg-red-600 text-white",
};

export function Toast({
  message,
  variant = "success",
  onDismiss,
  action,
}: {
  message: string;
  variant?: ToastVariant;
  onDismiss: () => void;
  /** Optional inline action, e.g. "DESFAZER" to undo a removal. */
  action?: { label: string; onClick: () => void };
}) {
  // Give the user a little longer to react when there's an action to take.
  const durationMs = action ? 5000 : 3000;
  useEffect(() => {
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [onDismiss, durationMs]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex max-w-sm items-center gap-4 rounded-lg px-5 py-3 text-sm font-medium shadow-lg ${VARIANT_STYLES[variant]}`}
    >
      <span>{message}</span>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="shrink-0 border-l border-white/30 pl-4 text-xs font-semibold uppercase tracking-wide hover:opacity-80"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
