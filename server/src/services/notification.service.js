import {
  countNotifications,
  countUnreadNotifications,
  createNotification,
  findNotificationForUser,
  findNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../repositories/notification.repository.js";
import { NotFoundError } from "../utils/AppError.js";

function serializeNotification(notification) {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    link: notification.link,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
  };
}

export async function listNotifications(userId, { type, unread, page, limit }) {
  const where = {};
  if (type) where.type = type;
  if (unread) where.isRead = false;

  const [items, total, unreadCount] = await Promise.all([
    findNotifications(userId, {
      where,
      skip: (page - 1) * limit,
      take: limit,
    }),
    countNotifications(userId, where),
    countUnreadNotifications(userId),
  ]);

  return {
    items: items.map(serializeNotification),
    total,
    page,
    limit,
    unreadCount,
  };
}

export async function readNotification(userId, id) {
  const existing = await findNotificationForUser(id, userId);
  if (!existing) throw new NotFoundError("Notifikasi tidak ditemukan");

  if (!existing.isRead) {
    await markNotificationRead(id, userId);
  }

  return serializeNotification({ ...existing, isRead: true });
}

export async function readAllNotifications(userId) {
  const result = await markAllNotificationsRead(userId);
  return { updated: result.count };
}

export async function notifyUser(data, client) {
  return createNotification(data, client);
}
