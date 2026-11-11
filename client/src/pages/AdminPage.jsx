import { useSearchParams } from "react-router-dom";
import {
  BookOpen,
  FolderTree,
  LayoutDashboard,
  Newspaper,
  Package,
  ShoppingBag,
  TicketPercent,
} from "lucide-react";
import { PageShell } from "../components/ui/PageShell.jsx";
import { AdminDashboard } from "../components/admin/AdminDashboard.jsx";
import { AdminProducts } from "../components/admin/AdminProducts.jsx";
import { AdminCategories } from "../components/admin/AdminCategories.jsx";
import { AdminOrders } from "../components/admin/AdminOrders.jsx";
import { AdminNews } from "../components/admin/AdminNews.jsx";
import { AdminHelp } from "../components/admin/AdminHelp.jsx";
import { AdminCoupons } from "../components/admin/AdminCoupons.jsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { authStore } from "../store/authStore.js";
import { useStore } from "../store/useStore.js";

const tabs = [
  { id: "dashboard", label: "Ringkasan", icon: LayoutDashboard },
  { id: "products", label: "Produk", icon: Package },
  { id: "categories", label: "Kategori", icon: FolderTree },
  { id: "orders", label: "Pesanan", icon: ShoppingBag },
  { id: "news", label: "News", icon: Newspaper },
  { id: "help", label: "Bantuan", icon: BookOpen },
  { id: "coupons", label: "Voucher", icon: TicketPercent },
];

const panels = {
  dashboard: AdminDashboard,
  products: AdminProducts,
  categories: AdminCategories,
  orders: AdminOrders,
  news: AdminNews,
  help: AdminHelp,
  coupons: AdminCoupons,
};

export default function AdminPage() {
  useDocumentTitle("Admin Dashboard", {
    description: "Panel operasional Stride Athletics.",
    noindex: true,
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const auth = useStore(authStore);
  const requested = searchParams.get("tab");
  const active = panels[requested] ? requested : "dashboard";
  const ActivePanel = panels[active];

  function navigate(tab) {
    if (tab === "dashboard") {
      setSearchParams({});
    } else {
      setSearchParams({ tab });
    }
  }

  return (
    <PageShell
      title="Admin Dashboard"
      description="Kelola katalog, pesanan, pengiriman, konten, dan voucher tanpa mengubah database secara manual."
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-surface px-4 py-3 text-xs">
        <p className="text-muted">
          Masuk sebagai{" "}
          <span className="font-semibold text-fg">{auth.user?.name}</span> ·{" "}
          <span className="text-accent">ADMIN</span>
        </p>
        <button
          type="button"
          onClick={() => navigate("orders")}
          className="rounded-control border border-border px-3 py-1.5 font-semibold hover:border-accent"
        >
          Pesanan menunggu tindakan
        </button>
      </div>

      <div className="mb-6 overflow-x-auto">
        <nav aria-label="Navigasi admin">
          <ul className="flex min-w-max gap-1 rounded-control border border-border bg-surface p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <li key={tab.id}>
                  <button
                    type="button"
                    onClick={() => navigate(tab.id)}
                    aria-current={active === tab.id ? "page" : undefined}
                    className={`inline-flex items-center gap-1.5 rounded-control px-3 py-2 text-xs font-semibold transition-colors ${
                      active === tab.id
                        ? "bg-accent text-black"
                        : "text-muted hover:bg-surface-2 hover:text-fg"
                    }`}
                  >
                    <Icon size={14} aria-hidden="true" />
                    {tab.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <ActivePanel onNavigate={navigate} />
    </PageShell>
  );
}
