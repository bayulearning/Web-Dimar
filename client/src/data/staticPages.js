export const staticPages = [
  {
    path: "delivery",
    title: "Pengiriman",
    description:
      "Informasi kurir, estimasi, dan cakupan pengiriman Stride Athletics.",
    sections: [
      {
        heading: "Kurir dan Layanan",
        paragraphs: [
          "Stride Athletics mengirim pesanan melalui JNE, J&T, dan SiCepat dengan layanan reguler maupun ekspres. Pilihan layanan dan biaya ditampilkan pada halaman checkout sebelum pesanan dibuat.",
          "Tarif pengiriman pada versi pengembangan ini menggunakan adapter mock yang meniru struktur tarif kurir. Integrasi tarif kurir nyata dapat ditambahkan melalui adapter pengiriman di backend tanpa mengubah alur checkout.",
        ],
      },
      {
        heading: "Estimasi Tiba",
        paragraphs: [
          "Estimasi tiba dihitung dari layanan kurir yang dipilih dan ditampilkan pada halaman detail pesanan. Estimasi dapat berubah jika terjadi kendala operasional pada pihak kurir.",
          "Nomor resi tersedia setelah paket diserahkan ke kurir. Gunakan tombol salin pada halaman detail pesanan untuk menyalin nomor resi.",
        ],
      },
      {
        heading: "Pemrosesan Pesanan",
        paragraphs: [
          "Pesanan diproses setelah pembayaran terverifikasi. Pembaruan status pesanan dan pengiriman ditampilkan terpisah agar status pembayaran tidak tertukar dengan status pengiriman.",
        ],
      },
    ],
  },
  {
    path: "payment-options",
    title: "Metode Pembayaran",
    description: "Pilihan pembayaran yang tersedia melalui Midtrans.",
    sections: [
      {
        heading: "Pembayaran melalui Midtrans",
        paragraphs: [
          "Pembayaran diproses melalui Midtrans Snap. Metode yang dapat tersedia meliputi virtual account BCA, BNI, BRI, Mandiri, dan Permata, GoPay, ShopeePay, QRIS, kartu kredit, serta gerai Indomaret dan Alfamart.",
          "Ketersediaan metode aktual bergantung pada konfigurasi akun Midtrans dan kebijakan penyedia pembayaran. Daftar metode yang tampil pada Snap adalah sumber acuan saat pembayaran.",
        ],
      },
      {
        heading: "Mode Pengembangan",
        paragraphs: [
          "Jika kredensial Midtrans belum diisi, aplikasi memakai mode mock khusus pengembangan. Pada mode ini status pembayaran tetap ditentukan oleh backend dan hanya dapat disimulasikan melalui endpoint pengujian.",
          "Jangan menggunakan mode mock pada production. Isi MIDTRANS_CLIENT_KEY dan MIDTRANS_SERVER_KEY pada environment server untuk mengaktifkan mode Midtrans sandbox atau production.",
        ],
      },
      {
        heading: "Keamanan Pembayaran",
        paragraphs: [
          "Aplikasi tidak menyimpan data kartu. Verifikasi pembayaran dilakukan melalui notifikasi Midtrans yang divalidasi menggunakan signature server key.",
        ],
      },
    ],
  },
  {
    path: "privacy",
    title: "Kebijakan Privasi",
    description:
      "Cara Stride Athletics mengumpulkan dan melindungi data Anda.",
    sections: [
      {
        heading: "Data yang Dikumpulkan",
        paragraphs: [
          "Kami menyimpan data akun seperti nama, email, dan nomor telepon, serta data alamat pengiriman yang Anda simpan. Data pesanan disimpan untuk keperluan riwayat transaksi, pengiriman, dan layanan pelanggan.",
          "Pesan yang dikirim melalui formulir kontak disimpan di database beserta status penanganannya.",
        ],
      },
      {
        heading: "Penggunaan Data",
        paragraphs: [
          "Data digunakan untuk memproses pesanan, memberikan pembaruan status, menangani pengembalian, dan meningkatkan layanan. Kami tidak menjual data pribadi kepada pihak ketiga.",
        ],
      },
      {
        heading: "Keamanan dan Penyimpanan",
        paragraphs: [
          "Password disimpan dalam bentuk hash. Sesi autentikasi memakai cookie httpOnly dengan validasi origin untuk mencegah permintaan lintas situs yang tidak sah.",
          "Data pembayaran diproses oleh penyedia pembayaran; aplikasi tidak menyimpan nomor kartu atau kredensial pembayaran.",
        ],
      },
      {
        heading: "Hak Pengguna",
        paragraphs: [
          "Anda dapat memperbarui profil dan alamat melalui halaman Akun. Untuk permintaan penghapusan data, hubungi tim Stride melalui halaman Kontak.",
        ],
      },
    ],
  },
  {
    path: "terms",
    title: "Syarat & Ketentuan",
    description:
      "Ketentuan penggunaan situs dan layanan Stride Athletics.",
    sections: [
      {
        heading: "Penggunaan Situs",
        paragraphs: [
          "Dengan menggunakan situs Stride Athletics, Anda setuju untuk memberikan informasi yang akurat dan tidak menyalahgunakan layanan, termasuk upaya mengakses data pengguna lain.",
          "Akun bersifat pribadi. Anda bertanggung jawab menjaga kerahasiaan kredensial akun.",
        ],
      },
      {
        heading: "Konten dan Ketersediaan",
        paragraphs: [
          "Harga, stok, dan ketersediaan produk dapat berubah tanpa pemberitahuan. Kami berupaya menampilkan informasi secara akurat, namun kesalahan teknis dapat terjadi dan akan dikoreksi.",
        ],
      },
      {
        heading: "Batasan Tanggung Jawab",
        paragraphs: [
          "Stride Athletics tidak bertanggung jawab atas gangguan yang disebabkan oleh jaringan, perangkat pengguna, atau layanan pihak ketiga di luar kendali kami.",
        ],
      },
    ],
  },
  {
    path: "sales-terms",
    title: "Ketentuan Penjualan",
    description: "Aturan pembelian, pembayaran, dan pengembalian produk.",
    sections: [
      {
        heading: "Pembuatan Pesanan",
        paragraphs: [
          "Pesanan dibuat setelah Anda memilih produk, mengisi alamat pengiriman, dan memilih layanan kurir. Harga, stok, dan diskon dihitung ulang oleh backend sebelum pesanan disimpan.",
          "Pesanan yang belum dibayar akan kedaluwarsa sesuai batas waktu yang ditampilkan pada halaman pembayaran.",
        ],
      },
      {
        heading: "Pembayaran",
        paragraphs: [
          "Pembayaran harus diselesaikan sebelum batas waktu berakhir. Status pesanan berubah menjadi PAID setelah pembayaran terverifikasi oleh backend melalui notifikasi penyedia pembayaran.",
        ],
      },
      {
        heading: "Pengembalian dan Tukar Ukuran",
        paragraphs: [
          "Produk dapat dikembalikan dalam 30 hari setelah diterima jika belum dipakai dan kemasan lengkap. Penukaran ukuran mengikuti ketersediaan stok serta ketentuan pengembalian.",
          "Ajukan pengembalian melalui halaman Kontak dengan menyertakan nomor pesanan dan foto kondisi produk.",
        ],
      },
    ],
  },
];
