// Self-test API Milestone 4: auth, address, cart, wishlist.
// Jalankan server lebih dulu, lalu: node tests/api-m4.mjs

import { prisma } from "../server/src/lib/prisma.js";

const BASE = process.env.API_BASE_URL || "http://localhost:3000/api";
const results = [];
const createdEmails = [];

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

function cleanup() {
  return prisma.user.deleteMany({
    where: { email: { in: createdEmails } },
  });
}

try {
  const anonymous = await request("/auth/me");
  check("GET /auth/me tanpa cookie → 401", anonymous.status === 401);

  const wrong = await request("/auth/login", {
    method: "POST",
    body: { email: "user@stride.local", password: "salah-password" },
  });
  check("Login password salah → 401", wrong.status === 401);

  const userLogin = await login("user@stride.local", "User#12345");
  check("Login user valid → 200", userLogin.status === 200);
  check("Cookie httpOnly diterima", Boolean(userLogin.cookie));
  const userCookie = userLogin.cookie;

  const me = await request("/auth/me", { cookie: userCookie });
  check(
    "GET /auth/me mengembalikan user",
    me.status === 200 && me.payload?.data?.user?.email === "user@stride.local",
  );
  check("Response tidak membocorkan passwordHash", !("passwordHash" in (me.payload?.data?.user ?? {})));

  const updated = await request("/auth/me", {
    method: "PATCH",
    cookie: userCookie,
    body: { name: "Budi Runner", phone: "081200000002" },
  });
  check("PATCH /auth/me → 200", updated.status === 200);

  const cartBefore = await request("/cart", { cookie: userCookie });
  check("GET /cart → 200", cartBefore.status === 200);
  check(
    "Cart user berasal dari database",
    typeof cartBefore.payload?.data?.itemCount === "number",
    `itemCount=${cartBefore.payload?.data?.itemCount}`,
  );

  const variant = await prisma.productVariant.findFirst({
    where: { isActive: true, inventory: { quantity: { gt: 5 } } },
    orderBy: { id: "asc" },
  });

  const added = await request("/cart/items", {
    method: "POST",
    cookie: userCookie,
    body: { variantId: variant.id, quantity: 2 },
  });
  check("POST /cart/items → 201", added.status === 201);
  const addedItem = added.payload?.data?.items?.find(
    (item) => item.variantId === variant.id,
  );
  check("Item masuk cart dengan harga server", Boolean(addedItem?.price > 0));

  const patched = await request(`/cart/items/${addedItem.id}`, {
    method: "PATCH",
    cookie: userCookie,
    body: { quantity: 3 },
  });
  const patchedItem = patched.payload?.data?.items?.find(
    (item) => item.variantId === variant.id,
  );
  check("PATCH quantity → 200", patched.status === 200);
  check("Quantity menjadi 3", patchedItem?.quantity === 3);

  const removed = await request(`/cart/items/${addedItem.id}`, {
    method: "DELETE",
    cookie: userCookie,
  });
  check("DELETE cart item → 200", removed.status === 200);
  check(
    "Item terhapus dari cart",
    !removed.payload?.data?.items?.some((item) => item.variantId === variant.id),
  );

  const secondVariant = await prisma.productVariant.findFirst({
    where: {
      isActive: true,
      id: { not: variant.id },
      inventory: { quantity: { gt: 2 } },
    },
    orderBy: { id: "asc" },
  });
  const merged = await request("/cart/merge", {
    method: "POST",
    cookie: userCookie,
    body: {
      items: [
        { variantId: secondVariant.id, quantity: 2 },
        { variantId: 999999, quantity: 1 },
      ],
    },
  });
  check("POST /cart/merge → 200", merged.status === 200);
  check("Merge menerima varian valid", merged.payload?.data?.mergedCount === 1);
  check("Merge menolak varian invalid", merged.payload?.data?.rejectedCount === 1);
  const mergedItem = merged.payload?.data?.items?.find(
    (item) => item.variantId === secondVariant.id,
  );
  await request(`/cart/items/${mergedItem.id}`, {
    method: "DELETE",
    cookie: userCookie,
  });

  const wishlist = await request("/wishlist", { cookie: userCookie });
  check("GET /wishlist → 200", wishlist.status === 200);

  const wishlistAdd = await request("/wishlist", {
    method: "POST",
    cookie: userCookie,
    body: { productId: 2 },
  });
  check(
    "POST /wishlist menambah produk",
    wishlistAdd.status === 201 &&
      wishlistAdd.payload?.data?.items?.some((item) => item.id === 2),
  );

  const wishlistRemove = await request("/wishlist/2", {
    method: "DELETE",
    cookie: userCookie,
  });
  check(
    "DELETE /wishlist/:productId",
    wishlistRemove.status === 200 &&
      !wishlistRemove.payload?.data?.items?.some((item) => item.id === 2),
  );

  const wishlistMerge = await request("/wishlist/merge", {
    method: "POST",
    cookie: userCookie,
    body: { productIds: [3, 4] },
  });
  check("POST /wishlist/merge → 200", wishlistMerge.status === 200);
  await request("/wishlist/3", { method: "DELETE", cookie: userCookie });
  await request("/wishlist/4", { method: "DELETE", cookie: userCookie });

  const addresses = await request("/addresses", { cookie: userCookie });
  check(
    "GET /addresses mengembalikan alamat seed",
    addresses.status === 200 && addresses.payload?.data?.length >= 1,
  );

  const created = await request("/addresses", {
    method: "POST",
    cookie: userCookie,
    body: {
      label: "Kantor",
      recipientName: "Budi Runner",
      phone: "081200000002",
      province: "DKI Jakarta",
      city: "Jakarta Pusat",
      district: "Menteng",
      postalCode: "10310",
      detail: "Jl. Sudirman No. 1",
      isDefault: true,
    },
  });
  check("POST /addresses → 201", created.status === 201);
  const addressId = created.payload?.data?.id;
  check("Alamat baru menjadi default", created.payload?.data?.isDefault === true);

  const addressPatched = await request(`/addresses/${addressId}`, {
    method: "PATCH",
    cookie: userCookie,
    body: { label: "Kantor Pusat" },
  });
  check(
    "PATCH /addresses/:id",
    addressPatched.status === 200 &&
      addressPatched.payload?.data?.label === "Kantor Pusat",
  );

  const adminLogin = await login("admin@stride.local", "Admin#12345");
  const foreignDelete = await request(`/addresses/${addressId}`, {
    method: "DELETE",
    cookie: adminLogin.cookie,
  });
  check("User lain tidak bisa hapus alamat → 404", foreignDelete.status === 404);

  const addressDeleted = await request(`/addresses/${addressId}`, {
    method: "DELETE",
    cookie: userCookie,
  });
  check("DELETE /addresses/:id → 200", addressDeleted.status === 200);

  const csrf = await request("/auth/logout", {
    method: "POST",
    cookie: userCookie,
    headers: { Origin: "https://evil.example" },
  });
  check("POST dengan Origin asing → 403", csrf.status === 403);

  const email = `m4.test.${Date.now()}@stride.local`;
  createdEmails.push(email);
  const registered = await request("/auth/register", {
    method: "POST",
    body: {
      name: "Test M4",
      email,
      password: "Test#12345",
      phone: "081299999999",
    },
  });
  check("POST /auth/register → 201", registered.status === 201);
  check("Register langsung memberi cookie", Boolean(registered.token));

  const duplicate = await request("/auth/register", {
    method: "POST",
    body: { name: "Test M4", email, password: "Test#12345" },
  });
  check("Register email duplikat → 409", duplicate.status === 409);

  const newCart = await request("/cart", { cookie: registered.token });
  check(
    "User baru otomatis punya cart kosong",
    newCart.status === 200 && newCart.payload?.data?.itemCount === 0,
  );

  const logout = await request("/auth/logout", {
    method: "POST",
    cookie: userCookie,
  });
  check("POST /auth/logout → 200", logout.status === 200);
} finally {
  await cleanup();
  await prisma.$disconnect();
}

const failed = results.filter((entry) => !entry.ok);
console.log(`\n${results.length - failed.length}/${results.length} pengujian lulus`);
if (failed.length) {
  console.log("Gagal:", failed.map((entry) => entry.name).join(", "));
  process.exit(1);
}
