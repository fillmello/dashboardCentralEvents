"use client";

import { useEffect } from "react";

type ToastVariant = "success" | "error";

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: "bg-zinc-900 text-white",
  error:   "bg-red-600 text-white",
};

export function Toast({
  message,
  variant = "success",
  onDismiss,
}: {
  message: string;
  variant?: ToastVariant;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-lg px-5 py-3 text-sm font-medium shadow-lg ${VARIANT_STYLES[variant]}`}
    >
      {message}
    </div>
  );
}
