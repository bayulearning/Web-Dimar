import { prisma } from "../lib/prisma.js";

export const orderInclude = {
  items: {
    orderBy: { id: "asc" },
    include: {
      product: {
        select: {
          slug: true,
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
        },
      },
    },
  },
  payments: { orderBy: { createdAt: "desc" }, take: 1 },
  shipments: {
    orderBy: { createdAt: "desc" },
    take: 1,
    include: { events: { orderBy: { occurredAt: "asc" } } },
  },
  statusHistory: { orderBy: { createdAt: "asc" } },
};

export function findOrderByNumber(orderNumber, client = prisma) {
  return client.order.findUnique({
    where: { orderNumber },
    include: orderInclude,
  });
}

export function findOrderForUser(userId, orderNumber, client = prisma) {
  return client.order.findFirst({
    where: { orderNumber, userId },
    include: orderInclude,
  });
}

export function findOrdersForUser(
  userId,
  { where = {}, skip = 0, take = 10 } = {},
  client = prisma,
) {
  return client.order.findMany({
    where: { userId, ...where },
    orderBy: { createdAt: "desc" },
    skip,
    take,
    include: orderInclude,
  });
}

export function countOrdersForUser(userId, where = {}, client = prisma) {
  return client.order.count({ where: { userId, ...where } });
}
