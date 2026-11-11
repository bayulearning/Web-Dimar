import { z } from "zod";

export const cartItemSchema = z.object({
  variantId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().min(1).max(10).default(1),
});

export const cartItemUpdateSchema = z.object({
  quantity: z.coerce.number().int().min(1).max(10),
});

export const cartMergeSchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.coerce.number().int().positive(),
        quantity: z.coerce.number().int().min(1).max(10).default(1),
      }),
    )
    .max(50)
    .default([]),
});

export const cartItemIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});
