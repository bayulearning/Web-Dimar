import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { categories, products, sizes } from "./data/products.js";
import { coupons, helpArticles, newsArticles } from "./data/content.js";

const prisma = new PrismaClient();

const CATEGORY_CODE = {
  running: "RUN",
  football: "FTB",
  badminton: "BDM",
  training: "TRN",
  lifestyle: "LFS",
};

const COLOR_CODE = {
  Hitam: "BLK",
  Putih: "WHT",
  Mint: "MNT",
  "Abu-abu": "GRY",
  Merah: "RED",
  Biru: "BLU",
  Krem: "CRM",
  Navy: "NVY",
};

const CATEGORY_DESCRIPTION = {
  running:
    "Didesain untuk pelari yang menuntut bantalan responsif dan transisi langkah halus pada latihan harian maupun balapan.",
  football:
    "Didesain untuk kontrol bola presisi, traksi kuat, dan stabilitas saat berbelok di lapangan.",
  badminton:
    "Didesain untuk stabilitas lateral maksimal pada gerakan cepat dan eksplosif di lapangan badminton.",
  training:
    "Didesain untuk latihan beban dan fungsional dengan sol kokoh serta dukungan tumit yang stabil.",
  lifestyle:
    "Didesain untuk kenyamanan sepanjang hari dengan siluet sporty yang mudah dipadukan.",
};

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function addDays(days) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

async function resetDatabase() {
  await prisma.paymentEvent.deleteMany();
  await prisma.shipmentEvent.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.newsArticleProduct.deleteMany();
  await prisma.newsArticle.deleteMany();
  await prisma.helpArticle.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // Reset AUTOINCREMENT agar ID seed deterministik.
  try {
    await prisma.$executeRawUnsafe("DELETE FROM sqlite_sequence");
  } catch {
    // Tabel sqlite_sequence hanya ada pada SQLite.
  }
}

async function seedUsers() {
  const [adminPassword, userPassword, demoPassword] = await Promise.all([
    bcrypt.hash("Admin#12345", 10),
    bcrypt.hash("User#12345", 10),
    bcrypt.hash("Demo#12345", 10),
  ]);

  const admin = await prisma.user.create({
    data: {
      name: "Admin Stride",
      email: "admin@stride.local",
      passwordHash: adminPassword,
      phone: "081200000001",
      role: "ADMIN",
    },
  });

  const user = await prisma.user.create({
    data: {
      name: "Budi Runner",
      email: "user@stride.local",
      passwordHash: userPassword,
      phone: "081200000002",
      role: "USER",
      addresses: {
        create: {
          label: "Rumah",
          recipientName: "Budi Runner",
          phone: "081200000002",
          province: "DKI Jakarta",
          city: "Jakarta Selatan",
          district: "Kebayoran Baru",
          postalCode: "12120",
          detail: "Jl. Melawai Raya No. 18, RT 04 / RW 03",
          isDefault: true,
        },
      },
    },
  });

  const demo = await prisma.user.create({
    data: {
      name: "Demo Runner",
      email: "demo@stride.local",
      passwordHash: demoPassword,
      phone: "081200000003",
      role: "USER",
      addresses: {
        create: {
          label: "Rumah",
          recipientName: "Demo Runner",
          phone: "081200000003",
          province: "DKI Jakarta",
          city: "Jakarta Pusat",
          district: "Menteng",
          postalCode: "10310",
          detail: "Jl. Cikini Raya No. 25, RT 02 / RW 01",
          isDefault: true,
        },
      },
    },
  });

  return { admin, user, demo };
}

