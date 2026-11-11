import { prisma } from "../lib/prisma.js";

export function findNotifications(
  userId,
  { where = {}, skip = 0, take = 20 } = {},
  client = prisma,
) {
  return client.notification.findMany({
    where: { userId, ...where },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });
}

export function countNotifications(userId, where = {}, client = prisma) {
  return client.notification.count({ where: { userId, ...where } });
}

export function countUnreadNotifications(userId, client = prisma) {
  return client.notification.count({ where: { userId, isRead: false } });
}

export function findNotificationForUser(id, userId, client = prisma) {
  return client.notification.findFirst({ where: { id, userId } });
}

export function markNotificationRead(id, userId, client = prisma) {
  return client.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });
}

export function markAllNotificationsRead(userId, client = prisma) {
  return client.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

export function createNotification(data, client = prisma) {
  return client.notification.create({ data });
}
