import { Router } from "express";
import {
  getNotifications,
  patchNotificationRead,
  patchNotificationsReadAll,
} from "../controllers/notification.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authenticate, requireAuth } from "../middlewares/auth.js";
import { validateParams, validateQuery } from "../validators/common.js";
import {
  notificationIdParamSchema,
  notificationListQuerySchema,
} from "../validators/notification.validator.js";

export const notificationRouter = Router();

notificationRouter.use(authenticate, requireAuth);

notificationRouter.get(
  "/",
  validateQuery(notificationListQuerySchema),
  asyncHandler(getNotifications),
);

notificationRouter.patch(
  "/read-all",
  asyncHandler(patchNotificationsReadAll),
);

notificationRouter.patch(
  "/:id/read",
  validateParams(notificationIdParamSchema),
  asyncHandler(patchNotificationRead),
);
