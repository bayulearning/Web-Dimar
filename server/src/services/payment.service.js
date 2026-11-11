import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import {
  createPayment,
  createPaymentEvent,
  findPaymentByOrderId,
  findPaymentEvent,
  updatePayment,
} from "../repositories/payment.repository.js";
import {
  findOrderByNumber,
  findOrderForUser,
  orderInclude,
} from "../repositories/order.repository.js";
import {
  getPaymentConfig,
  getPaymentProvider,
  paymentMode,
} from "../lib/payment/index.js";
import { getShippingAdapter } from "../lib/shipping/index.js";
import {
  consumeOrderInventory,
  releaseOrderInventory,
  serializeOrder,
} from "./order.service.js";
import { createNotification } from "../repositories/notification.repository.js";
import { sendOrderStatusEmail } from "./email.service.js";
import { AppError, NotFoundError } from "../utils/AppError.js";

const PAYABLE_STATUS = "PENDING_PAYMENT";

function providerForPayment() {
  return getPaymentProvider(paymentMode());
}

async function ensurePayment(order, client = prisma) {
  const existing = await findPaymentByOrderId(order.id, client);
  if (existing) return existing;

  return createPayment(
    {
      orderId: order.id,
      provider: paymentMode(),
      status: "PENDING",
      grossAmount: order.total,
    },
    client,
  );
}

function paymentStatusFor(transactionStatus, fraudStatus) {
  const status = String(transactionStatus || "").toLowerCase();
  const fraud = String(fraudStatus || "").toLowerCase();

  if (status === "settlement") {
    return { paymentStatus: "SETTLEMENT", orderStatus: "PAID" };
  }

  if (status === "capture") {
    if (fraud === "accept") {
      return { paymentStatus: "SETTLEMENT", orderStatus: "PAID" };
    }
    if (fraud === "challenge") {
      return { paymentStatus: "CHALLENGE", orderStatus: null };
    }
    return { paymentStatus: "DENY", orderStatus: "CANCELLED" };
  }

  if (status === "pending") {
    return { paymentStatus: "PENDING", orderStatus: null };
  }

  if (status === "deny") {
    return { paymentStatus: "DENY", orderStatus: "CANCELLED" };
  }

  if (status === "cancel") {
    return { paymentStatus: "CANCEL", orderStatus: "CANCELLED" };
  }

  if (status === "expire") {
    return { paymentStatus: "EXPIRE", orderStatus: "EXPIRED" };
  }

  if (status === "failure") {
    return { paymentStatus: "FAILURE", orderStatus: "FAILED" };
  }

  if (status === "refund" || status === "partial_refund") {
    return { paymentStatus: "REFUND", orderStatus: "REFUNDED" };
  }

  if (status === "chargeback" || status === "partial_chargeback") {
    return { paymentStatus: "CHARGEBACK", orderStatus: "REFUNDED" };
  }

  return { paymentStatus: "PENDING", orderStatus: null };
}

function eventKeyFor(payload) {
  const identity =
    payload.transaction_id ||
    `${payload.order_id}:${payload.transaction_status}:${payload.status_code}`;
  return `${identity}:${payload.transaction_status}:${payload.fraud_status || "-"}`;
}

async function expireOrderIfNeeded(order) {
  if (order.status !== PAYABLE_STATUS) return order;
  if (!order.expiresAt || order.expiresAt > new Date()) return order;

  return prisma.$transaction(async (tx) => {
    const fresh = await findOrderByNumber(order.orderNumber, tx);
    if (fresh.status !== PAYABLE_STATUS) return fresh;

    await releaseOrderInventory(fresh, tx);
    await tx.order.update({
      where: { id: fresh.id },
      data: { status: "EXPIRED", cancelledAt: new Date() },
    });
    await tx.orderStatusHistory.create({
      data: {
        orderId: fresh.id,
        fromStatus: fresh.status,
        toStatus: "EXPIRED",
        source: "system",
        note: "Pesanan kedaluwarsa sebelum dibayar",
      },
    });
    const payment = await findPaymentByOrderId(fresh.id, tx);
    if (payment) {
      await updatePayment(payment.id, { status: "EXPIRE" }, tx);
    }

    return findOrderByNumber(order.orderNumber, tx);
  });
}

