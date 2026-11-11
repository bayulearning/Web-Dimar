import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, Clock, RefreshCw, XCircle } from "lucide-react";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { ErrorState } from "../components/ui/States.jsx";
import { paymentApi } from "../services/payment.js";
import { toastStore } from "../store/toastStore.js";
import { formatRupiah } from "../utils/format.js";
import { loadSnapScript } from "../utils/snap.js";

const paymentCopy = {
  SETTLEMENT: {
    title: "Pembayaran Berhasil",
    description: "Pembayaran pesanan Anda telah dikonfirmasi backend.",
    tone: "success",
  },
  PENDING: {
    title: "Menunggu Pembayaran",
    description: "Selesaikan pembayaran sebelum batas waktu berakhir.",
    tone: "pending",
  },
  CHALLENGE: {
    title: "Pembayaran Sedang Ditinjau",
    description: "Pembayaran menunggu pemeriksaan fraud dari penyedia.",
    tone: "pending",
  },
  DENY: {
    title: "Pembayaran Ditolak",
    description: "Pembayaran ditolak oleh penyedia.",
    tone: "failed",
  },
  CANCEL: {
    title: "Pembayaran Dibatalkan",
    description: "Transaksi pembayaran dibatalkan.",
    tone: "failed",
  },
  EXPIRE: {
    title: "Pembayaran Kedaluwarsa",
    description: "Batas waktu pembayaran telah berakhir.",
    tone: "failed",
  },
  FAILURE: {
    title: "Pembayaran Gagal",
    description: "Pembayaran tidak berhasil diproses.",
    tone: "failed",
  },
  REFUND: {
    title: "Pembayaran Direfund",
    description: "Dana pembayaran telah dikembalikan.",
    tone: "pending",
  },
  CHARGEBACK: {
    title: "Chargeback",
    description: "Transaksi dibatalkan melalui chargeback.",
    tone: "failed",
  },
};

const routeCopy = {
  success: "Pembayaran Berhasil",
  pending: "Menunggu Pembayaran",
  failed: "Pembayaran Gagal",
};

