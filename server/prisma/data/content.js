export const coupons = [
  {
    code: "STRIDE10",
    description: "Diskon 10% untuk transaksi minimal Rp 1.000.000.",
    type: "PERCENT",
    value: 10,
    minSpend: 1000000,
    maxDiscount: 300000,
    usageLimit: 500,
    perUserLimit: 2,
    daysValid: 90,
  },
  {
    code: "STRIDE50",
    description: "Potongan Rp 50.000 untuk transaksi minimal Rp 500.000.",
    type: "FIXED",
    value: 50000,
    minSpend: 500000,
    usageLimit: 1000,
    perUserLimit: 1,
    daysValid: 60,
  },
  {
    code: "NEWMEMBER",
    description: "Diskon 15% untuk member baru, maksimal Rp 250.000.",
    type: "PERCENT",
    value: 15,
    minSpend: 750000,
    maxDiscount: 250000,
    usageLimit: 300,
    perUserLimit: 1,
    daysValid: 30,
  },
];

export const helpArticles = [
  {
    slug: "cara-melakukan-pemesanan",
    title: "Cara Melakukan Pemesanan",
    category: "Pesanan",
    excerpt: "Langkah memilih produk, ukuran, dan menyelesaikan checkout.",
    content:
      "Pilih produk dari katalog, tentukan ukuran yang tersedia, lalu tambahkan ke keranjang.\n\nBuka keranjang, periksa jumlah dan ukuran, kemudian lanjutkan ke checkout. Isi data penerima dan pilih metode pengiriman.\n\nSetelah pesanan dibuat, Anda akan menerima nomor pesanan dan instruksi pembayaran.",
  },
  {
    slug: "status-pesanan",
    title: "Arti Status Pesanan",
    category: "Pesanan",
    excerpt: "Penjelasan status PENDING_PAYMENT, PAID, PROCESSING, dan lainnya.",
    content:
      "PENDING_PAYMENT berarti pesanan menunggu pembayaran. PAID berarti pembayaran telah terverifikasi.\n\nPROCESSING berarti pesanan sedang disiapkan. SHIPPED berarti paket dalam perjalanan. DELIVERED berarti paket diterima.\n\nCANCELLED, EXPIRED, FAILED, dan REFUNDED menunjukkan pesanan tidak dilanjutkan atau dana dikembalikan.",
  },
  {
    slug: "metode-pembayaran",
    title: "Metode Pembayaran yang Tersedia",
    category: "Pembayaran",
    excerpt: "Virtual account, e-wallet, QRIS, dan kartu kredit.",
    content:
      "Pembayaran diproses melalui Midtrans. Metode yang tersedia dapat mencakup virtual account bank, GoPay, ShopeePay, QRIS, kartu kredit, dan gerai ritel.\n\nKetersediaan metode bergantung pada konfigurasi akun Midtrans Anda.",
  },
  {
    slug: "pembayaran-belum-terkonfirmasi",
    title: "Pembayaran Belum Terkonfirmasi",
    category: "Pembayaran",
    excerpt: "Apa yang harus dilakukan jika status pembayaran belum berubah.",
    content:
      "Status pembayaran diperbarui setelah notifikasi Midtrans diverifikasi oleh server, biasanya dalam beberapa menit.\n\nJika lebih dari 15 menit status belum berubah, buka halaman pesanan dan gunakan tombol periksa status. Jangan melakukan pembayaran ulang sebelum status dipastikan.",
  },
  {
    slug: "estimasi-pengiriman",
    title: "Estimasi dan Biaya Pengiriman",
    category: "Pengiriman",
    excerpt: "Cara menghitung ongkir dan estimasi tiba.",
    content:
      "Ongkir dihitung berdasarkan berat paket, kota tujuan, dan layanan kurir yang dipilih.\n\nEstimasi tiba ditampilkan pada halaman checkout dan halaman detail pesanan. Nilai estimasi dapat berubah jika terjadi kendala operasional kurir.",
  },
  {
    slug: "melacak-pesanan",
    title: "Cara Melacak Pesanan",
    category: "Pengiriman",
    excerpt: "Gunakan nomor pesanan atau nomor resi.",
    content:
      "Buka halaman Pesanan, lalu pilih pesanan yang ingin dilacak. Nomor resi dan riwayat pengiriman ditampilkan pada halaman detail.\n\nAnda juga dapat mencari pesanan menggunakan nomor pesanan pada kolom pencarian.",
  },
  {
    slug: "kebijakan-pengembalian",
    title: "Kebijakan Pengembalian",
    category: "Pengembalian",
    excerpt: "Retur dalam 30 hari dengan syarat produk belum dipakai.",
    content:
      "Produk dapat dikembalikan dalam 30 hari setelah diterima jika belum dipakai dan kemasan lengkap.\n\nAjukan pengembalian melalui halaman Kontak dengan menyertakan nomor pesanan dan foto kondisi produk.",
  },
  {
    slug: "tukar-ukuran",
    title: "Tukar Ukuran",
    category: "Pengembalian",
    excerpt: "Prosedur penukaran ukuran yang tidak sesuai.",
    content:
      "Penukaran ukuran dapat dilakukan selama stok tersedia dan produk dalam kondisi baru.\n\nProses penukaran mengikuti ketentuan pengembalian dan dapat dikenakan biaya pengiriman tambahan.",
  },
  {
    slug: "panduan-ukuran",
    title: "Panduan Ukuran Sepatu",
    category: "Produk",
    excerpt: "Cara mengukur kaki dan memilih ukuran EU yang tepat.",
    content:
      "Ukur panjang kaki dari tumit hingga ujung jari saat berdiri. Tambahkan 0,5 cm untuk ruang gerak.\n\nGunakan tabel konversi pada halaman produk. Jika berada di antara dua ukuran, pilih ukuran yang lebih besar untuk sepatu lari.",
  },
];

