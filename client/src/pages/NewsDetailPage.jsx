import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Eye } from "lucide-react";
import { PageShell } from "../components/ui/PageShell.jsx";
import { Breadcrumb } from "../components/ui/Breadcrumb.jsx";
import { ErrorState } from "../components/ui/States.jsx";
import { ProductCard } from "../components/catalog/ProductCard.jsx";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { newsApi } from "../services/content.js";
import { formatDate } from "../utils/format.js";

export default function NewsDetailPage() {
  const { slug } = useParams();
  const { data: article, loading, error, reload } = useAsyncData(
    () => newsApi.detail(slug).then((response) => response.data),
    [slug],
  );

  useDocumentTitle(article?.title || "News", {
    description:
      article?.excerpt || "Berita terbaru dari Stride Athletics.",
    type: "article",
    image: article?.coverImage,
  });

  if (loading && !article) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-12">
        <div className="h-96 animate-pulse rounded-card bg-surface-2" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-12">
        <ErrorState error={error} onRetry={reload} />
        <Link
          to="/news"
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Kembali ke News
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
          { label: "News", to: "/news" },
          { label: article.title },
        ]}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
        <article>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted">
            <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 font-semibold uppercase tracking-wide text-accent">
              {article.category}
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays size={12} aria-hidden="true" />
              {formatDate(article.publishedAt)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye size={12} aria-hidden="true" />
              {article.viewCount} kali dibaca
            </span>
          </div>

          {article.coverImage ? (
            <img
              src={article.coverImage}
              alt={article.title}
              width="1200"
              height="675"
              className="mt-4 aspect-[16/9] w-full rounded-card border border-border object-cover"
            />
          ) : null}

          <div className="mt-6 space-y-4 text-sm leading-relaxed text-fg/90">
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-8 border-t border-border pt-4">
            <Link
              to="/news"
              className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
            >
              <ArrowLeft size={13} aria-hidden="true" />
              Kembali ke News
            </Link>
          </div>
        </article>

        <aside className="space-y-5">
          <div className="rounded-card border border-border bg-surface p-5">
            <h2 className="font-heading text-sm font-bold uppercase tracking-wide">
              Artikel Lainnya
            </h2>
            {article.related?.length ? (
              <ul className="mt-3 space-y-3">
                {article.related.map((entry) => (
                  <li key={entry.id}>
                    <Link
                      to={`/news/${entry.slug}`}
                      className="group flex gap-3"
                    >
                      {entry.coverImage ? (
                        <img
                          src={entry.coverImage}
                          alt=""
                          width="80"
                          height="80"
                          loading="lazy"
                          className="h-16 w-16 shrink-0 rounded object-cover"
                        />
                      ) : (
                        <span className="h-16 w-16 shrink-0 rounded bg-surface-2" />
                      )}
                      <span className="min-w-0">
                        <span className="line-clamp-2 text-xs font-semibold group-hover:text-accent">
                          {entry.title}
                        </span>
                        <span className="mt-1 block text-[11px] text-muted">
                          {formatDate(entry.publishedAt)}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-xs text-muted">
                Belum ada artikel lain untuk ditampilkan.
              </p>
            )}
          </div>
        </aside>
      </div>

      {article.products?.length ? (
        <section className="mt-10 border-t border-border pt-6">
          <h2 className="font-heading text-lg font-bold uppercase tracking-wide">
            Produk Terkait
          </h2>
          <p className="mt-1 text-sm text-muted">
            Produk yang dibahas atau direkomendasikan pada artikel ini.
          </p>
          <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {article.products.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </PageShell>
  );
}
