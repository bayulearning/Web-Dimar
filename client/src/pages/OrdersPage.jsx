import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, PackageSearch, Search } from "lucide-react";
import { PageShell } from "../components/ui/PageShell.jsx";
import { EmptyState, ErrorState } from "../components/ui/States.jsx";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useDebouncedValue } from "../hooks/useDebouncedValue.js";
import { orderApi } from "../services/order.js";
import { formatDate, formatRupiah } from "../utils/format.js";
import { statusClass, statusLabel } from "../utils/orderStatus.js";

const statusOptions = [
  { value: "", label: "Semua status" },
  { value: "PENDING_PAYMENT", label: "Menunggu Pembayaran" },
  { value: "PAID", label: "Dibayar" },
  { value: "PROCESSING", label: "Diproses" },
  { value: "SHIPPED", label: "Dikirim" },
  { value: "DELIVERED", label: "Diterima" },
  { value: "CANCELLED", label: "Dibatalkan" },
  { value: "EXPIRED", label: "Kedaluwarsa" },
  { value: "FAILED", label: "Gagal" },
  { value: "REFUNDED", label: "Direfund" },
];

export default function OrdersPage() {
  useDocumentTitle("Riwayat Pesanan", {
    description: "Daftar dan status pesanan Stride Athletics Anda.",
    noindex: true,
  });
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const debouncedQuery = useDebouncedValue(query, 350);

  const { data, loading, error, reload } = useAsyncData(
    () =>
      orderApi
        .list({
          q: debouncedQuery || undefined,
          status: status || undefined,
          page,
          limit: 10,
        })
        .then((response) => response),
    [debouncedQuery, status, page],
  );

  const orders = data?.data ?? [];
  const meta = data?.meta;

  function handleQueryChange(event) {
    setQuery(event.target.value);
    setPage(1);
  }

  function handleStatusChange(event) {
    setStatus(event.target.value);
    setPage(1);
  }

  return (
    <PageShell
      title="Pesanan Saya"
      description="Riwayat pesanan beserta status pembayaran dan pengiriman."
    >
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_220px]">
        <label className="relative block">
          <span className="sr-only">Cari nomor pesanan</span>
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            id="order-search"
            value={query}
            onChange={handleQueryChange}
            placeholder="Cari nomor pesanan, contoh STR-2026-0001"
            className="w-full rounded-control border border-border bg-surface py-2.5 pl-9 pr-3 text-sm text-fg"
          />
        </label>
        <label className="block">
          <span className="sr-only">Filter status pesanan</span>
          <select
            id="order-status"
            value={status}
            onChange={handleStatusChange}
            className="w-full rounded-control border border-border bg-surface px-3 py-2.5 text-sm text-fg"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading && !data ? (
        <div className="space-y-3">
          {[0, 1, 2].map((entry) => (
            <div
              key={entry}
              className="h-32 animate-pulse rounded-card bg-surface-2"
            />
          ))}
        </div>
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="Belum ada pesanan"
          description={
            debouncedQuery || status
              ? "Tidak ada pesanan yang cocok dengan pencarian atau filter."
              : "Pesanan yang Anda buat akan muncul di sini."
          }
          action={
            <Link
              to="/belanja"
              className="rounded-control bg-accent px-5 py-2.5 text-sm font-bold text-black"
            >
              Mulai Belanja
            </Link>
          }
        />
      ) : (
        <>
          <ul className="space-y-3">
            {orders.map((order) => (
              <li
                key={order.id}
                className="rounded-card border border-border bg-surface p-4 md:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-heading text-sm font-bold">
                      {order.orderNumber}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {formatDate(order.createdAt)} ·{" "}
                      {order.items.reduce(
                        (total, item) => total + item.quantity,
                        0,
                      )}{" "}
                      item
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${statusClass(order.status)}`}
                  >
                    {statusLabel(order.status)}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                  <div className="text-xs text-muted">
                    <p>
                      {order.shipping.provider} {order.shipping.service}
                      {order.shipment?.trackingNumber
                        ? ` · resi ${order.shipment.trackingNumber}`
                        : ""}
                    </p>
                    <p className="mt-1">
                      {order.items
                        .slice(0, 2)
                        .map((item) => item.name)
                        .join(", ")}
                      {order.items.length > 2
                        ? ` +${order.items.length - 2} lainnya`
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-heading text-base font-bold text-accent">
                      {formatRupiah(order.total)}
                    </span>
                    <Link
                      to={`/pesanan/${order.orderNumber}`}
                      className="inline-flex items-center gap-1 rounded-control border border-border px-3 py-2 text-xs font-semibold hover:border-accent"
                    >
                      Detail
                      <ArrowRight size={13} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {meta && meta.totalPages > 1 ? (
            <div className="mt-5 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={!meta.hasPrevPage}
                className="rounded-control border border-border px-3 py-2 font-semibold disabled:opacity-40"
              >
                Sebelumnya
              </button>
              <span className="text-muted">
                Halaman {meta.page} dari {meta.totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((value) => value + 1)}
                disabled={!meta.hasNextPage}
                className="rounded-control border border-border px-3 py-2 font-semibold disabled:opacity-40"
              >
                Berikutnya
              </button>
            </div>
          ) : null}
        </>
      )}
    </PageShell>
  );
}
