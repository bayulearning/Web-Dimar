import { Router } from "express";
import {
  deleteAddressHandler,
  getAddresses,
  patchAddress,
  postAddress,
} from "../controllers/address.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authenticate, requireAuth } from "../middlewares/auth.js";
import { validateBody, validateParams } from "../validators/common.js";
import {
  addressIdSchema,
  createAddressSchema,
  updateAddressSchema,
} from "../validators/address.validator.js";

export const addressRouter = Router();

addressRouter.use(authenticate, requireAuth);

addressRouter.get("/", asyncHandler(getAddresses));
addressRouter.post(
  "/",
  validateBody(createAddressSchema),
  asyncHandler(postAddress),
);
addressRouter.patch(
  "/:id",
  validateParams(addressIdSchema),
  validateBody(updateAddressSchema),
  asyncHandler(patchAddress),
);
addressRouter.delete(
  "/:id",
  validateParams(addressIdSchema),
  asyncHandler(deleteAddressHandler),
);
