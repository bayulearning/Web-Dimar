import { Router } from "express";
import { getShippingServices } from "../controllers/shipping.controller.js";

export const shippingRouter = Router();

shippingRouter.get("/services", getShippingServices);
