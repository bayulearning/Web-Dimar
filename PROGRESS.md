# PROGRESS — Stride Athletics

## Status: Milestone 8 — Final QA & Release (selesai)

## Status sebelumnya: Milestone 7 — Admin Dashboard (selesai)

## Status sebelumnya: Milestone 6 — Riwayat Pesanan, Notifikasi & Konten (selesai)

## Status sebelumnya: Milestone 5 — Checkout & Payment (selesai)

## Status sebelumnya: Milestone 4 — Authentication & User Features (selesai)

## Status sebelumnya: Milestone 3 — Catalog & Main Pages (selesai)

## Status sebelumnya: Milestone 2 — Database & API Foundation (selesai)

## Status sebelumnya: Milestone 1 — Project Foundation (selesai)

### Tujuan task

Menyiapkan fondasi monorepo: npm workspaces, backend Express modular, frontend React+Tailwind dengan tema gelap Stride Athletics, router lengkap, dan dokumentasi awal.

### File dibuat

- `package.json` (root, npm workspaces + skrip dev/build/lint/test)
- `.gitignore`, `.env.example`, `README.md`
- `docs/DECISIONS.md` (deviasi React, lokasi Prisma)
- `server/src/config/env.js`
- `server/src/utils/AppError.js`, `apiResponse.js`, `logger.js`
- `server/src/middlewares/requestLogger.js`, `notFoundHandler.js`, `errorHandler.js`
- `server/src/routes/index.js`, `health.routes.js`
- `server/src/controllers/health.controller.js`
- `server/src/app.js`, `server/src/server.js`
- `client/src/router/paths.js`
- `client/src/services/http.js`
- `client/src/hooks/useDocumentTitle.js`
- `client/src/utils/format.js`
- `client/src/layouts/MainLayout.jsx`
- `client/src/components/common/Logo.jsx`, `ScrollToTop.jsx`
- `client/src/components/ui/PageShell.jsx`
- `client/src/components/layout/Header.jsx`, `Footer.jsx`, `BottomNav.jsx`
- 24 file di `client/src/pages/` (skeleton route)

### File diubah

- `client/vite.config.js` (Tailwind plugin + proxy `/api`)
- `client/index.html` (lang id, meta, font, hapus baris nyasar)
- `client/src/index.css` (dark theme tokens, Tailwind)
- `client/src/main.jsx` (BrowserRouter)
- `client/src/App.jsx` (seluruh route)
- `server/package.json` (deps: helmet, zod, cookie-parser, nodemon, prisma)
- `PROGRESS.md`

### File dihapus

- `client/src/App.css` (CSS template Vite, tidak dipakai)
- `server/public/index.html` (mock frontend kedua, melanggar AGENTS.md §2 dan plan §4)

### Fitur berhasil

- `npm run dev` menjalankan client + server bersamaan.
- Backend Express modular: Helmet, CORS terbatas, JSON body limit, cookie parser, request logging JSON, 404 handler, error handler terpusat, health check.
- Frontend: tema gelap (`#111111`, surface `#1a1a1a`, mint `#34d399`), header sticky, drawer mobile, bottom nav, footer, skip link, fokus terlihat.
- Semua route plan.md §7 tersedia sebagai halaman skeleton.

### Pengujian

- `npm install` (workspaces) — berhasil.
- `npm run lint` — 0 error (2 error awal diperbaiki: `no-useless-assignment` di `http.js`, `process` di `vite.config.js`).
- `npm run build` — berhasil (`client/dist`, 285,69 kB JS / 17,13 kB CSS).
- `GET /api/health` — 200, `{"success":true,...}`.
- `GET /api/nope` — 404 dengan format error standar.
- Log server JSON terstruktur tercatat (start, request, status, durasi).

### Perbaikan lanjutan

- `client/src/App.jsx` sempat tersimpan sebagai UTF-16LE (BOM `FF FE`, 2393 byte NUL) sehingga Vite/Rolldown gagal: `stream did not contain valid UTF-8`. File dikonversi ke UTF-8 tanpa BOM; 59 file lain dipindai, tidak ada yang terpengaruh.
- Ditambahkan `.editorconfig` dan `.vscode/settings.json` (`files.encoding: utf8`) untuk mencegah penyimpanan ulang sebagai UTF-16.
- `npm install` awal kena timeout 600s (unduh 327 paket, bukan error repo). Verifikasi ulang: `npm ls --depth=0` exit 0, root `package-lock.json` dibuat (lockfileVersion 3, 327 paket), `npm ci --dry-run` OK.
- `client/src/App.jsx` dirapikan: route halaman statis dan route status pesanan dipindah ke konfigurasi array (`staticPages`, `orderStatusPages`), formatting konsisten. Tidak ada perubahan perilaku; verifikasi SSR 30 route OK, `npm run lint` 0 error, `npm run build` sukses.

### Belum selesai / batasan

- Halaman masih skeleton; data belum dari API.
- Prisma schema masih minimal (User, Product), belum ada migration/seed.
- Belum ada auth, cart, checkout, Midtrans, admin, test otomatis.

### Task berikutnya

Milestone 2: ERD, Prisma schema lengkap, migration, seed 24 produk + akun development, standar API katalog, dokumentasi OpenAPI.

---

## Milestone 2 — Database & API Foundation (selesai)

### Tujuan task

Menyediakan database lengkap, seed realistis, API katalog dengan filter/sorting/pagination, dokumentasi OpenAPI, dan memperbaiki konfigurasi environment.

### File dibuat

- `docs/ERD.md` (ERD + constraint + aturan stok)
- `server/prisma/data/products.js` (5 kategori, 24 produk, 8 ukuran)
- `server/prisma/data/content.js` (3 voucher, 9 artikel bantuan, 5 artikel news)
- `server/prisma/generate-images.js` + 72 SVG di `client/public/images/products/`
- `server/prisma/seed.js`
- `server/src/lib/prisma.js`
- `server/src/utils/asyncHandler.js`
- `server/src/validators/product.validator.js`
- `server/src/repositories/product.repository.js`, `category.repository.js`
- `server/src/services/product.service.js`, `category.service.js`
- `server/src/controllers/product.controller.js`, `category.controller.js`
- `server/src/routes/product.routes.js`, `category.routes.js`, `docs.routes.js`
- `server/src/docs/openapi.js`
- Migration: `server/prisma/migrations/20261111030321_init`, `20261111030759_add_effective_price`

