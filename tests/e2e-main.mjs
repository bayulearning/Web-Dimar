// E2E alur utama + responsive + SEO dasar.
// Prasyarat: backend :3000 dan frontend :5173 berjalan, DB sudah di-seed.
// Jalankan: node tests/e2e-main.mjs

import { spawn } from "node:child_process";

const CHROME =
  process.env.CHROME_PATH ||
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
const PORT = Number(process.env.CDP_PORT || 9229);
const PROFILE =
  process.env.CHROME_PROFILE ||
  "C:\\Users\\bayu\\AppData\\Local\\Temp\\opencode\\chrome-cdp-m8";
const FRONTEND = process.env.FRONTEND_URL || "http://localhost:5173";

const chrome = spawn(CHROME, [
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  "--no-default-browser-check",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${PROFILE}`,
  "about:blank",
]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const results = [];
const browserErrors = [];

function check(name, condition, detail = "") {
  results.push({ name, ok: Boolean(condition), detail });
  console.log(`${condition ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
}

function includesText(haystack, needle) {
  return String(haystack || "")
    .toLowerCase()
    .includes(String(needle).toLowerCase());
}

async function waitForTarget() {
  for (let i = 0; i < 80; i += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const targets = await response.json();
      const page = targets.find((target) => target.type === "page");
      if (page) return page;
    } catch {
      // Chrome belum siap.
    }
    await sleep(250);
  }
  throw new Error("Chrome target tidak tersedia");
}

let ws;
let target;

try {
  target = await waitForTarget();
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });

  let id = 0;
  const pending = new Map();

  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);

    if (message.method === "Runtime.exceptionThrown") {
      browserErrors.push(
        message.params?.exceptionDetails?.exception?.description ||
          message.params?.exceptionDetails?.text ||
          "exception",
      );
    }
    if (
      message.method === "Runtime.consoleAPICalled" &&
      message.params?.type === "error"
    ) {
      browserErrors.push(
        message.params.args
          .map((arg) => arg.value ?? arg.description ?? "")
          .join(" "),
      );
    }

    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(JSON.stringify(message.error)));
      else resolve(message.result);
    }
  });

  function send(method, params = {}) {
    id += 1;
    const messageId = id;
    return new Promise((resolve, reject) => {
      pending.set(messageId, { resolve, reject });
      ws.send(JSON.stringify({ id: messageId, method, params }));
    });
  }

  async function evaluate(expression) {
    const result = await send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  }

  async function navigate(path, wait = 2600) {
    await send("Page.navigate", { url: `${FRONTEND}${path}` });
    await sleep(wait);
  }

  async function bodyText() {
    return evaluate("document.body.innerText");
  }

  async function clickText(text, selector = "button") {
    return evaluate(`
      (() => {
        const target = [...document.querySelectorAll(${JSON.stringify(selector)})].find(
          (entry) => entry.textContent.trim() === ${JSON.stringify(text)},
        );
        if (!target) return false;
        target.click();
        return true;
      })()
    `);
  }

  const helpers = `
    function setValue(element, value) {
      const proto = element instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : element instanceof HTMLSelectElement
          ? HTMLSelectElement.prototype
          : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
      setter.call(element, value);
      element.dispatchEvent(new Event(
        element instanceof HTMLSelectElement ? "change" : "input",
        { bubbles: true },
      ));
    }

    function fillLabel(labelText, value) {
      const label = [...document.querySelectorAll("label")].find((entry) =>
        entry.textContent.trim().toLowerCase().startsWith(labelText.toLowerCase()),
      );
      const field =
        label?.querySelector("input, textarea, select") ||
        document.getElementById(labelText.toLowerCase()) ||
        document.querySelector(
          'input[autocomplete="' +
            (labelText.toLowerCase() === "email" ? "email" : "current-password") +
            '"]',
        );
      if (!field) return false;
      setValue(field, value);
      return true;
    }
  `;

  async function fillLabel(labelText, value) {
    return evaluate(`
      (() => {
        ${helpers}
        return fillLabel(${JSON.stringify(labelText)}, ${JSON.stringify(value)});
      })()
    `);
  }

  async function overflowAt(width, path) {
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height: 900,
      deviceScaleFactor: 1,
      mobile: width < 768,
    });
    await navigate(path, 2200);
    return evaluate(`({
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      mobileNav: (() => {
        const nav = document.querySelector('nav[aria-label="Navigasi bawah"]');
        return nav ? getComputedStyle(nav).display !== "none" : false;
      })(),
      desktopNav: (() => {
        const nav = document.querySelector('nav[aria-label="Navigasi utama"]');
        return nav ? getComputedStyle(nav).display !== "none" : false;
      })(),
      width: window.innerWidth,
    })`);
  }

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Network.enable");
  await send("Network.clearBrowserCookies");

  /* Mulai dari state guest bersih */
  await navigate("/", 2500);
  await evaluate("localStorage.clear(); sessionStorage.clear(); true");
  await navigate("/", 2800);

  let text = await bodyText();
  check("Beranda tampil", includesText(text, "Stride Athletics"));
  check("Katalog unggulan tampil", includesText(text, "Velocity X"));

  const seo = await evaluate(`({
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.content,
    canonical: document.querySelector('link[rel="canonical"]')?.href,
    ogTitle: document.querySelector('meta[property="og:title"]')?.content,
    robots: document.querySelector('meta[name="robots"]')?.content,
    jsonLd: Boolean(document.getElementById("page-jsonld")),
  })`);
  check("Title beranda memuat brand", includesText(seo.title, "Stride Athletics"));
  check("Meta description terisi", Boolean(seo.description));
  check("Canonical tersedia", Boolean(seo.canonical));
  check("Open Graph title terisi", Boolean(seo.ogTitle));
  check("Robots index,follow di beranda", includesText(seo.robots, "index"));
  check("JSON-LD beranda tersedia", seo.jsonLd === true);

  /* Guest memilih produk dan ukuran */
  await navigate("/belanja", 3000);
  text = await bodyText();
  check("Halaman belanja tampil", includesText(text, "Shop What You Need"));

  const productHref = await evaluate(`
    (() => {
      const link = document.querySelector('a[href^="/produk/"]');
      return link ? link.getAttribute("href") : null;
    })()
  `);
  check("Produk bisa dibuka", Boolean(productHref), productHref || "");

  await navigate(productHref, 3000);
  text = await bodyText();
  check("Detail produk tampil", includesText(text, "Tambah ke Keranjang"));

  const sizePicked = await evaluate(`
    (() => {
      const size = [...document.querySelectorAll("button")].find(
        (entry) => /^\\d{2}$/.test(entry.textContent.trim()) && !entry.disabled,
      );
      if (!size) return null;
      size.click();
      return size.textContent.trim();
    })()
  `);
  check("Ukuran tersedia dipilih", Boolean(sizePicked), sizePicked || "");

  const added = await clickText("Tambah ke Keranjang");
  check("Tombol tambah ke keranjang bekerja", added);
  await sleep(1400);

  await navigate("/keranjang", 2600);
  text = await bodyText();
  check("Item masuk keranjang", includesText(text, "Lanjut ke Checkout"));

  /* Checkout sebagai guest → login → merge cart */
  await clickText("Lanjut ke Checkout", "a");
  await sleep(1800);
  let view = await evaluate("({ path: location.pathname, search: location.search })");
  check(
    "Guest checkout diarahkan ke login",
    view.path === "/login" && view.search.includes("next"),
    `${view.path}${view.search}`,
  );

  const emailFilled = await fillLabel("Email", "demo@stride.local");
  const passwordFilled = await fillLabel("Password", "Demo#12345");
  check("Form login terisi", emailFilled && passwordFilled);
  await clickText("Masuk");
  await sleep(3800);

  view = await evaluate("({ path: location.pathname, search: location.search })");
  check("Login demo kembali ke checkout", view.path === "/checkout", view.path);

  text = await bodyText();
  check("Alamat demo tampil", includesText(text, "Alamat Pengiriman"));
  check("Ringkasan checkout tampil", includesText(text, "Subtotal"));

  await clickText("Lanjut ke Pengiriman");
  await sleep(1000);
  text = await bodyText();
  check("Metode pengiriman tampil", includesText(text, "Metode Pengiriman"));

  await clickText("Lanjut ke Pembayaran");
  await sleep(1000);
  text = await bodyText();
  check("Ringkasan pembayaran tampil", includesText(text, "Bayar Sekarang"));

  await clickText("Bayar Sekarang");
  await sleep(5000);

  view = await evaluate("({ path: location.pathname, search: location.search })");
  check(
    "Pesanan dibuat dan diarahkan ke status",
    view.path.startsWith("/pesanan/") && view.path.endsWith("/pending"),
    view.path,
  );
  const orderNumber = view.path.split("/")[2] || "";

  text = await bodyText();
  check("Status menunggu pembayaran tampil", includesText(text, "Menunggu Pembayaran"));
  check("Mode mock dijelaskan", includesText(text, "mock"));

  await clickText("Simulasikan Pembayaran (Mock)");
  await sleep(2600);
  text = await bodyText();
  check("Pembayaran mock berhasil", includesText(text, "Pembayaran Berhasil"));
  check("Status pembayaran SETTLEMENT", includesText(text, "SETTLEMENT"));

  await navigate("/pesanan", 2800);
  text = await bodyText();
  check(
    "Riwayat pesanan memuat pesanan baru",
    Boolean(orderNumber) && includesText(text, orderNumber),
    orderNumber,
  );

  /* Responsive */
  const mobile = await overflowAt(375, "/");
  check("Mobile 375px tanpa overflow horizontal", mobile.overflow <= 1, `overflow=${mobile.overflow}`);
  check("Bottom nav tampil di mobile", mobile.mobileNav === true);
  check("Nav desktop tersembunyi di mobile", mobile.desktopNav === false);

  const tablet = await overflowAt(768, "/belanja");
  check("Tablet 768px tanpa overflow horizontal", tablet.overflow <= 1, `overflow=${tablet.overflow}`);

  const desktop = await overflowAt(1280, "/belanja");
  check("Desktop 1280px tanpa overflow horizontal", desktop.overflow <= 1, `overflow=${desktop.overflow}`);
  check("Nav desktop tampil di desktop", desktop.desktopNav === true);
  check("Bottom nav tersembunyi di desktop", desktop.mobileNav === false);

  check(
    "Tidak ada error console kritis",
    browserErrors.length === 0,
    browserErrors.slice(0, 3).join(" | "),
  );

  const failed = results.filter((entry) => !entry.ok);
  console.log(`\nM8 E2E: ${results.length - failed.length}/${results.length} lulus`);
  if (failed.length > 0) {
    console.log("Gagal:", failed.map((entry) => entry.name).join(", "));
    process.exitCode = 1;
  }
} finally {
  ws?.close();
  chrome.kill();
}
