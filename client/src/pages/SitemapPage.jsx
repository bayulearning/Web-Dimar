import { Link } from "react-router-dom";
import { Layers, Map } from "lucide-react";
import { PageShell } from "../components/ui/PageShell.jsx";
import { ErrorState } from "../components/ui/States.jsx";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { sitemapApi } from "../services/content.js";

const siteLinks = [
  { to: "/belanja", label: "Belanja" },
  { to: "/news", label: "News" },
  { to: "/bantuan", label: "Bantuan" },
  { to: "/kontak", label: "Kontak" },
  { to: "/delivery", label: "Pengiriman" },
  { to: "/payment-options", label: "Metode Pembayaran" },
  { to: "/privacy", label: "Kebijakan Privasi" },
  { to: "/terms", label: "Syarat & Ketentuan" },
  { to: "/sales-terms", label: "Ketentuan Penjualan" },
];

export default function SitemapPage() {
  useDocumentTitle("Sitemap", {
    description:
      "Peta seluruh kategori, produk, dan halaman Stride Athletics.",
  });
  const { data, loading, error, reload } = useAsyncData(
    () => sitemapApi.get().then((response) => response.data),
    [],
  );

  if (loading && !data) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="h-72 animate-pulse rounded-card bg-surface-2" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-12">
        <ErrorState error={error} onRetry={reload} />
      </div>
    );
  }

  const categories = data?.categories ?? [];
  const totalProducts = categories.reduce(
    (total, category) => total + category.products.length,
    0,
  );

  return (
    <PageShell
      title="Sitemap"
      description={`Struktur lengkap ${categories.length} kategori dan ${totalProducts} produk Stride Athletics.`}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-5">
          <div className="rounded-card border border-border bg-surface p-5">
            <h2 className="flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-wide">
              <Map size={15} className="text-accent" aria-hidden="true" />
              Halaman
            </h2>
            <ul className="mt-3 space-y-1.5 text-sm">
              {siteLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-muted hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-card border border-border bg-surface p-5">
            <h2 className="font-heading text-sm font-bold uppercase tracking-wide">
              Kategori
            </h2>
            <ul className="mt-3 space-y-1.5 text-sm">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    to={`/kategori/${category.slug}`}
                    className="flex items-center justify-between gap-2 text-muted hover:text-accent"
                  >
                    <span>{category.name}</span>
                    <span className="text-[11px]">
                      {category.productCount}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="space-y-6">
          {categories.map((category) => (
            <section
              key={category.id}
              className="rounded-card border border-border bg-surface p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                <h2 className="flex items-center gap-2 font-heading text-base font-bold uppercase tracking-wide">
                  <Layers size={16} className="text-accent" aria-hidden="true" />
                  <Link
                    to={`/kategori/${category.slug}`}
                    className="hover:text-accent"
                  >
                    {category.name}
                  </Link>
                </h2>
                <span className="text-xs text-muted">
                  {category.productCount} produk
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {category.groups.map((group) => (
                  <div key={group.key}>
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted">
                      {group.label}
                    </h3>
                    <ul className="mt-2 space-y-1 text-sm">
                      {group.products.map((product) => (
                        <li key={product.id}>
                          <Link
                            to={`/produk/${product.slug}`}
                            className="text-muted hover:text-accent"
                          >
                            {product.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
