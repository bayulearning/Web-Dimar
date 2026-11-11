import { prisma } from "../lib/prisma.js";
import { orderInclude } from "../repositories/order.repository.js";
import { createNotification } from "../repositories/notification.repository.js";
import { getShippingAdapter } from "../lib/shipping/index.js";
import {
  consumeOrderInventory,
  releaseOrderInventory,
  serializeOrder,
} from "./order.service.js";
import { sendOrderStatusEmail } from "./email.service.js";
import { AppError, NotFoundError } from "../utils/AppError.js";
import {
  allowedOrderTransitions,
  canTransitionOrderStatus,
} from "../utils/orderStatus.js";

const REVENUE_STATUSES = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

export function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function uniqueSlug(model, base, client = prisma, ignoreId = null) {
  const root = slugify(base) || "item";
  let candidate = root;
  let counter = 1;

  while (counter < 100) {
    const existing = await client[model].findFirst({
      where: {
        slug: candidate,
        ...(ignoreId ? { id: { not: ignoreId } } : {}),
      },
      select: { id: true },
    });
    if (!existing) return candidate;
    counter += 1;
    candidate = `${root}-${counter}`;
  }

  return `${root}-${Date.now()}`;
}

function variantSku(productSku, size, color) {
  const parts = [productSku, size, color]
    .map((part) => slugify(part).replace(/-/g, "").toUpperCase())
    .filter(Boolean);
  return parts.join("-").slice(0, 60);
}

async function uniqueVariantSku(base, client = prisma) {
  let candidate = base;
  let counter = 1;
  while (counter < 100) {
    const existing = await client.productVariant.findUnique({
      where: { sku: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
    counter += 1;
    candidate = `${base}-${counter}`.slice(0, 60);
  }
  return `${base}-${Date.now()}`.slice(0, 60);
}

function effectivePriceOf(product) {
  return product.salePrice ?? product.basePrice;
}

function serializeProductSummary(product) {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    slug: product.slug,
    category: product.category
      ? { id: product.category.id, name: product.category.name }
      : null,
    gender: product.gender,
    basePrice: product.basePrice,
    salePrice: product.salePrice,
    effectivePrice: product.effectivePrice,
    badge: product.badge,
    isPublished: product.isPublished,
    publishedAt: product.publishedAt,
    deletedAt: product.deletedAt,
    createdAt: product.createdAt,
    image: product.images?.[0] ?? null,
    variantCount: product._count?.variants ?? product.variants?.length ?? 0,
    totalStock:
      product.variants?.reduce(
        (total, variant) => total + (variant.inventory?.quantity ?? 0),
        0,
      ) ?? 0,
  };
}

function serializeProductDetail(product) {
  return {
    ...serializeProductSummary(product),
    description: product.description,
    brand: product.brand,
    categoryId: product.categoryId,
    images: (product.images ?? []).map((image) => ({
      id: image.id,
      url: image.url,
      alt: image.alt,
      sortOrder: image.sortOrder,
      isPrimary: image.isPrimary,
    })),
    variants: (product.variants ?? []).map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      colorHex: variant.colorHex,
      priceOverride: variant.priceOverride,
      isActive: variant.isActive,
      quantity: variant.inventory?.quantity ?? 0,
      reserved: variant.inventory?.reserved ?? 0,
      lowStockThreshold: variant.inventory?.lowStockThreshold ?? 3,
    })),
  };
}

const productDetailInclude = {
  category: { select: { id: true, name: true, slug: true } },
  images: { orderBy: { sortOrder: "asc" } },
  variants: {
    orderBy: [{ size: "asc" }, { color: "asc" }],
    include: { inventory: true },
  },
  _count: { select: { variants: true } },
};

function buildProductWhere({ q, status, category }) {
  const where = {};

  if (status === "published") {
    where.deletedAt = null;
    where.isPublished = true;
  } else if (status === "draft") {
    where.deletedAt = null;
    where.isPublished = false;
  } else if (status === "deleted") {
    where.deletedAt = { not: null };
  } else {
    where.deletedAt = null;
  }

  if (category) where.category = { slug: category };
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { sku: { contains: q } },
      { slug: { contains: q } },
    ];
  }

  return where;
}

