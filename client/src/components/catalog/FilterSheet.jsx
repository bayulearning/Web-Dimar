import { X } from "lucide-react";

export function FilterSheet({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Filter produk"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        aria-label="Tutup filter"
        onClick={onClose}
      />
      <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-border bg-surface p-5 pb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-base font-bold uppercase tracking-wide">
            Filter Produk
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup filter"
            className="rounded-control p-2 hover:bg-surface-2"
          >
            <X size={18} />
          </button>
        </div>
        {children}
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-control bg-fg px-4 py-3 text-sm font-bold text-bg"
        >
          Terapkan Filter
        </button>
      </div>
    </div>
  );
}
