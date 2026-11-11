import { useState } from "react";
import { Search, Truck, X } from "lucide-react";
import { useAsyncData } from "../../hooks/useAsyncData.js";
import { useDebouncedValue } from "../../hooks/useDebouncedValue.js";
import { adminApi } from "../../services/admin.js";
import { toastStore } from "../../store/toastStore.js";
import { formatDate, formatRupiah } from "../../utils/format.js";
import { statusClass, statusLabel } from "../../utils/orderStatus.js";
import { EmptyState, ErrorState } from "../ui/States.jsx";
import { Field, Pagination, Panel, Td, Th } from "./AdminUI.jsx";
import {
  buttonPrimary,
  buttonSecondary,
  inputClass,
  toDateInput,
} from "./adminUtils.js";

const TRANSITIONS = {
  PENDING_PAYMENT: ["PAID", "CANCELLED", "EXPIRED"],
  PAID: ["PROCESSING", "CANCELLED", "REFUNDED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: ["REFUNDED"],
};

const statusOptions = [
  { value: "", label: "Semua status" },
  ...Object.keys(TRANSITIONS).map((status) => ({
    value: status,
    label: statusLabel(status),
  })),
  { value: "CANCELLED", label: "Dibatalkan" },
  { value: "EXPIRED", label: "Kedaluwarsa" },
  { value: "FAILED", label: "Gagal" },
  { value: "REFUNDED", label: "Direfund" },
];

const shipmentStatuses = [
  "PENDING",
  "PICKED_UP",
  "IN_TRANSIT",
  "SHIPPED",
  "DELIVERED",
  "FAILED",
  "RETURNED",
];

const shipmentLabel = {
  PENDING: "Menunggu",
  PICKED_UP: "Dijemput kurir",
  IN_TRANSIT: "Dalam perjalanan",
  SHIPPED: "Dikirim",
  DELIVERED: "Diterima",
  FAILED: "Gagal",
  RETURNED: "Dikembalikan",
};

function OrderDetailPanel({ orderNumber, onChanged, onClose }) {
  const { data: order, loading, error, reload } = useAsyncData(
    () => adminApi.orders.detail(orderNumber).then((response) => response.data),
    [orderNumber],
  );
  const [statusForm, setStatusForm] = useState({ status: "", note: "" });
  const [shipmentForm, setShipmentForm] = useState({
    status: "",
    trackingNumber: "",
    estimatedArrival: "",
    description: "",
  });
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingShipment, setSavingShipment] = useState(false);

  if (loading && !order) {
    return <div className="h-48 animate-pulse rounded-card bg-surface-2" />;
  }
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const allowed = TRANSITIONS[order.status] ?? [];
  const shipment = order.shipment;
  const canUpdateShipment = ![
    "PENDING_PAYMENT",
    "CANCELLED",
    "EXPIRED",
    "FAILED",
  ].includes(order.status);

  async function submitStatus(event) {
    event.preventDefault();
    if (!statusForm.status) {
      toastStore.show("Pilih status tujuan.", "error");
      return;
    }
    setSavingStatus(true);
    try {
      await adminApi.orders.updateStatus(order.orderNumber, {
        status: statusForm.status,
        note: statusForm.note.trim() || undefined,
      });
      toastStore.show("Status pesanan diperbarui.");
      setStatusForm({ status: "", note: "" });
      reload();
      onChanged();
    } catch (requestError) {
      toastStore.show(requestError?.message || "Gagal memperbarui status.", "error");
    } finally {
      setSavingStatus(false);
    }
  }

  async function submitShipment(event) {
    event.preventDefault();
    setSavingShipment(true);
    const payload = {
      status: shipmentForm.status || undefined,
      trackingNumber:
        shipmentForm.trackingNumber.trim() || shipment?.trackingNumber || null,
      estimatedArrival:
        shipmentForm.estimatedArrival ||
        (shipment?.estimatedArrival
          ? new Date(shipment.estimatedArrival).toISOString()
          : null),
      description: shipmentForm.description.trim() || undefined,
    };
    try {
      await adminApi.orders.updateShipment(order.orderNumber, payload);
      toastStore.show("Pengiriman diperbarui.");
      setShipmentForm((current) => ({ ...current, description: "" }));
      reload();
      onChanged();
    } catch (requestError) {
      toastStore.show(requestError?.message || "Gagal memperbarui pengiriman.", "error");
    } finally {
      setSavingShipment(false);
    }
  }

  return (
    <Panel
      title={`Pesanan ${order.orderNumber}`}
      description={`Dibuat ${formatDate(order.createdAt, { hour: "2-digit", minute: "2-digit" })}`}
      actions={
        <button type="button" onClick={onClose} className={buttonSecondary}>
          <span className="inline-flex items-center gap-1">
            <X size={13} /> Tutup
          </span>
        </button>
      }
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-control border border-border bg-bg p-4 text-xs">
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted">
            Pelanggan
          </p>
          <p className="mt-2 font-semibold">{order.user?.name ?? order.recipient.name}</p>
          <p className="text-muted">{order.user?.email ?? order.recipient.email}</p>
          <p className="mt-2 text-muted">{order.recipient.phone}</p>
          <p className="mt-2 text-muted">
            {order.recipient.detail}, {order.recipient.district}, {order.recipient.city},{" "}
            {order.recipient.province} {order.recipient.postalCode}
          </p>
          {order.notes ? (
            <p className="mt-2 rounded border border-border bg-surface px-2 py-1">
              Catatan: {order.notes}
            </p>
          ) : null}
        </div>

        <div className="rounded-control border border-border bg-bg p-4 text-xs">
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted">
            Pembayaran
          </p>
          <p className="mt-2">
            Status:{" "}
            <span className="font-semibold">{order.payment?.status ?? "-"}</span>
          </p>
          <p className="mt-1 text-muted">
            {order.payment?.provider ?? "-"} · {order.payment?.method ?? "metode belum dipilih"}
          </p>
          <p className="mt-1 text-muted">
            Nominal {formatRupiah(order.payment?.grossAmount ?? order.total)}
          </p>
          <p className="mt-2 text-muted">
            Subtotal {formatRupiah(order.subtotal)} · Diskon{" "}
            {formatRupiah(order.discountTotal)} · Kirim {formatRupiah(order.shippingCost)}
          </p>
          <p className="mt-2 font-heading text-base font-bold text-accent">
            {formatRupiah(order.total)}
          </p>
          {order.couponCode ? (
            <p className="mt-1 text-muted">Voucher: {order.couponCode}</p>
          ) : null}
        </div>

        <div className="rounded-control border border-border bg-bg p-4 text-xs">
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted">
            Pengiriman
          </p>
          <p className="mt-2 font-semibold">
            {order.shipping.provider} {order.shipping.service}
          </p>
          <p className="mt-1 text-muted">
            Status kirim: {shipmentLabel[shipment?.status] ?? shipment?.status ?? "-"}
          </p>
          <p className="mt-1 text-muted">
            Resi: {shipment?.trackingNumber ?? "Belum ada"}
          </p>
          <p className="mt-1 text-muted">
            Estimasi: {shipment?.estimatedArrival ? formatDate(shipment.estimatedArrival) : "-"}
          </p>
          <p className="mt-1 text-muted">
            Dikirim: {shipment?.shippedAt ? formatDate(shipment.shippedAt) : "-"}
          </p>
          <p className="mt-1 text-muted">
            Diterima: {shipment?.deliveredAt ? formatDate(shipment.deliveredAt) : "-"}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-control border border-border bg-bg p-4">
          <h3 className="text-xs font-bold uppercase tracking-wide">Ubah Status Pesanan</h3>
          {allowed.length === 0 ? (
            <p className="mt-2 text-xs text-muted">
              Status {statusLabel(order.status)} tidak memiliki transisi lanjutan.
            </p>
          ) : (
            <form onSubmit={submitStatus} className="mt-3 space-y-3">
              <Field label="Status tujuan">
                <select
                  required
                  value={statusForm.status}
                  onChange={(event) =>
                    setStatusForm((current) => ({ ...current, status: event.target.value }))
                  }
                  className={inputClass}
                >
                  <option value="">Pilih status</option>
                  {allowed.map((status) => (
                    <option key={status} value={status}>
                      {statusLabel(status)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Catatan" hint="Opsional, tampil di riwayat pesanan.">
                <input
                  maxLength="240"
                  value={statusForm.note}
                  onChange={(event) =>
                    setStatusForm((current) => ({ ...current, note: event.target.value }))
                  }
                  className={inputClass}
                />
              </Field>
              <button type="submit" disabled={savingStatus} className={buttonPrimary}>
                {savingStatus ? "Menyimpan..." : "Simpan Status"}
              </button>
            </form>
          )}
        </div>

        <div className="rounded-control border border-border bg-bg p-4">
          <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide">
            <Truck size={14} className="text-accent" aria-hidden="true" />
            Update Pengiriman
          </h3>
          {!canUpdateShipment ? (
            <p className="mt-2 text-xs text-muted">
              Pembaruan pengiriman belum dapat dilakukan pada status pesanan ini.
            </p>
          ) : (
            <form onSubmit={submitShipment} className="mt-3 grid grid-cols-2 gap-2">
              <Field label="Status kirim">
                <select
                  value={shipmentForm.status}
                  onChange={(event) =>
                    setShipmentForm((current) => ({
                      ...current,
                      status: event.target.value,
                    }))
                  }
                  className={inputClass}
                >
                  <option value="">Tidak berubah</option>
                  {shipmentStatuses.map((status) => (
                    <option key={status} value={status}>
                      {shipmentLabel[status]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Nomor resi">
                <input
                  value={shipmentForm.trackingNumber}
                  onChange={(event) =>
                    setShipmentForm((current) => ({
                      ...current,
                      trackingNumber: event.target.value,
                    }))
                  }
                  placeholder={shipment?.trackingNumber || "JNE1234567890"}
                  className={inputClass}
                />
              </Field>
              <Field label="Estimasi tiba">
                <input
                  type="date"
                  value={
                    shipmentForm.estimatedArrival ||
                    toDateInput(shipment?.estimatedArrival)
                  }
                  onChange={(event) =>
                    setShipmentForm((current) => ({
                      ...current,
                      estimatedArrival: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Keterangan">
                <input
                  maxLength="240"
                  value={shipmentForm.description}
                  onChange={(event) =>
                    setShipmentForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </Field>
              <div className="col-span-2">
                <button type="submit" disabled={savingShipment} className={buttonPrimary}>
                  {savingShipment ? "Menyimpan..." : "Simpan Pengiriman"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-control border border-border">
        <table className="w-full border-collapse">
          <thead className="bg-surface-2">
            <tr>
              <Th>Produk</Th>
              <Th>SKU</Th>
              <Th>Ukuran</Th>
              <Th>Warna</Th>
              <Th>Harga</Th>
              <Th>Qty</Th>
              <Th>Total</Th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-t border-border">
                <Td>
                  <div className="flex items-center gap-2">
                    {item.image ? (
                      <img src={item.image.url} alt="" className="h-8 w-8 rounded object-cover" />
                    ) : null}
                    <span className="font-semibold">{item.name}</span>
                  </div>
                </Td>
                <Td className="font-mono">{item.sku}</Td>
                <Td>{item.size}</Td>
                <Td>{item.color}</Td>
                <Td>{formatRupiah(item.unitPrice)}</Td>
                <Td>{item.quantity}</Td>
                <Td>{formatRupiah(item.lineTotal)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-control border border-border bg-bg p-4">
          <h3 className="text-xs font-bold uppercase tracking-wide">Riwayat Status</h3>
          <ul className="mt-2 space-y-2 text-[11px]">
            {[...order.statusHistory].reverse().map((entry, index) => (
              <li key={`${entry.createdAt}-${index}`} className="border-l-2 border-border pl-3">
                <p className="font-semibold">
                  {entry.fromStatus ? `${statusLabel(entry.fromStatus)} → ` : ""}
                  {statusLabel(entry.toStatus)}
                </p>
                <p className="text-muted">
                  {formatDate(entry.createdAt, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  · {entry.source}
                </p>
                {entry.note ? <p className="text-muted">{entry.note}</p> : null}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-control border border-border bg-bg p-4">
          <h3 className="text-xs font-bold uppercase tracking-wide">Event Pengiriman</h3>
          {shipment?.events?.length ? (
            <ul className="mt-2 space-y-2 text-[11px]">
              {[...shipment.events].reverse().map((event, index) => (
                <li
                  key={`${event.occurredAt}-${index}`}
                  className="border-l-2 border-border pl-3"
                >
                  <p className="font-semibold">
                    {shipmentLabel[event.status] ?? event.status}
                  </p>
                  <p className="text-muted">
                    {formatDate(event.occurredAt, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    · {event.source}
                  </p>
                  {event.description ? (
                    <p className="text-muted">{event.description}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-muted">Belum ada event pengiriman.</p>
          )}
        </div>
      </div>
    </Panel>
  );
}

export function AdminOrders() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const debouncedQuery = useDebouncedValue(query, 350);

  const { data, loading, error, reload } = useAsyncData(
    () =>
      adminApi.orders
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

  return (
    <div className="space-y-5">
      {selected ? (
        <OrderDetailPanel
          orderNumber={selected}
          onChanged={reload}
          onClose={() => setSelected(null)}
        />
      ) : null}

      <Panel
        title="Pesanan"
        description="Filter, periksa detail, ubah status, dan perbarui resi."
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_220px]">
          <label className="relative block">
            <span className="sr-only">Cari pesanan</span>
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Cari nomor pesanan, nama, atau email"
              className="w-full rounded-control border border-border bg-bg py-2 pl-9 pr-3 text-sm"
            />
          </label>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            className="rounded-control border border-border bg-bg px-3 py-2 text-sm"
          >
            {statusOptions.map((option, index) => (
              <option key={`${option.value}-${index}`} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {loading && !data ? (
          <div className="mt-4 h-40 animate-pulse rounded-control bg-surface-2" />
        ) : error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : orders.length === 0 ? (
          <EmptyState title="Pesanan tidak ditemukan" description="Ubah pencarian atau filter." />
        ) : (
          <>
            <div className="mt-4 overflow-x-auto rounded-control border border-border">
              <table className="w-full border-collapse">
                <thead className="bg-surface-2">
                  <tr>
                    <Th>Nomor</Th>
                    <Th>Pelanggan</Th>
                    <Th>Tanggal</Th>
                    <Th>Total</Th>
                    <Th>Status</Th>
                    <Th>Resi</Th>
                    <Th>Aksi</Th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-t border-border">
                      <Td className="font-mono font-semibold">{order.orderNumber}</Td>
                      <Td>
                        <p>{order.user?.name ?? order.recipient.name}</p>
                        <p className="text-[10px] text-muted">
                          {order.user?.email ?? order.recipient.email}
                        </p>
                      </Td>
                      <Td>{formatDate(order.createdAt)}</Td>
                      <Td className="font-semibold">{formatRupiah(order.total)}</Td>
                      <Td>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${statusClass(order.status)}`}
                        >
                          {statusLabel(order.status)}
                        </span>
                      </Td>
                      <Td className="font-mono text-[10px]">
                        {order.shipment?.trackingNumber ?? "-"}
                      </Td>
                      <Td>
                        <button
                          type="button"
                          onClick={() => setSelected(order.orderNumber)}
                          className="text-[11px] font-semibold text-accent hover:underline"
                        >
                          Detail
                        </button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination meta={meta} onPage={setPage} />
          </>
        )}
      </Panel>
    </div>
  );
}