export async function getDashboard() {
  const [
    revenue,
    orderCount,
    pendingPayment,
    paidCount,
    processing,
    shipped,
    delivered,
    cancelled,
    productCount,
    draftCount,
    userCount,
    lowStock,
    recentOrders,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { status: { in: REVENUE_STATUSES } },
      _sum: { total: true },
    }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING_PAYMENT" } }),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.order.count({ where: { status: "PROCESSING" } }),
    prisma.order.count({ where: { status: "SHIPPED" } }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
    prisma.order.count({ where: { status: "CANCELLED" } }),
    prisma.product.count({ where: { deletedAt: null, isPublished: true } }),
    prisma.product.count({ where: { deletedAt: null, isPublished: false } }),
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.inventory.findMany({
      where: {
        variant: { isActive: true, product: { deletedAt: null } },
      },
      orderBy: [{ quantity: "asc" }, { variantId: "asc" }],
      take: 8,
      include: {
        variant: {
          include: {
            product: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: orderInclude,
    }),
  ]);

  return {
    summary: {
      revenue: revenue._sum.total ?? 0,
      orderCount,
      pendingPayment,
      paidCount,
      processing,
      shipped,
      delivered,
      cancelled,
      productCount,
      draftCount,
      userCount,
    },
    lowStock: lowStock
      .filter((entry) => entry.quantity <= entry.lowStockThreshold)
      .map((entry) => ({
        variantId: entry.variantId,
        productId: entry.variant.product.id,
        productName: entry.variant.product.name,
        productSlug: entry.variant.product.slug,
        sku: entry.variant.sku,
        size: entry.variant.size,
        color: entry.variant.color,
        quantity: entry.quantity,
        reserved: entry.reserved,
        lowStockThreshold: entry.lowStockThreshold,
      })),
    recentOrders: recentOrders.map(serializeOrder),
  };
}

export async function listProducts({ q, status, category, page, limit }) {
  const where = buildProductWhere({ q, status, category });
  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        variants: { include: { inventory: true } },
        _count: { select: { variants: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return { items: items.map(serializeProductSummary), total, page, limit };
}

export async function getProduct(id) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: productDetailInclude,
  });
  if (!product) throw new NotFoundError("Produk tidak ditemukan");
  return serializeProductDetail(product);
}

export async function createProduct(payload) {
  const { images = [], variants = [], ...fields } = payload;

  const category = await prisma.category.findUnique({
    where: { id: fields.categoryId },
  });
  if (!category) {
    throw new AppError("Kategori tidak ditemukan", 422, [
      { field: "categoryId", message: "Kategori tidak ditemukan" },
    ]);
  }

  const slug = await uniqueSlug("product", fields.slug || fields.name);
  const effectivePrice = fields.salePrice ?? fields.basePrice;
  const publishedAt =
    fields.isPublished !== false
      ? fields.publishedAt ?? new Date()
      : fields.publishedAt ?? null;

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        sku: fields.sku,
        name: fields.name,
        slug,
        description: fields.description,
        brand: fields.brand || "Stride Athletics",
        categoryId: fields.categoryId,
        gender: fields.gender || "unisex",
        basePrice: fields.basePrice,
        salePrice: fields.salePrice ?? null,
        effectivePrice,
        badge: fields.badge ?? null,
        isPublished: fields.isPublished !== false,
        publishedAt,
        images: {
          create: images.map((image, index) => {
            const primaryIndex = images.findIndex((entry) => entry.isPrimary);
            return {
              url: image.url,
              alt: image.alt || fields.name,
              sortOrder: image.sortOrder ?? index,
              isPrimary: index === (primaryIndex >= 0 ? primaryIndex : 0),
            };
          }),
        },
      },
      include: productDetailInclude,
    });

    for (const [index, variant] of variants.entries()) {
      const baseSku = variantSku(product.sku, variant.size, variant.color);
      const sku = variant.sku || (await uniqueVariantSku(baseSku, tx));
      await tx.productVariant.create({
        data: {
          productId: product.id,
          sku,
          size: variant.size,
          color: variant.color,
          colorHex: variant.colorHex || null,
          priceOverride: variant.priceOverride ?? null,
          isActive: variant.isActive !== false,
          inventory: {
            create: {
              quantity: variant.quantity ?? 0,
              lowStockThreshold: variant.lowStockThreshold ?? 3,
            },
          },
        },
      });
    }

    return tx.product.findUnique({
      where: { id: product.id },
      include: productDetailInclude,
    });
  }).then(serializeProductDetail);
}

