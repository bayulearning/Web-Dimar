import { Star } from "lucide-react";

export function RatingStars({ average = 0, count = 0, className = "" }) {
  if (!count) {
    return (
      <span className={`text-[11px] text-muted ${className}`}>
        Belum ada ulasan
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] text-muted ${className}`}
      aria-label={`Rating ${average} dari 5, ${count} ulasan`}
    >
      <Star size={12} className="fill-warning text-warning" aria-hidden="true" />
      <span className="font-semibold text-fg">{average.toFixed(1)}</span>
      <span>({count})</span>
    </span>
  );
}