async function applyTransaction(orderNumber, payload, { signatureValid, source }) {
  return prisma.$transaction(async (tx) => {
    const order = await findOrderByNumber(orderNumber, tx);
    if (!order) throw new NotFoundError("Pesanan tidak ditemukan");

    const payment = await ensurePayment(order, tx);
    const eventKey = eventKeyFor(payload);
    const existingEvent = await findPaymentEvent(eventKey, tx);

    if (existingEvent) {
      const current = await findOrderByNumber(orderNumber, tx);
      return { duplicate: true, order: current, payment };
    }

    const { paymentStatus, orderStatus } = paymentStatusFor(
      payload.transaction_status,
      payload.fraud_status,
    );

    await createPaymentEvent(
      {
        paymentId: payment.id,
        eventKey,
        transactionStatus: String(payload.transaction_status),
        statusCode: payload.status_code ? String(payload.status_code) : null,
        fraudStatus: payload.fraud_status ? String(payload.fraud_status) : null,
        grossAmount: Math.round(Number(payload.gross_amount)),
        signatureValid,
        payload: JSON.stringify(payload),
      },
      tx,
    );

    const paymentUpdate = {
      status: paymentStatus,
      method: payload.payment_type || payment.method,
      fraudStatus: payload.fraud_status || payment.fraudStatus,
      rawResponse: JSON.stringify(payload),
    };

    if (paymentStatus === "SETTLEMENT") {
      paymentUpdate.paidAt = payment.paidAt || new Date();
    }

    await updatePayment(payment.id, paymentUpdate, tx);

    let nextOrder = order;

    if (orderStatus === "PAID" && order.status === PAYABLE_STATUS) {
      await consumeOrderInventory(order, tx);

      nextOrder = await tx.order.update({
        where: { id: order.id },
        data: { status: "PAID", paidAt: new Date() },
        include: orderInclude,
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: "PAID",
          source: "payment",
          note:
            source === "reconciliation"
              ? "Pembayaran direkonsiliasi dengan Midtrans"
              : "Pembayaran terverifikasi",
        },
      });

      const existingShipment = await tx.shipment.findFirst({
        where: { orderId: order.id },
      });

      if (!existingShipment) {
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
            description: "Pesanan dibayar, menunggu penjemputan kurir",
            source: "system",
          },
        });
      }

      await createNotification(
        {
          userId: order.userId,
          type: "ORDER",
          title: `Pembayaran ${order.orderNumber} berhasil`,
          body: "Pembayaran terverifikasi. Pesanan sedang disiapkan.",
          link: `/pesanan/${order.orderNumber}`,
        },
        tx,
      );
    } else if (
      ["CANCELLED", "EXPIRED", "FAILED"].includes(orderStatus) &&
      order.status === PAYABLE_STATUS
    ) {
      await releaseOrderInventory(order, tx);

      nextOrder = await tx.order.update({
        where: { id: order.id },
        data: { status: orderStatus, cancelledAt: new Date() },
        include: orderInclude,
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: orderStatus,
          source: "payment",
          note: `Pembayaran ${payload.transaction_status}`,
        },
      });

      await createNotification(
        {
          userId: order.userId,
          type: "ORDER",
          title: `Pesanan ${order.orderNumber} ${orderStatus.toLowerCase()}`,
          body: `Status pesanan diperbarui menjadi ${orderStatus}.`,
          link: `/pesanan/${order.orderNumber}`,
        },
        tx,
      );
    } else if (
      orderStatus === "REFUNDED" &&
      ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status)
    ) {
      nextOrder = await tx.order.update({
        where: { id: order.id },
        data: { status: "REFUNDED" },
        include: orderInclude,
      });
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: "REFUNDED",
          source: "payment",
          note: `Pembayaran ${payload.transaction_status}`,
        },
      });
    }

    return { duplicate: false, order: nextOrder, payment };
  });
}

