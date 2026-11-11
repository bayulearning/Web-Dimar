import { Link, NavLink } from "react-router-dom";
import { Search, Heart, ShoppingBag, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "../common/Logo.jsx";
import { Countdown } from "../common/Countdown.jsx";
import { cartCount, cartStore } from "../../store/cartStore.js";
import { wishlistStore } from "../../store/wishlistStore.js";
import { authStore } from "../../store/authStore.js";
import { useStore } from "../../store/useStore.js";

export const DROP_END = "2027-01-01T00:00:00+07:00";

const mainNav = [
  { label: "Beranda", to: "/" },
  { label: "Belanja", to: "/belanja" },
  { label: "Pria", to: "/kategori/running?gender=men" },
  { label: "Wanita", to: "/kategori/running?gender=women" },
  { label: "Sale", to: "/kategori/lifestyle?badge=DISKON" },
  { label: "News", to: "/news" },
  { label: "Bantuan", to: "/bantuan" },
];

const drawerLinks = [
  { label: "Belanja Semua", to: "/belanja" },
  { label: "Pria", to: "/kategori/running?gender=men" },
  { label: "Wanita", to: "/kategori/running?gender=women" },
  { label: "Anak", to: "/kategori/lifestyle?gender=kids" },
  { label: "Sale", to: "/kategori/lifestyle?badge=DISKON" },
  { label: "News", to: "/news" },
  { label: "Bantuan", to: "/bantuan" },
  { label: "Kontak", to: "/kontak" },
  { label: "Sitemap", to: "/sitemap" },
];

function IconLink({ to, label, count = 0, children }) {
  return (
    <Link
      to={to}
      aria-label={label}
      className="relative rounded-control p-2 text-fg transition-colors hover:bg-surface-2"
    >
      {children}
      {count > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-black">
          {count}
        </span>
      ) : null}
    </Link>
  );
}

export function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const cart = useStore(cartStore);
  const wishlist = useStore(wishlistStore);
  const auth = useStore(authStore);

  return (
    <>
      <Countdown target={DROP_END} label="Drop resmi Stride Velocity X" />

      <header className="sticky top-0 z-40 border-b border-border bg-bg/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="rounded-control p-2 hover:bg-surface-2 lg:hidden"
              aria-label="Buka menu navigasi"
              aria-expanded={drawerOpen}
              aria-controls="mobile-drawer"
            >
              <Menu size={20} />
            </button>
            <Logo />
          </div>

          <nav aria-label="Navigasi utama" className="hidden lg:block">
            <ul className="flex items-center gap-6">
              {mainNav.map((item) => (
                <li key={item.label}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `text-xs font-semibold uppercase tracking-widest transition-colors hover:text-accent ${
                        isActive ? "text-accent" : "text-muted"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1">
            <IconLink to="/cari" label="Cari produk">
              <Search size={18} />
            </IconLink>
            <IconLink
              to="/wishlist"
              label={`Wishlist (${wishlist.items.length} produk)`}
              count={wishlist.items.length}
            >
              <Heart size={18} />
            </IconLink>
            <IconLink
              to="/keranjang"
              label={`Keranjang belanja (${cartCount(cart)} item)`}
              count={cartCount(cart)}
            >
              <ShoppingBag size={18} />
            </IconLink>
            <IconLink
              to={auth.user ? "/akun" : "/login"}
              label={auth.user ? "Akun saya" : "Masuk"}
            >
              <User size={18} />
            </IconLink>
          </div>
        </div>
      </header>

      {drawerOpen ? (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi"
          id="mobile-drawer"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="Tutup menu"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-surface p-5">
            <div className="mb-6 flex items-center justify-between">
              <Logo />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-control p-2 hover:bg-surface-2"
                aria-label="Tutup menu"
              >
                <X size={20} />
              </button>
            </div>
            <nav aria-label="Navigasi mobile">
              <ul className="flex flex-col gap-1">
                {drawerLinks.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      onClick={() => setDrawerOpen(false)}
                      className="block rounded-control px-3 py-2.5 text-sm font-medium text-fg hover:bg-surface-2"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    to={auth.user ? "/akun" : "/login"}
                    onClick={() => setDrawerOpen(false)}
                    className="block rounded-control px-3 py-2.5 text-sm font-medium text-accent hover:bg-surface-2"
                  >
                    {auth.user ? `Akun ${auth.user.name.split(" ")[0]}` : "Masuk"}
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