### File diubah

- `server/prisma/schema.prisma` (24 model, index, relasi, `effectivePrice`)
- `server/src/routes/index.js` (mount products, categories, docs)
- `server/src/app.js` (error CORS 403)
- `server/package.json` (script `seed:images`, dependency `swagger-ui-express`)
- `server/.env` (diformat multi-baris; sebelumnya satu baris sehingga hanya `DATABASE_URL` yang terbaca)
- `README.md`, `PROGRESS.md`

### Fitur berhasil

- Prisma schema 24 model: User, Address, Category, Product, ProductImage, ProductVariant, Inventory, Cart, CartItem, Wishlist, WishlistItem, Order, OrderItem, OrderStatusHistory, Payment, PaymentEvent, Shipment, ShipmentEvent, Review, Coupon, Notification, ContactMessage, HelpArticle, NewsArticle, NewsArticleProduct.
- Seed: 5 kategori, 24 produk, 384 varian (ukuran × warna), stok realistis termasuk varian habis, 2 pesanan (DELIVERED + PENDING_PAYMENT), pembayaran + event, shipment + event, 2 ulasan terverifikasi, 3 voucher, 9 artikel bantuan, 5 news, 3 notifikasi, wishlist, cart, 2 pesan kontak, akun admin/user.
- API katalog:
  - `GET /api/products` — filter `q`, `category`, `gender`, `size` (terima `42`/`EU 42`), `color`, `badge`, `minPrice`, `maxPrice`; sorting `newest`, `price_asc`, `price_desc`, `rating`, `popular`; pagination `page`, `limit`.
  - `GET /api/products/:slug` — detail + 16 varian + stok + ulasan + 4 produk terkait.
  - `GET /api/categories`, `GET /api/categories/:slug` — jumlah produk terpublikasi.
  - `GET /api/docs` (Swagger UI), `GET /api/docs/openapi.json`.
- Validasi Zod untuk query/param; error 422 dengan field + pesan.
- Respons standar `success/message/data/meta` dan `success/message/errors`.

### Pengujian

- `prisma validate` — schema valid.
- `prisma migrate dev` — 2 migration diterapkan ke SQLite `server/prisma/dev.db`.
- `npm run seed` — berhasil; hitungan sesuai target.
- `GET /api/products?limit=3` → 200, total 24, ID mulai 1.
- `GET /api/products?size=42&limit=48` → 200, total 24.
- `GET /api/products?category=running&sort=price_asc` → harga urut 1.599.000 → 3.299.000.
- `GET /api/categories` → `running:6 football:5 badminton:5 training:4 lifestyle:4`.
- `GET /api/products/stride-velocity-x` → 16 varian, 1 ulasan, 4 terkait.
- `GET /api/products?page=3&limit=12` → 0 item, `hasNextPage=false`.
- `GET /api/products?minPrice=abc` → 422 (`field=minPrice`).
- `GET /api/categories/tidak-ada` → 404.
- `GET /api/docs/` → 200.
- `npm run lint` → 0 error; `npm run build` → sukses. Catatan: `client/src/App.jsx` sempat ditimpa kembali menjadi placeholder oleh proses eksternal (bukan tool ini); file dipulihkan sebelum verifikasi.

### Belum selesai / batasan

- API masih read-only; CRUD admin dijadwalkan Milestone 7.
- Belum ada unit/integration test otomatis (Vitest) — dijadwalkan Milestone 8, sebagian bisa lebih awal.
- `server/prisma/dev.db` tidak di-commit (`.gitignore`).
- Endpoint `/` hanya info API; tidak melayani frontend.

### Task berikutnya

Milestone 3: beranda, belanja, listing kategori, detail produk, search, filter, sorting memakai API nyata.

---

## Milestone 3 — Catalog & Main Pages (selesai)

### Tujuan task

Menghubungkan halaman katalog utama ke API nyata: beranda, belanja, listing kategori, detail produk, pencarian, filter, sorting, keranjang tamu, dan wishlist tamu.

### File dibuat

- `client/src/services/catalog.js`
- `client/src/hooks/useAsyncData.js`, `useDebouncedValue.js`
- `client/src/store/persistentStore.js`, `useStore.js`, `cartStore.js`, `wishlistStore.js`, `toastStore.js`
- `client/src/components/ui/Price.jsx`, `Badge.jsx`, `RatingStars.jsx`, `States.jsx`, `SectionHeader.jsx`, `Breadcrumb.jsx`, `Toaster.jsx`
- `client/src/components/catalog/ProductCard.jsx`, `ProductGrid.jsx`, `ProductCardSkeleton.jsx`, `FilterPanel.jsx`, `FilterSheet.jsx`, `SortSelect.jsx`
- `client/src/components/common/Countdown.jsx`

### File diubah

- `server/src/repositories/category.repository.js` (facets ukuran, warna, rentang harga)
- `server/src/services/category.service.js` (sertakan facets pada detail kategori)
- `client/src/pages/HomePage.jsx`, `ShopPage.jsx`, `CategoryPage.jsx`, `ProductDetailPage.jsx`, `SearchPage.jsx`, `CartPage.jsx`, `WishlistPage.jsx`
- `client/src/components/layout/Header.jsx` (badge keranjang/wishlist live, countdown drop bertanggal)
- `client/src/layouts/MainLayout.jsx` (Toaster)
- `client/src/components/catalog/ProductCard.jsx` (perbaikan path import komponen UI)
- `client/src/hooks/useAsyncData.js` (aman terhadap aturan React 19: ref di effect, setState async)
- `client/src/store/toastStore.js` (store memori, tanpa persistensi)
- `client/.env.example` (VITE_API_BASE_URL)
- `.gitignore` (abaikan DB, backup, `.env`, kecualikan `.env.example`)
- `PROGRESS.md`

