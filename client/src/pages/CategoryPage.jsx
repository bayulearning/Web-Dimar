import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Truck,
} from "lucide-react";
import { catalogApi } from "../services/catalog.js";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { useDebouncedValue } from "../hooks/useDebouncedValue.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { ProductGrid } from "../components/catalog/ProductGrid.jsx";
import { ProductGridSkeleton } from "../components/catalog/ProductCardSkeleton.jsx";
import { FilterPanel } from "../components/catalog/FilterPanel.jsx";
import { FilterSheet } from "../components/catalog/FilterSheet.jsx";
import { SortSelect } from "../components/catalog/SortSelect.jsx";
import { Breadcrumb } from "../components/ui/Breadcrumb.jsx";
import { ErrorState } from "../components/ui/States.jsx";

const FILTER_KEYS = [
  "gender",
  "size",
  "color",
  "badge",
  "minPrice",
  "maxPrice",
];

const quickChips = [
  { label: "Semua", value: "" },
  { label: "Diskon", value: "DISKON" },
  { label: "Baru", value: "BARU" },
  { label: "Terlaris", value: "TERLARIS" },
];

function readFilters(params) {
  return {
    gender: params.get("gender") || "",
    size: params.get("size") || "",
    color: params.get("color") || "",
    badge: params.get("badge") || "",
    minPrice: params.get("minPrice") || "",
    maxPrice: params.get("maxPrice") || "",
    sort: params.get("sort") || "newest",
    limit: Number(params.get("limit")) || 12,
  };
}

