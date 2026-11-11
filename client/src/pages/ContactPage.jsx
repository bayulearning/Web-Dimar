import { useState } from "react";
import { CheckCircle2, Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { PageShell } from "../components/ui/PageShell.jsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { contactApi } from "../services/content.js";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

const storeInfo = {
  phone: "+62 21 5555 0123",
  phoneHref: "tel:+622155550123",
  email: "hello@stride.local",
  address: "Jl. Sudirman Kav. 52, Jakarta Selatan 12190",
  hours: "Senin–Jumat, 09.00–18.00 WIB",
};

export default function ContactPage() {
  useDocumentTitle("Kontak", {
    description:
      "Hubungi tim Stride Athletics untuk pertanyaan produk, pesanan, dan pengembalian.",
  });
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setErrors([]);
    try {
      await contactApi.send({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        subject: form.subject,
        message: form.message,
      });
      setSent(true);
      setForm(initialForm);
    } catch (requestError) {
      setErrors(
        requestError?.errors?.length
          ? requestError.errors
          : [{ field: "form", message: requestError?.message }],
      );
    } finally {
      setSubmitting(false);
    }
  }

  function fieldError(field) {
    return errors.find((entry) => entry.field === field)?.message;
  }

  return (
    <PageShell
      title="Hubungi Kami"
      description="Informasi operasional Stride Athletics dan formulir pesan langsung."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-card border border-border bg-surface p-5">
            <h2 className="font-heading text-sm font-bold uppercase tracking-wide">
              Informasi Operasional
            </h2>
            <ul className="mt-4 space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Phone size={16} className="mt-0.5 text-accent" aria-hidden="true" />
                <span>
                  <span className="block text-[11px] uppercase tracking-wide text-muted">
                    Telepon
                  </span>
                  <a
                    href={storeInfo.phoneHref}
                    className="font-semibold hover:text-accent"
                  >
                    {storeInfo.phone}
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={16} className="mt-0.5 text-accent" aria-hidden="true" />
                <span>
                  <span className="block text-[11px] uppercase tracking-wide text-muted">
                    Email
                  </span>
                  <a
                    href={`mailto:${storeInfo.email}`}
                    className="font-semibold hover:text-accent"
                  >
                    {storeInfo.email}
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 text-accent" aria-hidden="true" />
                <span>
                  <span className="block text-[11px] uppercase tracking-wide text-muted">
                    Alamat
                  </span>
                  <span className="font-semibold">{storeInfo.address}</span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Clock size={16} className="mt-0.5 text-accent" aria-hidden="true" />
                <span>
                  <span className="block text-[11px] uppercase tracking-wide text-muted">
                    Jam Operasional
                  </span>
                  <span className="font-semibold">{storeInfo.hours}</span>
                </span>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a
              href={storeInfo.phoneHref}
              className="inline-flex items-center justify-center gap-2 rounded-control bg-accent px-4 py-2.5 text-sm font-bold text-black"
            >
              <Phone size={15} aria-hidden="true" />
              Telepon
            </a>
            <a
              href={`mailto:${storeInfo.email}`}
              className="inline-flex items-center justify-center gap-2 rounded-control border border-border px-4 py-2.5 text-sm font-semibold hover:border-accent"
            >
              <Mail size={15} aria-hidden="true" />
              Kirim Email
            </a>
          </div>
        </aside>

        <section className="rounded-card border border-border bg-surface p-6">
          <h2 className="font-heading text-lg font-bold uppercase tracking-wide">
            Formulir Kontak
          </h2>
          <p className="mt-1 text-sm text-muted">
            Pesan disimpan di database dan diteruskan ke tim Stride.
          </p>

          {sent ? (
            <div className="mt-5 flex items-start gap-3 rounded-control border border-accent/40 bg-accent/10 p-4 text-sm text-accent">
              <CheckCircle2 size={18} aria-hidden="true" />
              <p>
                Pesan berhasil dikirim. Tim Stride akan menghubungi Anda melalui
                email atau telepon.
              </p>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block text-xs text-muted">
                Nama lengkap <span className="text-danger">*</span>
                <input
                  id="contact-name"
                  name="name"
                  required
                  minLength="2"
                  maxLength="80"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  className="mt-1 w-full rounded-control border border-border bg-bg px-3 py-2.5 text-sm text-fg"
                />
                {fieldError("name") ? (
                  <span className="mt-1 block text-[11px] text-danger">
                    {fieldError("name")}
                  </span>
                ) : null}
              </label>

              <label className="block text-xs text-muted">
                Email <span className="text-danger">*</span>
                <input
                  id="contact-email"
                  name="email"
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  className="mt-1 w-full rounded-control border border-border bg-bg px-3 py-2.5 text-sm text-fg"
                />
                {fieldError("email") ? (
                  <span className="mt-1 block text-[11px] text-danger">
                    {fieldError("email")}
                  </span>
                ) : null}
              </label>

              <label className="block text-xs text-muted">
                Nomor telepon
                <input
                  id="contact-phone"
                  name="phone"
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  className="mt-1 w-full rounded-control border border-border bg-bg px-3 py-2.5 text-sm text-fg"
                />
                {fieldError("phone") ? (
                  <span className="mt-1 block text-[11px] text-danger">
                    {fieldError("phone")}
                  </span>
                ) : null}
              </label>

              <label className="block text-xs text-muted">
                Subjek <span className="text-danger">*</span>
                <input
                  id="contact-subject"
                  name="subject"
                  required
                  minLength="3"
                  maxLength="120"
                  value={form.subject}
                  onChange={(event) => updateField("subject", event.target.value)}
                  className="mt-1 w-full rounded-control border border-border bg-bg px-3 py-2.5 text-sm text-fg"
                />
                {fieldError("subject") ? (
                  <span className="mt-1 block text-[11px] text-danger">
                    {fieldError("subject")}
                  </span>
                ) : null}
              </label>
            </div>

            <label className="block text-xs text-muted">
              Pesan <span className="text-danger">*</span>
              <textarea
                id="contact-message"
                name="message"
                required
                minLength="10"
                maxLength="2000"
                rows="6"
                value={form.message}
                onChange={(event) => updateField("message", event.target.value)}
                className="mt-1 w-full rounded-control border border-border bg-bg px-3 py-2.5 text-sm text-fg"
              />
              {fieldError("message") ? (
                <span className="mt-1 block text-[11px] text-danger">
                  {fieldError("message")}
                </span>
              ) : null}
            </label>

            {fieldError("form") ? (
              <p role="alert" className="text-xs text-danger">
                {fieldError("form")}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-control bg-accent px-5 py-2.5 text-sm font-bold text-black disabled:opacity-60"
            >
              <Send size={15} aria-hidden="true" />
              {submitting ? "Mengirim..." : "Kirim Pesan"}
            </button>
          </form>
        </section>
      </div>
    </PageShell>
  );
}
