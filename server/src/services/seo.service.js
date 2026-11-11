import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";

const STATIC_PATHS = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/belanja", priority: "0.9", changefreq: "daily" },
  { path: "/news", priority: "0.7", changefreq: "weekly" },
  { path: "/bantuan", priority: "0.6", changefreq: "monthly" },
  { path: "/kontak", priority: "0.5", changefreq: "yearly" },
  { path: "/sitemap", priority: "0.3", changefreq: "monthly" },
  { path: "/delivery", priority: "0.3", changefreq: "yearly" },
  { path: "/payment-options", priority: "0.3", changefreq: "yearly" },
  { path: "/privacy", priority: "0.3", changefreq: "yearly" },
  { path: "/terms", priority: "0.3", changefreq: "yearly" },
  { path: "/sales-terms", priority: "0.3", changefreq: "yearly" },
];

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlEntry({ path, lastmod, changefreq, priority }) {
  return [
    "  <url>",
    `    <loc>${escapeXml(`${env.siteUrl}${path}`)}</loc>`,
    lastmod ? `    <lastmod>${lastmod.toISOString()}</lastmod>` : null,
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
    priority ? `    <priority>${priority}</priority>` : null,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function buildSitemapXml() {
  const [categories, products, news, help] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.product.findMany({
      where: { deletedAt: null, isPublished: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.newsArticle.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: "desc" },
    }),
    prisma.helpArticle.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const entries = [
    ...STATIC_PATHS.map((entry) => urlEntry(entry)),
    ...categories.map((entry) =>
      urlEntry({
        path: `/kategori/${entry.slug}`,
        lastmod: entry.updatedAt,
        changefreq: "weekly",
        priority: "0.8",
      }),
    ),
    ...products.map((entry) =>
      urlEntry({
        path: `/produk/${entry.slug}`,
        lastmod: entry.updatedAt,
        changefreq: "weekly",
        priority: "0.7",
      }),
    ),
    ...news.map((entry) =>
      urlEntry({
        path: `/news/${entry.slug}`,
        lastmod: entry.updatedAt,
        changefreq: "monthly",
        priority: "0.6",
      }),
    ),
    ...help.map((entry) =>
      urlEntry({
        path: `/bantuan/${entry.slug}`,
        lastmod: entry.updatedAt,
        changefreq: "monthly",
        priority: "0.5",
      }),
    ),
  ];

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    "</urlset>",
  ].join("\n");
}

export function buildRobotsTxt() {
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /akun",
    "Disallow: /keranjang",
    "Disallow: /checkout",
    "Disallow: /pesanan",
    "Disallow: /notifikasi",
    "Disallow: /wishlist",
    "Disallow: /login",
    "Disallow: /daftar",
    "Disallow: /cari",
    "",
    `Sitemap: ${env.siteUrl}/sitemap.xml`,
    "",
  ].join("\n");
}
