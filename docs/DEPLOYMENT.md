# DEPLOYMENT — Stride Athletics

Panduan deploy production. Arsitektur: frontend statis (Vercel/Netlify) + backend Node/Express (Render/Railway/VPS) + PostgreSQL.

## 1. Ringkasan arsitektur

| Komponen | Teknologi | Artefak |
| --- | --- | --- |
| Frontend | Vite + React 19 + Tailwind 4 | `client/dist` (static) |
| Backend | Express (ES Modules) | `server/src/server.js` (`npm start`) |
| Database | PostgreSQL | `server/prisma/schema.postgresql.prisma` |
| Pembayaran | Midtrans Snap | Webhook `POST /api/payments/midtrans/notification` |
| SEO | Server-side | `GET /sitemap.xml`, `GET /robots.txt` |

Frontend dan backend boleh berbeda origin selama HTTPS dan `CLIENT_ORIGIN` tepat.

## 2. Prasyarat

- Node.js 20+ (diuji Node 22), npm 10+.
- PostgreSQL 14+.
- Domain HTTPS untuk frontend dan backend.
- Akun Midtrans (production) bila pembayaran nyata dipakai.

## 3. Environment production

Salin `.env.production.example` menjadi `server/.env` di server, lalu isi nilai asli.

Wajib:

- `NODE_ENV=production`
- `SITE_URL=https://<domain-frontend>` (HTTPS, tanpa trailing slash)
- `CLIENT_ORIGIN=https://<domain-frontend>` (HTTPS; bisa beberapa origin dipisah koma)
- `DATABASE_URL=postgresql://...`
- `JWT_SECRET` minimal 32 karakter acak

Backend menolak start bila salah satu syarat di atas tidak terpenuhi.

Catatan:

- Jangan pernah commit `server/.env`.
- `server/.env` dibaca relatif terhadap `server/src/config/env.js`; environment variable dari platform tetap diutamakan.
- `MIDTRANS_CLIENT_KEY` dan `MIDTRANS_SERVER_KEY` terisi → mode pembayaran `midtrans`. Kosong → `mock`.

## 4. Database PostgreSQL

Schema production terpisah agar SQLite development tidak berubah:

```bash
# validasi
npm run prisma:validate:pg --workspace server

# generate Prisma Client untuk PostgreSQL
npm run prisma:generate:pg --workspace server

# buat tabel (initial deploy / perubahan additive)
npm run prisma:push:pg --workspace server
```

`prisma db push` dipakai karena folder migration saat ini dihasilkan untuk SQLite. Setelah schema production stabil, buat baseline migration PostgreSQL dengan `prisma migrate diff` lalu gunakan `prisma migrate deploy` pada rilis berikutnya.

Penting:

- `npm run seed --workspace server` membuat akun demo dengan password yang diketahui publik. **Jangan jalankan seed di production.** Gunakan seed hanya untuk staging/development.
- Buat admin pertama tanpa edit database manual:

```bash
npm run create-admin --workspace server -- admin@example.com "PasswordKuat123!" "Nama Admin"
```

Script memakai bcrypt (cost 12) dan menolak password < 12 karakter. Tambahkan `--update` hanya bila memang ingin mereset akun yang sudah ada.

- Katalog, kategori, konten, voucher, dan pesanan diisi lewat `/admin` setelah login admin.

## 5. Backend (Render/Railway)

Contoh pengaturan:

- Root directory: root repo (monorepo).
- Build command:
  ```bash
  npm ci && npm run prisma:generate:pg --workspace server
  ```
- Start command:
  ```bash
  npm run prisma:push:pg --workspace server && npm start --workspace server
  ```
- Health check path: `/api/health`.

Untuk VPS:

```bash
npm ci
npm run prisma:generate:pg --workspace server
npm run prisma:push:pg --workspace server
npm start --workspace server
```

Jalankan di belakang reverse proxy (nginx/Caddy) dengan TLS. Proses `app.set("trust proxy", 1)` sudah aktif agar `req.ip` dan cookie `Secure` benar.

## 6. Frontend (Vercel/Netlify)

