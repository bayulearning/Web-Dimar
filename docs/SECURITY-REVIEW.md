# SECURITY REVIEW — Stride Athletics

Review keamanan Milestone 8. Fokus: kontrol yang diterapkan, hasil verifikasi, batasan, dan risiko residual. Bukan pengganti pentest eksternal.

## 1. Ruang lingkup

- API Express (`server/src`), middleware, validasi, autentikasi, otorisasi, pembayaran, dan admin.
- Frontend React (`client/src`) untuk penyimpanan token, rendering, dan alur checkout.
- Konfigurasi production (`server/src/config/env.js`, `.env.production.example`).
- Endpoint SEO (`/robots.txt`, `/sitemap.xml`).

Di luar ruang lingkup: pentest infrastruktur, WAF, keamanan platform hosting, dan audit kode dependency mendalam.

## 2. Kontrol keamanan

### Header dan transport

- `helmet()` mengaktifkan CSP, `X-Content-Type-Options`, `X-Frame-Options`, HSTS, Referrer-Policy, dan lainnya (`server/src/app.js`).
- `app.disable("x-powered-by")` menghilangkan `X-Powered-By`.
- `app.set("trust proxy", 1)` agar IP klien dan cookie `Secure` benar di belakang reverse proxy.
- Production mewajibkan `SITE_URL` dan `CLIENT_ORIGIN` HTTPS.

### CORS dan CSRF

- CORS hanya mengizinkan origin di `CLIENT_ORIGIN`; origin lain → 403 (`server/src/app.js`).
- `credentials: true` diperlukan untuk cookie httpOnly.
- Middleware CSRF memeriksa `Origin`/`Referer` pada `POST/PUT/PATCH/DELETE`; request lintas situs → 403 (`server/src/middlewares/csrf.js`).
- Request non-browser tanpa `Origin`/`Referer` diizinkan agar health check/curl tetap bekerja; ini tidak membuka CSRF karena browser selalu mengirim `Origin` pada request lintas situs.

### Autentikasi dan sesi

- Password di-hash bcrypt cost 10 (`server/src/services/user.service.js`).
- JWT disimpan di cookie `httpOnly`; tidak ada token di `localStorage`.
- Cookie production: `Secure` + `SameSite=None`; development: `SameSite=Lax` (`server/src/lib/token.js`).
- `authenticate` memuat ulang user dari database dan menolak user nonaktif/terhapus, sehingga perubahan role atau penonaktifan akun langsung berlaku.
- Login/register dibatasi rate limit: login 20 percobaan/15 menit, register 10/jam, kontak 5/15 menit (`server/src/routes/auth.routes.js`, `contact.routes.js`).
- Pesan gagal login tidak membedakan email tidak terdaftar dan password salah.
- Register mengabaikan `role` dari body; akun baru selalu `USER`.

### Otorisasi

- `requireAuth` dan `requireAdmin` pada route privat/admin (`server/src/middlewares/auth.js`).
- Seluruh modul admin berada di `/api/admin` dan dilindungi `requireAdmin`.
- Data pesanan difilter berdasarkan `userId` pemilik; user tidak dapat membaca pesanan user lain.
- Perubahan status pesanan hanya melalui transisi yang diizinkan (`server/src/utils/orderStatus.js`).
- Endpoint admin tidak bergantung pada role dari frontend.

### Validasi dan injeksi

- Semua input divalidasi Zod (body, query, param) sebelum service.
- Akses database melalui Prisma (query parameterized), bukan string SQL.
- `express.json({ limit: "1mb" })` membatasi payload.
- JSON rusak → 400 dengan format error standar.
- Harga, diskon, ongkir, dan stok dihitung ulang di backend; harga frontend tidak dipercaya.
- Voucher divalidasi backend (masa berlaku, kuota, minimum belanja).

### Error handling dan logging

- Error terpusat (`server/src/middlewares/errorHandler.js`); stack trace hanya ke log server, tidak ke respons.
- Prisma error umum dipetakan ke pesan aman (409/404).
- Logger terstruktur mencatat method, path, status, dan durasi tanpa password/token.
- Respons 404 dan error memakai format konsisten.