async function seedCatalog() {
  const categoryMap = new Map();
  for (const category of categories) {
    const created = await prisma.category.create({
      data: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        sortOrder: category.sortOrder,
      },
    });
    categoryMap.set(category.slug, created);
  }

  const catalog = [];

  for (const [index, item] of products.entries()) {
    const slug = slugify(item.name);
    const category = categoryMap.get(item.category);
    const baseSku = `STR-${CATEGORY_CODE[item.category]}-${String(index + 1).padStart(3, "0")}`;

    const imageUrls = [1, 2, 3].map(
      (number) => `/images/products/${slug}-${number}.svg`,
    );

    const variantData = [];
    item.colors.forEach((color, colorIndex) => {
      sizes.forEach((size, sizeIndex) => {
        const stockSeed = (index * 7 + sizeIndex * 5 + colorIndex * 3) % 13;
        const isSoldOut =
          (sizeIndex === 7 && colorIndex === 0 && index % 4 === 0) ||
          (sizeIndex === 0 && colorIndex === 1 && index % 5 === 0);

        variantData.push({
          sku: `${baseSku}-${size.replace("EU ", "")}-${COLOR_CODE[color.name]}`,
          size,
          color: color.name,
          colorHex: color.hex,
          inventory: {
            create: {
              quantity: isSoldOut ? 0 : Math.max(stockSeed, 1),
              reserved: 0,
            },
          },
        });
      });
    });

    const product = await prisma.product.create({
      data: {
        sku: baseSku,
        name: item.name,
        slug,
        description: `${item.name} - ${CATEGORY_DESCRIPTION[item.category]}`,
        categoryId: category.id,
        gender: item.gender,
        basePrice: item.basePrice,
        salePrice: item.salePrice ?? null,
        effectivePrice: item.salePrice ?? item.basePrice,
        badge: item.badge ?? null,
        isPublished: true,
        publishedAt: addDays(-index),
        images: {
          create: imageUrls.map((url, imageIndex) => ({
            url,
            alt: `${item.name} tampilan ${imageIndex + 1}`,
            sortOrder: imageIndex,
            isPrimary: imageIndex === 0,
          })),
        },
        variants: { create: variantData },
      },
      include: { variants: true },
    });

    if (!category.imageUrl) {
      await prisma.category.update({
        where: { id: category.id },
        data: { imageUrl: imageUrls[0] },
      });
    }

    catalog.push(product);
  }

  return catalog;
}

async function seedCoupons() {
  const created = [];
  for (const coupon of coupons) {
    created.push(
      await prisma.coupon.create({
        data: {
          code: coupon.code,
          description: coupon.description,
          type: coupon.type,
          value: coupon.value,
          minSpend: coupon.minSpend,
          maxDiscount: coupon.maxDiscount ?? null,
          usageLimit: coupon.usageLimit ?? null,
          perUserLimit: coupon.perUserLimit,
          startsAt: new Date(),
          expiresAt: addDays(coupon.daysValid),
          isActive: true,
        },
      }),
    );
  }
  return created;
}

