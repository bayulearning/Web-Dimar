import { z } from "zod";

const shippingText = z.string().trim().min(1).max(40);

export const checkoutPreviewSchema = z.object({
  shippingProvider: shippingText.optional(),
  shippingService: shippingText.optional(),
  couponCode: z
    .string()
    .trim()
    .max(40)
    .optional()
    .transform((value) => (value ? value.toUpperCase() : undefined)),
});

export const createOrderSchema = z.object({
  addressId: z.coerce.number().int().positive(),
  shippingProvider: shippingText,
  shippingService: shippingText,
  couponCode: z
    .string()
    .trim()
    .max(40)
    .optional()
    .transform((value) => (value ? value.toUpperCase() : undefined)),
  notes: z.string().trim().max(240).optional().or(z.literal("")),
});

export const orderNumberParamSchema = z.object({
  orderNumber: z.string().trim().min(3).max(40),
});

export const orderListQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .max(40)
    .optional()
    .transform((value) => (value ? value.toUpperCase() : undefined)),
  status: z
    .enum([
      "PENDING_PAYMENT",
      "PAID",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "EXPIRED",
      "FAILED",
      "REFUNDED",
    ])
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});
