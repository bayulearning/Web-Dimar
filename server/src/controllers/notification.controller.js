import {
  listNotifications,
  readAllNotifications,
  readNotification,
} from "../services/notification.service.js";
import { paginationMeta, successResponse } from "../utils/apiResponse.js";

export async function getNotifications(req, res) {
  const { page, limit, ...filters } = req.validatedQuery;
  const result = await listNotifications(req.user.id, { page, limit, ...filters });

  return successResponse(res, {
    message: "Notifikasi berhasil diambil",
    data: result.items,
    meta: {
      ...paginationMeta({ page, limit, total: result.total }),
      unreadCount: result.unreadCount,
    },
  });
}

export async function patchNotificationRead(req, res) {
  const notification = await readNotification(
    req.user.id,
    req.validatedParams.id,
  );

  return successResponse(res, {
    message: "Notifikasi ditandai sudah dibaca",
    data: notification,
  });
}

export async function patchNotificationsReadAll(req, res) {
  const result = await readAllNotifications(req.user.id);

  return successResponse(res, {
    message: "Semua notifikasi ditandai sudah dibaca",
    data: result,
  });
}
