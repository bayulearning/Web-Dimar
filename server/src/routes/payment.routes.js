import { Router } from "express";
import {
  getConfig,
  getStatus,
  postMockSettle,
  postNotification,
  postSnapToken,
} from "../controllers/payment.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authenticate, requireAuth } from "../middlewares/auth.js";
import { validateBody, validateParams } from "../validators/common.js";
import {
  mockSettleSchema,
  notificationSchema,
  snapTokenSchema,
} from "../validators/payment.validator.js";
import { orderNumberParamSchema } from "../validators/order.validator.js";

export const paymentRouter = Router();

paymentRouter.get("/config", getConfig);

paymentRouter.post(
  "/midtrans/notification",
  validateBody(notificationSchema),
  asyncHandler(postNotification),
);

paymentRouter.post(
  "/midtrans/snap-token",
  authenticate,
  requireAuth,
  validateBody(snapTokenSchema),
  asyncHandler(postSnapToken),
);

paymentRouter.post(
  "/mock/settle",
  authenticate,
  requireAuth,
  validateBody(mockSettleSchema),
  asyncHandler(postMockSettle),
);

paymentRouter.get(
  "/:orderNumber/status",
  authenticate,
  requireAuth,
  validateParams(orderNumberParamSchema),
  asyncHandler(getStatus),
);
