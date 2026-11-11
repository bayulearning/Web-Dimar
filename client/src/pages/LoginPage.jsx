import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { authStore } from "../store/authStore.js";
import { useStore } from "../store/useStore.js";

function safeNext(value) {
  return value && value.startsWith("/") ? value : "/akun";
}

export default function LoginPage() {
  useDocumentTitle("Masuk", {
    description: "Masuk ke akun Stride Athletics.",
    noindex: true,
  });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const auth = useStore(authStore);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (auth.user) {
    return <Navigate to={next} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await authStore.login(form);
      navigate(next, { replace: true });
    } catch (requestError) {
      setError(requestError?.message || "Login gagal. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <div className="rounded-card border border-border bg-surface p-6 md:p-8">
        <p className="label-caps text-accent">Akun Stride</p>
        <h1 className="mt-2 font-heading text-2xl font-bold uppercase">
          Masuk
        </h1>
        <p className="mt-2 text-sm text-muted">
          Masuk untuk melanjutkan checkout, menyimpan alamat, dan melihat
          pesanan.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="label-caps text-muted">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              className="mt-2 w-full rounded-control border border-border bg-bg px-3 py-2.5 text-sm"
            />
          </div>

          <div>
            <label htmlFor="password" className="label-caps text-muted">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              className="mt-2 w-full rounded-control border border-border bg-bg px-3 py-2.5 text-sm"
            />
          </div>

          {error ? (
            <p
              role="alert"
              className="rounded-control border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger"
            >
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-control bg-accent px-5 py-3 text-sm font-bold text-black disabled:opacity-60"
          >
            <LogIn size={16} aria-hidden="true" />
            {submitting ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          Belum punya akun?{" "}
          <Link
            to={`/daftar?next=${encodeURIComponent(next)}`}
            className="font-semibold text-accent hover:underline"
          >
            Daftar sekarang
          </Link>
        </p>

        <div className="mt-6 rounded-control border border-border bg-bg p-3 text-[11px] text-muted">
          <p className="font-semibold text-fg">Akun development</p>
          <p className="mt-1">Demo: demo@stride.local / Demo#12345</p>
          <p>User: user@stride.local / User#12345</p>
          <p>Admin: admin@stride.local / Admin#12345</p>
        </div>
      </div>
    </div>
  );
}
