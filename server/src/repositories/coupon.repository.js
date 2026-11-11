import { prisma } from "../lib/prisma.js";

export const INACTIVE_ORDER_STATUSES = ["CANCELLED", "EXPIRED", "FAILED"];

export function findCouponByCode(code, client = prisma) {
  return client.coupon.findUnique({ where: { code } });
}

export function countUserCouponOrders(userId, couponId, client = prisma) {
  return client.order.count({
    where: {
      userId,
      couponId,
      status: { notIn: INACTIVE_ORDER_STATUSES },
    },
  });
}

export function incrementCouponUsage(couponId, client = prisma) {
  return client.coupon.update({
    where: { id: couponId },
    data: { usageCount: { increment: 1 } },
  });
}

export function decrementCouponUsage(couponId, client = prisma) {
  return client.coupon.updateMany({
    where: { id: couponId, usageCount: { gt: 0 } },
    data: { usageCount: { decrement: 1 } },
  });
}
