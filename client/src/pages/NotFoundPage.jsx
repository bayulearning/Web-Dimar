import { Link } from "react-router-dom";
import { PageShell } from "../components/ui/PageShell.jsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";

export default function NotFoundPage() {
  useDocumentTitle("Halaman Tidak Ditemukan", {
    description: "Halaman yang Anda cari tidak tersedia.",
    noindex: true,
  });

  return (
    <PageShell
      title="Halaman Tidak Ditemukan"
      description="Alamat yang Anda tuju tidak tersedia atau sudah dipindahkan."
    >
      <Link
        to="/"
        className="inline-block rounded-control bg-fg px-5 py-2.5 text-sm font-bold text-bg"
      >
        Kembali ke Beranda
      </Link>
    </PageShell>
  );
}