export async function updateProduct(id, payload) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product || product.deletedAt) {
    throw new NotFoundError("Produk tidak ditemukan");
  }

  if (payload.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: payload.categoryId },
    });
    if (!category) {
      throw new AppError("Kategori tidak ditemukan", 422, [
        { field: "categoryId", message: "Kategori tidak ditemukan" },
      ]);
    }
  }

  const data = { ...payload };
  if (payload.slug) {
    data.slug = await uniqueSlug("product", payload.slug, prisma, id);
  }

  const nextBase = payload.basePrice ?? product.basePrice;
  const nextSale = "salePrice" in payload ? payload.salePrice : product.salePrice;
  if (nextSale != null && nextSale > nextBase) {
    throw new AppError("Harga diskon tidak boleh melebihi harga dasar", 422, [
      { field: "salePrice", message: "Harga diskon melebihi harga dasar" },
    ]);
  }
  data.effectivePrice = nextSale ?? nextBase;

  if (
    "isPublished" in payload &&
    payload.isPublished &&
    !product.publishedAt &&
    !payload.publishedAt
  ) {
    data.publishedAt = new Date();
  }

  const updated = await prisma.product.update({
    where: { id },
    data,
    include: productDetailInclude,
  });
  return serializeProductDetail(updated);
}

export async function deleteProduct(id) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product || product.deletedAt) {
    throw new NotFoundError("Produk tidak ditemukan");
  }

  await prisma.product.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      isPublished: false,
    },
  });

  return { id };
}

async function assertProduct(id) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product || product.deletedAt) {
    throw new NotFoundError("Produk tidak ditemukan");
  }
  return product;
}

export async function addProductImage(productId, payload) {
  await assertProduct(productId);

  return prisma.$transaction(async (tx) => {
    const count = await tx.productImage.count({ where: { productId } });
    if (payload.isPrimary || count === 0) {
      await tx.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      });
    }
    return tx.productImage.create({
      data: {
        productId,
        url: payload.url,
        alt: payload.alt || null,
        sortOrder: payload.sortOrder ?? count,
        isPrimary: payload.isPrimary || count === 0,
      },
    });
  });
}

export async function updateProductImage(productId, imageId, payload) {
  const image = await prisma.productImage.findFirst({
    where: { id: imageId, productId },
  });
  if (!image) throw new NotFoundError("Gambar produk tidak ditemukan");

  return prisma.$transaction(async (tx) => {
    if (payload.isPrimary) {
      await tx.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      });
    }
    return tx.productImage.update({
      where: { id: imageId },
      data: payload,
    });
  });
}

export async function deleteProductImage(productId, imageId) {
  const image = await prisma.productImage.findFirst({
    where: { id: imageId, productId },
  });
  if (!image) throw new NotFoundError("Gambar produk tidak ditemukan");

  await prisma.$transaction(async (tx) => {
    await tx.productImage.delete({ where: { id: imageId } });
    if (image.isPrimary) {
      const next = await tx.productImage.findFirst({
        where: { productId },
        orderBy: { sortOrder: "asc" },
      });
      if (next) {
        await tx.productImage.update({
          where: { id: next.id },
          data: { isPrimary: true },
        });
      }
    }
  });

  return { id: imageId };
}

export async function addVariant(productId, payload) {
  const product = await assertProduct(productId);
  const baseSku = variantSku(product.sku, payload.size, payload.color);
  const sku = payload.sku || (await uniqueVariantSku(baseSku));

  const variant = await prisma.productVariant.create({
    data: {
      productId,
      sku,
      size: payload.size,
      color: payload.color,
      colorHex: payload.colorHex || null,
      priceOverride: payload.priceOverride ?? null,
      isActive: payload.isActive !== false,
      inventory: {
        create: {
          quantity: payload.quantity ?? 0,
          lowStockThreshold: payload.lowStockThreshold ?? 3,
        },
      },
    },
    include: { inventory: true },
  });

  return {
    id: variant.id,
    sku: variant.sku,
    size: variant.size,
    color: variant.color,
    colorHex: variant.colorHex,
    priceOverride: variant.priceOverride,
    isActive: variant.isActive,
    quantity: variant.inventory?.quantity ?? 0,
    reserved: variant.inventory?.reserved ?? 0,
    lowStockThreshold: variant.inventory?.lowStockThreshold ?? 3,
  };
}

