import { Router } from "express";
import { postContactMessage } from "../controllers/contact.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { rateLimit } from "../middlewares/rateLimit.js";
import { validateBody } from "../validators/common.js";
import { contactMessageSchema } from "../validators/content.validator.js";

export const contactRouter = Router();

contactRouter.post(
  "/",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Terlalu banyak pesan dari alamat ini. Coba lagi nanti.",
  }),
  validateBody(contactMessageSchema),
  asyncHandler(postContactMessage),
);