### Fitur berhasil

- Beranda: hero, chip kategori, carousel trending, banner Stride Club, kategori olahraga, rilis terbaru, highlights, layanan, badge original/retur.
- Belanja: kategori horizontal, highlights, tombol show more (12 → 24).
- Listing kategori `/kategori/:slug`: breadcrumb, hero kategori, jumlah produk, progress load, chip badge, filter gender/ukuran/warna/harga, sorting, filter bottom sheet mobile, grid 2 kolom mobile, load more 12 → 48, URL query menyimpan filter.
- Detail produk `/produk/:slug`: galeri + thumbnail + indikator, share, badge diskon, stok, rating, pemilih warna dan ukuran (ukuran habis disabled), panduan ukuran, validasi ukuran, tambah ke keranjang, beli sekarang, wishlist, accordion spesifikasi/ulasan/pengiriman/pengembalian, produk terkait.
- Pencarian `/cari?q=`: pencarian backend debounce, minimal 2 karakter, saran kata kunci, empty state.
- Keranjang `/keranjang`: daftar item, kontrol jumlah, hapus, simpan ke wishlist, tautan ubah ukuran, validasi stok ulang dari backend, ringkasan subtotal/total, empty state.
- Wishlist `/wishlist`: daftar tersimpan, hapus, tautan pilih ukuran, empty state.
- Keranjang, wishlist, dan toast tamu disimpan di `localStorage`.
- Filter kategori memakai facets nyata dari API (`sizes`, `colors`, `priceRange`).

### Pengujian

- `npm run lint` — 0 error (aturan React 19 `react-hooks/refs` dan `set-state-in-effect` diperbaiki, bukan dimatikan).
- `npm run build` — sukses (`dist/assets/index-BnG-5Tfq.js` 351,00 kB, CSS 35,09 kB).
- Runtime dev server + API:
  - `GET /` 200; semua modul halaman (`CategoryPage`, `ProductDetailPage`, `SearchPage`, `CartPage`, `WishlistPage`) ditransformasi Vite tanpa error.
  - `GET /api/health` 200 melalui proxy Vite.
  - `GET /api/categories/running` mengembalikan 8 ukuran, 6 warna, rentang harga 1.599.000–3.299.000.
  - `GET /api/products?q=velocity&limit=5` total 1.
  - `GET /api/products?category=running&size=42&gender=men&sort=price_asc&limit=48` total 2, harga terurut.
  - `GET /api/products/stride-velocity-x` 16 varian, 3 gambar, 1 ulasan, 4 produk terkait.

### Belum selesai / batasan

- Belum ada automated UI test (Playwright/Vitest) — dijadwalkan Milestone 8.
- Mini-cart drawer, voucher nyata, dan validasi harga server saat checkout masuk Milestone 5.
- Cart tamu belum di-merge ke cart user (Milestone 4, butuh auth).
- Halaman akun/admin masih skeleton.

### Task berikutnya

Milestone 4: register, login, logout, profil, alamat, wishlist/cart user, merge guest cart.

---

## Milestone 4 — Authentication & User Features (selesai)

### Tujuan task

Register, login, logout, profil, alamat, cart dan wishlist milik user di database, serta merge cart/wishlist tamu setelah login.

### File dibuat

- `server/src/validators/common.js` (`parseOrThrow`, `validateBody`, `validateQuery`, `validateParams`)
- `server/src/validators/auth.validator.js`, `address.validator.js`, `cart.validator.js`, `wishlist.validator.js`
- `server/src/lib/token.js` (JWT sign/verify, opsi cookie)
- `server/src/middlewares/auth.js`, `csrf.js`, `rateLimit.js`
- `server/src/repositories/user.repository.js`, `address.repository.js`, `cart.repository.js`, `wishlist.repository.js`
- `server/src/services/user.service.js`, `address.service.js`, `cart.service.js`, `wishlist.service.js`
- `server/src/controllers/auth.controller.js`, `address.controller.js`, `cart.controller.js`, `wishlist.controller.js`
- `server/src/routes/auth.routes.js`, `address.routes.js`, `cart.routes.js`, `wishlist.routes.js`
- `client/src/store/memoryStore.js`, `authStore.js`
- `client/src/services/auth.js`, `address.js`, `cart.js`, `wishlist.js`
- `client/src/components/auth/ProtectedRoute.jsx`
- `tests/api-m4.mjs` (self-test API Milestone 4)

### File diubah

- `server/src/validators/product.validator.js` (re-export helper validasi dari `common.js`)
- `server/src/repositories/product.repository.js` (`cardInclude` diekspor untuk wishlist)
- `server/src/routes/index.js` (mount `/auth`, `/addresses`, `/cart`, `/wishlist`)
- `server/src/app.js` (middleware CSRF)
- `server/src/docs/openapi.js` (tag Auth/Addresses/Cart/Wishlist, cookie security, schema `AuthUser`/`Address`/`CartItem`/`Cart`, 18 path)
- `server/package.json` (dependency `bcrypt`, `jsonwebtoken`)
- `client/src/store/cartStore.js`, `wishlistStore.js` (mode guest localStorage + mode user server)
- `client/src/main.jsx` (`authStore.initialize()`)
- `client/src/pages/LoginPage.jsx`, `RegisterPage.jsx`, `AccountPage.jsx`
- `client/src/pages/ProductDetailPage.jsx`, `CartPage.jsx` (handle promise/error operasi cart)
- `client/src/App.jsx` (route `/akun` dilindungi `ProtectedRoute`)
- `client/src/components/layout/Header.jsx` (tautan akun/login sadar sesi, drawer)
- `PROGRESS.md`

### Fitur berhasil

