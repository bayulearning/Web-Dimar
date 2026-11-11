import { errorResponse } from "../utils/apiResponse.js";

export function notFoundHandler(req, res) {
  return errorResponse(res, {
    statusCode: 404,
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`,
  });
}
