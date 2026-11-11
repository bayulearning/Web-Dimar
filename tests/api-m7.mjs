// Self-test API Milestone 7: admin dashboard, katalog, pesanan, konten, voucher.
// Jalankan server lebih dulu, lalu: node tests/api-m7.mjs

import { prisma } from "../server/src/lib/prisma.js";

const BASE = process.env.API_BASE_URL || "http://localhost:3000/api";
const results = [];
const stamp = Date.now();
let adminCookie = null;
let userCookie = null;
let productId = null;
let categoryId = null;
let newsId = null;
let helpId = null;
let couponId = null;
let createdOrderNumber = null;

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

function admin(path, options = {}) {
  return request(`/admin${path}`, { ...options, cookie: adminCookie });
}

async function main() {
  adminCookie = await login("admin@stride.local", "Admin#12345");
  userCookie = await login("user@stride.local", "User#12345");
  check("Login admin berhasil", Boolean(adminCookie));
  check("Login user berhasil", Boolean(userCookie));

  /* Authorization */
  const anonymous = await request("/admin/dashboard");
  check("GET /admin/dashboard tanpa login → 401", anonymous.status === 401);

  const forbidden = await request("/admin/dashboard", { cookie: userCookie });
  check("GET /admin/dashboard sebagai user → 403", forbidden.status === 403);

  const forbiddenCreate = await request("/admin/products", {
    method: "POST",
    cookie: userCookie,
    body: { name: "Tidak boleh" },
  });
  check("POST /admin/products sebagai user → 403", forbiddenCreate.status === 403);

  /* Dashboard */
  const dashboard = await admin("/dashboard");
  const summary = dashboard.payload?.data?.summary;
  check("GET /admin/dashboard → 200", dashboard.status === 200);
  check(
    "Ringkasan dashboard lengkap",
    summary &&
      typeof summary.revenue === "number" &&
      summary.orderCount >= 2 &&
      summary.productCount >= 1 &&
      summary.userCount >= 2,
  );
  check(
    "Ringkasan memuat pesanan terbaru",
    Array.isArray(dashboard.payload?.data?.recentOrders) &&
      dashboard.payload.data.recentOrders.length >= 2,
  );
  check(
    "Ringkasan memuat daftar stok menipis",
    Array.isArray(dashboard.payload?.data?.lowStock),
  );

  /* Products */
  const products = await admin("/products?limit=5");
  check("GET /admin/products → 200", products.status === 200);
  check(
    "Daftar produk admin berpaginasi",
    products.payload?.data?.length > 0 && products.payload?.meta?.total >= 24,
  );

  const searched = await admin("/products?q=STR-RUN-001&status=published");
  check(
    "Pencarian & filter produk admin bekerja",
    searched.status === 200 &&
      searched.payload?.data?.some((product) => product.sku === "STR-RUN-001"),
  );

  const productDetail = await admin("/products/1");
  check("GET /admin/products/:id → 200", productDetail.status === 200);
  check(
    "Detail produk memuat gambar dan varian",
    Array.isArray(productDetail.payload?.data?.images) &&
      Array.isArray(productDetail.payload?.data?.variants) &&
      productDetail.payload.data.variants.length > 0,
  );

  const productSku = `M7-${stamp}`;
  const createdProduct = await admin("/products", {
    method: "POST",
    body: {
      sku: productSku,
      name: `Produk M7 ${stamp}`,
      description: "Produk uji otomatis Milestone 7 dengan deskripsi lengkap.",
      categoryId: 1,
      gender: "unisex",
      basePrice: 500000,
      salePrice: 450000,
      badge: "BARU",
      isPublished: true,
    },
  });
  productId = createdProduct.payload?.data?.id;
  check("POST /admin/products → 201", createdProduct.status === 201);
  check(
    "Produk baru memiliki slug otomatis & effectivePrice",
    createdProduct.payload?.data?.slug &&
      createdProduct.payload.data.effectivePrice === 450000,
  );

  const duplicate = await admin("/products", {
    method: "POST",
    body: {
      sku: productSku,
      name: "Duplikat SKU",
      description: "Produk duplikat untuk menguji konflik SKU di server.",
      categoryId: 1,
      basePrice: 100000,
    },
  });
  check("SKU duplikat → 409", duplicate.status === 409);

  const invalidProduct = await admin("/products", {
    method: "POST",
    body: { name: "Tidak lengkap" },
  });
  check("Validasi produk tidak lengkap → 422", invalidProduct.status === 422);

  const updatedProduct = await admin(`/products/${productId}`, {
    method: "PATCH",
    body: { name: `Produk M7 Update ${stamp}`, salePrice: 400000 },
  });
  check(
    "PATCH produk memperbarui harga efektif",
    updatedProduct.status === 200 &&
      updatedProduct.payload?.data?.name.includes("Update") &&
      updatedProduct.payload.data.effectivePrice === 400000,
  );

  const invalidPrice = await admin(`/products/${productId}`, {
    method: "PATCH",
    body: { salePrice: 900000 },
  });
  check("Harga diskon melebihi harga dasar → 422", invalidPrice.status === 422);

  /* Images */
  const image1 = await admin(`/products/${productId}/images`, {
    method: "POST",
    body: { url: "/images/products/m7-a.svg", alt: "Gambar A" },
  });
  const image2 = await admin(`/products/${productId}/images`, {
    method: "POST",
    body: {
      url: "/images/products/m7-b.svg",
      alt: "Gambar B",
      sortOrder: 1,
    },
  });
  check(
    "Tambah gambar pertama otomatis utama",
    image1.status === 201 && image1.payload?.data?.isPrimary === true,
  );
  check(
    "Tambah gambar kedua bukan utama",
    image2.status === 201 && image2.payload?.data?.isPrimary === false,
  );

  const primary = await admin(
    `/products/${productId}/images/${image2.payload?.data?.id}`,
    { method: "PATCH", body: { isPrimary: true } },
  );
  check("Ubah gambar utama → 200", primary.status === 200);

  const removedImage = await admin(
    `/products/${productId}/images/${image2.payload?.data?.id}`,
    { method: "DELETE" },
  );
  const productAfterImage = await admin(`/products/${productId}`);
  check(
    "Hapus gambar & promosi gambar utama",
    removedImage.status === 200 &&
      productAfterImage.payload?.data?.images?.length === 1 &&
      productAfterImage.payload.data.images[0].isPrimary === true,
  );

  /* Variants & stock */
  const variant = await admin(`/products/${productId}/variants`, {
    method: "POST",
    body: {
      size: "EU 44",
      color: "Uji",
      colorHex: "#123456",
      quantity: 7,
      lowStockThreshold: 2,
    },
  });
  const variantId = variant.payload?.data?.id;
  check(
    "Tambah varian dengan stok awal",
    variant.status === 201 &&
      variant.payload?.data?.quantity === 7 &&
      Boolean(variant.payload.data.sku),
  );

  const stock = await admin(
    `/products/${productId}/variants/${variantId}/stock`,
    { method: "PATCH", body: { quantity: 12, lowStockThreshold: 3 } },
  );
  check(
    "Update stok varian",
    stock.status === 200 && stock.payload?.data?.quantity === 12,
  );

  const variantUpdate = await admin(
    `/products/${productId}/variants/${variantId}`,
    { method: "PATCH", body: { priceOverride: 475000, isActive: false } },
  );
  check(
    "Update varian & status aktif",
    variantUpdate.status === 200 &&
      variantUpdate.payload?.data?.priceOverride === 475000 &&
      variantUpdate.payload.data.isActive === false,
  );

  /* Categories */
  const categories = await admin("/categories");
  check(
    "GET /admin/categories → 200",
    categories.status === 200 && categories.payload?.data?.length >= 5,
  );

  const createdCategory = await admin("/categories", {
    method: "POST",
    body: {
      name: `Kategori M7 ${stamp}`,
      description: "Kategori uji otomatis.",
      sortOrder: 99,
    },
  });
  categoryId = createdCategory.payload?.data?.id;
  check(
    "POST /admin/categories → 201 & slug otomatis",
    createdCategory.status === 201 && Boolean(createdCategory.payload?.data?.slug),
  );

  const updatedCategory = await admin(`/categories/${categoryId}`, {
    method: "PATCH",
    body: { name: `Kategori M7 Edit ${stamp}`, sortOrder: 98 },
  });
  check(
    "PATCH /admin/categories → 200",
    updatedCategory.status === 200 &&
      updatedCategory.payload?.data?.sortOrder === 98,
  );

  const blockedCategory = await admin("/categories/1", { method: "DELETE" });
  check("Kategori dengan produk aktif tidak dapat dinonaktifkan → 409", blockedCategory.status === 409);

  const removedCategory = await admin(`/categories/${categoryId}`, {
    method: "DELETE",
  });
  check(
    "DELETE /admin/categories → 200",
    removedCategory.status === 200,
  );

  /* Orders */
  const orders = await admin("/orders?limit=10");
  check(
    "GET /admin/orders → 200",
    orders.status === 200 && orders.payload?.meta?.total >= 2,
  );
  check(
    "Daftar pesanan admin memuat data pelanggan",
    orders.payload?.data?.every((order) => order.user?.email),
  );

  const filteredOrders = await admin("/orders?status=DELIVERED");
  check(
    "Filter status pesanan admin",
    filteredOrders.status === 200 &&
      filteredOrders.payload?.data?.every((order) => order.status === "DELIVERED"),
  );

  const orderDetail = await admin("/orders/STR-2026-0001");
  check(
    "GET /admin/orders/:orderNumber → 200",
    orderDetail.status === 200 &&
      orderDetail.payload?.data?.items?.length > 0,
  );

  const invalidTransition = await admin("/orders/STR-2026-0001/status", {
    method: "PATCH",
    body: { status: "CANCELLED" },
  });
  check("Transisi status tidak valid → 409", invalidTransition.status === 409);

  const shipment = await admin("/orders/STR-2026-0001/shipment", {
    method: "PATCH",
    body: {
      status: "DELIVERED",
      trackingNumber: "JNE-M7-999",
      description: "Konfirmasi penerimaan oleh admin",
    },
  });
  check(
    "Update resi & status pengiriman → 200",
    shipment.status === 200 &&
      shipment.payload?.data?.shipment?.trackingNumber === "JNE-M7-999",
  );

  const orderAfterShipment = await admin("/orders/STR-2026-0001");
  check(
    "Event pengiriman admin tercatat",
    orderAfterShipment.payload?.data?.shipment?.events?.some(
      (event) => event.description === "Konfirmasi penerimaan oleh admin",
    ),
  );

  /* Pending order cancel releases reservation */
  const pendingOrder = await prisma.order.findUnique({
    where: { orderNumber: "STR-2026-0002" },
    include: { items: true },
  });
  const pendingVariantId = pendingOrder.items.find((item) => item.variantId)?.variantId;
  const reservedBefore = pendingVariantId
    ? (await prisma.inventory.findUnique({ where: { variantId: pendingVariantId } }))
        ?.reserved
    : 0;

  const cancelPending = await admin("/orders/STR-2026-0002/status", {
    method: "PATCH",
    body: { status: "CANCELLED", note: "Dibatalkan oleh admin untuk pengujian" },
  });
  const reservedAfter = pendingVariantId
    ? (await prisma.inventory.findUnique({ where: { variantId: pendingVariantId } }))
        ?.reserved
    : 0;
  check(
    "Batalkan pesanan pending → 200",
    cancelPending.status === 200 &&
      cancelPending.payload?.data?.status === "CANCELLED",
  );
  check(
    "Reservasi stok pesanan pending tidak negatif",
    reservedAfter >= 0 && reservedAfter <= reservedBefore,
    `${reservedBefore} → ${reservedAfter}`,
  );

  /* Create real order and drive full admin lifecycle */
  const catalog = await request("/products?limit=12");
  let availableVariant = null;
  for (const entry of catalog.payload?.data ?? []) {
    const detail = await request(`/products/${entry.slug}`);
    const candidate = detail.payload?.data?.variants?.find(
      (variantEntry) => variantEntry.stock > 1,
    );
    if (candidate) {
      availableVariant = candidate;
      break;
    }
  }
  check("Varian katalog dengan stok tersedia", Boolean(availableVariant));

  await request("/cart/items", {
    method: "POST",
    cookie: userCookie,
    body: { variantId: availableVariant.id, quantity: 1 },
  });
  const addresses = await request("/addresses", { cookie: userCookie });
  const addressId = addresses.payload?.data?.[0]?.id;
  check("Alamat user tersedia untuk checkout", Boolean(addressId));

  const newOrder = await request("/orders", {
    method: "POST",
    cookie: userCookie,
    body: {
      addressId,
      shippingProvider: "JNE",
      shippingService: "REG",
      notes: "Pesanan uji Milestone 7",
    },
  });
  createdOrderNumber = newOrder.payload?.data?.orderNumber;
  check("User membuat pesanan baru", newOrder.status === 201 && Boolean(createdOrderNumber));

  const quantityBeforePaid = (
    await prisma.inventory.findUnique({ where: { variantId: availableVariant.id } })
  ).quantity;

  const markPaid = await admin(`/orders/${createdOrderNumber}/status`, {
    method: "PATCH",
    body: { status: "PAID", note: "Pembayaran manual diverifikasi" },
  });
  const quantityAfterPaid = (
    await prisma.inventory.findUnique({ where: { variantId: availableVariant.id } })
  ).quantity;
  check(
    "Admin menandai pesanan PAID → 200",
    markPaid.status === 200 && markPaid.payload?.data?.status === "PAID",
  );
  check(
    "PAID mengurangi stok fisik & membuat shipment",
    quantityAfterPaid === quantityBeforePaid - 1 &&
      Boolean(markPaid.payload?.data?.shipment),
    `${quantityBeforePaid} → ${quantityAfterPaid}`,
  );

  const repeatPaid = await admin(`/orders/${createdOrderNumber}/status`, {
    method: "PATCH",
    body: { status: "PAID" },
  });
  check("Ulangi status yang sama → 409", repeatPaid.status === 409);

  const processing = await admin(`/orders/${createdOrderNumber}/status`, {
    method: "PATCH",
    body: { status: "PROCESSING" },
  });
  check("Pesanan PAID → PROCESSING", processing.status === 200);

  const inTransit = await admin(`/orders/${createdOrderNumber}/shipment`, {
    method: "PATCH",
    body: {
      status: "IN_TRANSIT",
      trackingNumber: `M7-RESI-${stamp}`,
      description: "Paket dalam perjalanan",
    },
  });
  const afterTransit = await admin(`/orders/${createdOrderNumber}`);
  check(
    "Shipment IN_TRANSIT memajukan order ke SHIPPED",
    inTransit.status === 200 &&
      afterTransit.payload?.data?.status === "SHIPPED" &&
      afterTransit.payload?.data?.shipment?.trackingNumber === `M7-RESI-${stamp}`,
  );

  const delivered = await admin(`/orders/${createdOrderNumber}/status`, {
    method: "PATCH",
    body: { status: "DELIVERED", note: "Paket diterima" },
  });
  check(
    "Pesanan SHIPPED → DELIVERED",
    delivered.status === 200 &&
      delivered.payload?.data?.shipment?.deliveredAt,
  );

  const refunded = await admin(`/orders/${createdOrderNumber}/status`, {
    method: "PATCH",
    body: { status: "REFUNDED", note: "Refund uji" },
  });
  check(
    "Pesanan DELIVERED → REFUNDED",
    refunded.status === 200 && refunded.payload?.data?.status === "REFUNDED",
  );

  const userNotification = await prisma.notification.findFirst({
    where: { userId: pendingOrder.userId, type: "ORDER" },
    orderBy: { createdAt: "desc" },
  });
  check("Notifikasi perubahan status dibuat", Boolean(userNotification));

  /* News */
  const news = await admin("/news?limit=5");
  check(
    "GET /admin/news → 200",
    news.status === 200 && news.payload?.meta?.total >= 5,
  );

  const createdNews = await admin("/news", {
    method: "POST",
    body: {
      title: `Artikel M7 ${stamp}`,
      category: "Uji",
      excerpt: "Ringkasan artikel uji.",
      content: "Konten artikel uji Milestone 7 yang panjang dan valid.",
      isPublished: true,
      productIds: [1],
    },
  });
  newsId = createdNews.payload?.data?.id;
  check(
    "POST /admin/news → 201 & produk terkait",
    createdNews.status === 201 && createdNews.payload?.data?.products?.length === 1,
  );

  const updatedNews = await admin(`/news/${newsId}`, {
    method: "PATCH",
    body: { title: `Artikel M7 Edit ${stamp}`, isPublished: false },
  });
  check(
    "PATCH /admin/news → 200",
    updatedNews.status === 200 &&
      updatedNews.payload?.data?.isPublished === false,
  );

  const removedNews = await admin(`/news/${newsId}`, { method: "DELETE" });
  const newsAfterDelete = await admin(`/news/${newsId}`);
  check(
    "DELETE /admin/news → 200 & detail 404",
    removedNews.status === 200 && newsAfterDelete.status === 404,
  );

  /* Help */
  const help = await admin("/help?limit=5");
  check(
    "GET /admin/help → 200",
    help.status === 200 && help.payload?.meta?.total >= 9,
  );

  const createdHelp = await admin("/help", {
    method: "POST",
    body: {
      title: `Bantuan M7 ${stamp}`,
      category: "Uji",
      excerpt: "Ringkasan bantuan uji.",
      content: "Konten bantuan uji Milestone 7 yang panjang dan valid.",
      isPublished: true,
      sortOrder: 50,
    },
  });
  helpId = createdHelp.payload?.data?.id;
  check("POST /admin/help → 201", createdHelp.status === 201);

  const updatedHelp = await admin(`/help/${helpId}`, {
    method: "PATCH",
    body: { title: `Bantuan M7 Edit ${stamp}`, sortOrder: 49 },
  });
  check(
    "PATCH /admin/help → 200",
    updatedHelp.status === 200 &&
      updatedHelp.payload?.data?.sortOrder === 49,
  );

  const removedHelp = await admin(`/help/${helpId}`, { method: "DELETE" });
  check("DELETE /admin/help → 200", removedHelp.status === 200);

  /* Coupons */
  const coupons = await admin("/coupons");
  check(
    "GET /admin/coupons → 200",
    coupons.status === 200 && coupons.payload?.meta?.total >= 3,
  );

  const code = `M7${stamp}`;
  const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const createdCoupon = await admin("/coupons", {
    method: "POST",
    body: {
      code,
      description: "Voucher uji Milestone 7",
      type: "PERCENT",
      value: 15,
      minSpend: 100000,
      maxDiscount: 50000,
      usageLimit: 10,
      perUserLimit: 1,
      expiresAt: future,
      isActive: true,
    },
  });
  couponId = createdCoupon.payload?.data?.id;
  check(
    "POST /admin/coupons → 201",
    createdCoupon.status === 201 && createdCoupon.payload?.data?.code === code,
  );

  const duplicateCoupon = await admin("/coupons", {
    method: "POST",
    body: {
      code,
      type: "FIXED",
      value: 10000,
      expiresAt: future,
    },
  });
  check("Kode voucher duplikat → 409", duplicateCoupon.status === 409);

  const invalidCoupon = await admin("/coupons", {
    method: "POST",
    body: {
      code: `M7X${stamp}`,
      type: "PERCENT",
      value: 150,
      expiresAt: future,
    },
  });
  check("Voucher persen > 100 → 422", invalidCoupon.status === 422);

  const updatedCoupon = await admin(`/coupons/${couponId}`, {
    method: "PATCH",
    body: { value: 20, isActive: false },
  });
  check(
    "PATCH /admin/coupons → 200",
    updatedCoupon.status === 200 &&
      updatedCoupon.payload?.data?.value === 20 &&
      updatedCoupon.payload.data.isActive === false,
  );

  const removedCoupon = await admin(`/coupons/${couponId}`, { method: "DELETE" });
  const couponAfterDelete = await prisma.coupon.findUnique({ where: { id: couponId } });
  check(
    "DELETE /admin/coupons menonaktifkan voucher",
    removedCoupon.status === 200 && couponAfterDelete.isActive === false,
  );

  /* Product soft delete */
  const removedProduct = await admin(`/products/${productId}`, { method: "DELETE" });
  const deletedList = await admin("/products?status=deleted&limit=50");
  check(
    "DELETE /admin/products bersifat soft delete",
    removedProduct.status === 200 &&
      deletedList.payload?.data?.some((product) => product.id === productId),
  );

  const total = results.length;
  const passed = results.filter((entry) => entry.ok).length;
  console.log(`\n${passed}/${total} pengujian lulus`);
  if (passed !== total) process.exitCode = 1;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
