import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { authStore } from "../store/authStore.js";
import { useStore } from "../store/useStore.js";

function safeNext(value) {
  return value && value.startsWith("/") ? value : "/akun";
}

export default function RegisterPage() {
  useDocumentTitle("Daftar", {
    description: "Buat akun Stride Athletics untuk checkout lebih cepat.",
    noindex: true,
  });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const auth = useStore(authStore);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (auth.user) {
    return <Navigate to={next} replace />;
  }

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    if (form.password !== form.confirm) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    setSubmitting(true);
    try {
      await authStore.register({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
      });
      navigate(next, { replace: true });
    } catch (requestError) {
      setError(requestError?.message || "Pendaftaran gagal. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <div className="rounded-card border border-border bg-surface p-6 md:p-8">
        <p className="label-caps text-accent">Akun Stride</p>
        <h1 className="mt-2 font-heading text-2xl font-bold uppercase">
          Daftar
        </h1>
        <p className="mt-2 text-sm text-muted">
          Buat akun gratis untuk checkout lebih cepat dan menyimpan wishlist.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="name" className="label-caps text-muted">
              Nama lengkap
            </label>
            <input
              id="name"
              autoComplete="name"
              required
              minLength="2"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              className="mt-2 w-full rounded-control border border-border bg-bg px-3 py-2.5 text-sm"
            />
          </div>

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
              onChange={(event) => updateField("email", event.target.value)}
              className="mt-2 w-full rounded-control border border-border bg-bg px-3 py-2.5 text-sm"
            />
          </div>

          <div>
            <label htmlFor="phone" className="label-caps text-muted">
              Nomor telepon (opsional)
            </label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              className="mt-2 w-full rounded-control border border-border bg-bg px-3 py-2.5 text-sm"
            />
          </div>

          <div>
            <label htmlFor="password" className="label-caps text-muted">
              Password (minimal 8 karakter)
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength="8"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              className="mt-2 w-full rounded-control border border-border bg-bg px-3 py-2.5 text-sm"
            />
          </div>

          <div>
            <label htmlFor="confirm" className="label-caps text-muted">
              Konfirmasi password
            </label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              required
              minLength="8"
              value={form.confirm}
              onChange={(event) => updateField("confirm", event.target.value)}
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
            <UserPlus size={16} aria-hidden="true" />
            {submitting ? "Memproses..." : "Buat Akun"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          Sudah punya akun?{" "}
          <Link
            to={`/login?next=${encodeURIComponent(next)}`}
            className="font-semibold text-accent hover:underline"
          >
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
