import { Router } from "express";
import { getSitemapController } from "../controllers/sitemap.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const sitemapRouter = Router();

sitemapRouter.get("/", asyncHandler(getSitemapController));
