import { z } from "zod";

const id = z.coerce.number().int().positive();
const slug = z
  .string()
  .trim()
  .min(2)
  .max(140)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug hanya huruf kecil, angka, dan tanda minus");
const money = z.coerce.number().int().min(0);
const gender = z.enum(["men", "women", "kids", "unisex"]);
const badge = z.enum(["BARU", "TERLARIS", "POPULER", "EKSKLUSIF", "DISKON"]);

export const adminIdParamSchema = z.object({ id });
export const adminProductImageParamSchema = z.object({ id, imageId: id });
export const adminProductVariantParamSchema = z.object({ id, variantId: id });
export const adminOrderParamSchema = z.object({
  orderNumber: z.string().trim().min(3).max(40),
});

export const adminListQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  status: z.string().trim().max(30).optional(),
  category: z.string().trim().max(80).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const adminProductListQuerySchema = adminListQuerySchema.extend({
  status: z.enum(["all", "published", "draft", "deleted"]).default("all"),
});

const productFields = {
  sku: z.string().trim().min(2).max(40),
  name: z.string().trim().min(2).max(140),
  slug: slug,
  description: z.string().trim().min(10).max(4000),
  brand: z.string().trim().min(1).max(80).optional(),
  categoryId: id,
  gender: gender.default("unisex"),
  basePrice: money,
  salePrice: money.nullable().optional(),
  badge: badge.nullable().optional(),
  isPublished: z.boolean().default(true),
  publishedAt: z.coerce.date().nullable().optional(),
};

export const createProductSchema = z
  .object({
    ...productFields,
    slug: slug.optional(),
    images: z
      .array(
        z.object({
          url: z.string().trim().min(1).max(500),
          alt: z.string().trim().max(160).optional(),
          sortOrder: z.coerce.number().int().min(0).default(0),
          isPrimary: z.boolean().default(false),
        }),
      )
      .max(8)
      .optional(),
    variants: z
      .array(
        z.object({
          sku: z.string().trim().min(2).max(60).optional(),
          size: z.string().trim().min(1).max(20),
          color: z.string().trim().min(1).max(40),
          colorHex: z.string().trim().max(20).optional(),
          priceOverride: money.nullable().optional(),
          quantity: z.coerce.number().int().min(0).default(0),
          lowStockThreshold: z.coerce.number().int().min(0).default(3),
          isActive: z.boolean().default(true),
        }),
      )
      .max(80)
      .optional(),
  })
  .refine((value) => value.salePrice == null || value.salePrice <= value.basePrice, {
    message: "Harga diskon tidak boleh melebihi harga dasar",
    path: ["salePrice"],
  });

export const updateProductSchema = z
  .object({
    sku: productFields.sku.optional(),
    name: productFields.name.optional(),
    slug: slug.optional(),
    description: productFields.description.optional(),
    brand: productFields.brand,
    categoryId: id.optional(),
    gender: gender.optional(),
    basePrice: money.optional(),
    salePrice: money.nullable().optional(),
    badge: badge.nullable().optional(),
    isPublished: z.boolean().optional(),
    publishedAt: z.coerce.date().nullable().optional(),
  })
  .refine(
    (value) =>
      value.salePrice == null ||
      value.basePrice == null ||
      value.salePrice <= value.basePrice,
    {
      message: "Harga diskon tidak boleh melebihi harga dasar",
      path: ["salePrice"],
    },
  );

export const productImageSchema = z.object({
  url: z.string().trim().min(1).max(500),
  alt: z.string().trim().max(160).optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isPrimary: z.boolean().default(false),
});

export const updateProductImageSchema = productImageSchema.partial();

export const createVariantSchema = z.object({
  sku: z.string().trim().min(2).max(60).optional(),
  size: z.string().trim().min(1).max(20),
  color: z.string().trim().min(1).max(40),
  colorHex: z.string().trim().max(20).optional(),
  priceOverride: money.nullable().optional(),
  quantity: z.coerce.number().int().min(0).default(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(3),
  isActive: z.boolean().default(true),
});

export const updateVariantSchema = z.object({
  sku: z.string().trim().min(2).max(60).optional(),
  size: z.string().trim().min(1).max(20).optional(),
  color: z.string().trim().min(1).max(40).optional(),
  colorHex: z.string().trim().max(20).nullable().optional(),
  priceOverride: money.nullable().optional(),
  quantity: z.coerce.number().int().min(0).optional(),
  lowStockThreshold: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const updateVariantStockSchema = z.object({
  quantity: z.coerce.number().int().min(0),
  lowStockThreshold: z.coerce.number().int().min(0).optional(),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: slug.optional(),
  description: z.string().trim().max(500).nullable().optional(),
  imageUrl: z.string().trim().max(500).nullable().optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const updateCategorySchema = categorySchema.partial();

const orderStatus = z.enum([
  "PENDING_PAYMENT",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "EXPIRED",
  "FAILED",
  "REFUNDED",
]);

export const adminOrderListQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .max(40)
    .optional()
    .transform((value) => (value ? value.toUpperCase() : undefined)),
  status: orderStatus.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const updateOrderStatusSchema = z.object({
  status: orderStatus,
  note: z.string().trim().max(240).optional(),
});

export const shipmentStatus = z.enum([
  "PENDING",
  "PICKED_UP",
  "IN_TRANSIT",
  "SHIPPED",
  "DELIVERED",
  "FAILED",
  "RETURNED",
]);

export const updateShipmentSchema = z.object({
  status: shipmentStatus.optional(),
  trackingNumber: z.string().trim().max(80).nullable().optional(),
  estimatedArrival: z.coerce.date().nullable().optional(),
  description: z.string().trim().max(240).optional(),
});

const newsFields = {
  title: z.string().trim().min(3).max(180),
  slug: slug.optional(),
  excerpt: z.string().trim().max(400).nullable().optional(),
  content: z.string().trim().min(20).max(12000),
  coverImage: z.string().trim().max(500).nullable().optional(),
  category: z.string().trim().min(2).max(60),
  isPublished: z.boolean().default(true),
  publishedAt: z.coerce.date().optional(),
  productIds: z.array(id).max(12).optional(),
};

export const createNewsSchema = z.object(newsFields);
export const updateNewsSchema = z.object(newsFields).partial();

const helpFields = {
  title: z.string().trim().min(3).max(180),
  slug: slug.optional(),
  category: z.string().trim().min(2).max(60),
  excerpt: z.string().trim().max(400).nullable().optional(),
  content: z.string().trim().min(20).max(12000),
  isPublished: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).default(0),
};

export const createHelpSchema = z.object(helpFields);
export const updateHelpSchema = z.object(helpFields).partial();

const couponFields = {
  code: z
    .string()
    .trim()
    .min(3)
    .max(40)
    .transform((value) => value.toUpperCase()),
  description: z.string().trim().max(300).nullable().optional(),
  type: z.enum(["PERCENT", "FIXED"]).default("PERCENT"),
  value: z.coerce.number().int().positive(),
  minSpend: money.default(0),
  maxDiscount: money.nullable().optional(),
  usageLimit: z.coerce.number().int().positive().nullable().optional(),
  perUserLimit: z.coerce.number().int().positive().default(1),
  startsAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date(),
  isActive: z.boolean().default(true),
};

export const createCouponSchema = z
  .object(couponFields)
  .refine((value) => value.expiresAt > (value.startsAt ?? new Date()), {
    message: "Tanggal berakhir harus setelah tanggal mulai",
    path: ["expiresAt"],
  });

export const updateCouponSchema = z.object(couponFields).partial();
