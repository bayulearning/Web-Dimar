// Self-test API Milestone 8: keamanan, SEO, dan penerimaan akhir.
// Jalankan server lebih dulu, lalu: node tests/api-m8.mjs

const BASE = process.env.API_BASE_URL || "http://localhost:3000/api";
const ROOT = BASE.replace(/\/api\/?$/, "");
const results = [];
const stamp = Date.now();

function check(name, condition, detail = "") {
  results.push({ name, ok: Boolean(condition), detail });
  console.log(`${condition ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
}

async function request(path, { method = "GET", body, cookie, headers = {}, base = BASE } = {}) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let payload = null;
  try {
    payload = JSON.parse(text);
  } catch {
    payload = null;
  }
  const setCookie = response.headers.getSetCookie?.() ?? [];
  const token = setCookie
    .map((entry) => entry.split(";")[0])
    .find((entry) => entry.startsWith("stride_token="));
  return { status: response.status, payload, text, token, headers: response.headers };
}

async function login(email, password) {
  const response = await request("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  return { ...response, cookie: response.token };
}

async function main() {
  /* Security headers */
  const health = await request("/health");
  check("GET /api/health → 200", health.status === 200);
  check(
    "Header X-Content-Type-Options ada",
    health.headers.get("x-content-type-options") === "nosniff",
  );
  check(
    "Header X-Frame-Options atau CSP frame-ancestors ada",
    Boolean(
      health.headers.get("x-frame-options") ||
        health.headers.get("content-security-policy")?.includes("frame-ancestors"),
    ),
  );
  check(
    "X-Powered-By tidak bocor",
    health.headers.get("x-powered-by") === null,
  );

  /* CORS dan CSRF */
  const allowedCors = await request("/health", {
    headers: { Origin: "http://localhost:5173" },
  });
  check(
    "Origin diizinkan mendapat Access-Control-Allow-Origin",
    allowedCors.headers.get("access-control-allow-origin") ===
      "http://localhost:5173",
  );

  const blockedCors = await request("/health", {
    headers: { Origin: "https://evil.example" },
  });
  check("Origin asing ditolak", blockedCors.status === 403);

  const csrfBlocked = await request("/auth/login", {
    method: "POST",
    body: { email: "demo@stride.local", password: "Demo#12345" },
    headers: { Origin: "https://evil.example" },
  });
  check("POST lintas situs ditolak CSRF", csrfBlocked.status === 403);

  /* Authentication */
  const wrongPassword = await login("demo@stride.local", "PasswordSalah");
  check("Password salah → 401", wrongPassword.status === 401);
  check("Error password tidak membocorkan detail", Boolean(wrongPassword.payload?.message));

  const demo = await login("demo@stride.local", "Demo#12345");
  check("Login akun demo → 200", demo.status === 200);
  check("Cookie demo httpOnly", (demo.headers.get("set-cookie") || "").toLowerCase().includes("httponly"));
  check("Cookie demo SameSite", (demo.headers.get("set-cookie") || "").toLowerCase().includes("samesite"));

  const me = await request("/auth/me", { cookie: demo.cookie });
  check("GET /auth/me akun demo → 200", me.status === 200);
  check("Role akun demo USER", me.payload?.data?.user?.role === "USER");

  const registerEmail = `m8.test.${stamp}@stride.local`;
  const escalated = await request("/auth/register", {
    method: "POST",
    body: {
      name: "M8 Escalation",
      email: registerEmail,
      password: "Test#12345",
      role: "ADMIN",
    },
  });
  check("Register mengabaikan role dari request", escalated.status === 201);
  check(
    "Akun baru tetap USER",
    escalated.payload?.data?.user?.role === "USER",
  );

  /* Authorization */
  const anonymousAdmin = await request("/admin/dashboard");
  check("Admin tanpa login → 401", anonymousAdmin.status === 401);

  const userAdmin = await request("/admin/dashboard", { cookie: demo.cookie });
  check("Admin sebagai user biasa → 403", userAdmin.status === 403);

  const otherOrder = await request("/orders/STR-2026-0001", {
    cookie: demo.cookie,
  });
  check(
    "User tidak bisa melihat pesanan milik user lain",
    [403, 404].includes(otherOrder.status),
  );

  const admin = await login("admin@stride.local", "Admin#12345");
  const otherOrderDetail = await request("/admin/orders/STR-2026-0001", {
    cookie: admin.cookie,
  });
  check("Admin tetap bisa melihat detail pesanan", otherOrderDetail.status === 200);

  /* Validasi input dan error */
  const invalidCoupon = await request("/orders/preview", {
    method: "POST",
    cookie: demo.cookie,
    body: {
      shippingProvider: "JNE",
      shippingService: "REG",
      couponCode: "TIDAKADA",
    },
  });
  check("Voucher tidak valid ditolak", invalidCoupon.status === 422);

  const invalidShipping = await request("/orders/preview", {
    method: "POST",
    cookie: demo.cookie,
    body: { shippingProvider: "KURIR", shippingService: "REG" },
  });
  check("Layanan pengiriman tidak valid ditolak", invalidShipping.status === 422);

  const badJson = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" },
    body: "{",
  });
  const badJsonPayload = await badJson.json().catch(() => null);
  check("JSON rusak ditolak 400", badJson.status === 400);
  check(
    "Respons error tidak memuat stack trace",
    !JSON.stringify(badJsonPayload || {}).includes("node_modules") &&
      !JSON.stringify(badJsonPayload || {}).includes("\n    at "),
  );

  /* SEO */
  const robots = await request("/robots.txt", { base: ROOT });
  check("GET /robots.txt → 200", robots.status === 200);
  check("robots.txt memuat Sitemap", robots.text.includes("Sitemap:"));
  check("robots.txt memblokir /admin", robots.text.includes("Disallow: /admin"));

  const sitemap = await request("/sitemap.xml", { base: ROOT });
  check("GET /sitemap.xml → 200", sitemap.status === 200);
  check("sitemap.xml memakai XML urlset", sitemap.text.includes("<urlset"));
  check("sitemap.xml memuat halaman belanja", sitemap.text.includes("/belanja"));
  check("sitemap.xml memuat produk", sitemap.text.includes("/produk/"));

  const docs = await request("/docs/openapi.json");
  const pathCount = Object.keys(docs.payload?.paths ?? {}).length;
  check("OpenAPI tersedia", docs.status === 200);
  check("OpenAPI minimal 58 path", pathCount >= 58, `path=${pathCount}`);

  const notFound = await request("/tidak-ada-endpoint-ini");
  check("404 memakai format error standar", notFound.status === 404 && notFound.payload?.success === false);

  const failed = results.filter((entry) => !entry.ok);
  console.log(`\nM8 API: ${results.length - failed.length}/${results.length} lulus`);
  if (failed.length > 0) {
    console.log("Gagal:", failed.map((entry) => entry.name).join(", "));
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
