import { z } from "zod";

export const notificationListQuerySchema = z.object({
  type: z.enum(["ORDER", "PROMO", "SYSTEM"]).optional(),
  unread: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const notificationIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
