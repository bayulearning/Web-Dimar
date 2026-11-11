import { z } from "zod";

export const wishlistItemSchema = z.object({
  productId: z.coerce.number().int().positive(),
});

export const wishlistMergeSchema = z.object({
  productIds: z.array(z.coerce.number().int().positive()).max(100).default([]),
});

export const wishlistProductIdSchema = z.object({
  productId: z.coerce.number().int().positive(),
});
