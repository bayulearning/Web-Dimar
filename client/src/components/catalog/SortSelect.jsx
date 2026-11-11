const options = [
  { value: "newest", label: "Terbaru" },
  { value: "price_asc", label: "Harga: Rendah ke Tinggi" },
  { value: "price_desc", label: "Harga: Tinggi ke Rendah" },
  { value: "rating", label: "Rating Tertinggi" },
  { value: "popular", label: "Paling Populer" },
];

export function SortSelect({ value, onChange }) {
  return (
    <label className="flex items-center gap-2 text-xs text-muted">
      <span className="hidden sm:inline">Urutkan</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-control border border-border bg-surface px-3 py-2 text-xs font-semibold text-fg"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
