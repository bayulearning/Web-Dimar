const genderOptions = [
  { value: "", label: "Semua" },
  { value: "men", label: "Pria" },
  { value: "women", label: "Wanita" },
  { value: "kids", label: "Anak" },
  { value: "unisex", label: "Unisex" },
];

function ChipGroup({ label, options, value, onSelect }) {
  return (
    <fieldset className="border-t border-border pt-4">
      <legend className="label-caps mb-2 text-muted">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = (value ?? "") === option.value;
          return (
            <button
              key={option.value || "all"}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(option.value)}
              className={`rounded-control border px-3 py-1.5 text-xs font-semibold transition-colors ${
                active
                  ? "border-accent bg-accent text-black"
                  : "border-border text-muted hover:border-accent hover:text-fg"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function FilterPanel({ facets, value, onChange, onReset }) {
  const sizes = (facets?.sizes ?? []).map((size) => ({
    value: size,
    label: size.replace("EU ", ""),
  }));
  const colors = (facets?.colors ?? []).map((color) => ({
    value: color,
    label: color,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wider">
          Filter
        </h2>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold text-accent hover:underline"
        >
          Reset
        </button>
      </div>

      <ChipGroup
        label="Gender"
        options={genderOptions}
        value={value.gender}
        onSelect={(next) => onChange("gender", next)}
      />

      {sizes.length ? (
        <ChipGroup
          label="Ukuran (EU)"
          options={sizes}
          value={value.size}
          onSelect={(next) => onChange("size", next)}
        />
      ) : null}

      {colors.length ? (
        <ChipGroup
          label="Warna"
          options={colors}
          value={value.color}
          onSelect={(next) => onChange("color", next)}
        />
      ) : null}

      <fieldset className="border-t border-border pt-4">
        <legend className="label-caps mb-2 text-muted">Rentang Harga</legend>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min="0"
            step="50000"
            placeholder="Min"
            aria-label="Harga minimum"
            value={value.minPrice}
            onChange={(event) => onChange("minPrice", event.target.value)}
            className="w-full rounded-control border border-border bg-bg px-3 py-2 text-sm"
          />
          <span className="text-muted">-</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            step="50000"
            placeholder="Maks"
            aria-label="Harga maksimum"
            value={value.maxPrice}
            onChange={(event) => onChange("maxPrice", event.target.value)}
            className="w-full rounded-control border border-border bg-bg px-3 py-2 text-sm"
          />
        </div>
        {facets?.priceRange ? (
          <p className="mt-2 text-[11px] text-muted">
            Kisaran data: Rp {facets.priceRange.min.toLocaleString("id-ID")} - Rp{" "}
            {facets.priceRange.max.toLocaleString("id-ID")}
          </p>
        ) : null}
      </fieldset>
    </div>
  );
}
