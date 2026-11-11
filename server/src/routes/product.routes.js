import { Router } from "express";
import { getProducts, getProductDetail } from "../controllers/product.controller.js";
import {
  productListQuerySchema,
  productSlugParamSchema,
  validateParams,
  validateQuery,
} from "../validators/product.validator.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const productRouter = Router();

productRouter.get(
  "/",
  validateQuery(productListQuerySchema),
  asyncHandler(getProducts),
);

productRouter.get(
  "/:slug",
  validateParams(productSlugParamSchema),
  asyncHandler(getProductDetail),
);
