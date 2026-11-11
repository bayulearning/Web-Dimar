import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Search } from "lucide-react";
import { PageShell } from "../components/ui/PageShell.jsx";
import { EmptyState, ErrorState } from "../components/ui/States.jsx";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useDebouncedValue } from "../hooks/useDebouncedValue.js";
import { helpApi } from "../services/content.js";

export default function HelpPage() {
  useDocumentTitle("Pusat Bantuan", {
    description:
      "Panduan ukuran, pengiriman, pembayaran, retur, dan pertanyaan umum Stride Athletics.",
  });
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const debouncedQuery = useDebouncedValue(query, 350);

  const { data, loading, error, reload } = useAsyncData(
    () =>
      helpApi
        .list({
          q: debouncedQuery || undefined,
          category: category || undefined,
          page,
          limit: 20,
        })
        .then((response) => response),
    [debouncedQuery, category, page],
  );

  const { data: categoriesData } = useAsyncData(
    () => helpApi.categories().then((response) => response.data),
    [],
  );
  const categories = categoriesData ?? [];

  const articles = data?.data ?? [];
  const meta = data?.meta;

  function handleCategory(value) {
    setCategory(value);
    setPage(1);
  }

  return (
    <PageShell
      title="Pusat Bantuan"
      description="Cari panduan pesanan, pembayaran, pengiriman, dan pengembalian."
    >
      <label className="relative mb-6 block">
        <span className="sr-only">Cari artikel bantuan</span>
        <Search
          size={17}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          id="help-search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
          placeholder="Cari artikel, contoh: cara melacak pesanan"
          className="w-full rounded-card border border-border bg-surface py-3 pl-11 pr-4 text-sm text-fg"
        />
      </label>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        <aside>
          <h2 className="label-caps text-muted">Kategori</h2>
          <ul className="mt-3 space-y-1">
            <li>
              <button
                type="button"
                onClick={() => handleCategory("")}
                className={`w-full rounded-control px-3 py-2 text-left text-sm ${
                  category === "" ? "bg-fg font-semibold text-bg" : "text-muted hover:text-fg"
                }`}
              >
                Semua Artikel
              </button>
            </li>
            {categories.map((entry) => (
              <li key={entry.category}>
                <button
                  type="button"
                  onClick={() => handleCategory(entry.category)}
                  className={`flex w-full items-center justify-between rounded-control px-3 py-2 text-left text-sm ${
                    category === entry.category
                      ? "bg-fg font-semibold text-bg"
                      : "text-muted hover:text-fg"
                  }`}
                >
                  <span>{entry.category}</span>
                  <span className="text-[11px] opacity-70">{entry.count}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section>
          {loading && !data ? (
            <div className="space-y-3">
              {[0, 1, 2].map((entry) => (
                <div
                  key={entry}
                  className="h-24 animate-pulse rounded-card bg-surface-2"
                />
              ))}
            </div>
          ) : error ? (
            <ErrorState error={error} onRetry={reload} />
          ) : articles.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Artikel tidak ditemukan"
              description="Coba kata kunci lain atau pilih kategori berbeda."
            />
          ) : (
            <>
              <ul className="space-y-3">
                {articles.map((article) => (
                  <li key={article.id}>
                    <Link
                      to={`/bantuan/${article.slug}`}
                      className="group flex items-start justify-between gap-4 rounded-card border border-border bg-surface p-4 hover:border-accent"
                    >
                      <span>
                        <span className="text-[11px] uppercase tracking-wide text-accent">
                          {article.category}
                        </span>
                        <span className="mt-1 block font-heading text-base font-bold group-hover:text-accent">
                          {article.title}
                        </span>
                        {article.excerpt ? (
                          <span className="mt-1 block text-xs text-muted">
                            {article.excerpt}
                          </span>
                        ) : null}
                      </span>
                      <ArrowRight
                        size={16}
                        className="mt-1 shrink-0 text-muted group-hover:text-accent"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>

              {meta && meta.totalPages > 1 ? (
                <div className="mt-5 flex items-center justify-between text-xs">
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
        </section>
      </div>
    </PageShell>
  );
}
