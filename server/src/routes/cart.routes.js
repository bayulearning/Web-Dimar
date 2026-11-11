import { Router } from "express";
import {
  deleteCart,
  deleteCartItem,
  getCartHandler,
  patchCartItem,
  postCartItem,
  postCartMerge,
} from "../controllers/cart.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authenticate, requireAuth } from "../middlewares/auth.js";
import { validateBody, validateParams } from "../validators/common.js";
import {
  cartItemIdSchema,
  cartItemSchema,
  cartItemUpdateSchema,
  cartMergeSchema,
} from "../validators/cart.validator.js";

export const cartRouter = Router();

cartRouter.use(authenticate, requireAuth);

cartRouter.get("/", asyncHandler(getCartHandler));
cartRouter.post(
  "/items",
  validateBody(cartItemSchema),
  asyncHandler(postCartItem),
);
cartRouter.patch(
  "/items/:id",
  validateParams(cartItemIdSchema),
  validateBody(cartItemUpdateSchema),
  asyncHandler(patchCartItem),
);
cartRouter.delete(
  "/items/:id",
  validateParams(cartItemIdSchema),
  asyncHandler(deleteCartItem),
);
cartRouter.delete("/", asyncHandler(deleteCart));
cartRouter.post(
  "/merge",
  validateBody(cartMergeSchema),
  asyncHandler(postCartMerge),
);
