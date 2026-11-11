import { Link, Navigate, useLocation } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { authStore } from "../../store/authStore.js";
import { useStore } from "../../store/useStore.js";

export function AdminRoute({ children }) {
  const auth = useStore(authStore);
  const location = useLocation();

  if (auth.status === "loading") {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16">
        <div className="h-40 animate-pulse rounded-card bg-surface-2" />
      </div>
    );
  }

  if (!auth.user) {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
  }

  if (auth.user.role !== "ADMIN") {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16">
        <div className="rounded-card border border-border bg-surface px-6 py-14 text-center">
          <ShieldAlert size={38} className="mx-auto text-danger" aria-hidden="true" />
          <h1 className="mt-4 font-heading text-2xl font-bold uppercase">
            Akses Ditolak
          </h1>
          <p className="mt-2 text-sm text-muted">
            Halaman admin hanya dapat diakses oleh akun dengan peran admin.
          </p>
          <Link
            to="/"
            className="mt-5 inline-block rounded-control bg-fg px-4 py-2 text-sm font-bold text-bg"
          >
            Ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
