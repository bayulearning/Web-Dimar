import { z } from "zod";

export const snapTokenSchema = z.object({
  orderNumber: z.string().trim().min(3).max(40),
});

export const mockSettleSchema = z.object({
  orderNumber: z.string().trim().min(3).max(40),
});

// Payload Midtrans berisi banyak field tambahan; hanya field wajib divalidasi.
export const notificationSchema = z
  .object({
    order_id: z.string().min(1),
    status_code: z.string().min(1),
    gross_amount: z.union([z.string(), z.number()]),
    signature_key: z.string().min(1),
    transaction_status: z.string().min(1),
  })
  .passthrough();
