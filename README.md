# Stride Athletics

Aplikasi e-commerce sepatu olahraga full-stack. Monorepo berisi frontend Vite + React dan backend Express + Prisma.

> Status: **Milestone 8 (Final QA & Release) selesai**. Seluruh milestone 1–8 telah diimplementasikan dan diuji. Lihat `PROGRESS.md` untuk rincian dan `docs/DEPLOYMENT.md` untuk deployment.

## Persyaratan sistem

- Node.js 20+ (diuji pada Node 22)
- npm 10+
- SQLite (development, via Prisma) / PostgreSQL (production)

## Struktur proyek

```
/
├── client/                  # Frontend Vite + React + Tailwind
│   └── src/
│       ├── components/      # common, layout, ui
│       ├── pages/           # halaman per route
│       ├── layouts/         # MainLayout
│       ├── router/          # definisi path
│       ├── services/        # HTTP client
│       ├── hooks/           # custom hooks
│       └── utils/           # formatter, dll
├── server/                  # Backend Express
│   ├── src/
│   │   ├── config/          # env
│   │   ├── controllers/
│   │   ├── middlewares/     # logging, 404, error handler
│   │   ├── routes/
│   │   ├── utils/           # response, logger, AppError
│   │   ├── app.js
│   │   └── server.js
│   └── prisma/              # schema, migration, seed
├── docs/                    # dokumentasi teknis
├── UI Reff/                 # referensi visual
├── UI Target/               # referensi struktur halaman
├── .env.example
└── package.json             # npm workspaces
```

## Instalasi

```bash
npm install
```

## Konfigurasi environment

```bash
copy .env.example server\.env   # Windows
# cp .env.example server/.env   # macOS/Linux
```

Salin nilai dari `.env.example` (root repo) ke `server/.env` lalu isi kredensial. `server/.env` tidak boleh di-commit.

Variabel utama:

| Variabel | Fungsi |
| --- | --- |
| `NODE_ENV` | `development` / `test` / `production` |
| `PORT` | Port backend (default 3000) |
| `SITE_URL` | URL publik frontend untuk canonical, Open Graph, sitemap, dan robots |
| `CLIENT_ORIGIN` | Origin frontend yang diizinkan CORS, pisahkan dengan koma |
| `DATABASE_URL` | SQLite (`file:./dev.db`) atau PostgreSQL |
| `JWT_SECRET` | Secret JWT (wajib ≥ 32 karakter di production) |
| `MIDTRANS_*` | Kredensial Midtrans; isi client + server key untuk mode `midtrans` |
| `EMAIL_MODE` | `log` (development); adapter SMTP belum terpasang |

## Setup database

```bash
npm run prisma:migrate --workspace server
npm run seed --workspace server
```

Database development: `server/prisma/dev.db` (SQLite).

## Menjalankan development

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Health check: http://localhost:3000/api/health

Request `/api/*` dari frontend diproxy Vite ke backend.

## Perintah lain

```bash
npm run build
npm run lint
npm test
npm start
```

## Dokumentasi API

Prefix `/api`. Format respons:

```json
{ "success": true, "message": "Berhasil", "data": {}, "meta": null }
```

```json
{ "success": false, "message": "Terjadi kesalahan", "errors": [] }
```

Modul endpoint (total 58 path, dokumentasi lengkap di Swagger):

| Modul | Prefix | Keterangan |
| --- | --- | --- |
| Health | `/api/health` | Health check |
| Auth | `/api/auth` | Register, login, logout, profil |
| Address | `/api/addresses` | CRUD alamat user |
| Catalog | `/api/products`, `/api/categories` | Filter, sorting, pagination, detail |
| Cart | `/api/cart` | Cart user + merge guest cart |
| Wishlist | `/api/wishlist` | Wishlist user + merge |
| Order | `/api/orders` | Preview checkout, buat order, riwayat, detail |
| Shipping | `/api/shipping` | Layanan dan estimasi (mock) |
| Payment | `/api/payments` | Konfigurasi, Snap token, status, webhook Midtrans, mock settle |
| Content | `/api/news`, `/api/help`, `/api/contact`, `/api/sitemap` | Konten publik |
| Notification | `/api/notifications` | Daftar dan tandai dibaca |
| Admin | `/api/admin` | Dashboard, produk, kategori, pesanan, konten, voucher |
| Docs | `/api/docs` | Swagger UI dan OpenAPI JSON |

