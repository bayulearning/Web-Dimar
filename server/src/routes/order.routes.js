import { Router } from "express";
import {
  getOrder,
  getOrders,
  postCheckoutPreview,
  postOrder,
} from "../controllers/order.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authenticate, requireAuth } from "../middlewares/auth.js";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../validators/common.js";
import {
  checkoutPreviewSchema,
  createOrderSchema,
  orderListQuerySchema,
  orderNumberParamSchema,
} from "../validators/order.validator.js";

export const orderRouter = Router();

orderRouter.use(authenticate, requireAuth);

orderRouter.post(
  "/preview",
  validateBody(checkoutPreviewSchema),
  asyncHandler(postCheckoutPreview),
);
orderRouter.post("/", validateBody(createOrderSchema), asyncHandler(postOrder));
orderRouter.get(
  "/",
  validateQuery(orderListQuerySchema),
  asyncHandler(getOrders),
);
orderRouter.get(
  "/:orderNumber",
  validateParams(orderNumberParamSchema),
  asyncHandler(getOrder),
);