Build dari root repo:

```bash
npm ci
npm run build
```

Output: `client/dist`.

### SPA rewrite

Semua route React harus jatuh ke `index.html`, kecuali `/api/*`, `/sitemap.xml`, dan `/robots.txt` yang diteruskan ke backend.

Netlify `_redirects` (di `client/public` atau root publish):

```
/api/*        https://api.example.com/api/:splat   200
/sitemap.xml  https://api.example.com/sitemap.xml  200
/robots.txt   https://api.example.com/robots.txt   200
/*            /index.html                          200
```

Vercel `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://api.example.com/api/:path*" },
    { "source": "/sitemap.xml", "destination": "https://api.example.com/sitemap.xml" },
    { "source": "/robots.txt", "destination": "https://api.example.com/robots.txt" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Tanpa rewrite `/api/*`, frontend akan mendapat 404. Tanpa rewrite sitemap/robots, crawler tidak melihat sitemap dinamis.

## 7. Cookie, CORS, dan HTTPS

- Cookie auth: `httpOnly`; di production `Secure` dan `SameSite=None` (frontend/backend bisa beda origin).
- `SameSite=None` wajib HTTPS di kedua sisi.
- `CLIENT_ORIGIN` harus sama persis dengan origin browser (skema + host + port). Tidak ada wildcard.
- Middleware CSRF menolak `POST/PUT/PATCH/DELETE` dengan `Origin`/`Referer` di luar daftar.
- Jangan menaruh server key Midtrans di frontend.

## 8. Midtrans webhook

1. Isi kredensial production di `server/.env`.
2. Set Payment Notification URL di dashboard Midtrans:
   `https://api.example.com/api/payments/midtrans/notification`
3. Signature SHA-512 diverifikasi backend; notifikasi tanpa signature valid ditolak.
4. Untuk sandbox, ekspos backend lokal:
   ```bash
   ngrok http 3000
   ```
   lalu set URL `https://<ngrok-domain>/api/payments/midtrans/notification`.

## 9. SEO production

- `SITE_URL` menentukan URL absolut pada `sitemap.xml`, `robots.txt`, canonical, dan Open Graph.
- Pastikan `https://<domain>/sitemap.xml` dan `/robots.txt` dapat diakses publik.
- Daftarkan sitemap di Google Search Console.
- Meta tag halaman di-render client-side. Untuk crawler yang tidak menjalankan JavaScript, pertimbangkan prerender/SSR (lihat batasan di `docs/SECURITY-REVIEW.md`).

## 10. Checklist sebelum rilis

- [ ] `npm run lint` lulus.
- [ ] `npm test` lulus.
- [ ] `npm run build` lulus.
- [ ] `schema.postgresql.prisma` valid dan client PostgreSQL sudah digenerate.
- [ ] Tabel production dibuat (`prisma:push:pg`).
- [ ] Admin production dibuat via `create-admin`, bukan seed.
- [ ] `JWT_SECRET` acak dan hanya ada di server.
- [ ] `CLIENT_ORIGIN`, `SITE_URL`, dan `DATABASE_URL` benar.
- [ ] HTTPS aktif di frontend dan backend.
- [ ] `/api/health`, `/sitemap.xml`, `/robots.txt` → 200.
- [ ] Login, checkout, dan webhook Midtrans diuji di staging.
- [ ] Backup database pertama sudah dibuat.

## 11. Backup & restore PostgreSQL

```bash
# backup harian
pg_dump "$DATABASE_URL" --format=custom --file=stride-$(date +%F).dump

# restore
pg_restore --clean --if-exists --dbname="$DATABASE_URL" stride-YYYY-MM-DD.dump
```

Simpan backup di luar server aplikasi dan uji restore secara berkala.

## 12. Rollback

1. Deploy ulang artefak frontend/backend versi sebelumnya.
2. Perubahan schema additive aman dibiarkan; untuk perubahan destruktif, restore backup sebelum rollback.
3. Setelah rollback, cek `/api/health`, login, dan daftar pesanan.
4. Jangan menghapus migration atau tabel tanpa backup terverifikasi.