export const newsArticles = [
  {
    slug: "stride-velocity-x-rilis",
    title: "Stride Velocity X Resmi Dirilis",
    category: "Rilis Produk",
    excerpt:
      "Sepatu lari dengan pelat karbon dan busa responsif untuk tempo kompetisi.",
    cover: "/images/products/stride-velocity-x-1.svg",
    content:
      "Stride Athletics merilis Velocity X sebagai sepatu lari kompetisi dengan pelat karbon penuh dan busa responsif tinggi.\n\nUpper mesh ringan menjaga sirkulasi udara, sementara outsole karet memberikan traksi pada permukaan basah.\n\nVelocity X tersedia di seluruh toko resmi Stride Athletics dengan harga Rp 2.499.000.",
  },
  {
    slug: "panduan-memilih-sepatu-lari",
    title: "Panduan Memilih Sepatu Lari Pertama",
    category: "Panduan",
    excerpt:
      "Kenali pronasi, drop, dan jenis latihan sebelum membeli sepatu lari.",
    cover: "/images/products/stride-pace-daily-1.svg",
    content:
      "Sepatu lari yang tepat bergantung pada jenis latihan, jarak tempuh, dan bentuk kaki.\n\nUntuk latihan harian, pilih sepatu dengan bantalan seimbang. Untuk balapan, sepatu ringan dengan pelat karbon dapat membantu efisiensi langkah.\n\nSelalu coba sepatu pada sore hari ketika kaki sedikit membesar, dan sisakan ruang sekitar satu jempol di depan.",
  },
  {
    slug: "latihan-kecepatan-untuk-pemula",
    title: "Tiga Latihan Kecepatan untuk Pemula",
    category: "Latihan",
    excerpt:
      "Interval sederhana yang bisa dilakukan dua kali seminggu.",
    cover: "/images/products/stride-aero-runner-1.svg",
    content:
      "Latihan kecepatan tidak harus rumit. Mulai dengan pemanasan 10 menit, lalu lakukan interval 1 menit cepat dan 2 menit mudah sebanyak enam pengulangan.\n\nTambahkan latihan tangga dan drill langkah pendek untuk memperbaiki teknik.\n\nAkhiri dengan pendinginan dan peregangan ringan. Hentikan latihan jika terasa nyeri tajam.",
  },
  {
    slug: "teknologi-bantalan-stride",
    title: "Di Balik Teknologi Bantalan Stride",
    category: "Teknologi",
    excerpt:
      "Bagaimana busa StriderFoam menyeimbangkan energi balik dan kenyamanan.",
    cover: "/images/products/stride-elite-carbon-1.svg",
    content:
      "StriderFoam dikembangkan untuk mengembalikan energi tanpa mengurangi stabilitas.\n\nStruktur sel tertutup membuat busa tetap responsif pada suhu rendah dan tidak mudah padat setelah jarak jauh.\n\nKombinasi midsole dan pelat karbon memberikan transisi tumit ke ujung kaki yang lebih halus.",
  },
  {
    slug: "komunitas-stride-run-club",
    title: "Stride Run Club Kembali Digelar",
    category: "Komunitas",
    excerpt:
      "Sesi lari bersama setiap Sabtu pagi di lima kota.",
    cover: "/images/products/stride-terra-trail-1.svg",
    content:
      "Stride Run Club kembali hadir dengan sesi lari santai sejauh 5 km setiap Sabtu pagi.\n\nPeserta mendapatkan pendampingan pelatih, sesi pendinginan, dan kesempatan mencoba produk terbaru.\n\nPendaftaran dilakukan melalui halaman News dan dibuka untuk umum tanpa biaya.",
  },
];
