import { submitContactMessage } from "../services/contact.service.js";
import { successResponse } from "../utils/apiResponse.js";

export async function postContactMessage(req, res) {
  const result = await submitContactMessage(req.validatedBody);

  return successResponse(res, {
    statusCode: 201,
    message: "Pesan berhasil dikirim. Tim Stride akan menghubungi Anda.",
    data: result,
  });
}
