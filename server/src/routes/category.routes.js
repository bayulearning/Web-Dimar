import { Router } from "express";
import {
  getCategories,
  getCategoryDetail,
} from "../controllers/category.controller.js";
import {
  productSlugParamSchema,
  validateParams,
} from "../validators/product.validator.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const categoryRouter = Router();

categoryRouter.get("/", asyncHandler(getCategories));

categoryRouter.get(
  "/:slug",
  validateParams(productSlugParamSchema),
  asyncHandler(getCategoryDetail),
);