async function seedOrders(user, catalog) {
  const address = await prisma.address.findFirst({ where: { userId: user.id } });

  const pickedVariants = [
    { product: catalog[0], size: "EU 42", color: "Hitam" },
    { product: catalog[6], size: "EU 42", color: "Hitam" },
    { product: catalog[11], size: "EU 41", color: "Putih" },
  ].map((entry) => {
    const variant = entry.product.variants.find(
      (candidate) =>
        candidate.size === entry.size && candidate.color === entry.color,
    );
    return { entry, variant };
  });

  const items = pickedVariants.map(({ entry, variant }) => {
    const unitPrice = entry.product.salePrice ?? entry.product.basePrice;
    return {
      product: entry.product,
      variant,
      productName: entry.product.name,
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      unitPrice,
      quantity: 1,
      lineTotal: unitPrice,
    };
  });

  const subtotal = items.reduce((total, item) => total + item.lineTotal, 0);
  const shippingCost = 22000;

  const paidOrder = await prisma.order.create({
    data: {
      orderNumber: "STR-2026-0001",
      userId: user.id,
      addressId: address?.id ?? null,
      status: "DELIVERED",
      subtotal,
      discountTotal: 0,
      shippingCost,
      total: subtotal + shippingCost,
      expiresAt: addDays(-10),
      paidAt: addDays(-9),
      recipientName: address.recipientName,
      phone: address.phone,
      email: user.email,
      province: address.province,
      city: address.city,
      district: address.district,
      postalCode: address.postalCode,
      addressDetail: address.detail,
      shippingProvider: "JNE",
      shippingService: "REG",
      items: {
        create: items.map((item) => ({
          productId: item.product.id,
          variantId: item.variant.id,
          productName: item.productName,
          sku: item.sku,
          size: item.size,
          color: item.color,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          lineTotal: item.lineTotal,
        })),
      },
    },
    include: { items: true },
  });

  const payment = await prisma.payment.create({
    data: {
      orderId: paidOrder.id,
      provider: "midtrans",
      providerTransactionId: "seed-trx-0001",
      status: "SETTLEMENT",
      method: "bca_va",
      grossAmount: paidOrder.total,
      fraudStatus: "accept",
      paidAt: addDays(-9),
      rawResponse: JSON.stringify({ note: "seed data pembayaran" }),
    },
  });

  await prisma.paymentEvent.create({
    data: {
      paymentId: payment.id,
      eventKey: "seed-event-0001",
      transactionStatus: "settlement",
      statusCode: "200",
      fraudStatus: "accept",
      grossAmount: paidOrder.total,
      signatureValid: true,
      payload: JSON.stringify({ transaction_status: "settlement" }),
    },
  });

  const shipment = await prisma.shipment.create({
    data: {
      orderId: paidOrder.id,
      provider: "JNE",
      service: "REG",
      trackingNumber: "JNE1234567890",
      status: "DELIVERED",
      cost: shippingCost,
      estimatedArrival: addDays(-6),
      shippedAt: addDays(-8),
      deliveredAt: addDays(-7),
    },
  });

  await prisma.shipmentEvent.create({
    data: {
      shipmentId: shipment.id,
      status: "PICKED_UP",
      description: "Paket diambil kurir",
      source: "provider",
      occurredAt: addDays(-8),
    },
  });

  await prisma.shipmentEvent.create({
    data: {
      shipmentId: shipment.id,
      status: "DELIVERED",
      description: "Paket diterima oleh penerima",
      source: "provider",
      occurredAt: addDays(-7),
    },
  });

  const statusTimeline = [
    ["PENDING_PAYMENT", "PAID", "payment", -9],
    ["PAID", "PROCESSING", "admin", -9],
    ["PROCESSING", "SHIPPED", "admin", -8],
    ["SHIPPED", "DELIVERED", "shipment", -7],
  ];

  for (const [fromStatus, toStatus, source, day] of statusTimeline) {
    await prisma.orderStatusHistory.create({
      data: {
        orderId: paidOrder.id,
        fromStatus,
        toStatus,
        source,
        createdAt: addDays(day),
      },
    });
  }

  const pendingVariant = catalog[2].variants.find(
    (variant) => variant.size === "EU 40" && variant.color === "Mint",
  );
  const pendingPrice = catalog[2].salePrice ?? catalog[2].basePrice;

  const pendingOrder = await prisma.order.create({
    data: {
      orderNumber: "STR-2026-0002",
      userId: user.id,
      addressId: address?.id ?? null,
      status: "PENDING_PAYMENT",
      subtotal: pendingPrice,
      shippingCost: 18000,
      total: pendingPrice + 18000,
      expiresAt: addDays(1),
      recipientName: address.recipientName,
      phone: address.phone,
      email: user.email,
      province: address.province,
      city: address.city,
      district: address.district,
      postalCode: address.postalCode,
      addressDetail: address.detail,
      shippingProvider: "SiCepat",
      shippingService: "REG",
      items: {
        create: [
          {
            productId: catalog[2].id,
            variantId: pendingVariant?.id ?? null,
            productName: catalog[2].name,
            sku: pendingVariant?.sku ?? `${catalog[2].sku}-40-MNT`,
            size: pendingVariant?.size ?? "EU 40",
            color: pendingVariant?.color ?? "Mint",
            unitPrice: pendingPrice,
            quantity: 1,
            lineTotal: pendingPrice,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      orderId: pendingOrder.id,
      provider: "midtrans",
      status: "PENDING",
      grossAmount: pendingOrder.total,
      expiresAt: addDays(1),
    },
  });

  return { paidOrder, pendingOrder, address };
}

async function seedReviews(user, paidOrder, catalog) {
  const firstItems = paidOrder.items.slice(0, 2);

  const reviewSeeds = [
    {
      item: firstItems[0],
      rating: 5,
      title: "Sangat ringan dan responsif",
      comment:
        "Dipakai untuk lari 10 km, bantalan terasa seimbang dan tidak panas di kaki.",
    },
    {
      item: firstItems[1],
      rating: 4,
      title: "Kontrol bola bagus",
      comment:
        "Traksi kuat di lapangan basah. Ukuran sedikit sempit, disarankan naik setengah ukuran.",
    },
  ];

  for (const review of reviewSeeds) {
    if (!review.item) continue;
    await prisma.review.create({
      data: {
        userId: user.id,
        productId: review.item.productId,
        orderItemId: review.item.id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        isPublished: true,
      },
    });
  }

  for (const productId of new Set(firstItems.map((item) => item.productId))) {
    const aggregate = await prisma.review.aggregate({
      where: { productId, isPublished: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.product.update({
      where: { id: productId },
      data: {
        ratingAverage: Number((aggregate._avg.rating ?? 0).toFixed(2)),
        ratingCount: aggregate._count.rating,
      },
    });
  }
}

async function seedEngagement(user, catalog) {
  const wishlist = await prisma.wishlist.create({ data: { userId: user.id } });
  for (const product of [catalog[1], catalog[13]]) {
    await prisma.wishlistItem.create({
      data: { wishlistId: wishlist.id, productId: product.id },
    });
  }

  const cart = await prisma.cart.create({ data: { userId: user.id } });
  const cartProduct = catalog[20];
  const cartVariant = cartProduct.variants.find(
    (variant) => variant.size === "EU 41" && variant.color === "Putih",
  );
  if (cartVariant) {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: cartProduct.id,
        variantId: cartVariant.id,
        quantity: 1,
      },
    });
  }

  const notifications = [
    {
      type: "ORDER",
      title: "Pesanan STR-2026-0001 telah diterima",
      body: "Pesanan Anda telah dikirim dan diterima. Terima kasih telah berbelanja.",
      link: "/pesanan/STR-2026-0001",
      isRead: false,
    },
    {
      type: "PROMO",
      title: "Voucher STRIDE10 untuk Anda",
      body: "Gunakan kode STRIDE10 dan dapatkan diskon 10% hingga Rp 300.000.",
      link: "/belanja",
      isRead: false,
    },
    {
      type: "SYSTEM",
      title: "Selamat datang di Stride Athletics",
      body: "Lengkapi profil dan alamat pengiriman agar checkout lebih cepat.",
      link: "/akun",
      isRead: true,
    },
  ];

  for (const notification of notifications) {
    await prisma.notification.create({
      data: { userId: user.id, ...notification },
    });
  }
}

async function seedDemoEngagement(demo, catalog) {
  const wishlist = await prisma.wishlist.create({ data: { userId: demo.id } });
  for (const product of [catalog[2], catalog[9]]) {
    await prisma.wishlistItem.create({
      data: { wishlistId: wishlist.id, productId: product.id },
    });
  }

  const cart = await prisma.cart.create({ data: { userId: demo.id } });
  const cartProduct = catalog[4];
  const cartVariant = cartProduct.variants[0];
  if (cartVariant) {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: cartProduct.id,
        variantId: cartVariant.id,
        quantity: 1,
      },
    });
  }

  await prisma.notification.create({
    data: {
      userId: demo.id,
      type: "SYSTEM",
      title: "Selamat datang di akun demo",
      body: "Akun ini disiapkan untuk mencoba fitur Stride Athletics. Data bisa diubah bebas.",
      link: "/akun",
      isRead: false,
    },
  });
}

