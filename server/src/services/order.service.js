import crypto from "crypto";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { findCartByUserId } from "../repositories/cart.repository.js";
import {
  countUserCouponOrders,
  decrementCouponUsage,
  findCouponByCode,
  incrementCouponUsage,
} from "../repositories/coupon.repository.js";
import {
  countOrdersForUser,
  findOrderForUser,
  findOrdersForUser,
  orderInclude,
} from "../repositories/order.repository.js";
import { getPaymentProvider, paymentMode } from "../lib/payment/index.js";
import { getShippingAdapter } from "../lib/shipping/index.js";
import { createNotification } from "../repositories/notification.repository.js";
import { sendOrderCreatedEmail } from "./email.service.js";
import { AppError, NotFoundError } from "../utils/AppError.js";
import { formatRupiah } from "../utils/money.js";
import {
  availableStock,
  calculateDiscount,
  calculateOrderTotal,
} from "../utils/pricing.js";

const MAX_QUANTITY = 10;

function itemPrice(item) {
  return item.variant.priceOverride ?? item.product.effectivePrice;
}

function primaryImage(product) {
  return product.images?.find((image) => image.isPrimary) ?? product.images?.[0] ?? null;
}

function buildCartSnapshot(cart) {
  if (!cart || cart.items.length === 0) {
    throw new AppError("Keranjang belanja kosong", 400);
  }

  const items = cart.items.map((item) => ({
    cartItemId: item.id,
    productId: item.productId,
    variantId: item.variantId,
    slug: item.product.slug,
    productName: item.product.name,
    sku: item.variant.sku,
    size: item.variant.size,
    color: item.variant.color,
    image: primaryImage(item.product),
    unitPrice: itemPrice(item),
    quantity: item.quantity,
    stock: availableStock(item.variant?.inventory),
  }));

  const stockProblems = items.filter((item) => item.stock < item.quantity);
  if (stockProblems.length > 0) {
    throw new AppError(
      "Stok beberapa produk tidak mencukupi",
      409,
      stockProblems.map((item) => ({
        field: `variant:${item.variantId}`,
        message: `${item.productName} ukuran ${item.size} tersisa ${item.stock}`,
        variantId: item.variantId,
        requested: item.quantity,
        available: item.stock,
      })),
    );
  }

  const subtotal = items.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0,
  );
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return { items, subtotal, itemCount };
}

function resolveShipping(provider, service) {
  if (!provider && !service) return null;
  const adapter = getShippingAdapter();
  const match = adapter.findService(provider, service);
  if (!match) {
    throw new AppError("Metode pengiriman tidak tersedia", 422, [
      { field: "shippingService", message: "Layanan pengiriman tidak valid" },
    ]);
  }
  return match;
}

async function resolveCoupon({ code, subtotal, userId, client = prisma }) {
  if (!code) return { coupon: null, discountTotal: 0 };

  const coupon = await findCouponByCode(code, client);
  const now = new Date();

  if (!coupon || !coupon.isActive) {
    throw new AppError("Kode voucher tidak valid", 422, [
      { field: "couponCode", message: "Voucher tidak ditemukan atau tidak aktif" },
    ]);
  }

  if (coupon.startsAt > now) {
    throw new AppError("Voucher belum berlaku", 422, [
      { field: "couponCode", message: "Voucher belum memasuki masa berlaku" },
    ]);
  }

  if (coupon.expiresAt < now) {
    throw new AppError("Voucher sudah kedaluwarsa", 422, [
      { field: "couponCode", message: "Masa berlaku voucher telah berakhir" },
    ]);
  }

  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    throw new AppError("Kuota voucher habis", 422, [
      { field: "couponCode", message: "Kuota penggunaan voucher telah habis" },
    ]);
  }

  const usedByUser = await countUserCouponOrders(userId, coupon.id, client);
  if (usedByUser >= coupon.perUserLimit) {
    throw new AppError("Batas penggunaan voucher tercapai", 422, [
      {
        field: "couponCode",
        message: "Anda telah mencapai batas penggunaan voucher ini",
      },
    ]);
  }

  if (subtotal < coupon.minSpend) {
    throw new AppError("Minimum transaksi belum terpenuhi", 422, [
      {
        field: "couponCode",
        message: `Voucher memerlukan minimal transaksi ${formatRupiah(coupon.minSpend)}`,
      },
    ]);
  }

  const discountTotal = calculateDiscount({
    type: coupon.type,
    value: coupon.value,
    maxDiscount: coupon.maxDiscount,
    subtotal,
  });

  return { coupon, discountTotal };
}