async function findVariant(productId, variantId) {
  const variant = await prisma.productVariant.findFirst({
    where: { id: variantId, productId },
    include: { inventory: true },
  });
  if (!variant) throw new NotFoundError("Varian produk tidak ditemukan");
  return variant;
}

export async function updateVariant(productId, variantId, payload) {
  await findVariant(productId, variantId);
  const { quantity, lowStockThreshold, ...fields } = payload;

  const variant = await prisma.$transaction(async (tx) => {
    if (quantity !== undefined || lowStockThreshold !== undefined) {
      await tx.inventory.upsert({
        where: { variantId },
        update: {
          ...(quantity !== undefined ? { quantity } : {}),
          ...(lowStockThreshold !== undefined ? { lowStockThreshold } : {}),
        },
        create: {
          variantId,
          quantity: quantity ?? 0,
          lowStockThreshold: lowStockThreshold ?? 3,
        },
      });
    }

    if (Object.keys(fields).length > 0) {
      await tx.productVariant.update({
        where: { id: variantId },
        data: fields,
      });
    }

    return tx.productVariant.findUnique({
      where: { id: variantId },
      include: { inventory: true },
    });
  });

  return {
    id: variant.id,
    sku: variant.sku,
    size: variant.size,
    color: variant.color,
    colorHex: variant.colorHex,
    priceOverride: variant.priceOverride,
    isActive: variant.isActive,
    quantity: variant.inventory?.quantity ?? 0,
    reserved: variant.inventory?.reserved ?? 0,
    lowStockThreshold: variant.inventory?.lowStockThreshold ?? 3,
  };
}

export async function updateVariantStock(productId, variantId, payload) {
  await findVariant(productId, variantId);
  const inventory = await prisma.inventory.upsert({
    where: { variantId },
    update: {
      ...(payload.quantity !== undefined ? { quantity: payload.quantity } : {}),
      ...(payload.lowStockThreshold !== undefined
        ? { lowStockThreshold: payload.lowStockThreshold }
        : {}),
    },
    create: {
      variantId,
      quantity: payload.quantity ?? 0,
      lowStockThreshold: payload.lowStockThreshold ?? 3,
    },
  });

  return {
    variantId,
    quantity: inventory.quantity,
    reserved: inventory.reserved,
    lowStockThreshold: inventory.lowStockThreshold,
  };
}

export async function deleteVariant(productId, variantId) {
  await findVariant(productId, variantId);
  await prisma.productVariant.update({
    where: { id: variantId },
    data: { isActive: false },
  });
  return { id: variantId };
}

export async function listCategories() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    include: {
      _count: {
        select: {
          products: { where: { deletedAt: null } },
        },
      },
    },
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    imageUrl: category.imageUrl,
    sortOrder: category.sortOrder,
    isActive: category.isActive,
    productCount: category._count.products,
  }));
}

export async function createCategory(payload) {
  const slug = await uniqueSlug("category", payload.slug || payload.name);
  return prisma.category.create({
    data: {
      name: payload.name,
      slug,
      description: payload.description ?? null,
      imageUrl: payload.imageUrl ?? null,
      sortOrder: payload.sortOrder ?? 0,
      isActive: payload.isActive !== false,
    },
  });
}

export async function updateCategory(id, payload) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new NotFoundError("Kategori tidak ditemukan");

  const data = { ...payload };
  if (payload.slug) {
    data.slug = await uniqueSlug("category", payload.slug, prisma, id);
  }

  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { products: { where: { deletedAt: null } } },
      },
    },
  });
  if (!category) throw new NotFoundError("Kategori tidak ditemukan");

  if (category._count.products > 0) {
    throw new AppError(
      "Kategori masih memiliki produk aktif dan tidak dapat dinonaktifkan",
      409,
    );
  }

  await prisma.category.update({
    where: { id },
    data: { isActive: false },
  });
  return { id };
}

