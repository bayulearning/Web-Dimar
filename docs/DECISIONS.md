# DECISIONS — Stride Athletics

Catatan keputusan teknis yang menyimpang dari atau melengkapi `plan.md`.

## D-001 — Frontend memakai React + Tailwind CSS

- **Tanggal:** 2026-11-11
- **Status:** Disetujui pemilik proyek
- **Konteks:** `plan.md` §3.1 mewajibkan Vite + vanilla JavaScript ES Modules dan melarang React/Vue. Repository awal sudah berisi scaffold Vite + React 19 + Tailwind CSS 4.
- **Keputusan:** Frontend tetap memakai React 19, React Router 7, Tailwind CSS 4, dan lucide-react di `/client`.
- **Konsekuensi:**
  - Ketentuan "vanilla JS" dan "tanpa framework frontend" pada `plan.md` §3.1 tidak berlaku.
  - Ketentuan lain tetap berlaku: ES Modules, modular (components/pages/layouts/router/services/utils), CSS variables, mobile-first, aksesibilitas, state loading/empty/error.
  - State management tetap memakai store modular sendiri (bukan Redux/Zustand) sesuai semangat plan.
- **Risiko:** Selisih dengan spesifikasi tugas jika penilaian mengacu harfiah ke `plan.md` §3.1.

## D-002 — Struktur Prisma di `server/prisma`

- **Status:** Sementara
- **Konteks:** `plan.md` §3.6 menempatkan `/prisma` di root monorepo. Schema awal sudah ada di `server/prisma/schema.prisma` dan Prisma Client sudah di-generate dari lokasi itu.
- **Keputusan:** Schema, migration, dan seed tetap di `server/prisma` agar `DATABASE_URL` relatif dan `@prisma/client` konsisten tanpa migrasi ulang.
- **Konsekuensi:** Path berbeda dari plan; dokumentasi memakai path aktual.

## D-003 — Mode pembayaran mock saat kredensial Midtrans kosong

- **Tanggal:** 2026-11-11
- **Status:** Disetujui pemilik proyek (`untuk integrasi midtrans sandbox apinya cukup dikosongkan saja`)
- **Konteks:** `plan.md` §10 mewajibkan Midtrans Snap Sandbox. Kredensial sandbox belum tersedia dan boleh dikosongkan selama development.
- **Keputusan:**
  - `server/.env` menyimpan `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, `MIDTRANS_MERCHANT_ID` kosong (placeholder siap diisi).
  - Mode dipilih otomatis: kedua key terisi → provider `midtrans`; jika tidak → provider `mock` (`server/src/lib/payment/index.js`).
  - Provider mock membuat token/redirect lokal, memverifikasi signature SHA512 dengan fallback key `stride-mock-server-key`, dan menyediakan endpoint simulasi settlement khusus development (`POST /api/payments/mock/settle`).
  - Status pembayaran selalu diturunkan backend dari notifikasi/endpoint internal, tidak pernah dipercaya dari callback frontend.
- **Konsekuensi:**
  - Alur checkout, webhook, idempotensi, dan status tetap dapat diuji tanpa kredensial Midtrans.
  - Endpoint simulasi ditolak (403) saat `NODE_ENV=production` atau mode `midtrans` aktif.
  - Tarif pengiriman tetap mock (lihat `server/src/lib/shipping/mock.provider.js`) dan tidak boleh diklaim sebagai tarif kurir aktual.
- **Risiko:** Perilaku mock berbeda dari Snap nyata; verifikasi ulang dengan kredensial sandbox sebelum produksi.

