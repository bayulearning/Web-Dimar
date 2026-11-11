import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  SITE_URL: z.string().url().default("http://localhost:5173"),
  CLIENT_ORIGIN: z.string().min(1).default("http://localhost:5173"),
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().optional(),
  JWT_EXPIRES_IN: z.string().default("7d"),
  COOKIE_NAME: z.string().default("stride_token"),
  MIDTRANS_IS_PRODUCTION: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  MIDTRANS_MERCHANT_ID: z.string().optional(),
  MIDTRANS_CLIENT_KEY: z.string().optional(),
  MIDTRANS_SERVER_KEY: z.string().optional(),
  SHIPPING_PROVIDER: z.string().default("mock"),
  ORDER_EXPIRY_HOURS: z.coerce.number().int().min(1).max(168).default(24),
  EMAIL_MODE: z.enum(["log", "smtp"]).default("log"),
  EMAIL_FROM: z.string().default("no-reply@stride.local"),
  STORE_EMAIL: z.string().default("hello@stride.local"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  console.error(`[env] Konfigurasi environment tidak valid: ${details}`);
  process.exit(1);
}

const corsOrigins = parsed.data.CLIENT_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (parsed.data.NODE_ENV === "production") {
  const problems = [];

  if (!parsed.data.JWT_SECRET || parsed.data.JWT_SECRET.length < 32) {
    problems.push("JWT_SECRET wajib diisi minimal 32 karakter");
  }
  if (!parsed.data.DATABASE_URL) {
    problems.push("DATABASE_URL wajib diisi");
  }
  if (!corsOrigins.length || corsOrigins.some((origin) => !origin.startsWith("https://"))) {
    problems.push("CLIENT_ORIGIN wajib berisi URL HTTPS");
  }
  if (!parsed.data.SITE_URL.startsWith("https://")) {
    problems.push("SITE_URL wajib memakai HTTPS");
  }

  if (problems.length > 0) {
    console.error(`[env] Konfigurasi production tidak valid: ${problems.join("; ")}`);
    process.exit(1);
  }
}

const midtransConfigured = Boolean(
  parsed.data.MIDTRANS_CLIENT_KEY && parsed.data.MIDTRANS_SERVER_KEY,
);

export const env = {
  ...parsed.data,
  isProduction: parsed.data.NODE_ENV === "production",
  isTest: parsed.data.NODE_ENV === "test",
  corsOrigins,
  siteUrl: parsed.data.SITE_URL.replace(/\/+$/, ""),
  midtransConfigured,
};
