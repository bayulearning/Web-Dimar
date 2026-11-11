import { Prisma } from "@prisma/client";
import { env } from "../config/env.js";
import { errorResponse } from "../utils/apiResponse.js";
import { logger } from "../utils/logger.js";

const PRISMA_STATUS = {
  P2002: { status: 409, message: "Data sudah digunakan" },
  P2003: { status: 409, message: "Data masih terhubung dengan data lain" },
  P2025: { status: 404, message: "Data tidak ditemukan" },
};

export function errorHandler(error, req, res, _next) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const mapped = PRISMA_STATUS[error.code];
    if (mapped) {
      error.statusCode = mapped.status;
      error.message = mapped.message;
      error.isOperational = true;
    }
  }

  const statusCode = error.statusCode || 500;
  const isOperational = Boolean(error.isOperational);

  logger.error("request_failed", {
    method: req.method,
    path: req.originalUrl,
    status: statusCode,
    name: error.name,
    message: error.message,
  });

  const message =
    isOperational || statusCode < 500
      ? error.message
      : "Terjadi kesalahan pada server";

  const errors = Array.isArray(error.errors) ? error.errors : [];

  if (!isOperational && !env.isTest) {
    logger.error("unhandled_error_stack", { stack: error.stack });
  }

  return errorResponse(res, { statusCode, message, errors });
}
