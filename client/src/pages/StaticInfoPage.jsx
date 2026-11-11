import { Link } from "react-router-dom";
import { Info } from "lucide-react";
import { PageShell } from "../components/ui/PageShell.jsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";

export function StaticInfoPage({ title, description, sections = [] }) {
  useDocumentTitle(title, { description });

  return (
    <PageShell title={title} description={description}>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_260px]">
        <div className="space-y-4">
          {sections.map((section) => (
            <section
              key={section.heading}
              className="rounded-card border border-border bg-surface p-6"
            >
              <h2 className="font-heading text-base font-bold uppercase tracking-wide">
                {section.heading}
              </h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-fg/90">
                {section.paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="space-y-4">
          <div className="rounded-card border border-border bg-surface p-5 text-xs text-muted">
            <p className="flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-wide text-fg">
              <Info size={15} className="text-accent" aria-hidden="true" />
              Catatan
            </p>
            <p className="mt-2">
              Halaman ini merupakan informasi resmi Stride Athletics dan dapat
              diperbarui sewaktu-waktu.
            </p>
          </div>
          <div className="rounded-card border border-border bg-surface p-5 text-xs text-muted">
            <p className="font-heading text-sm font-bold uppercase tracking-wide text-fg">
              Butuh Bantuan?
            </p>
            <p className="mt-2">
              Pertanyaan tentang pesanan atau pengembalian dapat dikirim ke tim
              Stride.
            </p>
            <div className="mt-3 flex flex-col gap-2 font-semibold">
              <Link to="/bantuan" className="text-accent hover:underline">
                Pusat Bantuan
              </Link>
              <Link to="/kontak" className="text-accent hover:underline">
                Hubungi Kami
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