function buildOrderWhere({ q, status }) {
  const where = {};
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { orderNumber: { contains: q } },
      { recipientName: { contains: q } },
      { email: { contains: q } },
    ];
  }
  return where;
}

function serializeAdminOrder(order) {
  return {
    ...serializeOrder(order),
    user: order.user
      ? { id: order.user.id, name: order.user.name, email: order.user.email }
      : null,
  };
}

export async function listOrders({ q, status, page, limit }) {
  const where = buildOrderWhere({ q, status });
  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { ...orderInclude, user: true },
    }),
    prisma.order.count({ where }),
  ]);

  return { items: items.map(serializeAdminOrder), total, page, limit };
}

export async function getOrder(orderNumber) {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { ...orderInclude, user: true },
  });
  if (!order) throw new NotFoundError("Pesanan tidak ditemukan");
  return serializeAdminOrder(order);
}

async function ensureShipmentForOrder(order, tx) {
  const existing = await tx.shipment.findFirst({
    where: { orderId: order.id },
    orderBy: { createdAt: "desc" },
  });
  if (existing) return existing;

  const shippingService = getShippingAdapter().findService(
    order.shippingProvider,
    order.shippingService,
  );
  const shipment = await tx.shipment.create({
    data: {
      orderId: order.id,
      provider: order.shippingProvider || "mock",
      service: order.shippingService || "REG",
      status: "PENDING",
      cost: order.shippingCost,
      estimatedArrival: shippingService
        ? getShippingAdapter().estimateArrival(shippingService.etaMaxDays)
        : null,
    },
  });
  await tx.shipmentEvent.create({
    data: {
      shipmentId: shipment.id,
      status: "PENDING",
      description: "Menunggu penjemputan kurir",
      source: "system",
    },
  });
  return shipment;
}

async function restockConsumed(order, tx) {
  for (const item of order.items) {
    if (!item.variantId) continue;
    await tx.inventory.updateMany({
      where: { variantId: item.variantId },
      data: { quantity: { increment: item.quantity } },
    });
  }
  if (order.couponId) {
    await tx.coupon.updateMany({
      where: { id: order.couponId, usageCount: { gt: 0 } },
      data: { usageCount: { decrement: 1 } },
    });
  }
}

export async function updateOrderStatus(orderNumber, payload, actorId) {
  const { status, note } = payload;

  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { orderNumber },
      include: orderInclude,
    });
    if (!order) throw new NotFoundError("Pesanan tidak ditemukan");

    if (order.status === status) {
      throw new AppError("Status pesanan sudah sama", 409);
    }

    const allowed = allowedOrderTransitions(order.status);
    if (!canTransitionOrderStatus(order.status, status)) {
      throw new AppError(
        `Status tidak dapat diubah dari ${order.status} ke ${status}`,
        409,
        [
          {
            field: "status",
            message: `Transisi yang diizinkan: ${allowed.join(", ") || "tidak ada"}`,
          },
        ],
      );
    }

    let paymentUpdate = null;

    if (status === "PAID") {
      await consumeOrderInventory(order, tx);
      paymentUpdate = { status: "SETTLEMENT", paidAt: new Date() };
      await ensureShipmentForOrder(order, tx);
    } else if (status === "CANCELLED" || status === "EXPIRED") {
      if (order.status === "PENDING_PAYMENT") {
        await releaseOrderInventory(order, tx);
      } else {
        await restockConsumed(order, tx);
      }
      paymentUpdate = { status: status === "EXPIRED" ? "EXPIRE" : "CANCEL" };
    } else if (status === "REFUNDED") {
      if (["PAID", "PROCESSING"].includes(order.status)) {
        await restockConsumed(order, tx);
      }
      paymentUpdate = { status: "REFUND" };
    } else if (status === "SHIPPED") {
      const shipment = await ensureShipmentForOrder(order, tx);
      await tx.shipment.update({
        where: { id: shipment.id },
        data: { status: "SHIPPED", shippedAt: shipment.shippedAt ?? new Date() },
      });
      await tx.shipmentEvent.create({
        data: {
          shipmentId: shipment.id,
          status: "SHIPPED",
          description: note || "Paket diserahkan ke kurir",
          source: "admin",
        },
      });
    } else if (status === "DELIVERED") {
      const shipment = await ensureShipmentForOrder(order, tx);
      await tx.shipment.update({
        where: { id: shipment.id },
        data: {
          status: "DELIVERED",
          shippedAt: shipment.shippedAt ?? new Date(),
          deliveredAt: new Date(),
        },
      });
      await tx.shipmentEvent.create({
        data: {
          shipmentId: shipment.id,
          status: "DELIVERED",
          description: note || "Paket diterima penerima",
          source: "admin",
        },
      });
    }

    if (paymentUpdate) {
      await tx.payment.updateMany({
        where: { orderId: order.id },
        data: paymentUpdate,
      });
    }

    const updated = await tx.order.update({
      where: { id: order.id },
      data: {
        status,
        ...(status === "PAID" ? { paidAt: new Date() } : {}),
        ...(["CANCELLED", "EXPIRED"].includes(status)
          ? { cancelledAt: new Date() }
          : {}),
      },
      include: { ...orderInclude, user: true },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId: order.id,
        fromStatus: order.status,
        toStatus: status,
        source: "admin",
        note: note || "Status diperbarui oleh admin",
        actorId,
      },
    });

    await createNotification(
      {
        userId: order.userId,
        type: "ORDER",
        title: `Status pesanan ${order.orderNumber}: ${status}`,
        body: note || `Status pesanan diperbarui menjadi ${status}.`,
        link: `/pesanan/${order.orderNumber}`,
      },
      tx,
    );

    return updated;
  });

  const serialized = serializeAdminOrder(result);
  await sendOrderStatusEmail(serialized, status).catch(() => null);
  return serialized;
}