- Auth: `POST /api/auth/register`, `/login`, `/logout`, `GET/PATCH /api/auth/me`. Password bcrypt, JWT httpOnly cookie `stride_token`, rate limit register/login, CSRF origin check, validasi Zod, `requireAuth`/`requireAdmin`.
- Profil: ubah nama dan telepon; email read-only; respons tidak membocorkan `passwordHash`.
- Alamat: CRUD `/api/addresses`, kepemilikan per user, satu alamat default otomatis, default berpindah saat dihapus.
- Cart user: `GET/DELETE /api/cart`, `POST /api/cart/items`, `PATCH/DELETE /api/cart/items/:id`, `POST /api/cart/merge`. Harga, stok, dan gambar selalu dari server; quantity dibatasi stok dan maksimum 10.
- Wishlist user: `GET/POST /api/wishlist`, `DELETE /api/wishlist/:productId`, `POST /api/wishlist/merge`.
- Merge tamu: cart memakai quantity maksimum, wishlist memakai union; item tidak valid ditolak dengan `rejectedCount`.
- Frontend: halaman login/register dengan redirect `next`, halaman akun (profil, alamat CRUD + default, tautan pesanan/notifikasi/wishlist, logout), proteksi route `/akun`, badge header mengikuti sesi, cart/wishlist tamu otomatis pindah ke server setelah login.
- Dokumentasi OpenAPI memuat endpoint dan schema Milestone 4; Swagger UI `/api/docs/` tetap 200.

### Pengujian

- `node tests/api-m4.mjs` — **34/34 lulus**: auth tanpa cookie 401, password salah 401, login valid + cookie, profil, tidak ada kebocoran hash, cart DB, tambah/ubah/hapus item, merge valid+invalid, wishlist tambah/hapus/merge, alamat seed + CRUD + default, alamat user lain 404, CSRF origin asing 403, register 201 + cookie, email duplikat 409, cart kosong user baru, logout 200.
- Headless Chrome (CDP) alur UI — **14/14 lulus**: guest `/akun` → login dengan `next`, login UI → `/akun`, nama tampil, profil+alamat tampil, cart tamu merge, wishlist tamu merge, cart lokal sinkron dari server, tambah alamat, simpan profil, logout ke beranda, cookie terhapus (`/auth/me` 401), `/akun` kembali ke login.
- `npm run lint` — 0 error.
- `npm run build` — sukses (`dist/assets/index-BaebFOwx.js` 372,01 kB, CSS 35,86 kB).
- `GET /api/docs/` dan `GET /api/docs/openapi.json` — 200, spec `3.0.3`, 18 path.
- Database di-seed ulang setelah pengujian agar state deterministik.

### Belum selesai / batasan

- Checkout, voucher, ongkir, dan Midtrans belum ada (Milestone 5).
- Halaman riwayat pesanan `/pesanan` masih skeleton; tautan dari akun sudah tersedia.
- Notifikasi masih seed/read-only, belum ada UI.
- Rate limit disimpan di memori proses (cukup untuk development, perlu store bersama saat multi-instance).
- Belum ada automated test framework resmi; `tests/api-m4.mjs` adalah self-test mandiri.
- Reset password/verifikasi email belum termasuk lingkup Milestone 4.

### Task berikutnya

Milestone 5: checkout, validasi ulang cart, alamat pengiriman, voucher `STRIDE10`, perhitungan ongkir, pembuatan order, dan integrasi Midtrans (mode sandbox dengan env kosong sampai kredensial diisi).

---

## Milestone 5 — Checkout & Payment (selesai)

### Tujuan task

Checkout bertahap (alamat → pengiriman → pembayaran), voucher, shipping adapter, order service dengan reservasi stok, Midtrans Snap, webhook terverifikasi/idempoten, dan status pembayaran dari backend.

### File dibuat

- `server/src/lib/shipping/mock.provider.js`, `server/src/lib/shipping/index.js`
- `server/src/lib/payment/index.js`, `midtrans.provider.js`, `mock.provider.js`
- `server/src/utils/money.js`
- `server/src/repositories/order.repository.js`, `coupon.repository.js`, `payment.repository.js`
- `server/src/services/order.service.js`, `payment.service.js`
- `server/src/validators/order.validator.js`, `payment.validator.js`
- `server/src/controllers/order.controller.js`, `payment.controller.js`, `shipping.controller.js`
- `server/src/routes/order.routes.js`, `payment.routes.js`, `shipping.routes.js`
- `client/src/services/order.js`, `shipping.js`, `payment.js`
- `client/src/utils/snap.js`
- `client/src/components/account/AddressForm.jsx` (form alamat dipakai ulang)
- `tests/api-m5.mjs` (self-test API Milestone 5)

### File diubah

- `server/src/config/env.js` (`ORDER_EXPIRY_HOURS`)
- `server/src/routes/index.js` (mount `/orders`, `/shipping`, `/payments`)
- `server/src/repositories/cart.repository.js` (`client` transaksi opsional)
- `server/src/docs/openapi.js` (tag Orders/Shipping/Payments, schema `Order`, `OrderItem`, `Payment`, `PaymentConfig`, `ShippingService`, `CheckoutPreview`, `PaymentStatus`, 8 path)
- `client/src/pages/CheckoutPage.jsx` (alur 3 langkah, alamat, voucher, ongkir mock, order, Snap/mock)
- `client/src/pages/OrderStatusPage.jsx` (status backend, lanjut bayar, simulasi mock, refresh)
- `client/src/pages/AccountPage.jsx` (memakai `AddressForm` bersama)
- `client/src/store/cartStore.js` (`refresh()` setelah checkout)
- `client/src/App.jsx` (route `/checkout` dan status pesanan dilindungi)
- `.env.example`, `server/.env` (`ORDER_EXPIRY_HOURS`, Midtrans key kosong), `docs/DECISIONS.md` (D-003)
- `PROGRESS.md`

### Fitur berhasil

