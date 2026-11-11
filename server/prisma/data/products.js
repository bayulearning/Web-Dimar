// Katalog seed Stride Athletics.
// Harga dalam rupiah (integer). Ukuran mengikuti standar EU.

export const categories = [
  {
    name: "Running",
    slug: "running",
    description:
      "Sepatu lari dengan bantalan responsif untuk latihan harian hingga balapan.",
    imageUrl: "/images/categories/running.jpg",
    sortOrder: 1,
  },
  {
    name: "Football",
    slug: "football",
    description:
      "Sepatu sepakbola dengan traksi dan kontrol bola untuk lapangan keras maupun rumput.",
    imageUrl: "/images/categories/football.jpg",
    sortOrder: 2,
  },
  {
    name: "Badminton",
    slug: "badminton",
    description:
      "Sepatu badminton dengan stabilitas lateral untuk gerakan cepat dan eksplosif.",
    imageUrl: "/images/categories/badminton.jpg",
    sortOrder: 3,
  },
  {
    name: "Training",
    slug: "training",
    description:
      "Sepatu latihan dengan sol kokoh untuk beban, crossfit, dan latihan fungsional.",
    imageUrl: "/images/categories/training.jpg",
    sortOrder: 4,
  },
  {
    name: "Lifestyle",
    slug: "lifestyle",
    description:
      "Sepatu kasual bergaya sporty untuk aktivitas sehari-hari.",
    imageUrl: "/images/categories/lifestyle.jpg",
    sortOrder: 5,
  },
];

const black = { name: "Hitam", hex: "#1c1c1c" };
const white = { name: "Putih", hex: "#f2f2f2" };
const mint = { name: "Mint", hex: "#34d399" };
const grey = { name: "Abu-abu", hex: "#8b8b8b" };
const red = { name: "Merah", hex: "#dc2626" };
const blue = { name: "Biru", hex: "#2563eb" };
const cream = { name: "Krem", hex: "#e7dcc9" };
const navy = { name: "Navy", hex: "#1e293b" };

export const products = [
  {
    name: "Stride Velocity X",
    category: "running",
    gender: "unisex",
    basePrice: 2799000,
    salePrice: 2499000,
    badge: "BARU",
    colors: [black, mint],
  },
  {
    name: "Stride Elite Carbon",
    category: "running",
    gender: "men",
    basePrice: 3299000,
    badge: "EKSKLUSIF",
    colors: [white, black],
  },
  {
    name: "Stride Aero Runner",
    category: "running",
    gender: "women",
    basePrice: 1899000,
    salePrice: 1599000,
    badge: "DISKON",
    colors: [mint, white],
  },
  {
    name: "Stride Terra Trail",
    category: "running",
    gender: "men",
    basePrice: 2599000,
    badge: "POPULER",
    colors: [grey, black],
  },
  {
    name: "Stride Pace Daily",
    category: "running",
    gender: "unisex",
    basePrice: 1699000,
    colors: [navy, white],
  },
  {
    name: "Stride Flux Racer",
    category: "running",
    gender: "women",
    basePrice: 2299000,
    salePrice: 1999000,
    colors: [red, black],
  },
  {
    name: "Pitch Master Pro",
    category: "football",
    gender: "men",
    basePrice: 1899000,
    badge: "TERLARIS",
    colors: [black, mint],
  },
  {
    name: "Pitch Control FG",
    category: "football",
    gender: "men",
    basePrice: 2199000,
    colors: [white, black],
  },
  {
    name: "Stride Striker Elite",
    category: "football",
    gender: "men",
    basePrice: 2999000,
    badge: "EKSKLUSIF",
    colors: [red, black],
  },
  {
    name: "Pitch Vortex TF",
    category: "football",
    gender: "unisex",
    basePrice: 1599000,
    salePrice: 1299000,
    badge: "DISKON",
    colors: [navy, white],
  },
  {
    name: "Stride Keeper Grip",
    category: "football",
    gender: "men",
    basePrice: 1999000,
    colors: [grey, black],
  },
  {
    name: "Smash Court X",
    category: "badminton",
    gender: "unisex",
    basePrice: 1599000,
    badge: "POPULER",
    colors: [white, mint],
  },
  {
    name: "Smash Lite Pro",
    category: "badminton",
    gender: "women",
    basePrice: 1499000,
    salePrice: 1199000,
    colors: [mint, white],
  },
  {
    name: "Stride Court Ace",
    category: "badminton",
    gender: "unisex",
    basePrice: 1899000,
    badge: "BARU",
    colors: [navy, mint],
  },
  {
    name: "Smash Drive Z",
    category: "badminton",
    gender: "men",
    basePrice: 2099000,
    colors: [black, red],
  },
  {
    name: "Stride Net Master",
    category: "badminton",
    gender: "unisex",
    basePrice: 1799000,
    colors: [white, blue],
  },
  {
    name: "CrossFit Trainer Z",
    category: "training",
    gender: "unisex",
    basePrice: 1299000,
    badge: "POPULER",
    colors: [black, grey],
  },
  {
    name: "Stride Lift Pro",
    category: "training",
    gender: "men",
    basePrice: 1999000,
    colors: [black, white],
  },
  {
    name: "Stride Flex Trainer",
    category: "training",
    gender: "women",
    basePrice: 1499000,
    salePrice: 1299000,
    badge: "DISKON",
    colors: [cream, mint],
  },
  {
    name: "Stride Power Grip",
    category: "training",
    gender: "unisex",
    basePrice: 1699000,
    colors: [navy, grey],
  },
  {
    name: "Stride Street Classic",
    category: "lifestyle",
    gender: "unisex",
    basePrice: 1599000,
    badge: "TERLARIS",
    colors: [white, black],
  },
  {
    name: "Stride Urban Knit",
    category: "lifestyle",
    gender: "women",
    basePrice: 1499000,
    colors: [cream, grey],
  },
  {
    name: "Stride Retro Court",
    category: "lifestyle",
    gender: "unisex",
    basePrice: 1799000,
    salePrice: 1499000,
    badge: "DISKON",
    colors: [cream, red],
  },
  {
    name: "Stride Everyday Low",
    category: "lifestyle",
    gender: "kids",
    basePrice: 1099000,
    colors: [blue, white],
  },
];

export const sizes = ["EU 39", "EU 40", "EU 41", "EU 42", "EU 43", "EU 44", "EU 45", "EU 46"];