export async function updateShipment(orderNumber, payload) {
  const { status, trackingNumber, estimatedArrival, description } = payload;

  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { orderNumber },
      include: orderInclude,
    });
    if (!order) throw new NotFoundError("Pesanan tidak ditemukan");

    if (
      ["PENDING_PAYMENT", "CANCELLED", "EXPIRED", "FAILED", "REFUNDED"].includes(
        order.status,
      )
    ) {
      throw new AppError(
        "Status pesanan belum memungkinkan pembaruan pengiriman",
        409,
      );
    }

    const shipment = await ensureShipmentForOrder(order, tx);

    const data = {};
    if (status) data.status = status;
    if ("trackingNumber" in payload) {
      data.trackingNumber = trackingNumber ? trackingNumber.trim() : null;
    }
    if ("estimatedArrival" in payload) {
      data.estimatedArrival = estimatedArrival;
    }
    if (status && ["PICKED_UP", "IN_TRANSIT", "SHIPPED"].includes(status)) {
      data.shippedAt = shipment.shippedAt ?? new Date();
    }
    if (status === "DELIVERED") {
      data.deliveredAt = new Date();
      data.shippedAt = shipment.shippedAt ?? new Date();
    }

    await tx.shipment.update({
      where: { id: shipment.id },
      data,
    });

    if (status) {
      await tx.shipmentEvent.create({
        data: {
          shipmentId: shipment.id,
          status,
          description: description || null,
          source: "admin",
        },
      });
    }

    let orderStatus = order.status;
    if (status === "DELIVERED" && order.status !== "DELIVERED") {
      orderStatus = "DELIVERED";
    } else if (
      ["PICKED_UP", "IN_TRANSIT", "SHIPPED"].includes(status) &&
      ["PAID", "PROCESSING"].includes(order.status)
    ) {
      orderStatus = "SHIPPED";
    }

    if (orderStatus !== order.status) {
      await tx.order.update({
        where: { id: order.id },
        data: { status: orderStatus },
      });
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: orderStatus,
          source: "shipment",
          note: description || `Status pengiriman ${status}`,
        },
      });
      await createNotification(
        {
          userId: order.userId,
          type: "ORDER",
          title: `Pesanan ${order.orderNumber}: ${orderStatus}`,
          body: description || `Status pesanan diperbarui menjadi ${orderStatus}.`,
          link: `/pesanan/${order.orderNumber}`,
        },
        tx,
      );
    }

  });

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { ...orderInclude, user: true },
  });

  return serializeAdminOrder(order);
}

function serializeNewsSummary(article) {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    coverImage: article.coverImage,
    category: article.category,
    viewCount: article.viewCount,
    isPublished: article.isPublished,
    publishedAt: article.publishedAt,
    productCount: article._count?.products ?? article.products?.length ?? 0,
  };
}

