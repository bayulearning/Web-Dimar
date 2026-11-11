import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

function getSecret() {
  if (env.JWT_SECRET) return env.JWT_SECRET;
  if (env.isProduction) {
    throw new AppError("JWT_SECRET belum dikonfigurasi", 500);
  }
  return "stride-development-secret";
}

export function signAuthToken(user) {
  return jwt.sign(
    { sub: String(user.id), role: user.role },
    getSecret(),
    { expiresIn: env.JWT_EXPIRES_IN },
  );
}

export function verifyAuthToken(token) {
  return jwt.verify(token, getSecret());
}

function parseDuration(value, fallbackMs) {
  const match = /^(\d+)([smhd])$/.exec(String(value).trim());
  if (!match) return fallbackMs;
  const amount = Number(match[1]);
  const unit = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[match[2]];
  return amount * unit;
}

export function authCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? "none" : "lax",
    path: "/",
    maxAge: parseDuration(env.JWT_EXPIRES_IN, 7 * 86400000),
  };
}
