import { Link } from "react-router-dom";
import {
  ShieldCheck,
  RotateCcw,
  Truck,
  CreditCard,
  LifeBuoy,
  Sparkles,
} from "lucide-react";
import { catalogApi } from "../services/catalog.js";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { ProductCard } from "../components/catalog/ProductCard.jsx";
import { ProductGrid } from "../components/catalog/ProductGrid.jsx";
import { ProductGridSkeleton } from "../components/catalog/ProductCardSkeleton.jsx";
import { SectionHeader } from "../components/ui/SectionHeader.jsx";
import { ErrorState } from "../components/ui/States.jsx";

const services = [
  {
    icon: Truck,
    title: "Pengiriman Cepat",
    description: "J&T, JNE, SiCepat, dan kurir pilihan lainnya.",
    to: "/delivery",
  },
  {
    icon: RotateCcw,
    title: "Retur 30 Hari",
    description: "Tukar ukuran atau kembalikan produk dengan mudah.",
    to: "/bantuan/kebijakan-pengembalian",
  },
  {
    icon: CreditCard,
    title: "Pembayaran Aman",
    description: "Virtual account, e-wallet, QRIS, dan kartu kredit.",
    to: "/payment-options",
  },
  {
    icon: LifeBuoy,
    title: "Layanan & Informasi",
    description: "Panduan ukuran, pelacakan, dan pusat bantuan.",
    to: "/bantuan",
  },
];

