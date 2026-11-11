export const inputClass =
  "mt-1 w-full rounded-control border border-border bg-bg px-3 py-2 text-sm text-fg";

export const buttonPrimary =
  "rounded-control bg-accent px-4 py-2 text-xs font-bold text-black transition-opacity hover:opacity-90 disabled:opacity-60";

export const buttonSecondary =
  "rounded-control border border-border px-4 py-2 text-xs font-semibold text-fg hover:border-accent disabled:opacity-60";

export const buttonDanger =
  "rounded-control border border-border px-4 py-2 text-xs font-semibold text-muted hover:border-danger hover:text-danger disabled:opacity-60";

export function toDateInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function toDateTimeInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
