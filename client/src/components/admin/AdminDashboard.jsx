import {
  AlertTriangle,
  Boxes,
  CircleDollarSign,
  Package,
  ShoppingBag,
  Truck,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAsyncData } from "../../hooks/useAsyncData.js";
import { adminApi } from "../../services/admin.js";
import { formatDate, formatRupiah } from "../../utils/format.js";
import { statusClass, statusLabel } from "../../utils/orderStatus.js";
import { ErrorState } from "../ui/States.jsx";
import { Panel } from "./AdminUI.jsx";

function Stat({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
          {label}
        </p>
        <Icon size={18} className="text-accent" aria-hidden="true" />
      </div>
      <p className="mt-3 font-heading text-2xl font-bold">{value}</p>
      {hint ? <p className="mt-1 text-[11px] text-muted">{hint}</p> : null}
    </div>
  );
}

export function AdminDashboard({ onNavigate }) {
  const { data, loading, error, reload } = useAsyncData(() =>
    adminApi.dashboard().then((response) => response.data),
  );

  if (loading && !data) {
    return <div className="h-48 animate-pulse rounded-card bg-surface-2" />;
  }
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const { summary, lowStock, recentOrders } = data;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          icon={CircleDollarSign}
          label="Pendapatan"
          value={formatRupiah(summary.revenue)}
          hint="Pesanan dibayar, diproses, dikirim, diterima"
        />
        <Stat
          icon={ShoppingBag}
          label="Total Pesanan"
          value={summary.orderCount}
          hint={`${summary.pendingPayment} menunggu pembayaran`}
        />
        <Stat
          icon={Package}
          label="Produk Tayang"
          value={summary.productCount}
          hint={`${summary.draftCount} draft`}
        />
        <Stat
          icon={Users}
          label="Pengguna"
          value={summary.userCount}
          hint="Akun aktif terdaftar"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat icon={ShoppingBag} label="Dibayar" value={summary.paidCount} />
        <Stat icon={Boxes} label="Diproses" value={summary.processing} />
        <Stat icon={Truck} label="Dikirim" value={summary.shipped} />
        <Stat icon={Package} label="Diterima" value={summary.delivered} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
        <Panel
          title="Pesanan Terbaru"
          description="Enam pesanan terakhir yang masuk."
          actions={
            <button
              type="button"
              onClick={() => onNavigate("orders")}
              className="text-xs font-semibold text-accent hover:underline"
            >
              Lihat semua
            </button>
          }
        >
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted">Belum ada pesanan.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recentOrders.map((order) => (
                <li
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="text-xs font-bold">{order.orderNumber}</p>
                    <p className="mt-1 text-[11px] text-muted">
                      {order.recipient.name} · {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${statusClass(order.status)}`}
                    >
                      {statusLabel(order.status)}
                    </span>
                    <span className="text-xs font-semibold text-accent">
                      {formatRupiah(order.total)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Stok Menipis"
          description="Varian dengan stok di bawah ambang batas."
          actions={
            <button
              type="button"
              onClick={() => onNavigate("products")}
              className="text-xs font-semibold text-accent hover:underline"
            >
              Kelola
            </button>
          }
        >
          {lowStock.length === 0 ? (
            <p className="text-sm text-muted">Semua stok aman.</p>
          ) : (
            <ul className="space-y-2">
              {lowStock.map((entry) => (
                <li
                  key={entry.variantId}
                  className="flex items-start justify-between gap-3 rounded-control border border-warning/30 bg-warning/5 px-3 py-2"
                >
                  <div>
                    <p className="text-xs font-semibold">{entry.productName}</p>
                    <p className="mt-0.5 text-[11px] text-muted">
                      {entry.sku} · {entry.size} / {entry.color}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-warning">
                    <AlertTriangle size={12} aria-hidden="true" />
                    {entry.quantity}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link
            to="/belanja"
            className="mt-4 inline-block text-[11px] text-muted hover:text-accent"
          >
            Lihat katalog publik
          </Link>
        </Panel>
      </div>
    </div>
  );
}
