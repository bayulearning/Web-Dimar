import { Router } from "express";
import {
  getRobotsTxtController,
  getSitemapXmlController,
} from "../controllers/seo.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const seoRouter = Router();

seoRouter.get("/sitemap.xml", asyncHandler(getSitemapXmlController));
seoRouter.get("/robots.txt", getRobotsTxtController);
