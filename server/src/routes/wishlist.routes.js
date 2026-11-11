import { Router } from "express";
import {
  deleteWishlistItemHandler,
  getWishlistHandler,
  postWishlistItem,
  postWishlistMerge,
} from "../controllers/wishlist.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authenticate, requireAuth } from "../middlewares/auth.js";
import { validateBody, validateParams } from "../validators/common.js";
import {
  wishlistItemSchema,
  wishlistMergeSchema,
  wishlistProductIdSchema,
} from "../validators/wishlist.validator.js";

export const wishlistRouter = Router();

wishlistRouter.use(authenticate, requireAuth);

wishlistRouter.get("/", asyncHandler(getWishlistHandler));
wishlistRouter.post(
  "/",
  validateBody(wishlistItemSchema),
  asyncHandler(postWishlistItem),
);
wishlistRouter.post(
  "/merge",
  validateBody(wishlistMergeSchema),
  asyncHandler(postWishlistMerge),
);
wishlistRouter.delete(
  "/:productId",
  validateParams(wishlistProductIdSchema),
  asyncHandler(deleteWishlistItemHandler),
);
