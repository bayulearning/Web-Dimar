import { z } from "zod";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(160)
  .email("Format email tidak valid");

const password = z
  .string()
  .min(8, "Password minimal 8 karakter")
  .max(72, "Password maksimal 72 karakter");

const phone = z
  .string()
  .trim()
  .min(8, "Nomor telepon minimal 8 karakter")
  .max(20, "Nomor telepon maksimal 20 karakter")
  .regex(/^[0-9+\-\s]+$/, "Nomor telepon tidak valid");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(80),
  email,
  password,
  phone: phone.optional().or(z.literal("")),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password wajib diisi").max(72),
});

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    phone: phone.optional().or(z.literal("")),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Tidak ada data yang diubah",
  });