export async function listNews({ q, page, limit }) {
  const where = {};
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { excerpt: { contains: q } },
      { category: { contains: q } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.newsArticle.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { _count: { select: { products: true } } },
    }),
    prisma.newsArticle.count({ where }),
  ]);

  return { items: items.map(serializeNewsSummary), total, page, limit };
}

export async function getNews(id) {
  const article = await prisma.newsArticle.findUnique({
    where: { id },
    include: { products: { include: { product: true } } },
  });
  if (!article) throw new NotFoundError("Artikel news tidak ditemukan");

  return {
    ...serializeNewsSummary(article),
    content: article.content,
    products: article.products.map((entry) => ({
      id: entry.product.id,
      name: entry.product.name,
      slug: entry.product.slug,
    })),
  };
}

async function syncNewsProducts(newsArticleId, productIds, tx) {
  await tx.newsArticleProduct.deleteMany({ where: { newsArticleId } });
  for (const productId of [...new Set(productIds ?? [])]) {
    await tx.newsArticleProduct.create({
      data: { newsArticleId, productId },
    });
  }
}

export async function createNews(payload) {
  const { productIds = [], ...fields } = payload;
  const slug = await uniqueSlug("newsArticle", fields.slug || fields.title);

  const article = await prisma.$transaction(async (tx) => {
    const created = await tx.newsArticle.create({
      data: {
        slug,
        title: fields.title,
        excerpt: fields.excerpt ?? null,
        content: fields.content,
        coverImage: fields.coverImage ?? null,
        category: fields.category,
        isPublished: fields.isPublished !== false,
        publishedAt:
          fields.publishedAt ??
          (fields.isPublished !== false ? new Date() : new Date()),
      },
      include: { _count: { select: { products: true } } },
    });
    await syncNewsProducts(created.id, productIds, tx);
    return created;
  });

  return getNews(article.id);
}

export async function updateNews(id, payload) {
  const article = await prisma.newsArticle.findUnique({ where: { id } });
  if (!article) throw new NotFoundError("Artikel news tidak ditemukan");

  const { productIds, ...fields } = payload;
  const data = { ...fields };
  if (fields.slug) {
    data.slug = await uniqueSlug("newsArticle", fields.slug, prisma, id);
  }
  if (fields.isPublished === true && !article.publishedAt && !fields.publishedAt) {
    data.publishedAt = new Date();
  }

  await prisma.$transaction(async (tx) => {
    await tx.newsArticle.update({ where: { id }, data });
    if (productIds !== undefined) {
      await syncNewsProducts(id, productIds, tx);
    }
  });

  return getNews(id);
}

export async function deleteNews(id) {
  const article = await prisma.newsArticle.findUnique({ where: { id } });
  if (!article) throw new NotFoundError("Artikel news tidak ditemukan");
  await prisma.newsArticle.delete({ where: { id } });
  return { id };
}

function serializeHelp(article) {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    category: article.category,
    excerpt: article.excerpt,
    content: article.content,
    isPublished: article.isPublished,
    sortOrder: article.sortOrder,
    updatedAt: article.updatedAt,
  };
}

export async function listHelp({ q, page, limit }) {
  const where = {};
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { excerpt: { contains: q } },
      { category: { contains: q } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.helpArticle.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.helpArticle.count({ where }),
  ]);

  return { items: items.map(serializeHelp), total, page, limit };
}

export async function getHelp(id) {
  const article = await prisma.helpArticle.findUnique({ where: { id } });
  if (!article) throw new NotFoundError("Artikel bantuan tidak ditemukan");
  return serializeHelp(article);
}

export async function createHelp(payload) {
  const slug = await uniqueSlug("helpArticle", payload.slug || payload.title);
  const article = await prisma.helpArticle.create({
    data: {
      slug,
      title: payload.title,
      category: payload.category,
      excerpt: payload.excerpt ?? null,
      content: payload.content,
      isPublished: payload.isPublished !== false,
      sortOrder: payload.sortOrder ?? 0,
    },
  });
  return serializeHelp(article);
}

