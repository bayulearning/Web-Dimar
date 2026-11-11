import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import { catalogApi } from "../services/catalog.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { formatRupiah } from "../utils/format.js";
import { cartCount, cartStore, cartSubtotal } from "../store/cartStore.js";
import { wishlistStore } from "../store/wishlistStore.js";
import { useStore } from "../store/useStore.js";
import { toastStore } from "../store/toastStore.js";

export default function CartPage() {
  useDocumentTitle("Keranjang Belanja", {
    description: "Tinjau produk pilihan Anda sebelum melanjutkan checkout.",
    noindex: true,
  });
  const cart = useStore(cartStore);
  const [voucher, setVoucher] = useState("");
  const [validation, setValidation] = useState({
    loading: false,
    variants: {},
    missingSlugs: [],
  });

  const slugsKey = useMemo(
    () => [...new Set(cart.items.map((item) => item.slug))].join("|"),
    [cart.items],
  );

  useEffect(() => {
    if (!slugsKey) return undefined;

    let active = true;
    const targets = slugsKey.split("|");

    Promise.resolve()
      .then(() => {
        if (active) {
          setValidation((current) => ({ ...current, loading: true }));
        }
        return Promise.all(
          targets.map((slug) =>
            catalogApi
              .getProduct(slug)
              .then((response) => response.data)
              .catch(() => null),
          ),
        );
      })
      .then((products) => {
        if (!active) return;

        const variants = {};
        const missingSlugs = [];

        targets.forEach((slug, index) => {
          const product = products[index];
          if (!product) {
            missingSlugs.push(slug);
            return;
          }
          product.variants.forEach((variant) => {
            variants[String(variant.id)] = variant;
          });
        });

        setValidation({ loading: false, variants, missingSlugs });
      });

    return () => {
      active = false;
    };
  }, [slugsKey]);

  const subtotal = cartSubtotal(cart);
  const items = cart.items;
  const itemCount = cartCount(cart);

  function stockOf(item) {
    return validation.variants[String(item.variantId)] ?? null;
  }

  function saveToWishlist(item) {
    wishlistStore.toggle({
      id: item.productId,
      slug: item.slug,
      name: item.name,
      price: item.price,
      basePrice: null,
      salePrice: null,
      image: item.image,
      badge: null,
      category: null,
    });
    toastStore.show(`${item.name} disimpan ke wishlist.`);
  }

  function changeQuantity(variantId, quantity) {
    cartStore.setQuantity(variantId, quantity).catch((error) => {
      toastStore.show(error?.message || "Gagal memperbarui jumlah.", "error");
    });
  }

  function removeItem(variantId) {
    cartStore.remove(variantId).catch((error) => {
      toastStore.show(error?.message || "Gagal menghapus item.", "error");
    });
  }

  function clearCart() {
    cartStore
      .clear()
      .then(() => toastStore.show("Keranjang dikosongkan."))
      .catch((error) => {
        toastStore.show(error?.message || "Gagal mengosongkan keranjang.", "error");
      });
  }

  if (!items.length) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 md:px-8">
        <div className="rounded-card border border-border bg-surface px-6 py-14 text-center">
          <ShoppingBag size={38} className="mx-auto text-muted" aria-hidden="true" />
          <h1 className="mt-4 font-heading text-2xl font-bold uppercase">
            Keranjang Masih Kosong
          </h1>
          <p className="mt-2 text-sm text-muted">
            Tambahkan produk favorit Anda dan mulai lengkapi perlengkapan
            latihan.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/belanja"
              className="rounded-control bg-fg px-5 py-2.5 text-sm font-bold text-bg"
            >
              Mulai Belanja
            </Link>
            <Link
              to="/wishlist"
              className="rounded-control border border-border px-5 py-2.5 text-sm font-semibold"
            >
              Lihat Wishlist
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
      <header className="mb-6">
        <p className="label-caps text-accent">Keranjang</p>
        <h1 className="mt-2 font-heading text-2xl font-bold uppercase md:text-4xl">
          Keranjang Belanja
        </h1>
        <p className="mt-2 text-sm text-muted">
          {itemCount} item di keranjang Anda.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <section aria-label="Daftar produk di keranjang" className="space-y-3">
          {validation.missingSlugs.length ? (
            <p className="flex items-start gap-2 rounded-card border border-danger/50 bg-danger/10 px-4 py-3 text-xs text-danger">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              Beberapa produk tidak lagi tersedia. Hapus item bertanda sebelum
              melanjutkan.
            </p>
          ) : null}

          {items.map((item) => {
            const variant = stockOf(item);
            const stock = variant ? variant.stock : null;
            const overStock = stock !== null && item.quantity > stock;
            const unavailable =
              validation.missingSlugs.includes(item.slug) ||
              (variant !== null && !variant.isAvailable);

            return (
              <article
                key={item.variantId}
                className="flex gap-3 rounded-card border border-border bg-surface p-3 md:gap-4"
              >
                <Link
                  to={`/produk/${item.slug}`}
                  className="shrink-0 overflow-hidden rounded-control bg-surface-2"
                >
                  <img
                    src={item.image?.url}
                    alt={item.image?.alt || item.name}
                    width="160"
                    height="160"
                    className="h-24 w-24 object-cover md:h-28 md:w-28"
                  />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-semibold">
                        <Link
                          to={`/produk/${item.slug}`}
                          className="hover:text-accent"
                        >
                          {item.name}
                        </Link>
                      </h2>
                      <p className="mt-1 text-xs text-muted">
                        Ukuran {item.size.replace("EU ", "")} · {item.color}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.variantId)}
                      aria-label={`Hapus ${item.name} dari keranjang`}
                      className="rounded p-1 text-muted hover:text-danger"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <p className="mt-2 font-heading text-sm font-bold text-accent">
                    {formatRupiah(item.price)}
                  </p>

                  {unavailable ? (
                    <p className="mt-1 text-[11px] text-danger">
                      Varian ini sudah tidak tersedia.
                    </p>
                  ) : stock !== null && stock <= 0 ? (
                    <p className="mt-1 text-[11px] text-danger">
                      Stok habis. Hapus item untuk melanjutkan.
                    </p>
                  ) : overStock ? (
                    <p className="mt-1 text-[11px] text-warning">
                      Stok tersisa {stock}. Sesuaikan jumlah.
                    </p>
                  ) : stock !== null ? (
                    <p className="mt-1 text-[11px] text-muted">
                      Stok tersedia {stock}.
                    </p>
                  ) : validation.loading ? (
                    <p className="mt-1 text-[11px] text-muted">
                      Memeriksa stok...
                    </p>
                  ) : null}

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
                    <div className="flex items-center rounded-control border border-border">
                      <button
                        type="button"
                        onClick={() =>
                          changeQuantity(item.variantId, item.quantity - 1)
                        }
                        aria-label={`Kurangi jumlah ${item.name}`}
                        className="px-2.5 py-1.5 text-muted hover:text-fg"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="min-w-8 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        disabled={
                          item.quantity >= 10 ||
                          (stock !== null && item.quantity >= stock)
                        }
                        onClick={() =>
                          changeQuantity(item.variantId, item.quantity + 1)
                        }
                        aria-label={`Tambah jumlah ${item.name}`}
                        className="px-2.5 py-1.5 text-muted hover:text-fg disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] font-semibold text-muted">
                      <button
                        type="button"
                        onClick={() => saveToWishlist(item)}
                        className="inline-flex items-center gap-1 hover:text-accent"
                      >
                        <Heart size={13} aria-hidden="true" />
                        Wishlist
                      </button>
                      <Link
                        to={`/produk/${item.slug}`}
                        className="hover:text-accent"
                      >
                        Ubah ukuran
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-surface p-4">
            <Link
              to="/belanja"
              className="text-xs font-semibold text-accent hover:underline"
            >
              Lanjut belanja
            </Link>
            <button
              type="button"
              onClick={clearCart}
              className="text-xs font-semibold text-muted hover:text-danger"
            >
              Kosongkan keranjang
            </button>
          </div>
        </section>

        <aside aria-label="Ringkasan belanja">
          <div className="sticky top-24 space-y-4 rounded-card border border-border bg-surface p-5">
            <h2 className="font-heading text-base font-bold uppercase tracking-wide">
              Ringkasan Belanja
            </h2>

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Subtotal ({itemCount} item)</dt>
                <dd className="font-semibold">{formatRupiah(subtotal)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Diskon</dt>
                <dd className="font-semibold">{formatRupiah(0)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Ongkir</dt>
                <dd className="text-xs text-muted">Dihitung saat checkout</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-border pt-2 text-base">
                <dt className="font-bold">Total</dt>
                <dd className="font-heading font-bold text-accent">
                  {formatRupiah(subtotal)}
                </dd>
              </div>
            </dl>

            <div>
              <label
                htmlFor="voucher"
                className="label-caps text-muted"
              >
                Kode voucher
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="voucher"
                  value={voucher}
                  onChange={(event) => setVoucher(event.target.value)}
                  placeholder="STRIDE10"
                  className="w-full rounded-control border border-border bg-bg px-3 py-2 text-sm uppercase"
                />
                <button
                  type="button"
                  onClick={() =>
                    toastStore.show(
                      "Voucher akan divalidasi di backend saat checkout.",
                    )
                  }
                  className="rounded-control border border-border px-3 py-2 text-xs font-semibold hover:border-accent"
                >
                  Pakai
                </button>
              </div>
            </div>

            <Link
              to="/checkout"
              className="flex w-full items-center justify-center gap-2 rounded-control bg-accent px-5 py-3 text-sm font-bold text-black"
            >
              Lanjut ke Checkout
              <ArrowRight size={16} aria-hidden="true" />
            </Link>

            <p className="flex items-start gap-2 text-[11px] text-muted">
              <Truck size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
              Harga dan stok divalidasi ulang oleh server saat checkout.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
