import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Eye, Newspaper } from "lucide-react";
import { PageShell } from "../components/ui/PageShell.jsx";
import { EmptyState, ErrorState } from "../components/ui/States.jsx";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { newsApi } from "../services/content.js";
import { formatDate } from "../utils/format.js";

export default function NewsPage() {
  useDocumentTitle("News", {
    description:
      "Berita, peluncuran produk, dan tips olahraga terbaru dari Stride Athletics.",
  });
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const { data, loading, error, reload } = useAsyncData(
    () =>
      newsApi
        .list({
          category: category || undefined,
          sort,
          page,
          limit: 9,
        })
        .then((response) => response),
    [category, sort, page],
  );

  const { data: categoriesData } = useAsyncData(
    () => newsApi.categories().then((response) => response.data),
    [],
  );
  const categories = categoriesData ?? [];

  const articles = data?.data ?? [];
  const meta = data?.meta;

  function handleCategory(value) {
    setCategory(value);
    setPage(1);
  }

  function handleSort(value) {
    setSort(value);
    setPage(1);
  }

  return (
    <PageShell
      title="News & Artikel"
      description="Berita produk, panduan latihan, dan cerita komunitas Stride Athletics."
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => handleCategory("")}
            className={`rounded-control border px-3 py-1.5 text-xs font-semibold ${
              category === ""
                ? "border-fg bg-fg text-bg"
                : "border-border text-muted hover:text-fg"
            }`}
          >
            Semua
          </button>
          {categories.map((entry) => (
            <button
              key={entry.category}
              type="button"
              onClick={() => handleCategory(entry.category)}
              className={`rounded-control border px-3 py-1.5 text-xs font-semibold ${
                category === entry.category
                  ? "border-fg bg-fg text-bg"
                  : "border-border text-muted hover:text-fg"
              }`}
            >
              {entry.category}
            </button>
          ))}
        </div>

        <label className="text-xs text-muted">
          Urutkan{" "}
          <select
            id="news-sort"
            value={sort}
            onChange={(event) => handleSort(event.target.value)}
            className="rounded-control border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-fg"
          >
            <option value="newest">Terbaru</option>
            <option value="popular">Terpopuler</option>
          </select>
        </label>
      </div>

      {loading && !data ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((entry) => (
            <div
              key={entry}
              className="h-72 animate-pulse rounded-card bg-surface-2"
            />
          ))}
        </div>
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : articles.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="Belum ada artikel"
          description="Artikel untuk kategori ini belum tersedia."
        />
      ) : (
        <>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <li key={article.id}>
                <article className="group flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface">
                  <Link
                    to={`/news/${article.slug}`}
                    className="block bg-surface-2"
                    aria-label={`Baca ${article.title}`}
                  >
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      width="800"
                      height="450"
                      loading="lazy"
                      className="aspect-[16/9] w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted">
                      <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 font-semibold uppercase tracking-wide text-accent">
                        {article.category}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays size={11} aria-hidden="true" />
                        {formatDate(article.publishedAt)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Eye size={11} aria-hidden="true" />
                        {article.viewCount}
                      </span>
                    </div>
                    <h2 className="mt-2 font-heading text-base font-bold group-hover:text-accent">
                      <Link to={`/news/${article.slug}`}>{article.title}</Link>
                    </h2>
                    {article.excerpt ? (
                      <p className="mt-1 line-clamp-3 text-xs text-muted">
                        {article.excerpt}
                      </p>
                    ) : null}
                    <Link
                      to={`/news/${article.slug}`}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent"
                    >
                      Baca Artikel
                      <ArrowRight size={13} aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              </li>
            ))}
          </ul>

          {meta && meta.totalPages > 1 ? (
            <div className="mt-6 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={!meta.hasPrevPage}
                className="rounded-control border border-border px-3 py-2 font-semibold disabled:opacity-40"
              >
                Sebelumnya
              </button>
              <span className="text-muted">
                Halaman {meta.page} dari {meta.totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((value) => value + 1)}
                disabled={!meta.hasNextPage}
                className="rounded-control border border-border px-3 py-2 font-semibold disabled:opacity-40"
              >
                Berikutnya
              </button>
            </div>
          ) : null}
        </>
      )}
    </PageShell>
  );
}
