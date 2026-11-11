import { prisma } from "../lib/prisma.js";

export function findPaymentByOrderId(orderId, client = prisma) {
  return client.payment.findFirst({
    where: { orderId },
    orderBy: { createdAt: "desc" },
  });
}

export function createPayment(data, client = prisma) {
  return client.payment.create({ data });
}

export function updatePayment(id, data, client = prisma) {
  return client.payment.update({ where: { id }, data });
}

export function findPaymentEvent(eventKey, client = prisma) {
  return client.paymentEvent.findUnique({ where: { eventKey } });
}

export function createPaymentEvent(data, client = prisma) {
  return client.paymentEvent.create({ data });
}
