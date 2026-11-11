import { z } from "zod";

const addressFields = {
  label: z.string().trim().min(1).max(40),
  recipientName: z.string().trim().min(2).max(80),
  phone: z
    .string()
    .trim()
    .min(8)
    .max(20)
    .regex(/^[0-9+\-\s]+$/, "Nomor telepon tidak valid"),
  province: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(80),
  district: z.string().trim().min(2).max(80),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "Kode pos harus 5 digit"),
  detail: z.string().trim().min(5).max(240),
  isDefault: z.boolean().optional(),
};

export const createAddressSchema = z.object({
  ...addressFields,
  label: addressFields.label.default("Rumah"),
});

export const updateAddressSchema = z
  .object(addressFields)
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Tidak ada data yang diubah",
  });

export const addressIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});