- Checkout 3 langkah: pilih/tambah alamat, pilih layanan pengiriman, ringkasan + voucher + catatan + Bayar Sekarang.
- `POST /api/orders/preview` menghitung ulang item, subtotal, voucher, ongkir, total dari database.
- `POST /api/orders`: validasi kepemilikan alamat, hitung ulang harga, validasi stok, buat snapshot item, reservasi `Inventory.reserved`, catat usage voucher, kosongkan cart — seluruhnya dalam satu transaksi.
- Order number unik `STR-YYYYMMDD-XXXXXX`, status awal `PENDING_PAYMENT`, masa berlaku `ORDER_EXPIRY_HOURS`.
- Voucher `STRIDE10`/`STRIDE50`/`NEWMEMBER`: periode, kuota total, batas per user, minimum belanja, cap diskon.
- Shipping adapter mock (JNE REG/YES, J&T EZ, SiCepat REG/BEST) dengan label `isMock` dan peringatan tarif.
- Payment abstraction: Midtrans Snap bila kedua key terisi; mock development bila kosong (D-003).
- `POST /api/payments/midtrans/snap-token`, webhook `POST /api/payments/midtrans/notification` (verifikasi SHA512, validasi nominal, idempoten via `PaymentEvent.eventKey`), `GET /api/payments/:orderNumber/status` dengan rekonsiliasi best-effort, `POST /api/payments/mock/settle` khusus development.
- Transisi: settlement → `PAID` + stok dikonsumsi + shipment dibuat; cancel/expire/deny/failure → stok dirilis + voucher dikembalikan; refund/chargeback → `REFUNDED`.
- Frontend memuat Snap dinamis hanya pada mode `midtrans`; mode mock mengarah ke halaman pending dengan tombol simulasi.
- Swagger UI tetap tersedia di `/api/docs/`.

### Pengujian

- `node tests/api-m5.mjs` — **44/44 lulus**: shipping mock, preview, voucher valid/invalid, ongkir, total, layanan invalid, pembuatan order, snapshot, reservasi stok, pengosongan cart, usage voucher, kepemilikan order, token mock, signature salah 403, settlement, konsumsi stok, pembuatan shipment, replay idempoten, cancel melepas reservasi, mock settle, config, preview cart kosong.
- Headless Chrome (CDP) alur checkout — **27/27 lulus**: guard guest, persiapan cart, checkout tampil, voucher `STRIDE10`, langkah pengiriman mock, ringkasan pembayaran, order pending, simulasi settlement, backend `PAID`/`SETTLEMENT`, cart kosong, shipment dibuat.
- `npm run lint` — 0 error.
- `npm run build` — sukses.
- `GET /api/docs/` dan `GET /api/docs/openapi.json` — 200, spec `3.0.3`, memuat path Milestone 5.
- Database di-seed ulang setelah pengujian agar state deterministik.

### Belum selesai / batasan

- Midtrans sandbox belum memakai kredensial nyata; seluruh alur pembayaran diuji pada mode `mock`. Isi `MIDTRANS_SERVER_KEY` + `MIDTRANS_CLIENT_KEY` di `server/.env` untuk mengaktifkan Snap.
- Tarif/estimasi pengiriman adalah mock development, bukan tarif kurir aktual.
- Endpoint `POST /api/payments/mock/settle` sengaja hanya untuk development.
- Riwayat pesanan `/pesanan`, tracking, notifikasi, email, dan halaman bantuan masih Milestone 6.
- Rate limit masih in-memory; simulasi stok memakai transaksi Prisma tanpa row lock eksplisit (cukup untuk SQLite development).

### Task berikutnya

Milestone 6: riwayat pesanan, pencarian nomor order, tracking pengiriman, notifikasi, email, halaman bantuan/contact/news, sitemap, dan halaman statis.

---

## Milestone 6 — Riwayat Pesanan, Notifikasi & Konten (selesai)

### Tujuan task

Riwayat pesanan dengan pencarian/filter/pagination, tracking pengiriman terpisah dari pembayaran, notifikasi user, adapter email development, halaman bantuan, kontak, news, sitemap dinamis, dan konten halaman statis.

### File dibuat

Server:

- `server/src/lib/email/index.js`
- `server/src/services/email.service.js`, `notification.service.js`, `help.service.js`, `news.service.js`, `contact.service.js`, `sitemap.service.js`
- `server/src/repositories/notification.repository.js`, `help.repository.js`, `news.repository.js`, `contact.repository.js`, `sitemap.repository.js`
- `server/src/validators/notification.validator.js`, `content.validator.js`
- `server/src/controllers/notification.controller.js`, `help.controller.js`, `news.controller.js`, `contact.controller.js`, `sitemap.controller.js`
- `server/src/routes/notification.routes.js`, `help.routes.js`, `news.routes.js`, `contact.routes.js`, `sitemap.routes.js`

Client:

- `client/src/services/content.js`, `notification.js`
- `client/src/utils/query.js`, `orderStatus.js`
- `client/src/data/staticPages.js`

Testing:

- `tests/api-m6.mjs` (self-test API Milestone 6)

### File diubah

- `server/src/config/env.js` (`EMAIL_MODE`, `EMAIL_FROM`, `STORE_EMAIL`)
- `server/src/routes/index.js` (mount `/notifications`, `/contact`, `/help`, `/news`, `/sitemap`)
- `server/src/repositories/order.repository.js` (list/count order, event shipment)
- `server/src/services/order.service.js` (list order, notifikasi order dibuat, email order, serialisasi tracking)
- `server/src/services/payment.service.js` (notifikasi & email status pembayaran)
- `server/src/controllers/order.controller.js`, `server/src/routes/order.routes.js`, `server/src/validators/order.validator.js` (`GET /orders`)
- `server/src/docs/openapi.js` (tag Notifications/Help/News/Contact/Sitemap, schema terkait, 11 path baru)
- `.env.example`, `server/.env` (konfigurasi email)
- `client/src/services/catalog.js`, `order.js` (pakai `toQueryString`, `orderApi.list`)
- `client/src/components/ui/States.jsx` (`EmptyState` menerima `icon`)
- `client/src/pages/OrdersPage.jsx`, `OrderDetailPage.jsx`, `NotificationsPage.jsx`, `HelpPage.jsx`, `HelpArticlePage.jsx`, `ContactPage.jsx`, `NewsPage.jsx`, `NewsDetailPage.jsx`, `SitemapPage.jsx`, `StaticInfoPage.jsx`
- `client/src/App.jsx` (proteksi `/pesanan`, `/pesanan/:orderId`, `/notifikasi`; konten halaman statis)
- `PROGRESS.md`

