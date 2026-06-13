"use client";

type ConfirmModalProps = {
  isOpen: boolean;
  message: string;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

// Brutalist confirm dialog matching the post/approval modals (border-black,
// titled header, micro buttons).
export function ConfirmModal({
  isOpen,
  message,
  title = "Confirmar",
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm border border-black bg-white">
        <header className="border-b border-black px-5 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide">
            {title}
          </h2>
        </header>
        <div className="px-5 py-5">
          <p className="text-sm text-[#555]">{message}</p>
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="micro border border-black px-4 py-2 text-black hover:bg-black hover:text-white"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="micro bg-black px-4 py-2 text-white hover:opacity-90"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
