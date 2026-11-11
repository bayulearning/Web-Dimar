import { Router } from "express";
import {
  getNewsArticleDetail,
  getNewsArticles,
  getNewsCategories,
} from "../controllers/news.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateParams, validateQuery } from "../validators/common.js";
import {
  contentSlugParamSchema,
  newsListQuerySchema,
} from "../validators/content.validator.js";

export const newsRouter = Router();

newsRouter.get("/", validateQuery(newsListQuerySchema), asyncHandler(getNewsArticles));
newsRouter.get("/categories", asyncHandler(getNewsCategories));
newsRouter.get(
  "/:slug",
  validateParams(contentSlugParamSchema),
  asyncHandler(getNewsArticleDetail),
);
