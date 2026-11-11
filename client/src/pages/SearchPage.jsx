import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import { catalogApi } from "../services/catalog.js";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { useDebouncedValue } from "../hooks/useDebouncedValue.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { ProductGrid } from "../components/catalog/ProductGrid.jsx";
import { ProductGridSkeleton } from "../components/catalog/ProductCardSkeleton.jsx";
import { ErrorState } from "../components/ui/States.jsx";

const MIN_QUERY_LENGTH = 2;

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") || "";
  const [draft, setDraft] = useState({ base: urlQuery, value: urlQuery });
  const input = draft.base === urlQuery ? draft.value : urlQuery;
  const debouncedInput = useDebouncedValue(input.trim(), 400);

  useDocumentTitle(urlQuery ? `Cari "${urlQuery}"` : "Pencarian", {
    description: urlQuery
      ? `Hasil pencarian "${urlQuery}" di Stride Athletics.`
      : "Cari sepatu dan perlengkapan olahraga di Stride Athletics.",
    noindex: true,
  });

  useEffect(() => {
    const normalized = debouncedInput.trim();
    if (normalized === urlQuery) return;
    setSearchParams(
      normalized ? { q: normalized } : {},
      { replace: true },
    );
  }, [debouncedInput, urlQuery, setSearchParams]);

  const query = urlQuery.trim();
  const canSearch = query.length >= MIN_QUERY_LENGTH;

  const { data, loading, error, reload } = useAsyncData(
    () =>
      canSearch
        ? catalogApi.listProducts({ q: query, limit: 24 })
        : Promise.resolve({ data: [], meta: { total: 0 } }),
    [query, canSearch],
  );

  function handleSubmit(event) {
    event.preventDefault();
    const normalized = input.trim();
    setSearchParams(normalized ? { q: normalized } : {}, { replace: true });
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
      <header className="mb-6">
        <p className="label-caps text-accent">Pencarian</p>
        <h1 className="mt-2 font-heading text-2xl font-bold uppercase md:text-4xl">
          Cari Produk
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Cari berdasarkan nama produk, deskripsi, atau SKU. Minimal{" "}
          {MIN_QUERY_LENGTH} karakter.
        </p>
      </header>

      <form onSubmit={handleSubmit} role="search" className="max-w-2xl">
        <label htmlFor="search-input" className="sr-only">
          Kata kunci pencarian
        </label>
        <div className="flex items-center gap-2 rounded-control border border-border bg-surface px-4">
          <Search size={18} className="text-muted" aria-hidden="true" />
          <input
            id="search-input"
            type="search"
            value={input}
            onChange={(event) =>
              setDraft({ base: urlQuery, value: event.target.value })
            }
            placeholder="Cari sepatu, apparel, atau SKU..."
            autoComplete="off"
            className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted"
          />
          {input ? (
            <button
              type="button"
              onClick={() => {
                setDraft({ base: urlQuery, value: "" });
                setSearchParams({}, { replace: true });
              }}
              aria-label="Hapus kata kunci"
              className="rounded p-1 text-muted hover:text-fg"
            >
              <X size={16} />
            </button>
          ) : null}
        </div>
      </form>

      {!canSearch ? (
        <div className="mt-8 rounded-card border border-border bg-surface p-8 text-center">
          <p className="font-heading text-lg font-semibold">
            Mulai ketik untuk mencari
          </p>
          <p className="mt-1 text-sm text-muted">
            Masukkan minimal {MIN_QUERY_LENGTH} karakter, misalnya “running” atau
            “velocity”.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {["running", "football", "badminton", "training"].map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setDraft({ base: urlQuery, value: term });
                  setSearchParams({ q: term });
                }}
                className="rounded-control border border-border px-3 py-1.5 text-xs font-semibold capitalize text-muted hover:border-accent hover:text-fg"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="mt-8">
          <ErrorState error={error} onRetry={reload} />
        </div>
      ) : loading && !data ? (
        <div className="mt-8">
          <ProductGridSkeleton count={8} />
        </div>
      ) : (
        <section className="mt-8" aria-label="Hasil pencarian">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm text-muted">
              Hasil untuk{" "}
              <span className="font-semibold text-fg">“{query}”</span>
            </p>
            <p className="text-xs text-muted">
              {data?.meta?.total ?? 0} produk ditemukan
            </p>
          </div>

          {data?.data?.length ? (
            <div className={loading ? "opacity-60 transition-opacity" : ""}>
              <ProductGrid products={data.data} />
            </div>
          ) : (
            <div className="rounded-card border border-border bg-surface px-6 py-12 text-center">
              <p className="font-heading text-lg font-semibold">
                Tidak ada produk yang cocok
              </p>
              <p className="mt-1 text-sm text-muted">
                Coba kata kunci lain atau telusuri seluruh katalog.
              </p>
              <Link
                to="/belanja"
                className="mt-4 inline-block rounded-control bg-fg px-5 py-2.5 text-sm font-bold text-bg"
              >
                Lihat Semua Produk
              </Link>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
