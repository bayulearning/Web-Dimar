# TESTING — Stride Athletics

Panduan dan matriks pengujian Milestone 8. Semua pengujian dijalankan terhadap kode aktual; angka di bawah adalah hasil run terakhir.

## 1. Ringkasan hasil

| Lapisan | Perintah | Hasil |
| --- | --- | --- |
| Unit (Vitest) | `npm test --workspace server` | 6 file, **30/30 lulus** |
| Integration/API M4 | `node tests/api-m4.mjs` | **34/34 lulus** |
| Integration/API M5 | `node tests/api-m5.mjs` | **44/44 lulus** |
| Integration/API M6 | `node tests/api-m6.mjs` | **52/52 lulus** |
| Integration/API M7 | `node tests/api-m7.mjs` | **67/67 lulus** |
| Integration/API M8 | `node tests/api-m8.mjs` | **34/34 lulus** |
| End-to-end | `node tests/e2e-main.mjs` | **35/35 lulus** |
| Lint | `npm run lint` | 0 error |
| Build | `npm run build` | sukses, route chunk terpisah |

Total: 30 unit test, 231 assertion API, 35 assertion E2E.

## 2. Prasyarat

- Node.js 20+ (diuji Node 22), npm 10+.
- Database sudah dimigrasi dan di-seed:
  ```bash
  npm run prisma:migrate --workspace server
  npm run seed --workspace server
  ```
- Backend berjalan di `http://localhost:3000` untuk test API.
- Backend + frontend (`http://localhost:5173`) berjalan untuk E2E.
- Chrome terpasang di `C:\Program Files (x86)\Google\Chrome\Application\chrome.exe` (atau set `CHROME_PATH`).

Test API dan E2E **mengubah database**. Selalu reseed sebelum menjalankan ulang agar hasil konsisten:

```bash
npm run seed --workspace server
```

## 3. Unit test (Vitest)

Lokasi: `server/tests/unit/`.

| File | Cakupan |
| --- | --- |
| `pricing.test.js` | Stok tersedia, diskon persen/nominal, batas `maxDiscount`, total order, input tidak valid |
| `orderStatus.test.js` | Transisi status pesanan, lompatan status, status terminal |
| `midtransSignature.test.js` | SHA-512 sesuai dokumentasi Midtrans, signature valid/salah/kosong |
| `shipping.test.js` | Daftar layanan mock, pencarian layanan, penolakan layanan tidak ada, estimasi tiba |
| `validation.test.js` | Validasi cart (quantity 1–10), voucher uppercase, status/limit query |
| `money.test.js` | Format rupiah, nilai tidak valid |

Menjalankan:

```bash
npm test --workspace server
# watch mode
npm run test:watch --workspace server
```

## 4. Integration/API test

Script mandiri (Node `fetch`) yang memanggil API nyata dan memeriksa database. Jalankan backend lebih dulu.

| Script | Fokus |
| --- | --- |
| `tests/api-m4.mjs` | Register, login, profil, alamat, cart, wishlist, isolasi user |
| `tests/api-m5.mjs` | Preview checkout, voucher, ongkir, pembuatan order, pembayaran mock, stok/reservasi, notifikasi idempoten, cancel |
| `tests/api-m6.mjs` | Riwayat/detail pesanan, timeline, notifikasi, konten bantuan/news, kontak, sitemap API |
| `tests/api-m7.mjs` | Admin dashboard, CRUD produk/kategori/konten/voucher, transisi pesanan, shipment, otorisasi admin |
| `tests/api-m8.mjs` | Header keamanan, CORS/CSRF, eskalasi role, isolasi pesanan, validasi, error tanpa stack trace, robots/sitemap, OpenAPI, 404 |

Contoh:

```bash
npm run seed --workspace server
node tests/api-m4.mjs
```

Urutan yang disarankan: reseed → M4 → reseed → M5 → reseed → M6 → reseed → M7 → reseed → M8.

## 5. End-to-end test

`tests/e2e-main.mjs` mengemudikan Chrome headless via CDP (port default 9229) dan mencakup:

1. Beranda tampil; title, description, canonical, Open Graph, robots, JSON-LD.
2. Buka katalog, pilih produk, pilih ukuran, tambah ke keranjang.
3. Guest checkout diarahkan ke login dengan `next`.
4. Login akun demo, cart guest digabung, kembali ke checkout.
5. Pilih alamat, metode pengiriman, ringkasan pembayaran, buat pesanan.
6. Status menunggu pembayaran; simulasi pembayaran mock → `SETTLEMENT`.
7. Pesanan baru muncul di riwayat.
8. Responsive 375/768/1280 tanpa overflow horizontal; bottom nav mobile dan nav desktop sesuai breakpoint.
9. Tidak ada error console kritis.

Prasyarat: backend :3000, frontend :5173, DB baru di-seed.

```bash
npm run seed --workspace server
node tests/e2e-main.mjs
```

Konfigurasi opsional: `FRONTEND_URL`, `CHROME_PATH`, `CDP_PORT`, `CHROME_PROFILE`.

Test memakai akun `demo@stride.local` / `Demo#12345` dan membuat satu pesanan baru. Reseed setelah selesai bila database ingin bersih.

## 6. Pemetaan ke plan §17

| Requirement plan | Implementasi |
| --- | --- |
| Perhitungan harga, diskon, voucher | `pricing.test.js`, `api-m5.mjs`, `validation.test.js` |
| Ongkir | `shipping.test.js`, `api-m5.mjs` |
| Validasi ukuran dan stok | `validation.test.js`, `api-m4.mjs`, `api-m5.mjs` |
| Order status transition | `orderStatus.test.js`, `api-m7.mjs` |
| Verifikasi signature Midtrans | `midtransSignature.test.js`, `api-m5.mjs` |
| Register dan login | `api-m4.mjs`, `api-m8.mjs`, E2E |
| API produk dan database | Regresi katalog via E2E; CRUD produk via `api-m7.mjs` |
| Cart dan wishlist | `api-m4.mjs`, E2E |
| Order creation | `api-m5.mjs`, E2E |
| Payment notification | `api-m5.mjs` (mock settle + replay), `api-m8.mjs` |
| Inventory update | `api-m5.mjs`, `pricing.test.js` |
| Authorization admin | `api-m7.mjs`, `api-m8.mjs` |
| Responsive | E2E viewport 375/768/1280 |
| SEO | E2E meta/JSON-LD, `api-m8.mjs` robots/sitemap |
| Security | `api-m8.mjs`, `docs/SECURITY-REVIEW.md` |

## 7. Batasan pengujian

- Test API dan E2E memakai database development SQLite dan data seed; bukan test paralel/CI terisolasi.
- E2E membutuhkan Chrome lokal dan server berjalan; tidak termasuk dalam `npm test`.
- Belum ada test beban (load test), test aksesibilitas otomatis (axe), dan visual regression.
- Pembayaran diuji pada mode `mock`; webhook Midtrans nyata memerlukan sandbox + ngrok.
- Email hanya mode `log`; pengiriman nyata belum diuji.
- Tidak ada automated test untuk upload file karena fitur upload belum ada.
- Angka lulus di atas berasal dari run terakhir pada 11 November 2026; jalankan ulang setelah perubahan kode.
