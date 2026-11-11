import { Link } from "react-router-dom";
import { ShieldCheck, RotateCcw } from "lucide-react";
import { Logo } from "../common/Logo.jsx";

const columns = [
  {
    title: "Belanja",
    links: [
      { label: "Semua Produk", to: "/belanja" },
      { label: "Running", to: "/kategori/running" },
      { label: "Football", to: "/kategori/football" },
      { label: "Badminton", to: "/kategori/badminton" },
      { label: "Training", to: "/kategori/training" },
      { label: "Lifestyle", to: "/kategori/lifestyle" },
    ],
  },
  {
    title: "Bantuan",
    links: [
      { label: "Pusat Bantuan", to: "/bantuan" },
      { label: "Lacak Pesanan", to: "/pesanan" },
      { label: "Pengiriman", to: "/delivery" },
      { label: "Metode Pembayaran", to: "/payment-options" },
      { label: "Hubungi Kami", to: "/kontak" },
    ],
  },
  {
    title: "Perusahaan",
    links: [
      { label: "Tentang Kami", to: "/news" },
      { label: "News", to: "/news" },
      { label: "Sitemap", to: "/sitemap" },
      { label: "Kebijakan Privasi", to: "/privacy" },
      { label: "Syarat & Ketentuan", to: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 md:px-8">
        <div className="grid gap-8 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted">
              Sepatu dan perlengkapan olahraga untuk atlet yang menuntut
              performa tanpa kompromi.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
                <ShieldCheck size={14} className="text-accent" /> 100% Produk Asli
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
                <RotateCcw size={14} className="text-accent" /> Retur 30 Hari
              </span>
            </div>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="label-caps text-fg">{column.title}</h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted transition-colors hover:text-fg"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col justify-between gap-3 border-t border-border pt-6 text-xs text-muted md:flex-row">
          <p>&copy; {new Date().getFullYear()} Stride Athletics. Semua hak dilindungi.</p>
          <p className="flex gap-4">
            <Link to="/privacy" className="hover:text-fg">
              Privasi
            </Link>
            <Link to="/terms" className="hover:text-fg">
              Ketentuan
            </Link>
            <Link to="/sales-terms" className="hover:text-fg">
              Ketentuan Penjualan
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
