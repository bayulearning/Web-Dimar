import { Link, useParams } from "react-router-dom";
import {
  Check,
  Copy,
  CreditCard,
  MapPin,
  Package,
  Truck,
} from "lucide-react";
import { PageShell } from "../components/ui/PageShell.jsx";
import { ErrorState } from "../components/ui/States.jsx";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { orderApi } from "../services/order.js";
import { toastStore } from "../store/toastStore.js";
import { formatDate, formatRupiah } from "../utils/format.js";
import {
  orderSteps,
  statusClass,
  statusLabel,
  statusStep,
} from "../utils/orderStatus.js";

function TimelineEntry({ entry }) {
  return (
    <li className="relative pl-6">
      <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full border border-accent bg-bg" />
      <p className="text-sm font-semibold">{entry.title}</p>
      {entry.note ? <p className="mt-0.5 text-xs text-muted">{entry.note}</p> : null}
      <p className="mt-0.5 text-[11px] uppercase tracking-wide text-muted">
        {formatDate(entry.at, {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
        {entry.source ? ` · ${entry.source}` : ""}
      </p>
    </li>
  );
}

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const { data: order, loading, error, reload } = useAsyncData(
    () => orderApi.detail(orderId).then((response) => response.data),
    [orderId],
  );

  useDocumentTitle(order ? `Pesanan ${order.orderNumber}` : "Detail Pesanan", {
    description: "Rincian, pembayaran, dan pelacakan pesanan Stride Athletics.",
    noindex: true,
  });

  async function copyTracking() {
    const tracking = order?.shipment?.trackingNumber;
    if (!tracking) return;
    try {
      await navigator.clipboard.writeText(tracking);
      toastStore.show("Nomor resi disalin.");
    } catch {
      toastStore.show("Gagal menyalin nomor resi.", "error");
    }
  }

  if (loading && !order) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-12">
        <div className="h-72 animate-pulse rounded-card bg-surface-2" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-12">
        <ErrorState error={error} onRetry={reload} />
      </div>
    );
  }

  const currentStep = statusStep(order.status);
  const timeline = [
    ...order.statusHistory.map((entry) => ({
      at: entry.createdAt,
      title: statusLabel(entry.toStatus),
      note: entry.note,
      source: entry.source,
    })),
    ...(order.shipment?.events ?? []).map((event) => ({
      at: event.occurredAt,
      title: event.status,
      note: event.description,
      source: event.source,
    })),
  ].sort((a, b) => new Date(a.at) - new Date(b.at));

  return (
    <PageShell
      title="Detail Pesanan"
      description="Status pesanan, pembayaran, pengiriman, dan riwayat perjalanan."
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="label-caps text-muted">Nomor pesanan</p>
          <p className="mt-1 font-heading text-xl font-bold">
            {order.orderNumber}
          </p>
          <p className="mt-1 text-xs text-muted">
            Dibuat {formatDate(order.createdAt)}
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${statusClass(order.status)}`}
        >
          {statusLabel(order.status)}
        </span>
      </div>

      <div className="mt-6 rounded-card border border-border bg-surface p-5">
        <ol className="grid grid-cols-5 gap-2">
          {orderSteps.map((step, index) => {
            const done = currentStep >= index && currentStep >= 0;
            const active = currentStep === index;
            return (
              <li key={step.status} className="flex flex-col items-center gap-2 text-center">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-[11px] font-bold ${
                    done
                      ? "border-accent bg-accent text-black"
                      : "border-border text-muted"
                  }`}
                >
                  {done ? <Check size={14} aria-hidden="true" /> : index + 1}
                </span>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wide ${
                    active ? "text-accent" : done ? "text-fg" : "text-muted"
                  }`}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
        {currentStep < 0 ? (
          <p className="mt-4 rounded-control border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
            Pesanan berstatus {statusLabel(order.status)} dan tidak dilanjutkan.
          </p>
        ) : null}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
        <section className="space-y-5">
          <div className="rounded-card border border-border bg-surface p-5">
            <h2 className="flex items-center gap-2 font-heading text-base font-bold uppercase tracking-wide">
              <Package size={16} className="text-accent" aria-hidden="true" />
              Produk
            </h2>
            <ul className="mt-3 space-y-3">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 text-xs">
                  {item.image ? (
                    <img
                      src={item.image.url}
                      alt=""
                      className="h-14 w-14 rounded object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="h-14 w-14 rounded bg-surface-2" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">
                      {item.slug ? (
                        <Link to={`/produk/${item.slug}`} className="hover:text-accent">
                          {item.name}
                        </Link>
                      ) : (
                        item.name
                      )}
                    </span>
                    <span className="mt-0.5 block text-muted">
                      {item.size} · {item.color} · {item.quantity}x
                    </span>
                  </span>
                  <span className="font-semibold">
                    {formatRupiah(item.lineTotal)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-2 border-t border-border pt-3 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd>{formatRupiah(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Diskon</dt>
                <dd>
                  {order.discountTotal > 0
                    ? `-${formatRupiah(order.discountTotal)}`
                    : formatRupiah(0)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Ongkir</dt>
                <dd>{formatRupiah(order.shippingCost)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-sm font-bold">
                <dt>Total</dt>
                <dd className="text-accent">{formatRupiah(order.total)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-card border border-border bg-surface p-5">
            <h2 className="flex items-center gap-2 font-heading text-base font-bold uppercase tracking-wide">
              <Truck size={16} className="text-accent" aria-hidden="true" />
              Pengiriman
            </h2>
            <div className="mt-3 grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
              <div>
                <p className="text-muted">Kurir</p>
                <p className="mt-0.5 font-semibold">
                  {order.shipping.provider} {order.shipping.service}
                </p>
              </div>
              <div>
                <p className="text-muted">Estimasi tiba</p>
                <p className="mt-0.5 font-semibold">
                  {order.shipment?.estimatedArrival
                    ? formatDate(order.shipment.estimatedArrival)
                    : "-"}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-muted">Nomor resi</p>
                {order.shipment?.trackingNumber ? (
                  <p className="mt-0.5 flex items-center gap-2 font-semibold">
                    {order.shipment.trackingNumber}
                    <button
                      type="button"
                      onClick={copyTracking}
                      className="inline-flex items-center gap-1 rounded-control border border-border px-2 py-1 text-[11px] font-semibold hover:border-accent"
                    >
                      <Copy size={12} aria-hidden="true" />
                      Salin
                    </button>
                  </p>
                ) : (
                  <p className="mt-0.5 text-muted">
                    Resi tersedia setelah paket diserahkan ke kurir.
                  </p>
                )}
              </div>
            </div>

            {timeline.length ? (
              <ol className="mt-5 space-y-4 border-l border-border pl-3">
                {timeline.map((entry, index) => (
                  <TimelineEntry key={`${entry.at}-${index}`} entry={entry} />
                ))}
              </ol>
            ) : null}
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-card border border-border bg-surface p-5">
            <h2 className="flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-wide">
              <CreditCard size={15} className="text-accent" aria-hidden="true" />
              Pembayaran
            </h2>
            <dl className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted">Status</dt>
                <dd className="font-semibold">
                  {order.payment?.status ?? "-"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Metode</dt>
                <dd className="font-semibold">{order.payment?.method ?? "-"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Dibayar</dt>
                <dd className="font-semibold">
                  {order.paidAt ? formatDate(order.paidAt) : "-"}
                </dd>
              </div>
              {order.status === "PENDING_PAYMENT" && order.expiresAt ? (
                <div className="flex justify-between">
                  <dt className="text-muted">Batas bayar</dt>
                  <dd className="font-semibold">{formatDate(order.expiresAt)}</dd>
                </div>
              ) : null}
            </dl>

            {order.status === "PENDING_PAYMENT" ? (
              <Link
                to={`/pesanan/${order.orderNumber}/pending`}
                className="mt-4 block rounded-control bg-accent px-4 py-2.5 text-center text-sm font-bold text-black"
              >
                Lanjutkan Pembayaran
              </Link>
            ) : (
              <Link
                to={`/pesanan/${order.orderNumber}/sukses`}
                className="mt-4 block rounded-control border border-border px-4 py-2.5 text-center text-sm font-semibold hover:border-accent"
              >
                Lihat Halaman Status
              </Link>
            )}
          </div>

          <div className="rounded-card border border-border bg-surface p-5">
            <h2 className="flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-wide">
              <MapPin size={15} className="text-accent" aria-hidden="true" />
              Alamat Penerima
            </h2>
            <p className="mt-3 text-sm font-semibold">{order.recipient.name}</p>
            <p className="mt-1 text-xs text-muted">{order.recipient.phone}</p>
            <p className="mt-1 text-xs text-muted">
              {order.recipient.detail}, {order.recipient.district},{" "}
              {order.recipient.city}, {order.recipient.province}{" "}
              {order.recipient.postalCode}
            </p>
          </div>

          <Link
            to="/pesanan"
            className="block rounded-control border border-border px-4 py-2.5 text-center text-sm font-semibold hover:border-accent"
          >
            Kembali ke Daftar Pesanan
          </Link>
        </aside>
      </div>
    </PageShell>
  );
}
