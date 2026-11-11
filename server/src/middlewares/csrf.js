import { env } from "../config/env.js";
import { ForbiddenError } from "../utils/AppError.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function csrfProtection(req, _res, next) {
  if (SAFE_METHODS.has(req.method)) return next();

  const origin = req.get("origin");
  const referer = req.get("referer");

  if (!origin && !referer) {
    // Request non-browser (curl, health check) tidak membawa Origin.
    return next();
  }

  const source = origin || new URL(referer).origin;
  if (env.corsOrigins.includes(source)) return next();

  return next(new ForbiddenError("Permintaan lintas situs ditolak"));
}
