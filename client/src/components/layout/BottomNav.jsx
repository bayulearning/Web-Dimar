import { NavLink } from "react-router-dom";
import { Home, LayoutGrid, Heart, Package, User } from "lucide-react";

const items = [
  { label: "Beranda", to: "/", icon: Home },
  { label: "Belanja", to: "/belanja", icon: LayoutGrid },
  { label: "Wishlist", to: "/wishlist", icon: Heart },
  { label: "Pesanan", to: "/pesanan", icon: Package },
  { label: "Akun", to: "/akun", icon: User },
];

export function BottomNav() {
  return (
    <nav
      aria-label="Navigasi bawah"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="flex items-stretch justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.label} className="flex-1">
              <NavLink
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                    isActive ? "text-accent" : "text-muted"
                  }`
                }
              >
                <Icon size={18} aria-hidden="true" />
                {item.label}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
