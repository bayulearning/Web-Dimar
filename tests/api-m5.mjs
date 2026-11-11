// Self-test API Milestone 5: checkout, voucher, shipping, order, payment mock.
// Jalankan server lebih dulu, lalu: node tests/api-m5.mjs

import { prisma } from "../server/src/lib/prisma.js";
import { mockPaymentProvider } from "../server/src/lib/payment/mock.provider.js";

const BASE = process.env.API_BASE_URL || "http://localhost:3000/api";
const results = [];
const createdOrderIds = [];

function check(name, condition, detail = "") {
  results.push({ name, ok: Boolean(condition), detail });
  console.log(`${condition ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
}

async function request(path, { method = "GET", body, cookie, headers = {} } = {}) {
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
      ...headers,
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
  return { ...response, cookie: response.token };
}

function notificationFor(order, transactionStatus, overrides = {}) {
  const payload = {
    order_id: order.orderNumber,
    status_code: "200",
    gross_amount: String(order.total),
    transaction_status: transactionStatus,
    fraud_status: "accept",
    transaction_id: `test-${order.orderNumber}-${transactionStatus}`,
    payment_type: "bank_transfer",
    ...overrides,
  };
  payload.signature_key = mockPaymentProvider.signNotification({
    orderId: payload.order_id,
    statusCode: payload.status_code,
    grossAmount: payload.gross_amount,
  });
  return payload;
}

async function main() {
  const userLogin = await login("user@stride.local", "User#12345");
  const userCookie = userLogin.cookie;
  check("Login user berhasil", userLogin.status === 200);

  const anonymousOrder = await request("/orders", {
    method: "POST",
    body: { addressId: 1, shippingProvider: "JNE", shippingService: "REG" },
  });
  check("POST /orders tanpa login → 401", anonymousOrder.status === 401);

  const shipping = await request("/shipping/services");
  check("GET /shipping/services → 200", shipping.status === 200);
  check("Shipping ditandai mock", shipping.payload?.meta?.isMock === true);
  check(
    "Layanan JNE/J&T/SiCepat tersedia",
    ["JNE", "J&T", "SiCepat"].every((provider) =>
      shipping.payload?.data?.some((entry) => entry.provider === provider),
    ),
  );

  const addresses = await request("/addresses", { cookie: userCookie });
  const addressId = addresses.payload?.data?.[0]?.id;
  check("Alamat user tersedia", Boolean(addressId));

  await request("/cart", { method: "DELETE", cookie: userCookie });

  const variant = await prisma.productVariant.findFirst({
    where: { isActive: true, inventory: { quantity: { gt: 6 } } },
    orderBy: { id: "asc" },
    include: { inventory: true, product: true },
  });

  const addCart = await request("/cart/items", {
    method: "POST",
    cookie: userCookie,
    body: { variantId: variant.id, quantity: 2 },
  });
  check("Tambah item cart untuk checkout", addCart.status === 201);

  const emptyPreview = await request("/orders/preview", {
    method: "POST",
    cookie: userCookie,
    body: { shippingProvider: "JNE", shippingService: "REG" },
  });
  check("Preview checkout → 200", emptyPreview.status === 200);

  const invalidCoupon = await request("/orders/preview", {
    method: "POST",
    cookie: userCookie,
    body: {
      shippingProvider: "JNE",
      shippingService: "REG",
      couponCode: "BUKANVOUCHER",
    },
  });
  check("Preview voucher tidak valid → 422", invalidCoupon.status === 422);

  const preview = await request("/orders/preview", {
    method: "POST",
    cookie: userCookie,
    body: {
      shippingProvider: "JNE",
      shippingService: "REG",
      couponCode: "STRIDE10",
    },
  });

  const subtotal = preview.payload?.data?.subtotal;
  const discount = preview.payload?.data?.discountTotal;
  const shippingCost = preview.payload?.data?.shippingCost;
  check("Preview menghitung diskon voucher", preview.status === 200 && discount > 0);
  check(
    "Diskon maksimal Rp 300.000",
    discount <= 300000,
    `discount=${discount}`,
  );
  check("Ongkir mock Rp 18.000 untuk JNE REG", shippingCost === 18000);
  check(
    "Total = subtotal - diskon + ongkir",
    preview.payload?.data?.total === subtotal - discount + shippingCost,
  );

  const invalidShipping = await request("/orders/preview", {
    method: "POST",
    cookie: userCookie,
    body: { shippingProvider: "KURIR-X", shippingService: "REG" },
  });
  check("Layanan pengiriman invalid → 422", invalidShipping.status === 422);

  const stockBefore = variant.inventory.quantity;
  const reservedBefore = variant.inventory.reserved;
  const couponBefore = await prisma.coupon.findUnique({
    where: { code: "STRIDE10" },
  });

  const created = await request("/orders", {
    method: "POST",
    cookie: userCookie,
    body: {
      addressId,
      shippingProvider: "JNE",
      shippingService: "REG",
      couponCode: "STRIDE10",
      notes: "Test checkout M5",
    },
  });

  const order = created.payload?.data;
  if (order?.id) createdOrderIds.push(order.id);
  check("POST /orders → 201", created.status === 201);
  check("Order memiliki nomor unik", Boolean(order?.orderNumber?.startsWith("STR-")));
  check("Order berstatus PENDING_PAYMENT", order?.status === "PENDING_PAYMENT");
  check("Order menyimpan snapshot item", order?.items?.length >= 1);
  check("Order menyimpan ongkir", order?.shippingCost === 18000);
  check("Order memakai voucher", order?.couponCode === "STRIDE10");
  check("Payment awal PENDING", order?.payment?.status === "PENDING");

  const cartAfterOrder = await request("/cart", { cookie: userCookie });
  check(
    "Cart dikosongkan setelah order",
    cartAfterOrder.payload?.data?.itemCount === 0,
  );

  const inventoryAfterOrder = await prisma.inventory.findUnique({
    where: { variantId: variant.id },
  });
  check(
    "Inventory direservasi saat order dibuat",
    inventoryAfterOrder.reserved === reservedBefore + 2 &&
      inventoryAfterOrder.quantity === stockBefore,
  );

  const couponAfterOrder = await prisma.coupon.findUnique({
    where: { code: "STRIDE10" },
  });
  check(
    "Usage voucher bertambah",
    couponAfterOrder.usageCount === couponBefore.usageCount + 1,
  );

  const detail = await request(`/orders/${order.orderNumber}`, {
    cookie: userCookie,
  });
  check("GET /orders/:orderNumber → 200", detail.status === 200);

  const adminLogin = await login("admin@stride.local", "Admin#12345");
  const foreignDetail = await request(`/orders/${order.orderNumber}`, {
    cookie: adminLogin.cookie,
  });
  check("User lain tidak bisa melihat order → 404", foreignDetail.status === 404);

  const snap = await request("/payments/midtrans/snap-token", {
    method: "POST",
    cookie: userCookie,
    body: { orderNumber: order.orderNumber },
  });
  check("Snap token mode mock dibuat", snap.status === 201 && snap.payload?.data?.mode === "mock");
  check("Token pembayaran dikembalikan", Boolean(snap.payload?.data?.token));

  const badNotification = notificationFor(order, "settlement");
  badNotification.signature_key = "signature-palsu";
  const rejectedNotification = await request("/payments/midtrans/notification", {
    method: "POST",
    body: badNotification,
  });
  check("Notifikasi signature salah → 403", rejectedNotification.status === 403);

  const notification = notificationFor(order, "settlement");
  const paid = await request("/payments/midtrans/notification", {
    method: "POST",
    body: notification,
  });
  check("Notifikasi settlement valid → 200", paid.status === 200);
  check("Order menjadi PAID", paid.payload?.data?.orderStatus === "PAID");

  const paidOrder = await prisma.order.findUnique({
    where: { orderNumber: order.orderNumber },
    include: { payments: true, shipments: true },
  });
  check("Payment menjadi SETTLEMENT", paidOrder.payments[0].status === "SETTLEMENT");
  check("Shipment dibuat setelah pembayaran", paidOrder.shipments.length === 1);

  const inventoryAfterPaid = await prisma.inventory.findUnique({
    where: { variantId: variant.id },
  });
  check(
    "Stok berkurang dan reservasi dilepas",
    inventoryAfterPaid.quantity === stockBefore - 2 &&
      inventoryAfterPaid.reserved === reservedBefore,
    `qty=${inventoryAfterPaid.quantity} reserved=${inventoryAfterPaid.reserved}`,
  );

  const replay = await request("/payments/midtrans/notification", {
    method: "POST",
    body: notification,
  });
  const inventoryAfterReplay = await prisma.inventory.findUnique({
    where: { variantId: variant.id },
  });
  check("Notifikasi duplikat idempoten", replay.payload?.data?.duplicate === true);
  check(
    "Replay tidak mengurangi stok lagi",
    inventoryAfterReplay.quantity === inventoryAfterPaid.quantity,
  );

  const status = await request(`/payments/${order.orderNumber}/status`, {
    cookie: userCookie,
  });
  check(
    "GET status pembayaran mengembalikan order",
    status.status === 200 &&
      status.payload?.data?.status === "PAID" &&
      status.payload?.data?.payment?.status === "SETTLEMENT",
  );

  await request("/cart/items", {
    method: "POST",
    cookie: userCookie,
    body: { variantId: variant.id, quantity: 1 },
  });
  const secondOrder = await request("/orders", {
    method: "POST",
    cookie: userCookie,
    body: {
      addressId,
      shippingProvider: "SiCepat",
      shippingService: "REG",
    },
  });
  const cancelTarget = secondOrder.payload?.data;
  if (cancelTarget?.id) createdOrderIds.push(cancelTarget.id);
  check("Order kedua dibuat", secondOrder.status === 201);

  const reservedBeforeCancel = await prisma.inventory.findUnique({
    where: { variantId: variant.id },
  });
  const cancelNotification = notificationFor(cancelTarget, "cancel");
  const cancelled = await request("/payments/midtrans/notification", {
    method: "POST",
    body: cancelNotification,
  });
  check("Notifikasi cancel diproses", cancelled.status === 200);
  const cancelledOrder = await prisma.order.findUnique({
    where: { orderNumber: cancelTarget.orderNumber },
  });
  const inventoryAfterCancel = await prisma.inventory.findUnique({
    where: { variantId: variant.id },
  });
  check("Order cancel menjadi CANCELLED", cancelledOrder.status === "CANCELLED");
  check(
    "Reservasi stok dilepas saat cancel",
    inventoryAfterCancel.reserved === reservedBeforeCancel.reserved - 1,
  );

  await request("/cart/items", {
    method: "POST",
    cookie: userCookie,
    body: { variantId: variant.id, quantity: 1 },
  });
  const thirdOrder = await request("/orders", {
    method: "POST",
    cookie: userCookie,
    body: {
      addressId,
      shippingProvider: "J&T",
      shippingService: "EZ",
    },
  });
  const mockTarget = thirdOrder.payload?.data;
  if (mockTarget?.id) createdOrderIds.push(mockTarget.id);
  const settled = await request("/payments/mock/settle", {
    method: "POST",
    cookie: userCookie,
    body: { orderNumber: mockTarget.orderNumber },
  });
  check(
    "POST /payments/mock/settle → PAID",
    settled.status === 200 && settled.payload?.data?.status === "PAID",
  );

  const config = await request("/payments/config");
  check(
    "GET /payments/config mode mock",
    config.status === 200 &&
      config.payload?.data?.mode === "mock" &&
      config.payload?.data?.clientKey === null,
  );

  const empty = await request("/orders/preview", {
    method: "POST",
    cookie: userCookie,
    body: { shippingProvider: "JNE", shippingService: "REG" },
  });
  check("Preview cart kosong → 400", empty.status === 400);
}

try {
  await main();
} finally {
  if (createdOrderIds.length) {
    await prisma.order.deleteMany({ where: { id: { in: createdOrderIds } } });
  }
  await prisma.$disconnect();
}

const failed = results.filter((entry) => !entry.ok);
console.log(`\n${results.length - failed.length}/${results.length} pengujian lulus`);
if (failed.length) {
  console.log("Gagal:", failed.map((entry) => entry.name).join(", "));
  process.exit(1);
}
