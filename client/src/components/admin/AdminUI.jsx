export function Panel({ title, description, actions, children }) {
  return (
    <section className="rounded-card border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {title ? (
            <h2 className="font-heading text-base font-bold uppercase tracking-wide">
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className="mt-1 text-xs text-muted">{description}</p>
          ) : null}
        </div>
        {actions}
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}

export function Pagination({ meta, onPage }) {
  if (!meta || meta.totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-between text-xs">
      <button
        type="button"
        onClick={() => onPage(Math.max(1, meta.page - 1))}
        disabled={!meta.hasPrevPage}
        className="rounded-control border border-border px-3 py-2 font-semibold disabled:opacity-40"
      >
        Sebelumnya
      </button>
      <span className="text-muted">
        Halaman {meta.page} dari {meta.totalPages} · {meta.total} data
      </span>
      <button
        type="button"
        onClick={() => onPage(meta.page + 1)}
        disabled={!meta.hasNextPage}
        className="rounded-control border border-border px-3 py-2 font-semibold disabled:opacity-40"
      >
        Berikutnya
      </button>
    </div>
  );
}

export function Field({ label, hint, children, className = "" }) {
  return (
    <label className={`block text-xs text-muted ${className}`}>
      <span className="font-semibold uppercase tracking-wide">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-[11px]">{hint}</span> : null}
    </label>
  );
}

export function Th({ children, className = "" }) {
  return (
    <th
      className={`whitespace-nowrap px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-muted ${className}`}
    >
      {children}
    </th>
  );
}

export function Td({ children, className = "" }) {
  return <td className={`px-3 py-2 align-top text-xs ${className}`}>{children}</td>;
}

export function StatusPill({ children, tone = "muted" }) {
  const tones = {
    accent: "border-accent/40 bg-accent/10 text-accent",
    danger: "border-danger/40 bg-danger/10 text-danger",
    warning: "border-warning/40 bg-warning/10 text-warning",
    muted: "border-border bg-surface-2 text-muted",
  };
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${tones[tone] ?? tones.muted}`}
    >
      {children}
    </span>
  );
}