export async function previewCheckout(userId, payload) {
  const cart = await findCartByUserId(userId);
  const snapshot = buildCartSnapshot(cart);
  const shipping = resolveShipping(
    payload.shippingProvider,
    payload.shippingService,
  );
  const { coupon, discountTotal } = await resolveCoupon({
    code: payload.couponCode,
    subtotal: snapshot.subtotal,
    userId,
  });

  const shippingCost = shipping?.cost ?? 0;
  const total = calculateOrderTotal({
    subtotal: snapshot.subtotal,
    discountTotal,
    shippingCost,
  });

  return {
    items: snapshot.items,
    itemCount: snapshot.itemCount,
    subtotal: snapshot.subtotal,
    discountTotal,
    shippingCost,
    total,
    shipping: shipping
      ? {
          provider: shipping.provider,
          service: shipping.service,
          description: shipping.description,
          etaMinDays: shipping.etaMinDays,
          etaMaxDays: shipping.etaMaxDays,
          isMock: true,
        }
      : null,
    coupon: coupon
      ? {
          code: coupon.code,
          description: coupon.description,
          type: coupon.type,
          value: coupon.value,
          maxDiscount: coupon.maxDiscount,
        }
      : null,
  };
}

function buildOrderNumber() {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const suffix = crypto.randomBytes(4).toString("hex").toUpperCase().slice(0, 6);
  return `STR-${date}-${suffix}`;
}

function expiresAt() {
  return new Date(Date.now() + env.ORDER_EXPIRY_HOURS * 60 * 60 * 1000);
}

export async function createOrder(userId, payload) {
  const shipping = resolveShipping(
    payload.shippingProvider,
    payload.shippingService,
  );

  const order = await prisma.$transaction(async (tx) => {
    const address = await tx.address.findFirst({
      where: { id: payload.addressId, userId },
    });

    if (!address) {
      throw new NotFoundError("Alamat pengiriman tidak ditemukan");
    }

    const cart = await findCartByUserId(userId, tx);
    const snapshot = buildCartSnapshot(cart);
    const { coupon, discountTotal } = await resolveCoupon({
      code: payload.couponCode,
      subtotal: snapshot.subtotal,
      userId,
      client: tx,
    });

    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("Pengguna tidak ditemukan");

    const shippingCost = shipping.cost;
    const total = Math.max(
      0,
      snapshot.subtotal - discountTotal + shippingCost,
    );

    const created = await tx.order.create({
      data: {
        orderNumber: buildOrderNumber(),
        userId,
        addressId: address.id,
        status: "PENDING_PAYMENT",
        subtotal: snapshot.subtotal,
        discountTotal,
        shippingCost,
        total,
        couponId: coupon?.id ?? null,
        couponCode: coupon?.code ?? null,
        notes: payload.notes ? payload.notes.trim() : null,
        expiresAt: expiresAt(),
        recipientName: address.recipientName,
        phone: address.phone,
        email: user.email,
        province: address.province,
        city: address.city,
        district: address.district,
        postalCode: address.postalCode,
        addressDetail: address.detail,
        shippingProvider: shipping.provider,
        shippingService: shipping.service,
        items: {
          create: snapshot.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            productName: item.productName,
            sku: item.sku,
            size: item.size,
            color: item.color,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            lineTotal: item.unitPrice * item.quantity,
          })),
        },
        payments: {
          create: {
            provider: paymentMode(),
            status: "PENDING",
            grossAmount: total,
          },
        },
        statusHistory: {
          create: {
            fromStatus: null,
            toStatus: "PENDING_PAYMENT",
            source: "system",
            note: "Pesanan dibuat, menunggu pembayaran",
            actorId: userId,
          },
        },
      },
      include: orderInclude,
    });

    for (const item of snapshot.items) {
      await tx.inventory.update({
        where: { variantId: item.variantId },
        data: { reserved: { increment: item.quantity } },
      });
    }

    if (coupon) {
      await incrementCouponUsage(coupon.id, tx);
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    await createNotification(
      {
        userId,
        type: "ORDER",
        title: `Pesanan ${created.orderNumber} dibuat`,
        body: `Pesanan menunggu pembayaran. Total ${formatRupiah(total)}.`,
        link: `/pesanan/${created.orderNumber}`,
      },
      tx,
    );

    return created;
  });

  const serialized = serializeOrder(order);
  await sendOrderCreatedEmail(serialized).catch(() => null);
  return serialized;
}