### Pembayaran

- Signature Midtrans SHA-512 diverifikasi dengan `crypto.timingSafeEqual` (`server/src/utils/midtransSignature.js`).
- Server key hanya di backend.
- Webhook idempoten; replay tidak mengurangi stok dua kali.
- `mock/settle` hanya tersedia saat mode pembayaran `mock` dan tetap memerlukan login.

### Upload dan konten

- Tidak ada fitur upload file; gambar produk berupa URL aset. Tidak ada `multer`/penyimpanan file yang perlu diamankan.
- Konten dinamis dirender sebagai teks React (escaping bawaan), bukan `dangerouslySetInnerHTML`.

### Konfigurasi production

- `JWT_SECRET` wajib ≥ 32 karakter; `DATABASE_URL` wajib; origin dan `SITE_URL` wajib HTTPS. Backend berhenti saat konfigurasi tidak valid (`server/src/config/env.js`).
- `.env` diabaikan git; hanya contoh tanpa secret yang disediakan.
- Script `create-admin` menggantikan pembuatan admin via seed/manual DB.

## 3. Hasil verifikasi

`node tests/api-m8.mjs` — **34/34 lulus**, mencakup:

- Header keamanan, `X-Powered-By` tidak bocor.
- CORS origin asing ditolak; POST lintas situs ditolak.
- Password salah → 401; cookie httpOnly dan SameSite.
- Register dengan `role: ADMIN` tetap menjadi `USER`.
- Admin tanpa login → 401; user biasa → 403.
- Isolasi pesanan antar-user; admin tetap dapat mengakses.
- Voucher dan layanan pengiriman tidak valid → 422.
- JSON rusak → 400 tanpa stack trace.
- `/robots.txt` dan `/sitemap.xml` → 200.
- OpenAPI 58 path; 404 format standar.

Unit test terkait keamanan logika: signature Midtrans (valid, server key salah, signature kosong), transisi status pesanan, validasi input — bagian dari `npm test` **30/30 lulus**.

`npm audit --omit=dev` → **0 kerentanan** pada dependency production. `npm audit` penuh mencatat 5 moderate pada `eslint`/`nodemon`/`minimatch` (devDependencies, tidak ikut runtime production).

## 4. Batasan yang diketahui

| Batasan | Dampak | Rekomendasi |
| --- | --- | --- |
| Rate limit in-memory | Reset saat restart; tidak dibagi antar instance | Gunakan Redis/rate-limit store saat multi-instance |
| Email `EMAIL_MODE=log` | Email tidak benar-benar terkirim | Pasang adapter SMTP/Resend sebelum produksi |
| Midtrans refund tidak memanggil API | Status `REFUNDED` hanya lokal | Integrasikan Refund API + rekonsiliasi |
| Ongkir mock | Tarif bukan tarif kurir nyata | Pasang adapter kurir resmi |
| Meta SEO client-side | Crawler tanpa JS tidak melihat meta dinamis | Prerender/SSR atau static generation |
| CSP Helmet default | `style-src` masih `unsafe-inline` (Tailwind/inline style) | Pertimbangkan nonce/hash style |
| Tidak ada verifikasi email | Akun langsung aktif | Tambahkan email verification bila diperlukan |
| Tidak ada 2FA admin | Akun admin hanya password | Tambahkan 2FA untuk admin |
| Tidak ada audit log admin terpisah | Perubahan admin hanya terlihat di log request | Tambahkan audit trail khusus |

## 5. Rekomendasi sebelum produksi nyata

1. Ganti rate limit in-memory dengan Redis.
2. Pasang pengiriman email nyata dan verifikasi email.
3. Aktifkan Midtrans production + uji webhook end-to-end di staging.
4. Tambahkan 2FA untuk admin dan audit log perubahan.
5. Jalankan pentest eksternal dan dependency scanning di CI.
6. Pastikan backup database teruji restore.
7. Tinjau ulang CSP setelah bundle final stabil.
8. Jangan pernah menjalankan seed development di production (kredensial demo diketahui publik).