export default function OrderStatusPage({ status = "pending" }) {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [actionLoading, setActionLoading] = useState(false);

  const { data, loading, error, reload } = useAsyncData(
    () => paymentApi.status(orderId).then((response) => response.data),
    [orderId],
  );

  useDocumentTitle(data ? `Pesanan ${data.orderNumber}` : routeCopy[status], {
    description: "Status pembayaran dan rincian pesanan Stride Athletics.",
    noindex: true,
  });

  async function handlePayNow() {
    setActionLoading(true);
    try {
      const response = await paymentApi.createSnapToken(orderId);
      const payment = response.data;

      if (payment.mode === "midtrans") {
        const snap = await loadSnapScript(
          payment.config?.snapScriptUrl,
          payment.config?.clientKey,
        );
        snap.pay(payment.token, {
          onSuccess: () => reload(),
          onPending: () => reload(),
          onError: () => reload(),
          onClose: () => reload(),
        });
      } else {
        toastStore.show(
          "Mode mock aktif. Gunakan tombol simulasi pembayaran untuk pengujian.",
        );
        reload();
      }
    } catch (paymentError) {
      toastStore.show(
        paymentError?.message || "Gagal membuat token pembayaran.",
        "error",
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSimulate() {
    setActionLoading(true);
    try {
      await paymentApi.simulateMockSettlement(orderId);
      toastStore.show("Pembayaran mock berhasil disimulasikan.");
      reload();
    } catch (simulateError) {
      toastStore.show(
        simulateError?.message || "Gagal mensimulasikan pembayaran.",
        "error",
      );
    } finally {
      setActionLoading(false);
    }
  }

  if (loading && !data) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-12">
        <div className="h-56 animate-pulse rounded-card bg-surface-2" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-12">
        <ErrorState error={error} onRetry={reload} />
      </div>
    );
  }

  const payment = data.payment;
  const copy = paymentCopy[payment?.status] ?? {
    title: routeCopy[status] ?? "Status Pesanan",
    description: "Status pesanan diperiksa langsung dari backend.",
    tone: status === "success" ? "success" : status === "failed" ? "failed" : "pending",
  };
  const isPaid = data.status === "PAID" || payment?.status === "SETTLEMENT";
  const isPending = data.status === "PENDING_PAYMENT";
  const isMock = data.paymentConfig?.mode === "mock";

  const toneClass = isPaid
    ? "border-accent/40 bg-accent/10 text-accent"
    : copy.tone === "failed"
      ? "border-danger/40 bg-danger/10 text-danger"
      : "border-warning/40 bg-warning/10 text-warning";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 md:px-8">
      <div className={`rounded-card border p-6 ${toneClass}`}>
        <div className="flex items-start gap-3">
          {isPaid ? (
            <CheckCircle2 size={28} aria-hidden="true" />
          ) : copy.tone === "failed" ? (
            <XCircle size={28} aria-hidden="true" />
          ) : (
            <Clock size={28} aria-hidden="true" />
          )}
          <div>
            <p className="label-caps">Status Pesanan</p>
            <h1 className="mt-1 font-heading text-2xl font-bold uppercase">
              {copy.title}
            </h1>
            <p className="mt-1 text-sm">{copy.description}</p>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-1 gap-2 border-t border-current/20 pt-4 text-xs sm:grid-cols-2">
          <div>
            <dt className="opacity-70">Nomor pesanan</dt>
            <dd className="font-semibold">{data.orderNumber}</dd>
          </div>
          <div>
            <dt className="opacity-70">Status pembayaran</dt>
            <dd className="font-semibold">{payment?.status || "-"}</dd>
          </div>
          <div>
            <dt className="opacity-70">Total</dt>
            <dd className="font-semibold">{formatRupiah(data.total)}</dd>
          </div>
          <div>
            <dt className="opacity-70">Status order</dt>
            <dd className="font-semibold">{data.status}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-5 rounded-card border border-border bg-surface p-5">
        <h2 className="font-heading text-base font-bold uppercase tracking-wide">
          Rincian Pesanan
        </h2>
        <ul className="mt-3 space-y-3">
          {data.items.map((item) => (
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
                <span className="block truncate font-semibold">{item.name}</span>
                <span className="mt-0.5 block text-muted">
                  {item.size} · {item.color} · {item.quantity}x
                </span>
              </span>
              <span className="font-semibold">{formatRupiah(item.lineTotal)}</span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-2 border-t border-border pt-3 text-xs">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd>{formatRupiah(data.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Diskon</dt>
            <dd>
              {data.discountTotal > 0
                ? `-${formatRupiah(data.discountTotal)}`
                : formatRupiah(0)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Ongkir</dt>
            <dd>{formatRupiah(data.shippingCost)}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-2 text-sm font-bold">
            <dt>Total</dt>
            <dd className="text-accent">{formatRupiah(data.total)}</dd>
          </div>
        </dl>

        <p className="mt-3 text-[11px] text-muted">
          Pengiriman: {data.shipping.provider} {data.shipping.service}
          {data.shipment?.estimatedArrival
            ? ` · estimasi ${new Date(data.shipment.estimatedArrival).toLocaleDateString("id-ID")}`
            : ""}
        </p>
        {data.shipment ? (
          <p className="mt-1 text-[11px] text-muted">
            Status pengiriman: {data.shipment.status}
            {data.shipment.trackingNumber
              ? ` · resi ${data.shipment.trackingNumber}`
              : ""}
          </p>
        ) : null}
      </div>

      {isMock ? (
        <p className="mt-4 rounded-control border border-warning/40 bg-warning/10 px-3 py-2 text-[11px] text-warning">
          Midtrans belum dikonfigurasi (key kosong). Pembayaran memakai mode mock
          development; status tetap ditentukan backend, bukan callback frontend.
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        {isPending ? (
          <button
            type="button"
            onClick={handlePayNow}
            disabled={actionLoading}
            className="rounded-control bg-accent px-5 py-2.5 text-sm font-bold text-black disabled:opacity-60"
          >
            {actionLoading ? "Memproses..." : "Lanjutkan Pembayaran"}
          </button>
        ) : null}

        {isPending && isMock ? (
          <button
            type="button"
            onClick={handleSimulate}
            disabled={actionLoading}
            className="rounded-control border border-accent px-5 py-2.5 text-sm font-semibold text-accent disabled:opacity-60"
          >
            Simulasikan Pembayaran (Mock)
          </button>
        ) : null}

        <button
          type="button"
          onClick={reload}
          disabled={actionLoading}
          className="inline-flex items-center gap-2 rounded-control border border-border px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
        >
          <RefreshCw size={14} aria-hidden="true" />
          Cek Status
        </button>

        <Link
          to="/akun"
          className="rounded-control border border-border px-4 py-2.5 text-sm font-semibold"
        >
          Ke Akun
        </Link>

        {!isPending ? (
          <button
            type="button"
            onClick={() => navigate("/belanja")}
            className="rounded-control bg-fg px-4 py-2.5 text-sm font-bold text-bg"
          >
            Lanjut Belanja
          </button>
        ) : null}
      </div>
    </div>
  );
}