export async function listOrdersForUser(userId, { q, status, page, limit }) {
  const where = {};
  if (status) where.status = status;
  if (q) where.orderNumber = { contains: q };

  const [items, total] = await Promise.all([
    findOrdersForUser(userId, {
      where,
      skip: (page - 1) * limit,
      take: limit,
    }),
    countOrdersForUser(userId, where),
  ]);

  return { items: items.map(serializeOrder), total, page, limit };
}

export async function getOrderForUser(userId, orderNumber) {
  const order = await findOrderForUser(userId, orderNumber);
  if (!order) throw new NotFoundError("Pesanan tidak ditemukan");
  return serializeOrder(order);
}

export async function releaseOrderInventory(order, tx, { restoreCoupon = true } = {}) {
  for (const item of order.items) {
    if (!item.variantId) continue;
    await tx.inventory.updateMany({
      where: { variantId: item.variantId, reserved: { gte: item.quantity } },
      data: { reserved: { decrement: item.quantity } },
    });
  }

  if (restoreCoupon && order.couponId) {
    await decrementCouponUsage(order.couponId, tx);
  }
}

export async function consumeOrderInventory(order, tx) {
  for (const item of order.items) {
    if (!item.variantId) continue;
    await tx.inventory.updateMany({
      where: { variantId: item.variantId, reserved: { gte: item.quantity } },
      data: {
        reserved: { decrement: item.quantity },
        quantity: { decrement: item.quantity },
      },
    });
  }
}

export function serializeOrder(order) {
  const payment = order.payments?.[0] ?? null;
  const shipment = order.shipments?.[0] ?? null;

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    subtotal: order.subtotal,
    discountTotal: order.discountTotal,
    shippingCost: order.shippingCost,
    total: order.total,
    couponCode: order.couponCode,
    notes: order.notes,
    createdAt: order.createdAt,
    expiresAt: order.expiresAt,
    paidAt: order.paidAt,
    cancelledAt: order.cancelledAt,
    recipient: {
      name: order.recipientName,
      phone: order.phone,
      email: order.email,
      province: order.province,
      city: order.city,
      district: order.district,
      postalCode: order.postalCode,
      detail: order.addressDetail,
    },
    shipping: {
      provider: order.shippingProvider,
      service: order.shippingService,
    },
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      slug: item.product?.slug ?? null,
      name: item.productName,
      sku: item.sku,
      size: item.size,
      color: item.color,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
      image: item.product?.images?.[0] ?? null,
    })),
    payment: payment
      ? {
          provider: payment.provider,
          status: payment.status,
          method: payment.method,
          grossAmount: payment.grossAmount,
          snapToken: payment.snapToken,
          snapRedirectUrl: payment.snapRedirectUrl,
          paidAt: payment.paidAt,
          expiresAt: payment.expiresAt,
        }
      : null,
    shipment: shipment
      ? {
          provider: shipment.provider,
          service: shipment.service,
          trackingNumber: shipment.trackingNumber,
          status: shipment.status,
          cost: shipment.cost,
          estimatedArrival: shipment.estimatedArrival,
          shippedAt: shipment.shippedAt,
          deliveredAt: shipment.deliveredAt,
          events: (shipment.events ?? []).map((event) => ({
            status: event.status,
            description: event.description,
            source: event.source,
            occurredAt: event.occurredAt,
          })),
        }
      : null,
    statusHistory: order.statusHistory.map((entry) => ({
      fromStatus: entry.fromStatus,
      toStatus: entry.toStatus,
      source: entry.source,
      note: entry.note,
      createdAt: entry.createdAt,
    })),
  };
}

export { availableStock, MAX_QUANTITY };
