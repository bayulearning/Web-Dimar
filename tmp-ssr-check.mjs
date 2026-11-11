import { createServer } from "vite";
import React from "react";
import { renderToString } from "react-dom/server";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

const vite = await createServer({
  root: `${process.cwd()}/client`,
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
});

const { default: App } = await vite.ssrLoadModule("/src/App.jsx");

const paths = [
  "/",
  "/belanja",
  "/kategori/running",
  "/produk/stride-elite",
  "/cari?q=lari",
  "/keranjang",
  "/checkout",
  "/pesanan",
  "/pesanan/INV-1",
  "/pesanan/INV-1/sukses",
  "/pesanan/INV-1/pending",
  "/pesanan/INV-1/gagal",
  "/bantuan",
  "/bantuan/cara-pesan",
  "/kontak",
  "/news",
  "/news/rilis",
  "/sitemap",
  "/wishlist",
  "/akun",
  "/login",
  "/daftar",
  "/notifikasi",
  "/admin",
  "/delivery",
  "/payment-options",
  "/privacy",
  "/terms",
  "/sales-terms",
  "/tidak-ada",
];

let failed = 0;
for (const path of paths) {
  const router = createMemoryRouter(
    [{ path: "*", element: React.createElement(App) }],
    { initialEntries: [path] },
  );
  try {
    const html = renderToString(React.createElement(RouterProvider, { router }));
    if (!html || html.length < 20) {
      throw new Error(`output terlalu pendek: ${html?.length ?? 0}`);
    }
    console.log(`OK   ${path} (${html.length} chars)`);
  } catch (error) {
    failed += 1;
    console.log(`FAIL ${path}: ${error.message}`);
  }
}

await vite.close();
process.exit(failed > 0 ? 1 : 0);
