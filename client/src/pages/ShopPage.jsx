import { useState } from "react";
import { Link } from "react-router-dom";
import { catalogApi } from "../services/catalog.js";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { ProductGrid } from "../components/catalog/ProductGrid.jsx";
import { ProductGridSkeleton } from "../components/catalog/ProductCardSkeleton.jsx";
import { SectionHeader } from "../components/ui/SectionHeader.jsx";
import { ErrorState } from "../components/ui/States.jsx";

export default function ShopPage() {
  useDocumentTitle("Belanja", {
    description:
      "Katalog lengkap sepatu olahraga Stride Athletics untuk running, football, badminton, training, dan lifestyle.",
  });
  const [limit, setLimit] = useState(9);

  const { data, loading, error, reload } = useAsyncData(async () => {
    const [categories, products] = await Promise.all([
      catalogApi.getCategories(),
      catalogApi.listProducts({ sort: "popular", limit }),
    ]);
    return { categories: categories.data, products: products.data };
  }, [limit]);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <ErrorState error={error} onRetry={reload} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
      <header className="mb-6">
        <p className="label-caps text-accent">Katalog</p>
        <h1 className="mt-2 font-heading text-2xl font-bold uppercase md:text-4xl">
          Shop What You Need
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Pilih kategori olahraga Anda dan temukan perlengkapan yang sesuai
          dengan kebutuhan latihan.
        </p>
      </header>

      <section aria-label="Kategori olahraga">
        {loading ? (
          <ProductGridSkeleton count={5} />
        ) : (
          <ul className="flex gap-3 overflow-x-auto pb-3 md:grid md:grid-cols-5 md:overflow-visible">
            {data.categories.map((category) => (
              <li
                key={category.id}
                className="w-56 shrink-0 md:w-auto"
              >
                <Link
                  to={`/kategori/${category.slug}`}
                  className="group relative flex h-48 items-end overflow-hidden rounded-card border border-border bg-surface"
                >
                  {category.imageUrl ? (
                    <img
                      src={category.imageUrl}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : null}
                  <div className="relative w-full bg-gradient-to-t from-black/90 to-transparent p-4">
                    <p className="font-heading text-base font-bold uppercase">
                      {category.name}
                    </p>
                    <p className="mt-1 text-[11px] text-muted">
                      {category.productCount} produk
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <SectionHeader
          title="Highlights"
          subtitle="Produk populer dari seluruh kategori."
        />
        {loading ? (
          <ProductGridSkeleton count={9} />
        ) : (
          <ProductGrid products={data.products} />
        )}

        {!loading && limit < 24 ? (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setLimit((value) => Math.min(value + 9, 24))}
              className="rounded-control border border-border px-6 py-3 text-sm font-semibold transition-colors hover:border-accent"
            >
              Tampilkan Lebih Banyak
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
