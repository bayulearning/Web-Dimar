// Self-test API Milestone 6: riwayat pesanan, tracking, notifikasi, konten.
// Jalankan server lebih dulu, lalu: node tests/api-m6.mjs

import { prisma } from "../server/src/lib/prisma.js";

const BASE = process.env.API_BASE_URL || "http://localhost:3000/api";
const results = [];
let createdContactId = null;
let notificationSnapshot = [];
let newsViewSnapshot = null;

function check(name, condition, detail = "") {
  results.push({ name, ok: Boolean(condition), detail });
  console.log(`${condition ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
}

async function request(path, { method = "GET", body, cookie } = {}) {
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => null);
  const setCookie = response.headers.getSetCookie?.() ?? [];
  const token = setCookie
    .map((entry) => entry.split(";")[0])
    .find((entry) => entry.startsWith("stride_token="));
  return { status: response.status, payload, token };
}

async function login(email, password) {
  const response = await request("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  return response.token;
}

function includesText(value, needle) {
  return String(value || "").toLowerCase().includes(String(needle).toLowerCase());
}

async function main() {
  const userCookie = await login("user@stride.local", "User#12345");
  const adminCookie = await login("admin@stride.local", "Admin#12345");
  check("Login user berhasil", Boolean(userCookie));
  check("Login admin berhasil", Boolean(adminCookie));

  const anonymousOrders = await request("/orders");
  check("GET /orders tanpa login → 401", anonymousOrders.status === 401);

  const orders = await request("/orders", { cookie: userCookie });
  check("GET /orders → 200", orders.status === 200);
  check("Daftar pesanan seed tersedia", orders.payload?.data?.length >= 2);
  check("Meta pagination pesanan tersedia", orders.payload?.meta?.total >= 2);

  const searchOrders = await request("/orders?q=STR-2026-0001", {
    cookie: userCookie,
  });
  check(
    "Pencarian nomor pesanan bekerja",
    searchOrders.status === 200 &&
      searchOrders.payload?.data?.length === 1 &&
      searchOrders.payload.data[0].orderNumber === "STR-2026-0001",
  );

  const deliveredOrders = await request("/orders?status=DELIVERED", {
    cookie: userCookie,
  });
  check(
    "Filter status pesanan bekerja",
    deliveredOrders.status === 200 &&
      deliveredOrders.payload?.data?.every((order) => order.status === "DELIVERED"),
  );

  const emptySearch = await request("/orders?q=STR-TIDAK-ADA", {
    cookie: userCookie,
  });
  check(
    "Pencarian tanpa hasil mengembalikan 0",
    emptySearch.status === 200 && emptySearch.payload?.data?.length === 0,
  );

  const foreignOrders = await request("/orders", { cookie: adminCookie });
  check(
    "Admin tidak melihat pesanan user lain",
    foreignOrders.status === 200 && foreignOrders.payload?.data?.length === 0,
  );

  const detail = await request("/orders/STR-2026-0001", { cookie: userCookie });
  const order = detail.payload?.data;
  check("Detail pesanan seed → 200", detail.status === 200);
  check("Timeline status pesanan tersedia", order?.statusHistory?.length >= 4);
  check("Nomor resi tersedia", order?.shipment?.trackingNumber === "JNE1234567890");
  check("Event pengiriman tersedia", order?.shipment?.events?.length >= 2);
  check(
    "Estimasi tiba tersedia",
    Boolean(order?.shipment?.estimatedArrival),
  );
  check(
    "Status pembayaran terpisah dari status pengiriman",
    order?.payment?.status === "SETTLEMENT" &&
      order?.shipment?.status === "DELIVERED",
  );

  notificationSnapshot = await prisma.notification.findMany({
    where: { user: { email: "user@stride.local" } },
    select: { id: true, isRead: true },
  });
  const unreadBefore = notificationSnapshot.filter((entry) => !entry.isRead).length;

  const notifications = await request("/notifications", { cookie: userCookie });
  check("GET /notifications → 200", notifications.status === 200);
  check("Notifikasi seed tersedia", notifications.payload?.data?.length >= 3);
  check(
    "Jumlah notifikasi belum dibaca benar",
    notifications.payload?.meta?.unreadCount === unreadBefore,
    `unread=${notifications.payload?.meta?.unreadCount}`,
  );

  const unreadOnly = await request("/notifications?unread=true", {
    cookie: userCookie,
  });
  check(
    "Filter notifikasi belum dibaca",
    unreadOnly.status === 200 &&
      unreadOnly.payload?.data?.every((entry) => entry.isRead === false),
  );

  const firstUnread = unreadOnly.payload?.data?.[0];
  const markRead = await request(`/notifications/${firstUnread?.id}/read`, {
    method: "PATCH",
    cookie: userCookie,
  });
  check(
    "Tandai satu notifikasi dibaca",
    markRead.status === 200 && markRead.payload?.data?.isRead === true,
  );

  const afterRead = await request("/notifications", { cookie: userCookie });
  check(
    "Unread count berkurang setelah dibaca",
    afterRead.payload?.meta?.unreadCount === Math.max(unreadBefore - 1, 0),
  );

  const foreignRead = await request(`/notifications/${firstUnread?.id}/read`, {
    method: "PATCH",
    cookie: adminCookie,
  });
  check("Notifikasi user lain → 404", foreignRead.status === 404);

  const markAll = await request("/notifications/read-all", {
    method: "PATCH",
    cookie: userCookie,
  });
  check("Tandai semua notifikasi dibaca", markAll.status === 200);

  const afterAll = await request("/notifications", { cookie: userCookie });
  check(
    "Semua notifikasi sudah dibaca",
    afterAll.payload?.meta?.unreadCount === 0,
  );

  const help = await request("/help");
  check("GET /help → 200", help.status === 200);
  check("Artikel bantuan seed tersedia", help.payload?.meta?.total >= 9);

  const helpSearch = await request("/help?q=ukuran");
  check(
    "Pencarian artikel bantuan bekerja",
    helpSearch.status === 200 && helpSearch.payload?.data?.length > 0,
  );

  const helpCategory = await request("/help?category=Pengiriman");
  check(
    "Filter kategori bantuan bekerja",
    helpCategory.status === 200 &&
      helpCategory.payload?.data?.every((entry) => entry.category === "Pengiriman"),
  );

  const helpCategories = await request("/help/categories");
  check(
    "Kategori bantuan tersedia",
    helpCategories.status === 200 && helpCategories.payload?.data?.length >= 4,
  );

  const helpDetail = await request("/help/melacak-pesanan");
  check(
    "Detail artikel bantuan → 200",
    helpDetail.status === 200 &&
      includesText(helpDetail.payload?.data?.content, "resi"),
  );
  check(
    "Artikel bantuan terkait tersedia",
    helpDetail.payload?.data?.related?.length >= 1,
  );

  const helpMissing = await request("/help/tidak-ada");
  check("Artikel bantuan tidak ada → 404", helpMissing.status === 404);

  const news = await request("/news");
  check("GET /news → 200", news.status === 200);
  check("Artikel news seed tersedia", news.payload?.meta?.total === 5);
  check(
    "News terbaru terurut menurun",
    new Date(news.payload.data[0].publishedAt) >=
      new Date(news.payload.data[1].publishedAt),
  );

  const popularNews = await request("/news?sort=popular");
  check(
    "Sorting news populer bekerja",
    popularNews.status === 200 &&
      popularNews.payload.data[0].viewCount >=
        popularNews.payload.data[1].viewCount,
  );

  const newsCategory = await request("/news?category=Teknologi");
  check(
    "Filter kategori news bekerja",
    newsCategory.status === 200 &&
      newsCategory.payload?.data?.every((entry) => entry.category === "Teknologi"),
  );

  const newsCategories = await request("/news/categories");
  check(
    "Kategori news tersedia",
    newsCategories.status === 200 && newsCategories.payload?.data?.length === 5,
  );

  newsViewSnapshot = await prisma.newsArticle.findUnique({
    where: { slug: "stride-velocity-x-rilis" },
    select: { id: true, viewCount: true },
  });

  const newsDetail = await request("/news/stride-velocity-x-rilis");
  check("Detail news → 200", newsDetail.status === 200);
  check(
    "Produk terkait pada news tersedia",
    newsDetail.payload?.data?.products?.length >= 1,
  );
  check(
    "Artikel news lainnya tersedia",
    newsDetail.payload?.data?.related?.length >= 1,
  );
  check(
    "View count bertambah",
    newsDetail.payload?.data?.viewCount === newsViewSnapshot.viewCount + 1,
  );

  const newsMissing = await request("/news/tidak-ada");
  check("Artikel news tidak ada → 404", newsMissing.status === 404);

  const contactPayload = {
    name: "Penguji Milestone 6",
    email: "penguji6@example.com",
    phone: "081200000006",
    subject: "Pertanyaan pengujian",
    message: "Pesan ini dibuat oleh self-test Milestone 6 untuk verifikasi.",
  };
  const contact = await request("/contact", {
    method: "POST",
    body: contactPayload,
  });
  check("POST /contact → 201", contact.status === 201);
  createdContactId = contact.payload?.data?.id;
  check("Pesan kontak tersimpan", Boolean(createdContactId));

  const storedContact = createdContactId
    ? await prisma.contactMessage.findUnique({ where: { id: createdContactId } })
    : null;
  check(
    "Pesan kontak ada di database",
    storedContact?.email === contactPayload.email,
  );

  const invalidContact = await request("/contact", {
    method: "POST",
    body: { name: "A", email: "bukan-email", subject: "x", message: "y" },
  });
  check("Kontak tidak valid → 422", invalidContact.status === 422);

  const sitemap = await request("/sitemap");
  check("GET /sitemap → 200", sitemap.status === 200);
  check(
    "Sitemap memuat 5 kategori",
    sitemap.payload?.data?.categories?.length === 5,
  );
  check(
    "Sitemap memuat grup gender",
    sitemap.payload?.data?.categories?.every(
      (category) => Array.isArray(category.groups) && category.groups.length > 0,
    ),
  );
  const totalSitemapProducts = sitemap.payload?.data?.categories?.reduce(
    (total, category) => total + category.products.length,
    0,
  );
  check("Sitemap memuat seluruh produk", totalSitemapProducts === 24);
}

try {
  await main();
} finally {
  if (createdContactId) {
    await prisma.contactMessage.deleteMany({ where: { id: createdContactId } });
  }
  if (notificationSnapshot.length) {
    for (const entry of notificationSnapshot) {
      await prisma.notification.update({
        where: { id: entry.id },
        data: { isRead: entry.isRead },
      });
    }
  }
  if (newsViewSnapshot) {
    await prisma.newsArticle.update({
      where: { id: newsViewSnapshot.id },
      data: { viewCount: newsViewSnapshot.viewCount },
    });
  }
  await prisma.$disconnect();
}

const failed = results.filter((entry) => !entry.ok);
console.log(`\n${results.length - failed.length}/${results.length} pengujian lulus`);
if (failed.length) {
  console.log("Gagal:", failed.map((entry) => entry.name).join(", "));
  process.exit(1);
}
