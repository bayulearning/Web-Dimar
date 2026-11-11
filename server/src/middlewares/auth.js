import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { verifyAuthToken } from "../lib/token.js";
import { ForbiddenError, UnauthorizedError } from "../utils/AppError.js";

export async function authenticate(req, _res, next) {
  const token = req.cookies?.[env.COOKIE_NAME];
  if (!token) return next();

  try {
    const payload = verifyAuthToken(token);
    const user = await prisma.user.findFirst({
      where: {
        id: Number(payload.sub),
        deletedAt: null,
        isActive: true,
      },
    });
    if (user) req.user = user;
  } catch {
    // Token tidak valid diperlakukan sebagai tamu.
  }

  return next();
}

export function requireAuth(req, _res, next) {
  if (!req.user) return next(new UnauthorizedError());
  return next();
}

export function requireAdmin(req, _res, next) {
  if (!req.user) return next(new UnauthorizedError());
  if (req.user.role !== "ADMIN") {
    return next(new ForbiddenError("Akses khusus admin"));
  }
  return next();
}