export default function CategoryPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sheetOpen, setSheetOpen] = useState(false);

  const queryString = searchParams.toString();
  const debouncedQuery = useDebouncedValue(queryString, 300);
  const filters = useMemo(
    () => readFilters(new URLSearchParams(debouncedQuery)),
    [debouncedQuery],
  );
  const activeFilters = useMemo(
    () => readFilters(searchParams),
    [searchParams],
  );

  const { data, loading, error, reload } = useAsyncData(async () => {
    const [category, products] = await Promise.all([
      catalogApi.getCategory(slug),
      catalogApi.listProducts({
        category: slug,
        gender: filters.gender || undefined,
        size: filters.size || undefined,
        color: filters.color || undefined,
        badge: filters.badge || undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        sort: filters.sort,
        limit: filters.limit,
      }),
    ]);

    return {
      category: category.data,
      products: products.data,
      meta: products.meta,
    };
  }, [slug, debouncedQuery]);

  useDocumentTitle(data?.category?.name || "Kategori", {
    description:
      data?.category?.description ||
      "Jelajahi sepatu olahraga Stride Athletics berdasarkan kategori.",
  });

  function updateParams(updates) {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        Object.entries(updates).forEach(([key, value]) => {
          if (value === "" || value === null || value === undefined) {
            next.delete(key);
          } else {
            next.set(key, String(value));
          }
        });
        if (!("limit" in updates)) {
          next.delete("limit");
        }
        return next;
      },
      { replace: true },
    );
  }

  function resetFilters() {
    setSearchParams({}, { replace: true });
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <ErrorState error={error} onRetry={reload} />
      </div>
    );
  }

  const category = data?.category;
  const products = data?.products ?? [];
  const total = data?.meta?.total ?? 0;
  const loaded = products.length;
  const canLoadMore = loaded < total && filters.limit < 48;
  const activeCount = FILTER_KEYS.filter((key) => activeFilters[key]).length;
  const progress = total ? Math.round((loaded / total) * 100) : 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-12 md:px-8">
      <Breadcrumb
        items={[
          { label: "Beranda", to: "/" },
          { label: "Belanja", to: "/belanja" },
          { label: category?.name || slug },
        ]}
      />

      <section className="relative overflow-hidden rounded-2xl border border-border bg-surface">
        {category?.imageUrl ? (
          <img
            src={category.imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-45"
          />
        ) : null}
        <div className="relative bg-gradient-to-r from-black/85 via-black/55 to-transparent px-5 py-9 md:px-10 md:py-14">
          <p className="label-caps text-accent">Koleksi</p>
          <h1 className="mt-2 font-heading text-3xl font-bold uppercase leading-tight md:text-5xl">
            {category?.name || "Kategori"}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            {category?.description ||
              "Temukan perlengkapan terbaik untuk sesi latihan Anda."}
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-fg">
            {total} produk tersedia
          </p>
        </div>
      </section>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {quickChips.map((chip) => {
          const active = activeFilters.badge === chip.value;
          return (
            <button
              key={chip.label}
              type="button"
              aria-pressed={active}
              onClick={() => updateParams({ badge: chip.value })}
              className={`whitespace-nowrap rounded-control border px-4 py-2 text-xs font-semibold transition-colors ${
                active
                  ? "border-accent bg-accent text-black"
                  : "border-border text-muted hover:border-accent hover:text-fg"
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-card border border-border bg-surface p-4">
            <FilterPanel
              facets={category?.facets}
              value={activeFilters}
              onChange={(key, value) => updateParams({ [key]: value })}
              onReset={resetFilters}
            />
          </div>
        </aside>

        <section aria-label="Daftar produk">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                className="inline-flex items-center gap-2 rounded-control border border-border px-3 py-2 text-xs font-semibold lg:hidden"
              >
                <SlidersHorizontal size={15} aria-hidden="true" />
                Filter
                {activeCount > 0 ? (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-black">
                    {activeCount}
                  </span>
                ) : null}
              </button>
              <p className="text-xs text-muted">
                Menampilkan{" "}
                <span className="font-semibold text-fg">{loaded}</span> dari{" "}
                <span className="font-semibold text-fg">{total}</span> produk
              </p>
            </div>
            <SortSelect
              value={activeFilters.sort}
              onChange={(value) => updateParams({ sort: value })}
            />
          </div>

          <div
            className="mb-5 h-1 overflow-hidden rounded-full bg-surface-2"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label="Progres jumlah produk dimuat"
          >
            <div
              className="h-full bg-accent transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          {loading && !data ? (
            <ProductGridSkeleton count={8} />
          ) : products.length ? (
            <div className={loading ? "opacity-60 transition-opacity" : ""}>
              <ProductGrid products={products} />
            </div>
          ) : (
            <div className="rounded-card border border-border bg-surface px-6 py-12 text-center">
              <p className="font-heading text-lg font-semibold">
                Produk tidak ditemukan
              </p>
              <p className="mt-1 text-sm text-muted">
                Coba ubah atau hapus filter yang aktif.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 rounded-control bg-fg px-5 py-2.5 text-sm font-bold text-bg"
              >
                Reset Filter
              </button>
            </div>
          )}

          {canLoadMore ? (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() =>
                  updateParams({ limit: Math.min(filters.limit + 12, 48) })
                }
                className="rounded-control border border-border px-6 py-3 text-sm font-semibold transition-colors hover:border-accent"
              >
                Tampilkan Lebih Banyak
              </button>
            </div>
          ) : null}
        </section>
      </div>

      <section className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          {
            icon: Truck,
            title: "Bebas Ongkir",
            text: "Untuk pembelian minimal Rp 1.000.000.",
          },
          {
            icon: RotateCcw,
            title: "Tukar 14 Hari",
            text: "Tukar ukuran sesuai ketentuan.",
          },
          {
            icon: ShieldCheck,
            title: "100% Original",
            text: "Produk resmi Stride Athletics.",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="flex items-center gap-3 rounded-card border border-border bg-surface p-4"
            >
              <Icon className="text-accent" size={22} aria-hidden="true" />
              <div>
                <p className="text-sm font-bold">{item.title}</p>
                <p className="text-xs text-muted">{item.text}</p>
              </div>
            </div>
          );
        })}
      </section>

      <FilterSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <FilterPanel
          facets={category?.facets}
          value={activeFilters}
          onChange={(key, value) => updateParams({ [key]: value })}
          onReset={resetFilters}
        />
      </FilterSheet>

      <p className="mt-8 text-center text-xs text-muted">
        Butuh bantuan memilih?{" "}
        <Link to="/bantuan" className="text-accent hover:underline">
          Buka pusat bantuan
        </Link>
      </p>
    </div>
  );
}
