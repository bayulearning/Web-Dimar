import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  Ruler,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  Undo2,
  X,
} from "lucide-react";
import { catalogApi } from "../services/catalog.js";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { Badge } from "../components/ui/Badge.jsx";
import { Price } from "../components/ui/Price.jsx";
import { RatingStars } from "../components/ui/RatingStars.jsx";
import { Breadcrumb } from "../components/ui/Breadcrumb.jsx";
import { ErrorState } from "../components/ui/States.jsx";
import { ProductGrid } from "../components/catalog/ProductGrid.jsx";
import { ProductGridSkeleton } from "../components/catalog/ProductCardSkeleton.jsx";
import { SectionHeader } from "../components/ui/SectionHeader.jsx";
import { formatRupiah, formatDate } from "../utils/format.js";
import { cartStore } from "../store/cartStore.js";
import { wishlistStore, isInWishlist } from "../store/wishlistStore.js";
import { useStore } from "../store/useStore.js";
import { toastStore } from "../store/toastStore.js";

function SizeGuideDialog({ open, onClose }) {
  if (!open) return null;

  const rows = [
    ["39", "24.5", "6.5"],
    ["40", "25.0", "7.0"],
    ["41", "26.0", "8.0"],
    ["42", "26.5", "8.5"],
    ["43", "27.5", "9.5"],
    ["44", "28.0", "10.0"],
    ["45", "29.0", "11.0"],
    ["46", "30.0", "12.0"],
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 md:items-center md:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Panduan ukuran"
    >
      <div className="w-full max-w-lg rounded-t-2xl border border-border bg-surface p-5 md:rounded-card">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold uppercase">
            Panduan Ukuran
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup panduan ukuran"
            className="rounded-control p-2 hover:bg-surface-2"
          >
            <X size={18} />
          </button>
        </div>
        <p className="mt-2 text-sm text-muted">
          Ukur panjang kaki dari tumit ke ujung jari. Jika berada di antara dua
          ukuran, pilih ukuran yang lebih besar.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-muted">
              <tr>
                <th className="border-b border-border py-2">EU</th>
                <th className="border-b border-border py-2">Panjang kaki (cm)</th>
                <th className="border-b border-border py-2">US</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row[0]}>
                  <td className="border-b border-border/60 py-2 font-semibold">
                    {row[0]}
                  </td>
                  <td className="border-b border-border/60 py-2">{row[1]}</td>
                  <td className="border-b border-border/60 py-2">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Accordion({ title, children, open = false }) {
  return (
    <details open={open} className="group border-b border-border py-4">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold uppercase tracking-wide">
        {title}
        <span
          className="text-muted transition-transform group-open:rotate-45"
          aria-hidden="true"
        >
          +
        </span>
      </summary>
      <div className="mt-3 text-sm text-muted">{children}</div>
    </details>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const wishlist = useStore(wishlistStore);

  const [selection, setSelection] = useState({
    productId: null,
    imageIndex: 0,
    color: "",
    size: "",
    quantity: 1,
  });
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const { data: product, loading, error, reload } = useAsyncData(
    () => catalogApi.getProduct(slug).then((response) => response.data),
    [slug],
  );

  const productJsonLd = useMemo(() => {
    if (!product) return null;
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      sku: product.sku,
      description: product.description,
      image: product.image?.url ? [product.image.url] : undefined,
      brand: { "@type": "Brand", name: product.brand || "Stride Athletics" },
      offers: {
        "@type": "Offer",
        priceCurrency: "IDR",
        price: product.price,
        availability:
          product.totalStock > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        url: `/produk/${product.slug}`,
      },
    };
  }, [product]);

  useDocumentTitle(product?.name || "Detail Produk", {
    description:
      product?.description ||
      "Detail produk sepatu olahraga Stride Athletics.",
    type: "product",
    image: product?.image?.url,
    jsonLd: productJsonLd,
  });

  const defaultColor =
    product?.variants.find((variant) => variant.isAvailable)?.color ??
    product?.variants[0]?.color ??
    "";
  const activeSelection =
    product && selection.productId === product.id
      ? selection
      : { imageIndex: 0, color: defaultColor, size: "", quantity: 1 };
  const { imageIndex, color, size, quantity } = activeSelection;

  function updateSelection(patch) {
    setSelection((current) => {
      const base =
        current.productId === product?.id
          ? current
          : { imageIndex: 0, color: defaultColor, size: "", quantity: 1 };
      return { ...base, ...patch, productId: product?.id };
    });
  }

  const colors = useMemo(() => {
    if (!product) return [];
    const map = new Map();
    product.variants.forEach((variant) => {
      const current = map.get(variant.color);
      map.set(variant.color, {
        color: variant.color,
        colorHex: variant.colorHex,
        available: (current?.available ?? false) || variant.isAvailable,
      });
    });
    return [...map.values()];
  }, [product]);

  const sizes = useMemo(() => {
    if (!product) return [];
    const order = (value) => Number(value.replace(/[^0-9]/g, "")) || 0;
    return [...new Set(product.variants.map((variant) => variant.size))].sort(
      (a, b) => order(a) - order(b),
    );
  }, [product]);

  const variant = useMemo(
    () =>
      product?.variants.find(
        (entry) => entry.color === color && entry.size === size,
      ) ?? null,
    [product, color, size],
  );

  const wishlisted = product ? isInWishlist(wishlist, product.id) : false;

  function isSizeAvailable(sizeValue) {
    return product?.variants.some(
      (entry) =>
        entry.color === color && entry.size === sizeValue && entry.isAvailable,
    );
  }

  async function handleAdd({ redirect = false } = {}) {
    if (!product) return;

    if (!size) {
      toastStore.show("Pilih ukuran terlebih dahulu.", "error");
      return;
    }

    if (!variant?.isAvailable) {
      toastStore.show("Ukuran dan warna ini sedang habis.", "error");
      return;
    }

    try {
      await cartStore.add(
        {
          productId: product.id,
          variantId: variant.id,
          slug: product.slug,
          name: product.name,
          size: variant.size,
          color: variant.color,
          price: variant.price,
          image: product.image,
        },
        quantity,
      );
    } catch (error) {
      toastStore.show(error?.message || "Gagal menambahkan ke keranjang.", "error");
      return;
    }

    toastStore.show(`${product.name} ditambahkan ke keranjang.`);

    if (redirect) {
      navigate("/keranjang");
    }
  }

  async function handleShare() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product?.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toastStore.show("Tautan produk disalin.");
    } catch {
      toastStore.show("Tidak dapat membagikan tautan.", "error");
    }
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <ErrorState error={error} onRetry={reload} />
      </div>
    );
  }

  if (loading && !product) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-card bg-surface-2" />
          <div className="space-y-3">
            <div className="h-4 w-24 animate-pulse rounded bg-surface-2" />
            <div className="h-9 w-3/4 animate-pulse rounded bg-surface-2" />
            <div className="h-5 w-32 animate-pulse rounded bg-surface-2" />
            <div className="h-24 animate-pulse rounded bg-surface-2" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const images = product.images.length
    ? product.images
    : product.image
      ? [product.image]
      : [];
  const activeImage = images[imageIndex] ?? images[0];
  const galleryLabel = `${product.name} - gambar ${imageIndex + 1} dari ${images.length}`;
  const stock = variant ? variant.stock : product.totalStock;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-12 md:px-8">
      <Breadcrumb
        items={[
          { label: "Beranda", to: "/" },
          { label: "Belanja", to: "/belanja" },
          {
            label: product.category?.name || "Kategori",
            to: `/kategori/${product.category?.slug}`,
          },
          { label: product.name },
        ]}
      />

      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-control border border-border px-3 py-2 text-xs font-semibold"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Kembali
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-2 rounded-control border border-border px-3 py-2 text-xs font-semibold"
          >
            <Share2 size={15} aria-hidden="true" />
            <span className="hidden sm:inline">Bagikan</span>
          </button>
          <Link
            to="/keranjang"
            className="inline-flex items-center gap-2 rounded-control border border-border px-3 py-2 text-xs font-semibold"
          >
            <ShoppingBag size={15} aria-hidden="true" />
            <span className="hidden sm:inline">Keranjang</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <section aria-label="Galeri produk">
          <div className="relative overflow-hidden rounded-card border border-border bg-surface-2">
            {activeImage ? (
              <img
                src={activeImage.url}
                alt={activeImage.alt || galleryLabel}
                width="800"
                height="800"
                className="aspect-square w-full object-cover"
              />
            ) : null}
            <div className="absolute left-3 top-3 flex flex-col items-start gap-1">
              <Badge label={product.badge} />
              {product.discountPercent > 0 ? (
                <span className="rounded bg-danger px-2 py-0.5 text-[10px] font-bold text-white">
                  Hemat {product.discountPercent}%
                </span>
              ) : null}
            </div>
            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() =>
                    updateSelection({
                      imageIndex:
                        imageIndex === 0 ? images.length - 1 : imageIndex - 1,
                    })
                  }
                  aria-label="Gambar sebelumnya"
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-border bg-black/60 p-2 backdrop-blur"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateSelection({
                      imageIndex: (imageIndex + 1) % images.length,
                    })
                  }
                  aria-label="Gambar berikutnya"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-border bg-black/60 p-2 backdrop-blur"
                >
                  <ChevronRight size={18} />
                </button>
                <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
                  {images.map((image, index) => (
                    <button
                      key={image.id ?? index}
                      type="button"
                      onClick={() => updateSelection({ imageIndex: index })}
                      aria-label={`Lihat gambar ${index + 1}`}
                      aria-current={index === imageIndex}
                      className={`h-2 rounded-full transition-all ${
                        index === imageIndex
                          ? "w-5 bg-accent"
                          : "w-2 bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            ) : null}
          </div>

          {images.length > 1 ? (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {images.map((image, index) => (
                <button
                  key={image.id ?? index}
                  type="button"
                  onClick={() => updateSelection({ imageIndex: index })}
                  aria-label={`Pilih gambar ${index + 1}`}
                  className={`shrink-0 overflow-hidden rounded-control border-2 ${
                    index === imageIndex
                      ? "border-accent"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={image.url}
                    alt=""
                    width="96"
                    height="96"
                    loading="lazy"
                    className="h-20 w-20 object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </section>

        <section aria-label="Informasi produk">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/kategori/${product.category?.slug}`}
              className="label-caps text-accent hover:underline"
            >
              {product.category?.name}
            </Link>
            <span className="text-muted">/</span>
            <span className="text-[11px] uppercase tracking-wider text-muted">
              {product.gender === "women"
                ? "Wanita"
                : product.gender === "men"
                  ? "Pria"
                  : product.gender === "kids"
                    ? "Anak"
                    : "Unisex"}
            </span>
          </div>

          <h1 className="mt-2 font-heading text-2xl font-bold uppercase leading-tight md:text-4xl">
            {product.name}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <RatingStars
              average={product.rating.average}
              count={product.rating.count}
            />
            <span className="text-xs text-muted">{product.sku}</span>
          </div>

          <div className="mt-4">
            <Price price={product.price} basePrice={product.basePrice} />
            <p className="mt-1 text-xs text-muted">
              {product.discountPercent > 0
                ? `Hemat ${formatRupiah(product.basePrice - product.price)} (${product.discountPercent}%)`
                : "Harga sudah termasuk pajak."}
            </p>
          </div>

          <p className="mt-3 text-sm text-muted">{product.description}</p>

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <p className="label-caps text-muted">
                Warna: <span className="text-fg">{color}</span>
              </p>
              <p className="text-xs text-muted">
                {stock > 0 ? `${stock} unit tersedia` : "Stok habis"}
              </p>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {colors.map((entry) => (
                <button
                  key={entry.color}
                  type="button"
                  onClick={() => {
                    updateSelection({ color: entry.color, size: "" });
                  }}
                  aria-pressed={entry.color === color}
                  className={`inline-flex items-center gap-2 rounded-control border px-3 py-2 text-xs font-semibold ${
                    entry.color === color
                      ? "border-accent text-fg"
                      : "border-border text-muted hover:border-accent"
                  } ${entry.available ? "" : "opacity-50"}`}
                >
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-white/30"
                    style={{ backgroundColor: entry.colorHex || "#888" }}
                    aria-hidden="true"
                  />
                  {entry.color}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <p className="label-caps text-muted">
                Ukuran (EU){size ? `: ${size.replace("EU ", "")}` : ""}
              </p>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
              >
                <Ruler size={14} aria-hidden="true" />
                Panduan ukuran
              </button>
            </div>
            <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-5">
              {sizes.map((sizeValue) => {
                const available = isSizeAvailable(sizeValue);
                const active = size === sizeValue;
                return (
                  <button
                    key={sizeValue}
                    type="button"
                    disabled={!available}
                    onClick={() => updateSelection({ size: sizeValue })}
                    aria-pressed={active}
                    className={`rounded-control border py-2.5 text-sm font-semibold transition-colors ${
                      active
                        ? "border-accent bg-accent text-black"
                        : "border-border text-fg hover:border-accent"
                    } ${available ? "" : "cursor-not-allowed border-border/40 text-muted line-through opacity-50"}`}
                  >
                    {sizeValue.replace("EU ", "")}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <label className="label-caps text-muted" htmlFor="quantity">
              Jumlah
            </label>
            <div className="flex items-center rounded-control border border-border">
              <button
                type="button"
                onClick={() =>
                  updateSelection({ quantity: Math.max(1, quantity - 1) })
                }
                aria-label="Kurangi jumlah"
                className="px-3 py-2 text-lg leading-none hover:text-accent"
              >
                -
              </button>
              <input
                id="quantity"
                type="number"
                min="1"
                max="10"
                value={quantity}
                onChange={(event) =>
                  updateSelection({
                    quantity: Math.min(
                      10,
                      Math.max(1, Number(event.target.value) || 1),
                    ),
                  })
                }
                className="w-12 border-x border-border bg-transparent py-2 text-center text-sm"
              />
              <button
                type="button"
                onClick={() =>
                  updateSelection({ quantity: Math.min(10, quantity + 1) })
                }
                aria-label="Tambah jumlah"
                className="px-3 py-2 text-lg leading-none hover:text-accent"
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => handleAdd()}
              className="flex-1 rounded-control bg-fg px-5 py-3 text-sm font-bold text-bg transition-opacity hover:opacity-90"
            >
              Tambah ke Keranjang
            </button>
            <button
              type="button"
              onClick={() => handleAdd({ redirect: true })}
              className="flex-1 rounded-control bg-accent px-5 py-3 text-sm font-bold text-black transition-opacity hover:opacity-90"
            >
              Beli Sekarang
            </button>
            <button
              type="button"
              onClick={() => wishlistStore.toggle(product)}
              aria-pressed={wishlisted}
              aria-label={
                wishlisted ? "Hapus dari wishlist" : "Simpan ke wishlist"
              }
              className="rounded-control border border-border px-4 py-3"
            >
              <Heart
                size={18}
                className={wishlisted ? "fill-danger text-danger" : ""}
                aria-hidden="true"
              />
            </button>
          </div>

          <ul className="mt-5 grid grid-cols-1 gap-2 text-xs text-muted sm:grid-cols-3">
            <li className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-accent" aria-hidden="true" />
              Original
            </li>
            <li className="flex items-center gap-2">
              <Truck size={15} className="text-accent" aria-hidden="true" />
              Bebas ongkir
            </li>
            <li className="flex items-center gap-2">
              <Undo2 size={15} className="text-accent" aria-hidden="true" />
              Tukar 14 hari
            </li>
          </ul>

          <div className="mt-6 border-t border-border">
            <Accordion title="Spesifikasi" open>
              <dl className="space-y-1.5">
                <div className="flex justify-between gap-4">
                  <dt>Brand</dt>
                  <dd className="text-fg">{product.brand}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>SKU</dt>
                  <dd className="text-fg">{product.sku}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Kategori</dt>
                  <dd className="text-fg">{product.category?.name}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Jumlah varian</dt>
                  <dd className="text-fg">{product.variants.length}</dd>
                </div>
              </dl>
            </Accordion>

            <Accordion title={`Ulasan (${product.rating.count})`}>
              {product.reviews.length ? (
                <ul className="space-y-4">
                  {product.reviews.map((review) => (
                    <li key={review.id}>
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-fg">
                          {review.userName}
                        </p>
                        <span className="text-[11px]">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      <RatingStars average={review.rating} count={1} />
                      {review.title ? (
                        <p className="mt-1 text-sm font-semibold text-fg">
                          {review.title}
                        </p>
                      ) : null}
                      <p className="mt-1">{review.comment}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Belum ada ulasan untuk produk ini.</p>
              )}
            </Accordion>

            <Accordion title="Pengiriman">
              <p>
                Dikirim dari gudang Jakarta dalam 1 hari kerja. Pilihan kurir
                J&T, JNE, dan SiCepat tersedia saat checkout. Estimasi 1-4 hari
                kerja tergantung tujuan.
              </p>
            </Accordion>

            <Accordion title="Pengembalian">
              <p>
                Tukar ukuran dalam 14 hari sejak produk diterima dengan syarat
                produk belum dipakai, label masih utuh, dan disertai bukti
                pembelian. Lihat{" "}
                <Link
                  to="/bantuan/kebijakan-pengembalian"
                  className="text-accent hover:underline"
                >
                  kebijakan pengembalian
                </Link>
                .
              </p>
            </Accordion>
          </div>

          <p className="mt-4 inline-flex items-center gap-2 text-xs text-muted">
            <Store size={14} aria-hidden="true" />
            Dijual dan dikirim oleh Stride Athletics
          </p>
        </section>
      </div>

      {product.relatedProducts?.length ? (
        <section className="mt-12">
          <SectionHeader
            title="Produk Terkait"
            subtitle={`Lebih banyak pilihan dari ${product.category?.name}.`}
            actionLabel="Lihat kategori"
            actionTo={`/kategori/${product.category?.slug}`}
          />
          {loading ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <ProductGrid products={product.relatedProducts} />
          )}
        </section>
      ) : null}

      <SizeGuideDialog
        open={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
      />
    </div>
  );
}