SEO tersedia di root (bukan `/api`): `GET /sitemap.xml`, `GET /robots.txt`.

Query `GET /api/products`: `q`, `category`, `gender`, `size`, `color`, `badge`, `minPrice`, `maxPrice`, `sort` (`newest`, `price_asc`, `price_desc`, `rating`, `popular`), `page`, `limit` (maks 48). Nilai `size` menerima `42` maupun `EU 42`.

Contoh:

```
GET /api/products?category=running&size=42&sort=price_asc&page=1&limit=12
```

## Pengujian

```bash
npm test                  # unit test Vitest (server)
npm run lint              # ESLint semua workspace
npm run build             # build frontend
```

Test API/E2E memerlukan backend (dan frontend untuk E2E) berjalan serta database di-seed:

```bash
npm run seed --workspace server
node tests/api-m8.mjs     # contoh integration test
node tests/e2e-main.mjs   # E2E Chrome headless
```

Hasil terakhir: unit 30/30, API M4–M8 231/231, E2E 35/35. Detail dan prasyarat di `docs/TESTING.md`.

## Pengujian Midtrans Sandbox

1. Isi `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, `MIDTRANS_IS_PRODUCTION=false` di `server/.env`.
2. Jalankan backend lalu ekspos dengan ngrok:

```bash
ngrok http 3000
```

3. Set Payment Notification URL di dashboard Midtrans ke `https://<ngrok-domain>/api/payments/midtrans/notification`.
4. Server key hanya boleh ada di backend.

Mode pembayaran otomatis: `midtrans` bila `MIDTRANS_CLIENT_KEY` dan `MIDTRANS_SERVER_KEY` terisi; selain itu `mock`. Endpoint mock hanya aktif pada mode mock.

## Deployment

Panduan lengkap: `docs/DEPLOYMENT.md`.

- Frontend: Vercel / Netlify (`npm run build`, output `client/dist`).
- Backend: Railway / Render / VPS (`npm start`).
- Database: PostgreSQL (`server/prisma/schema.postgresql.prisma`).
- Wajib: HTTPS, cookie `Secure`, `SameSite=None`, CORS terbatas, `JWT_SECRET` ≥ 32 karakter.
- Jangan menjalankan seed development di production; buat admin dengan `npm run create-admin --workspace server -- <email> <password> [nama]`.

## Backup & restore database

SQLite (development):

```bash
# backup
copy server\prisma\dev.db backups\dev-YYYYMMDD.db
# restore
copy backups\dev-YYYYMMDD.db server\prisma\dev.db
```

PostgreSQL (production): gunakan `pg_dump` dan `pg_restore` sesuai jadwal backup.

## Akun development

Dibuat oleh seed (`npm run seed --workspace server`):

| Role | Email | Password |
| --- | --- | --- |
| ADMIN | `admin@stride.local` | `Admin#12345` |
| USER | `user@stride.local` | `User#12345` |
| DEMO | `demo@stride.local` | `Demo#12345` |

Akun `demo@stride.local` disiapkan untuk pengujian fitur: punya alamat default,
wishlist, cart, dan notifikasi, tanpa riwayat pesanan agar alur checkout bisa
dicoba dari awal.

Kredensial hanya untuk development dan tidak boleh dipakai di production.

## Gambar produk

Gambar katalog berupa ilustrasi SVG lokal di `client/public/images/products/`.
Regenerate dengan:

```bash
npm run seed:images --workspace server
```

## Dokumen terkait

- `plan.md` — spesifikasi proyek
- `AGENTS.md` — aturan kerja
- `PROGRESS.md` — status milestone
- `docs/DECISIONS.md` — keputusan teknis
- `docs/ERD.md` — rancangan database
- `docs/DEPLOYMENT.md` — deployment production
- `docs/SECURITY-REVIEW.md` — review keamanan dan batasan
- `docs/TESTING.md` — matriks dan cara menjalankan test
