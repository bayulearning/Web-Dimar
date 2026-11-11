import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { Price } from "../components/ui/Price.jsx";
import { wishlistStore } from "../store/wishlistStore.js";
import { useStore } from "../store/useStore.js";
import { toastStore } from "../store/toastStore.js";

export default function WishlistPage() {
  useDocumentTitle("Wishlist", {
    description: "Produk Stride Athletics yang Anda simpan.",
    noindex: true,
  });
  const wishlist = useStore(wishlistStore);
  const items = wishlist.items;

  if (!items.length) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 md:px-8">
        <div className="rounded-card border border-border bg-surface px-6 py-14 text-center">
          <Heart size={38} className="mx-auto text-muted" aria-hidden="true" />
          <h1 className="mt-4 font-heading text-2xl font-bold uppercase">
            Wishlist Masih Kosong
          </h1>
          <p className="mt-2 text-sm text-muted">
            Simpan produk favorit dengan menekan ikon hati pada kartu produk.
          </p>
          <Link
            to="/belanja"
            className="mt-6 inline-block rounded-control bg-fg px-5 py-2.5 text-sm font-bold text-bg"
          >
            Jelajahi Katalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="label-caps text-accent">Wishlist</p>
          <h1 className="mt-2 font-heading text-2xl font-bold uppercase md:text-4xl">
            Produk Favorit
          </h1>
          <p className="mt-2 text-sm text-muted">
            {items.length} produk tersimpan.
          </p>
        </div>
        <Link
          to="/belanja"
          className="text-xs font-semibold text-accent hover:underline"
        >
          Lanjut belanja
        </Link>
      </header>

      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
        {items.map((item) => (
          <li
            key={item.id}
            className="group flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface"
          >
            <div className="relative">
              <Link
                to={`/produk/${item.slug}`}
                className="block bg-surface-2"
                aria-label={`Lihat ${item.name}`}
              >
                <img
                  src={item.image?.url}
                  alt={item.image?.alt || item.name}
                  width="800"
                  height="800"
                  loading="lazy"
                  className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </Link>
              <button
                type="button"
                onClick={() => {
                  wishlistStore.remove(item.id);
                  toastStore.show(`${item.name} dihapus dari wishlist.`);
                }}
                aria-label={`Hapus ${item.name} dari wishlist`}
                className="absolute right-2 top-2 rounded-full border border-border bg-black/60 p-2 text-fg backdrop-blur hover:border-danger"
              >
                <Trash2 size={15} />
              </button>
            </div>

            <div className="flex flex-1 flex-col p-3">
              {item.category?.name ? (
                <p className="label-caps text-muted">{item.category.name}</p>
              ) : null}
              <h2 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug">
                <Link to={`/produk/${item.slug}`} className="hover:text-accent">
                  {item.name}
                </Link>
              </h2>
              <div className="mt-auto pt-3">
                <Price price={item.price} basePrice={item.basePrice} />
                <Link
                  to={`/produk/${item.slug}`}
                  className="mt-3 flex items-center justify-center gap-2 rounded-control border border-border px-3 py-2 text-xs font-semibold hover:border-accent"
                >
                  <ShoppingBag size={14} aria-hidden="true" />
                  Pilih ukuran
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