export default function HomePage() {
  useDocumentTitle("Beranda", {
    description:
      "Stride Athletics - sepatu lari, sepakbola, badminton, training, dan lifestyle. Temukan produk resmi dengan retur 30 hari.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Stride Athletics",
      url: "/",
      potentialAction: {
        "@type": "SearchAction",
        target: "/cari?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
  });

  const { data, loading, error, reload } = useAsyncData(async () => {
    const [categories, trending, latest, highlights] = await Promise.all([
      catalogApi.getCategories(),
      catalogApi.listProducts({ sort: "popular", limit: 8 }),
      catalogApi.listProducts({ sort: "newest", limit: 8 }),
      catalogApi.listProducts({ sort: "rating", limit: 3 }),
    ]);

    return {
      categories: categories.data,
      trending: trending.data,
      latest: latest.data,
      highlights: highlights.data,
    };
  }, []);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <ErrorState error={error} onRetry={reload} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-12 md:px-8">
      <section className="relative mt-4 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-surface via-surface to-bg px-6 py-10 md:mt-6 md:px-12 md:py-16">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-accent/15 blur-3xl"
          aria-hidden="true"
        />
        <p className="label-caps text-accent">Koleksi Terbaru 2026</p>
        <h1 className="mt-3 max-w-2xl font-heading text-3xl font-bold uppercase leading-[1.05] tracking-tight md:text-6xl">
          Performa Tanpa Kompromi
        </h1>
        <p className="mt-4 max-w-lg text-sm text-muted md:text-base">
          Dirancang khusus untuk atlet yang menuntut kecepatan, bantalan
          optimal, dan daya tahan maksimal.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            to="/kategori/running?gender=men"
            className="rounded-control bg-fg px-6 py-3 text-sm font-bold text-bg transition-opacity hover:opacity-90"
          >
            Belanja Pria
          </Link>
          <Link
            to="/kategori/running?gender=women"
            className="rounded-control bg-accent px-6 py-3 text-sm font-bold text-black transition-opacity hover:opacity-90"
          >
            Belanja Wanita
          </Link>
        </div>
      </section>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        <Link
          to="/belanja"
          className="whitespace-nowrap rounded-control border border-accent bg-accent px-4 py-2 text-xs font-bold text-black"
        >
          Semua Drop
        </Link>
        {(data?.categories ?? []).map((category) => (
          <Link
            key={category.id}
            to={`/kategori/${category.slug}`}
            className="whitespace-nowrap rounded-control border border-border px-4 py-2 text-xs font-semibold text-muted transition-colors hover:border-accent hover:text-fg"
          >
            {category.name}
          </Link>
        ))}
      </div>

      <section className="mt-8">
        <SectionHeader
          title="Trending Sekarang"
          subtitle="Produk paling dicari atlet Stride minggu ini."
          actionLabel="Lihat semua"
          actionTo="/belanja"
        />
        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 md:gap-5">
            {data.trending.map((product) => (
              <div
                key={product.id}
                className="w-[68%] shrink-0 snap-start sm:w-[45%] md:w-[31%] lg:w-[23%]"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8 overflow-hidden rounded-card border border-border bg-gradient-to-r from-surface-2 via-surface to-surface p-6 md:flex md:items-center md:justify-between md:p-8">
        <div className="flex items-start gap-4">
          <Sparkles className="mt-1 shrink-0 text-accent" size={26} />
          <div>
            <p className="label-caps text-accent">Stride Club Member</p>
            <h2 className="mt-2 font-heading text-xl font-bold uppercase md:text-2xl">
              Poin setiap langkah, akses drop lebih awal
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted">
              Daftar gratis, kumpulkan poin dari setiap pembelian, dan dapatkan
              akses awal ke rilisan terbatas.
            </p>
          </div>
        </div>
        <Link
          to="/daftar"
          className="mt-5 inline-block rounded-control bg-fg px-5 py-2.5 text-sm font-bold text-bg md:mt-0"
        >
          Gabung Sekarang
        </Link>
      </section>

      <section className="mt-10">
        <SectionHeader
          title="Kategori Olahraga"
          subtitle="Temukan perlengkapan sesuai jenis latihan Anda."
        />
        {loading ? (
          <ProductGridSkeleton count={5} />
        ) : (
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {data.categories.map((category) => (
              <li key={category.id}>
                <Link
                  to={`/kategori/${category.slug}`}
                  className="group relative flex h-40 items-end overflow-hidden rounded-card border border-border bg-surface md:h-52"
                >
                  {category.imageUrl ? (
                    <img
                      src={category.imageUrl}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : null}
                  <div className="relative w-full bg-gradient-to-t from-black/90 to-transparent p-3">
                    <p className="font-heading text-sm font-bold uppercase">
                      {category.name}
                    </p>
                    <p className="text-[11px] text-muted">
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
          title="Rilis Terbaru"
          subtitle="Koleksi terbaru dari Stride Athletics."
          actionLabel="Belanja semua"
          actionTo="/belanja"
        />
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : (
          <ProductGrid products={data.latest} />
        )}
      </section>

      <section className="mt-10">
        <SectionHeader
          title="Highlights Pilihan Kurator"
          subtitle="Dipilih karena performa dan ulasan terbaik."
          actionLabel="Lihat lainnya"
          actionTo="/belanja"
        />
        {loading ? (
          <ProductGridSkeleton count={3} />
        ) : (
          <ProductGrid products={data.highlights} />
        )}
      </section>

      <section className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-card border border-border bg-surface p-4">
          <ShieldCheck className="text-accent" size={24} />
          <div>
            <p className="text-sm font-bold">100% Produk Asli</p>
            <p className="text-xs text-muted">
              Semua produk resmi Stride Athletics.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-card border border-border bg-surface p-4">
          <RotateCcw className="text-accent" size={24} />
          <div>
            <p className="text-sm font-bold">Retur 30 Hari</p>
            <p className="text-xs text-muted">
              Pengembalian mudah sesuai ketentuan.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <SectionHeader title="Layanan & Informasi" />
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <li key={service.title}>
                <Link
                  to={service.to}
                  className="flex h-full flex-col rounded-card border border-border bg-surface p-4 transition-colors hover:border-accent"
                >
                  <Icon size={20} className="text-accent" />
                  <p className="mt-3 text-sm font-bold">{service.title}</p>
                  <p className="mt-1 text-xs text-muted">
                    {service.description}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