async function seedContent(catalog) {
  for (const article of helpArticles) {
    await prisma.helpArticle.create({
      data: {
        slug: article.slug,
        title: article.title,
        category: article.category,
        excerpt: article.excerpt,
        content: article.content,
        isPublished: true,
      },
    });
  }

  for (const [index, article] of newsArticles.entries()) {
    const related = [catalog[index % catalog.length], catalog[(index + 5) % catalog.length]];
    await prisma.newsArticle.create({
      data: {
        slug: article.slug,
        title: article.title,
        category: article.category,
        excerpt: article.excerpt,
        content: article.content,
        coverImage: article.cover,
        isPublished: true,
        publishedAt: addDays(-index * 3),
        viewCount: 120 + index * 37,
        products: {
          create: related.map((product) => ({ productId: product.id })),
        },
      },
    });
  }

  const messages = [
    {
      name: "Sari",
      email: "sari@example.com",
      phone: "081211112222",
      subject: "Tukar ukuran",
      message:
        "Sepatu yang saya terima terlalu kecil. Bagaimana prosedur tukar ukuran?",
      status: "IN_PROGRESS",
    },
    {
      name: "Dimas",
      email: "dimas@example.com",
      phone: "081233334444",
      subject: "Pertanyaan stok",
      message: "Apakah Stride Elite Carbon akan restock ukuran EU 44?",
      status: "NEW",
    },
  ];

  for (const message of messages) {
    await prisma.contactMessage.create({ data: message });
  }
}

async function main() {
  console.log("Reset database...");
  await resetDatabase();

  console.log("Seed users...");
  const { user, demo } = await seedUsers();

  console.log("Seed katalog...");
  const catalog = await seedCatalog();

  console.log("Seed voucher...");
  await seedCoupons();

  console.log("Seed pesanan...");
  const { paidOrder } = await seedOrders(user, catalog);

  console.log("Seed ulasan...");
  await seedReviews(user, paidOrder, catalog);

  console.log("Seed wishlist, cart, notifikasi...");
  await seedEngagement(user, catalog);

  console.log("Seed akun demo...");
  await seedDemoEngagement(demo, catalog);

  console.log("Seed konten...");
  await seedContent(catalog);

  const counts = {
    users: await prisma.user.count(),
    categories: await prisma.category.count(),
    products: await prisma.product.count(),
    variants: await prisma.productVariant.count(),
    orders: await prisma.order.count(),
    reviews: await prisma.review.count(),
    helpArticles: await prisma.helpArticle.count(),
    newsArticles: await prisma.newsArticle.count(),
    coupons: await prisma.coupon.count(),
  };
  console.log("Seed selesai:", counts);
}

main()
  .catch((error) => {
    console.error("Seed gagal:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
