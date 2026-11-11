import { env } from "../config/env.js";
import { successResponse } from "../utils/apiResponse.js";

export function getHealth(_req, res) {
  return successResponse(res, {
    message: "Server berjalan dengan baik",
    data: {
      status: "ok",
      environment: env.NODE_ENV,
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    },
  });
}
