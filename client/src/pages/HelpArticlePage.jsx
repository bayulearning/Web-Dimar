import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { PageShell } from "../components/ui/PageShell.jsx";
import { Breadcrumb } from "../components/ui/Breadcrumb.jsx";
import { ErrorState } from "../components/ui/States.jsx";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { helpApi } from "../services/content.js";
import { formatDate } from "../utils/format.js";

export default function HelpArticlePage() {
  const { slug } = useParams();
  const { data: article, loading, error, reload } = useAsyncData(
    () => helpApi.detail(slug).then((response) => response.data),
    [slug],
  );

  useDocumentTitle(article?.title || "Pusat Bantuan", {
    description:
      article?.excerpt || "Panduan dan bantuan Stride Athletics.",
  });

  if (loading && !article) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-12">
        <div className="h-72 animate-pulse rounded-card bg-surface-2" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-12">
        <ErrorState error={error} onRetry={reload} />
        <Link
          to="/bantuan"
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Kembali ke Pusat Bantuan
        </Link>
      </div>
    );
  }

  const paragraphs = (article.content || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <PageShell title={article.title} description={article.excerpt}>
      <Breadcrumb
        items={[
          { label: "Beranda", to: "/" },
          { label: "Bantuan", to: "/bantuan" },
          { label: article.title },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        <article className="rounded-card border border-border bg-surface p-6">
          <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-wide text-muted">
            <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 font-semibold text-accent">
              {article.category}
            </span>
            {article.updatedAt ? (
              <span className="inline-flex items-center gap-1">
                <CalendarDays size={12} aria-hidden="true" />
                Diperbarui {formatDate(article.updatedAt)}
              </span>
            ) : null}
          </div>

          <div className="mt-5 space-y-4 text-sm leading-relaxed text-fg/90">
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-8 border-t border-border pt-4">
            <Link
              to="/bantuan"
              className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
            >
              <ArrowLeft size={13} aria-hidden="true" />
              Kembali ke Pusat Bantuan
            </Link>
          </div>
        </article>

        <aside className="space-y-4">
          <div className="rounded-card border border-border bg-surface p-5">
            <h2 className="font-heading text-sm font-bold uppercase tracking-wide">
              Artikel Terkait
            </h2>
            {article.related?.length ? (
              <ul className="mt-3 space-y-2">
                {article.related.map((entry) => (
                  <li key={entry.id}>
                    <Link
                      to={`/bantuan/${entry.slug}`}
                      className="block rounded-control border border-border px-3 py-2 text-xs hover:border-accent"
                    >
                      <span className="block font-semibold">{entry.title}</span>
                      <span className="mt-0.5 block text-[11px] text-muted">
                        {entry.category}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-xs text-muted">
                Belum ada artikel terkait pada kategori ini.
              </p>
            )}
          </div>

          <div className="rounded-card border border-border bg-surface p-5 text-xs text-muted">
            <p className="font-heading text-sm font-bold uppercase tracking-wide text-fg">
              Masih Butuh Bantuan?
            </p>
            <p className="mt-2">
              Tim Stride siap membantu pertanyaan pesanan dan pengembalian.
            </p>
            <Link
              to="/kontak"
              className="mt-3 inline-block font-semibold text-accent hover:underline"
            >
              Hubungi Kami
            </Link>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