export async function createSnapToken(userId, orderNumber) {
  let order = await findOrderForUser(userId, orderNumber);
  if (!order) throw new NotFoundError("Pesanan tidak ditemukan");

  order = await expireOrderIfNeeded(order);

  if (order.status !== PAYABLE_STATUS) {
    throw new AppError("Pesanan ini tidak dapat dibayar", 409);
  }

  const payment = await ensurePayment(order);
  const provider = providerForPayment();

  const transaction = await provider.createSnapTransaction({
    order,
    items: order.items,
    customer: {
      first_name: order.recipientName,
      email: order.email,
      phone: order.phone,
    },
  });

  await updatePayment(payment.id, {
    provider: provider.id,
    status: "PENDING",
    snapToken: transaction.token,
    snapRedirectUrl: transaction.redirectUrl,
    rawResponse: transaction.raw,
    expiresAt: order.expiresAt,
  });

  return {
    orderNumber: order.orderNumber,
    mode: provider.id,
    token: transaction.token,
    redirectUrl: transaction.redirectUrl,
    config: getPaymentConfig(),
  };
}

export async function handleNotification(payload) {
  const order = await findOrderByNumber(payload.order_id);
  if (!order) throw new NotFoundError("Pesanan tidak ditemukan");

  const payment = await ensurePayment(order);
  const provider = providerForPayment();

  if (!provider.verifySignature(payload)) {
    throw new AppError("Signature notifikasi tidak valid", 403);
  }

  const grossAmount = Math.round(Number(payload.gross_amount));
  if (!Number.isFinite(grossAmount) || grossAmount !== order.total) {
    throw new AppError("Nominal notifikasi tidak sesuai dengan pesanan", 400);
  }

  const result = await applyTransaction(order.orderNumber, payload, {
    signatureValid: true,
    source: "notification",
  });

  if (!result.duplicate) {
    await sendOrderStatusEmail(result.order, result.order.status).catch(
      () => null,
    );
  }

  return {
    duplicate: result.duplicate,
    orderNumber: order.orderNumber,
    orderStatus: result.order.status,
  };
}

export async function getPaymentStatus(userId, orderNumber) {
  let order = await findOrderForUser(userId, orderNumber);
  if (!order) throw new NotFoundError("Pesanan tidak ditemukan");

  order = await expireOrderIfNeeded(order);

  const payment = await findPaymentByOrderId(order.id);
  const provider = payment ? providerForPayment() : null;

  if (
    payment &&
    payment.status === "PENDING" &&
    payment.snapToken &&
    provider?.id === "midtrans"
  ) {
    try {
      const result = await provider.getTransactionStatus(order.orderNumber);
      if (result?.transaction_status) {
        const normalized = {
          ...result,
          order_id: order.orderNumber,
          status_code: result.status_code || "200",
          gross_amount: result.gross_amount || String(order.total),
        };
        await applyTransaction(order.orderNumber, normalized, {
          signatureValid: true,
          source: "reconciliation",
        });
        order = await findOrderForUser(userId, orderNumber);
      }
    } catch {
      // Rekonsiliasi bersifat best-effort; status lokal tetap dikembalikan.
    }
  }

  return {
    ...serializeOrder(order),
    paymentConfig: getPaymentConfig(),
  };
}

export async function simulateMockSettlement(userId, orderNumber) {
  if (env.isProduction || paymentMode() !== "mock") {
    throw new AppError("Simulasi pembayaran hanya tersedia pada mode mock development", 403);
  }

  const order = await findOrderForUser(userId, orderNumber);
  if (!order) throw new NotFoundError("Pesanan tidak ditemukan");

  if (order.status !== PAYABLE_STATUS) {
    throw new AppError("Pesanan ini tidak dapat dibayar", 409);
  }

  const provider = getPaymentProvider("mock");
  const payload = {
    order_id: order.orderNumber,
    status_code: "200",
    gross_amount: String(order.total),
    transaction_status: "settlement",
    fraud_status: "accept",
    transaction_id: `mock-${order.orderNumber}`,
    payment_type: "mock",
  };
  payload.signature_key = provider.signNotification({
    orderId: payload.order_id,
    statusCode: payload.status_code,
    grossAmount: payload.gross_amount,
  });

  await handleNotification(payload);

  const updated = await findOrderForUser(userId, orderNumber);
  return serializeOrder(updated);
}

export { applyTransaction, paymentStatusFor };
