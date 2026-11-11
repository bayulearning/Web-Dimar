import { Router } from "express";
import {
  getHelpArticleDetail,
  getHelpArticles,
  getHelpCategories,
} from "../controllers/help.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateParams, validateQuery } from "../validators/common.js";
import {
  contentSlugParamSchema,
  helpListQuerySchema,
} from "../validators/content.validator.js";

export const helpRouter = Router();

helpRouter.get("/", validateQuery(helpListQuerySchema), asyncHandler(getHelpArticles));
helpRouter.get("/categories", asyncHandler(getHelpCategories));
helpRouter.get(
  "/:slug",
  validateParams(contentSlugParamSchema),
  asyncHandler(getHelpArticleDetail),
);
