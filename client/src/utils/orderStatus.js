export const orderStatusMeta = {
  PENDING_PAYMENT: { label: "Menunggu Pembayaran", tone: "warning", step: 0 },
  PAID: { label: "Dibayar", tone: "accent", step: 1 },
  PROCESSING: { label: "Diproses", tone: "accent", step: 2 },
  SHIPPED: { label: "Dikirim", tone: "accent", step: 3 },
  DELIVERED: { label: "Diterima", tone: "accent", step: 4 },
  CANCELLED: { label: "Dibatalkan", tone: "danger", step: -1 },
  EXPIRED: { label: "Kedaluwarsa", tone: "danger", step: -1 },
  FAILED: { label: "Gagal", tone: "danger", step: -1 },
  REFUNDED: { label: "Direfund", tone: "muted", step: -1 },
};

export const orderSteps = [
  { status: "PENDING_PAYMENT", label: "Pesanan" },
  { status: "PAID", label: "Dibayar" },
  { status: "PROCESSING", label: "Diproses" },
  { status: "SHIPPED", label: "Dikirim" },
  { status: "DELIVERED", label: "Diterima" },
];

export function statusLabel(status) {
  return orderStatusMeta[status]?.label ?? status ?? "-";
}

export function statusTone(status) {
  return orderStatusMeta[status]?.tone ?? "muted";
}

export function statusClass(status) {
  const tone = statusTone(status);
  if (tone === "accent") return "border-accent/40 bg-accent/10 text-accent";
  if (tone === "danger") return "border-danger/40 bg-danger/10 text-danger";
  if (tone === "warning") return "border-warning/40 bg-warning/10 text-warning";
  return "border-border bg-surface-2 text-muted";
}

export function statusStep(status) {
  return orderStatusMeta[status]?.step ?? -1;
}
