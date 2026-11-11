import { Link } from "react-router-dom";
import { AlertCircle, PackageOpen } from "lucide-react";

export function EmptyState({
  title = "Belum ada data",
  description,
  action,
  icon: Icon = PackageOpen,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-border bg-surface px-6 py-14 text-center">
      <Icon size={36} className="text-muted" aria-hidden="true" />
      <h2 className="mt-4 font-heading text-lg font-semibold">{title}</h2>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-border bg-surface px-6 py-12 text-center">
      <AlertCircle size={34} className="text-danger" aria-hidden="true" />
      <h2 className="mt-4 font-heading text-lg font-semibold">
        Gagal memuat data
      </h2>
      <p className="mt-1 max-w-md text-sm text-muted">
        {error?.message || "Terjadi kesalahan saat menghubungi server."}
      </p>
      <div className="mt-5 flex gap-3">
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-control bg-fg px-4 py-2 text-sm font-bold text-bg"
          >
            Coba lagi
          </button>
        ) : null}
        <Link
          to="/"
          className="rounded-control border border-border px-4 py-2 text-sm font-semibold"
        >
          Ke Beranda
        </Link>
      </div>
    </div>
  );
}