### Fitur berhasil

- `GET /api/orders` milik user: pencarian nomor pesanan, filter status, pagination; user lain tidak dapat melihat pesanan.
- Serialisasi order memuat `shipment.trackingNumber`, `shippedAt`, `deliveredAt`, `estimatedArrival`, dan `events`; status pembayaran tetap terpisah dari status pengiriman.
- Notifikasi: daftar, filter tipe/belum dibaca, jumlah unread, tandai satu, tandai semua; dibuat otomatis saat order dibuat, pembayaran berhasil, dan status terminal (`CANCELLED`/`EXPIRED`/`FAILED`).
- Email development: adapter `EMAIL_MODE=log` mencatat email ke log; SMTP nyata belum dikonfigurasi.
- Bantuan: pencarian, kategori, daftar, detail, artikel terkait.
- News: filter kategori, sorting terbaru/populer, pencarian, detail dengan produk terkait, artikel lainnya, dan penambahan view count.
- Kontak: informasi operasional, tombol telepon/email, formulir tervalidasi, rate limit 5/15 menit, pesan tersimpan di database, notifikasi email log.
- Sitemap dinamis: kategori, grup gender (Pria/Wanita/Anak/Unisex), seluruh produk sebagai link.
- Halaman statis `/delivery`, `/payment-options`, `/privacy`, `/terms`, `/sales-terms` berisi konten lengkap.
- UI: daftar pesanan dengan pencarian/filter/pagination, detail pesanan dengan stepper, resi + tombol salin, timeline gabungan, kartu pembayaran, alamat; halaman notifikasi dengan filter dan aksi baca; halaman bantuan/kontak/news/sitemap responsif.
- Route `/pesanan`, `/pesanan/:orderId`, dan `/notifikasi` dilindungi `ProtectedRoute`; backend tetap memvalidasi kepemilikan.

### Pengujian

- `node tests/api-m6.mjs` — **52/52 lulus**: guard login, daftar/pagination order, pencarian, filter status, isolasi user, detail + timeline + resi + event + estimasi, pemisahan status bayar/kirim, notifikasi (list/filter/tandai satu/tandai semua/isolasi user), bantuan (list/search/kategori/detail/terkait/404), news (list/sort/kategori/detail/produk terkait/artikel lain/view count/404), kontak (201, tersimpan DB, validasi 422), sitemap (5 kategori, grup gender, 24 produk).
- Headless Chrome (CDP) alur UI Milestone 6 — **61/61 lulus**: redirect guest, daftar/pencarian/filter pesanan, detail pesanan + stepper + resi + salin + timeline, notifikasi + tandai semua + filter, bantuan + search + kategori + detail, kontak (info, tombol tel/mailto, submit sukses), news (filter, sort, detail, produk terkait), sitemap (24 produk, 5+ kategori), dan lima halaman statis.
- `npm run lint` — 0 error.
- `npm run build` — sukses.
- `GET /api/docs/` — 200; `GET /api/docs/openapi.json` — spec `3.0.3`, **38 path** (memuat Notifications/Help/News/Contact/Sitemap dan `GET /orders`).
- Database di-seed ulang setelah pengujian agar state deterministik.

### Belum selesai / batasan

- Email hanya mode `log`; belum ada pengiriman SMTP nyata atau template HTML.
- Tarif dan event pengiriman tetap mock development; pembaruan resi nyata belum terhubung ke kurir.
- Notifikasi promo belum dibuat otomatis oleh scheduler; endpoint dan UI sudah siap.
- Rate limit masih in-memory.
- Admin dashboard, pengelolaan konten, dan fitur Milestone 7 belum dikerjakan.

### Task berikutnya

Milestone 7: admin dashboard (produk, stok, order, konten), pengelolaan status pengiriman/resi, dan fitur operasional lanjutan sesuai `plan.md` §12.

---

## Milestone 7 — Admin Dashboard (selesai)

### Tujuan task

Dashboard operasional khusus role `ADMIN` untuk mengelola katalog, gambar, varian, stok, kategori, pesanan, status pengiriman/resi, news, bantuan, dan voucher tanpa mengubah database secara manual.

### File dibuat

Server:

- `server/src/validators/admin.validator.js`
- `server/src/services/admin.service.js`
- `server/src/controllers/admin.controller.js`
- `server/src/routes/admin.routes.js`

Client:

- `client/src/services/admin.js`
- `client/src/components/auth/AdminRoute.jsx`
- `client/src/pages/AdminPage.jsx`
- `client/src/components/admin/AdminUI.jsx`, `adminUtils.js`
- `client/src/components/admin/AdminDashboard.jsx`, `AdminProducts.jsx`, `AdminCategories.jsx`
- `client/src/components/admin/AdminOrders.jsx`
- `client/src/components/admin/AdminNews.jsx`, `AdminHelp.jsx`, `AdminCoupons.jsx`

Testing:

- `tests/api-m7.mjs` (self-test API Milestone 7)

### File diubah

- `server/src/routes/index.js` (mount `/admin`)
- `server/src/middlewares/errorHandler.js` (pemetaan error Prisma `P2002`/`P2003`/`P2025`)
- `server/src/services/order.service.js` (guard reservasi agar tidak negatif saat rilis stok)
- `server/src/docs/openapi.js` (tag Admin + 20 path admin; total 58 path)
- `client/src/App.jsx` (route `/admin` dilindungi `AdminRoute`)
- `client/src/pages/AccountPage.jsx` (kartu akses dashboard admin untuk role `ADMIN`)
- `PROGRESS.md`

### Fitur berhasil

