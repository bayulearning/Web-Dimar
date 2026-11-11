const styles = {
  BARU: "bg-accent text-black",
  TERLARIS: "bg-fg text-bg",
  POPULER: "bg-warning text-black",
  EKSKLUSIF: "border border-fg/70 bg-black/60 text-fg",
  DISKON: "bg-danger text-white",
};

export function Badge({ label, className = "" }) {
  if (!label) return null;
  const style = styles[label] ?? "bg-surface-2 text-fg";
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${style} ${className}`}
    >
      {label}
    </span>
  );
}
