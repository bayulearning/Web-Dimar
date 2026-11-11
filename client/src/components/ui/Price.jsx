import { formatRupiah } from "../../utils/format.js";

export function Price({ price, basePrice, className = "" }) {
  const hasDiscount = basePrice && basePrice > price;

  return (
    <span className={`flex flex-wrap items-baseline gap-2 ${className}`}>
      <span className="font-heading text-base font-bold text-accent">
        {formatRupiah(price)}
      </span>
      {hasDiscount ? (
        <span className="text-xs text-muted line-through">
          {formatRupiah(basePrice)}
        </span>
      ) : null}
    </span>
  );
}