- Seluruh `/api/admin/*` memakai `authenticate` + `requireAdmin`: guest `401`, user biasa `403`.
- Dashboard ringkasan: pendapatan, total pesanan per status, produk tayang/draft, pengguna, stok menipis, dan pesanan terbaru.
- Produk: daftar dengan pencarian/filter status/kategori/pagination, buat, ubah, soft delete (`deletedAt`), slug & SKU otomatis, validasi harga diskon.
- Gambar produk: tambah, ubah, jadikan utama, hapus dengan promosi gambar utama otomatis.
- Varian & stok: tambah varian, ubah atribut, aktif/nonaktif, update kuantitas dan ambang stok.
- Kategori: daftar termasuk nonaktif, buat, ubah, nonaktifkan; kategori dengan produk aktif ditolak `409`.
- Pesanan: daftar semua pesanan dengan pencarian/filter/pagination, detail pelanggan/pembayaran/pengiriman/item/riwayat.
- Transisi status pesanan tervalidasi: `PENDING_PAYMENT → PAID/CANCELLED/EXPIRED`, `PAID → PROCESSING/CANCELLED/REFUNDED`, `PROCESSING → SHIPPED/CANCELLED`, `SHIPPED → DELIVERED`, `DELIVERED → REFUNDED`.
- Dampak stok: `PAID` mengonsumsi stok & reservasi serta membuat shipment; pembatalan pending melepas reservasi; pembatalan/refund sebelum kirim mengembalikan stok dan kuota voucher.
- Pengiriman: update status kurir, nomor resi, estimasi tiba, keterangan; event pengiriman tercatat; status kurir `PICKED_UP`/`IN_TRANSIT`/`SHIPPED` memajukan order ke `SHIPPED`, `DELIVERED` memajukan ke `DELIVERED`.
- Setiap perubahan status mengirim notifikasi user dan email mode log.
- News: CRUD penuh termasuk produk terkait (kompatibel Prisma 4 SQLite tanpa `createMany`).
- Bantuan: CRUD penuh dengan urutan dan status publikasi.
- Voucher: CRUD, validasi persen maksimal 100 dan kode unik, nonaktifkan (soft), filter aktif/nonaktif/kedaluwarsa.
- UI admin bertab (`/admin?tab=<id>`) untuk Ringkasan, Produk, Kategori, Pesanan, News, Bantuan, Voucher; guard `Akses Ditolak` untuk non-admin; tautan admin di halaman akun.

### Pengujian

- `node tests/api-m7.mjs` — **67/67 lulus**: otorisasi (guest/user/admin), dashboard, CRUD produk + validasi + SKU duplikat, gambar & promosi utama, varian & stok, kategori + proteksi `409`, daftar/filter/detail pesanan, transisi tidak valid `409`, update resi & event, pembatalan pending + reservasi tidak negatif, siklus `PAID → PROCESSING → SHIPPED → DELIVERED → REFUNDED` + pengurangan stok, notifikasi, news CRUD + produk terkait, bantuan CRUD, voucher CRUD + validasi, dan soft delete produk.
- Headless Chrome (CDP) alur UI Milestone 7 — **42/42 lulus**: redirect guest, login admin, dashboard, tab produk (buat produk, kelola gambar, tambah varian, simpan stok), kategori, pesanan (detail + ubah status), news, bantuan, voucher, penolakan user biasa, dan redirect guest.
- `npm run lint` — 0 error.
- `npm run build` — sukses (hanya peringatan ukuran chunk).
- `GET /api/docs/` — 200; `GET /api/docs/openapi.json` — spec `3.0.3`, **58 path** (20 path `/admin`).
- Database di-seed ulang setelah pengujian agar state deterministik.

### Belum selesai / batasan

- Email tetap mode `log`; belum ada SMTP nyata.
- Pembaruan resi/kurir masih manual; belum ada webhook kurir nyata.
- Rate limit masih in-memory.
- Upload gambar memakai URL, belum ada unggah file ke storage.
- Aksi refund tidak memanggil Midtrans refund API; hanya menandai status dan menyesuaikan stok.
- Belum ada audit log terpisah selain `OrderStatusHistory` dan `ShipmentEvent`.

### Task berikutnya

Milestone 8 sesuai `plan.md` (finalisasi: hardening, dokumentasi deployment, dan pemeriksaan menyeluruh).

## Akun Demo Pengujian

### Tujuan

Menambah satu akun demo agar seluruh fitur aplikasi bisa dicoba tanpa mengubah data akun `user@stride.local`.

### File diubah

- `server/prisma/seed.js`: menambah user `demo@stride.local`, alamat default, wishlist 2 produk, cart 1 item, dan 1 notifikasi sambutan.
- `README.md`: menambah baris kredensial DEMO dan penjelasan isi akun.
- `PROGRESS.md`: mencatat perubahan dan hasil verifikasi.

### Kredensial

| Role | Email | Password |
| --- | --- | --- |
| USER (demo) | `demo@stride.local` | `Demo#12345` |

### Fitur berhasil

- Login demo berhasil sebagai role `USER`.
- Akun demo punya alamat default, 2 item wishlist, 1 item cart, dan 1 notifikasi belum dibaca.
- Tidak punya riwayat pesanan agar alur checkout bisa diuji dari awal.
- Seed tetap deterministik: total user menjadi 3.

### Pengujian

- `npm run seed --workspace server` - sukses (`users: 3`, `orders: 2`, `reviews: 2`).
- `POST /api/auth/login` demo - 200; `GET /api/auth/me` mengembalikan `Demo Runner` role `USER`.
- `GET /api/addresses` - 1 alamat default; `GET /api/cart` - 1 item; `GET /api/wishlist` - 2 item; `GET /api/notifications` - 1 notifikasi.
- Database di-seed ulang setelah verifikasi agar state deterministik.

### Belum selesai / batasan

- Akun demo tidak punya riwayat pesanan; data pesanan contoh tetap hanya pada `user@stride.local`.

## Milestone 8 — Final QA & Release (selesai)

### Tujuan task

Finalisasi: unit/integration/E2E test, review keamanan, pengujian responsive, SEO, performa, konfigurasi production, dokumentasi, dan persiapan deployment.

### File dibuat

Testing:

