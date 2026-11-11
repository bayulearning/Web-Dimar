import { AppError } from "../utils/AppError.js";

export function rateLimit({
  windowMs = 15 * 60 * 1000,
  max = 10,
  message = "Terlalu banyak percobaan. Coba lagi nanti.",
} = {}) {
  const hits = new Map();

  return function rateLimiter(req, _res, next) {
    const now = Date.now();

    if (hits.size > 5000) {
      for (const [key, entry] of hits) {
        if (entry.resetAt <= now) hits.delete(key);
      }
    }

    const key = `${req.ip}:${req.path}`;
    const entry = hits.get(key);

    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    entry.count += 1;
    if (entry.count > max) {
      return next(new AppError(message, 429));
    }

    return next();
  };
}
