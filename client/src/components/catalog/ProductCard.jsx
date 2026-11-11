import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { Badge } from "../ui/Badge.jsx";
import { Price } from "../ui/Price.jsx";
import { RatingStars } from "../ui/RatingStars.jsx";
import { wishlistStore, isInWishlist } from "../../store/wishlistStore.js";
import { useStore } from "../../store/useStore.js";

export function ProductCard({ product }) {
  const wishlist = useStore(wishlistStore);
  const active = isInWishlist(wishlist, product.id);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface">
      <div className="relative">
        <Link
          to={`/produk/${product.slug}`}
          className="block bg-surface-2"
          aria-label={`Lihat ${product.name}`}
        >
          <img
            src={product.image?.url}
            alt={product.image?.alt || product.name}
            width="800"
            height="800"
            loading="lazy"
            className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </Link>

        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          <Badge label={product.badge} />
          {product.discountPercent > 0 ? (
            <span className="rounded bg-danger px-2 py-0.5 text-[10px] font-bold text-white">
              -{product.discountPercent}%
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => wishlistStore.toggle(product)}
          aria-pressed={active}
          aria-label={
            active
              ? `Hapus ${product.name} dari wishlist`
              : `Simpan ${product.name} ke wishlist`
          }
          className="absolute right-2 top-2 rounded-full border border-border bg-black/60 p-2 text-fg backdrop-blur transition-colors hover:border-accent"
        >
          <Heart
            size={15}
            className={active ? "fill-danger text-danger" : ""}
            aria-hidden="true"
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <p className="label-caps text-muted">{product.category?.name}</p>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug">
          <Link to={`/produk/${product.slug}`} className="hover:text-accent">
            {product.name}
          </Link>
        </h3>

        <div className="mt-1">
          <RatingStars
            average={product.rating.average}
            count={product.rating.count}
          />
        </div>

        <div className="mt-auto pt-3">
          <Price price={product.price} basePrice={product.basePrice} />
          <p className="mt-1 text-[11px] text-muted">
            {product.totalStock > 0
              ? `${product.availableSizes.length} ukuran tersedia`
              : "Stok habis"}
          </p>
        </div>
      </div>
    </article>
  );
}