- `server/tests/unit/pricing.test.js`, `orderStatus.test.js`, `midtransSignature.test.js`, `shipping.test.js`, `validation.test.js`, `money.test.js`
- `tests/api-m8.mjs` (keamanan, SEO, penerimaan akhir)
- `tests/e2e-main.mjs` (alur utama + responsive + SEO)

Server:

- `server/src/utils/pricing.js` (stok tersedia, diskon, total order)
- `server/src/utils/orderStatus.js` (matriks transisi status)
- `server/src/utils/midtransSignature.js` (SHA-512 + `timingSafeEqual`)
- `server/src/services/seo.service.js`, `controllers/seo.controller.js`, `routes/seo.routes.js`
- `server/prisma/schema.postgresql.prisma` (schema provider PostgreSQL)
- `server/prisma/create-admin.js` (buat admin production tanpa seed/manual DB)

Dokumentasi dan konfigurasi:

- `docs/DEPLOYMENT.md`
- `docs/SECURITY-REVIEW.md`
- `docs/TESTING.md`
- `.env.production.example`

### File diubah

- `server/package.json` — Vitest, script `test`/`test:watch`, script `prisma:*:pg`, `create-admin`.
- `server/src/config/env.js` — `SITE_URL`; validasi production: `JWT_SECRET` ≥ 32 karakter, `DATABASE_URL`, origin HTTPS, `SITE_URL` HTTPS; ekspor `siteUrl` dan `midtransConfigured`.
- `server/src/app.js` — mount `/sitemap.xml` dan `/robots.txt`.
- `server/src/services/order.service.js`, `cart.service.js`, `admin.service.js`, `server/src/lib/payment/midtrans.provider.js` — memakai helper teruji (harga, stok, transisi, signature).
- `client/src/hooks/useDocumentTitle.js` — title, description, robots, canonical, Open Graph, Twitter, JSON-LD.
- `client/src/App.jsx` — seluruh halaman `React.lazy`; `client/src/layouts/MainLayout.jsx` — `Suspense` fallback.
- `client/src/components/layout/Header.jsx`, `BottomNav.jsx`, `layouts/MainLayout.jsx` — breakpoint navigasi `md` → `lg` untuk memperbaiki overflow 768 px.
- `client/vite.config.js` — proxy dev `/sitemap.xml` dan `/robots.txt`.
- `client/index.html` — robots default, Open Graph, Twitter.
- Halaman client: metadata/noindex untuk beranda, belanja, kategori, PDP (Product JSON-LD), news/help detail, halaman statis, kontak, sitemap, akun, cart, checkout, pesanan, notifikasi, wishlist, login/register, admin, 404.
- `client/src/pages/LoginPage.jsx` — kredensial akun demo.
- `.env.example` — `SITE_URL`.
- `README.md`, `PROGRESS.md`.

### Fitur berhasil

- **Unit test Vitest**: harga/diskon/voucher, ongkir, validasi ukuran/stok, transisi status, signature Midtrans, format uang.
- **Integration test API** M4–M8 mencakup auth, katalog, cart/wishlist, checkout, pembayaran, konten, admin, keamanan, dan SEO.
- **E2E Chrome headless**: guest browse → pilih ukuran → cart → login → merge cart → alamat → pengiriman → pembayaran mock → status → riwayat.
- **Keamanan**: header Helmet, CORS whitelist, CSRF origin check, cookie httpOnly + SameSite, rate limit, Zod, bcrypt, otorisasi role, isolasi pesanan, signature webhook, error tanpa stack trace, konfigurasi production fail-fast.
- **SEO**: `robots.txt` dan `sitemap.xml` dinamis dari database; metadata, canonical, Open Graph, Twitter, JSON-LD di client.
- **Performa**: route-level code splitting; chunk utama turun dari ±518 kB menjadi 287,41 kB (gzip 91,66 kB).
- **Responsive**: 375/768/1280 px tanpa overflow horizontal; bottom nav mobile, nav desktop pada `lg`.
- **Deployment**: schema PostgreSQL terpisah, script Prisma production, pembuatan admin production, panduan Vercel/Netlify/Render/Railway/VPS, webhook Midtrans, backup/restore, rollback.

### Pengujian

- `npm test --workspace server` — **30/30 lulus** (6 file).
- `node tests/api-m4.mjs` — **34/34 lulus**.
- `node tests/api-m5.mjs` — **44/44 lulus**.
- `node tests/api-m6.mjs` — **52/52 lulus**.
- `node tests/api-m7.mjs` — **67/67 lulus**.
- `node tests/api-m8.mjs` — **34/34 lulus**.
- `node tests/e2e-main.mjs` — **35/35 lulus**; console browser bersih.
- `npm run lint` — 0 error.
- `npm run build` — sukses dengan chunk per route.
- `prisma validate --schema prisma/schema.postgresql.prisma` — valid (dengan `DATABASE_URL` PostgreSQL).
- `npm audit --omit=dev` — 0 kerentanan production; 5 moderate hanya pada devDependencies (`eslint`, `nodemon`, `minimatch`).
- Database di-seed ulang setelah seluruh pengujian agar state deterministik.

### Belum selesai / batasan

- Rate limit masih in-memory (reset saat restart, tidak dibagi antar instance).
- Email masih `EMAIL_MODE=log`; adapter SMTP belum ada.
- Ongkir masih mock; belum ada adapter kurir nyata.
- Refund admin tidak memanggil Midtrans Refund API.
- Gambar produk berupa URL aset; belum ada upload/storage file.
- Meta SEO dinamis di-render client-side; crawler tanpa JavaScript tidak melihatnya (sitemap/robots sudah server-side).
- Belum ada 2FA admin, verifikasi email, audit log admin terpisah, load test, dan visual regression test.
- Folder migration saat ini untuk SQLite; production memakai `prisma db push` dengan `schema.postgresql.prisma`.

### Task berikutnya

Tidak ada milestone tersisa. Sebelum produksi nyata: Redis rate limit, SMTP nyata, Midtrans production + uji webhook, 2FA admin, pentest, dan backup teruji. Lihat `docs/SECURITY-REVIEW.md` dan `docs/DEPLOYMENT.md`.