export async function updateHelp(id, payload) {
  const article = await prisma.helpArticle.findUnique({ where: { id } });
  if (!article) throw new NotFoundError("Artikel bantuan tidak ditemukan");

  const data = { ...payload };
  if (payload.slug) {
    data.slug = await uniqueSlug("helpArticle", payload.slug, prisma, id);
  }

  const updated = await prisma.helpArticle.update({ where: { id }, data });
  return serializeHelp(updated);
}

export async function deleteHelp(id) {
  const article = await prisma.helpArticle.findUnique({ where: { id } });
  if (!article) throw new NotFoundError("Artikel bantuan tidak ditemukan");
  await prisma.helpArticle.delete({ where: { id } });
  return { id };
}

function serializeCoupon(coupon) {
  return {
    id: coupon.id,
    code: coupon.code,
    description: coupon.description,
    type: coupon.type,
    value: coupon.value,
    minSpend: coupon.minSpend,
    maxDiscount: coupon.maxDiscount,
    usageLimit: coupon.usageLimit,
    usageCount: coupon.usageCount,
    perUserLimit: coupon.perUserLimit,
    startsAt: coupon.startsAt,
    expiresAt: coupon.expiresAt,
    isActive: coupon.isActive,
    createdAt: coupon.createdAt,
  };
}

export async function listCoupons({ q, status, page, limit }) {
  const where = {};
  if (q) {
    where.OR = [
      { code: { contains: q.toUpperCase() } },
      { description: { contains: q } },
    ];
  }
  if (status === "active") {
    where.isActive = true;
    where.expiresAt = { gt: new Date() };
  } else if (status === "inactive") {
    where.isActive = false;
  } else if (status === "expired") {
    where.expiresAt = { lte: new Date() };
  }

  const [items, total] = await Promise.all([
    prisma.coupon.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.coupon.count({ where }),
  ]);

  return { items: items.map(serializeCoupon), total, page, limit };
}

function assertCouponValues(payload) {
  if (payload.type === "PERCENT" && payload.value > 100) {
    throw new AppError("Nilai voucher persen maksimal 100", 422, [
      { field: "value", message: "Nilai persen maksimal 100" },
    ]);
  }
  if (
    payload.maxDiscount != null &&
    payload.minSpend != null &&
    payload.maxDiscount <= 0
  ) {
    throw new AppError("Maksimal diskon harus lebih dari 0", 422);
  }
}

export async function createCoupon(payload) {
  assertCouponValues(payload);

  const existing = await prisma.coupon.findUnique({
    where: { code: payload.code },
  });
  if (existing) {
    throw new AppError("Kode voucher sudah digunakan", 409, [
      { field: "code", message: "Kode voucher sudah digunakan" },
    ]);
  }

  const coupon = await prisma.coupon.create({
    data: {
      code: payload.code,
      description: payload.description ?? null,
      type: payload.type,
      value: payload.value,
      minSpend: payload.minSpend ?? 0,
      maxDiscount: payload.maxDiscount ?? null,
      usageLimit: payload.usageLimit ?? null,
      perUserLimit: payload.perUserLimit ?? 1,
      startsAt: payload.startsAt ?? new Date(),
      expiresAt: payload.expiresAt,
      isActive: payload.isActive !== false,
    },
  });
  return serializeCoupon(coupon);
}

export async function updateCoupon(id, payload) {
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) throw new NotFoundError("Voucher tidak ditemukan");

  const merged = {
    type: payload.type ?? coupon.type,
    value: payload.value ?? coupon.value,
    minSpend: payload.minSpend ?? coupon.minSpend,
    maxDiscount:
      "maxDiscount" in payload ? payload.maxDiscount : coupon.maxDiscount,
  };
  assertCouponValues(merged);

  if (payload.code && payload.code !== coupon.code) {
    const existing = await prisma.coupon.findUnique({
      where: { code: payload.code },
    });
    if (existing) {
      throw new AppError("Kode voucher sudah digunakan", 409, [
        { field: "code", message: "Kode voucher sudah digunakan" },
      ]);
    }
  }

  const updated = await prisma.coupon.update({
    where: { id },
    data: payload,
  });
  return serializeCoupon(updated);
}

export async function deleteCoupon(id) {
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) throw new NotFoundError("Voucher tidak ditemukan");
  await prisma.coupon.update({
    where: { id },
    data: { isActive: false },
  });
  return { id };
}
