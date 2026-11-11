import { Router } from "express";
import {
  getMe,
  patchMe,
  postLogin,
  postLogout,
  postRegister,
} from "../controllers/auth.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authenticate, requireAuth } from "../middlewares/auth.js";
import { rateLimit } from "../middlewares/rateLimit.js";
import { validateBody } from "../validators/common.js";
import {
  loginSchema,
  registerSchema,
  updateProfileSchema,
} from "../validators/auth.validator.js";

export const authRouter = Router();

authRouter.post(
  "/register",
  rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: "Terlalu banyak pendaftaran dari alamat ini. Coba lagi nanti.",
  }),
  validateBody(registerSchema),
  asyncHandler(postRegister),
);

authRouter.post(
  "/login",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: "Terlalu banyak percobaan login. Coba lagi dalam 15 menit.",
  }),
  validateBody(loginSchema),
  asyncHandler(postLogin),
);

authRouter.post("/logout", postLogout);

authRouter.get("/me", authenticate, requireAuth, getMe);

authRouter.patch(
  "/me",
  authenticate,
  requireAuth,
  validateBody(updateProfileSchema),
  asyncHandler(patchMe),
);
