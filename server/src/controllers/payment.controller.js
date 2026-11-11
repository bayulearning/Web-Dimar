import {
  createSnapToken,
  getPaymentStatus,
  handleNotification,
  simulateMockSettlement,
} from "../services/payment.service.js";
import { getPaymentConfig } from "../lib/payment/index.js";
import { successResponse } from "../utils/apiResponse.js";

export function getConfig(_req, res) {
  return successResponse(res, {
    message: "Konfigurasi pembayaran",
    data: getPaymentConfig(),
  });
}

export async function postSnapToken(req, res) {
  const data = await createSnapToken(
    req.user.id,
    req.validatedBody.orderNumber,
  );
  return successResponse(res, {
    statusCode: 201,
    message: "Token pembayaran berhasil dibuat",
    data,
  });
}

export async function postNotification(req, res) {
  const data = await handleNotification(req.validatedBody);
  return successResponse(res, {
    message: data.duplicate
      ? "Notifikasi sudah pernah diproses"
      : "Notifikasi pembayaran diproses",
    data,
  });
}

export async function getStatus(req, res) {
  const data = await getPaymentStatus(
    req.user.id,
    req.validatedParams.orderNumber,
  );
  return successResponse(res, {
    message: "Status pembayaran berhasil diambil",
    data,
  });
}

export async function postMockSettle(req, res) {
  const data = await simulateMockSettlement(
    req.user.id,
    req.validatedBody.orderNumber,
  );
  return successResponse(res, {
    message: "Pembayaran mock disimulasikan",
    data,
  });
}
