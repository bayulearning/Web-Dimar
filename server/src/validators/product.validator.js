import { z } from "zod";

export {
  parseOrThrow,
  validateBody,
  validateParams,
  validateQuery,
} from "./common.js";

export const productListQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  category: z.string().trim().max(80).optional(),
  gender: z.enum(["men", "women", "kids", "unisex"]).optional(),
  size: z
    .string()
    .trim()
    .max(20)
    .optional()
    .transform((value) =>
      value && /^\d+$/.test(value) ? `EU ${value}` : value,
    ),
  color: z.string().trim().max(40).optional(),
  badge: z.string().trim().max(30).optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  sort: z
    .enum(["newest", "price_asc", "price_desc", "rating", "popular"])
    .default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
});

export const productSlugParamSchema = z.object({
  slug: z.string().trim().min(1).max(160),
});
