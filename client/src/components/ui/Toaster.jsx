import { CheckCircle2, X, AlertCircle } from "lucide-react";
import { toastStore } from "../../store/toastStore.js";
import { useStore } from "../../store/useStore.js";

export function Toaster() {
  const { toasts } = useStore(toastStore);

  if (!toasts.length) return null;

  return (
    <div
      className="fixed inset-x-4 bottom-20 z-50 flex flex-col items-center gap-2 md:inset-x-auto md:bottom-6 md:right-6 md:items-end"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex w-full max-w-sm items-start gap-2 rounded-card border border-border bg-surface-2 px-4 py-3 text-sm shadow-lg"
        >
          {toast.type === "error" ? (
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-danger" />
          ) : (
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-accent" />
          )}
          <p className="flex-1">{toast.message}</p>
          <button
            type="button"
            onClick={() => toastStore.dismiss(toast.id)}
            aria-label="Tutup notifikasi"
            className="rounded p-1 text-muted hover:text-fg"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
