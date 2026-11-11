import crypto from "crypto";
import { env } from "../../config/env.js";

const FALLBACK_MOCK_KEY = "stride-mock-server-key";

function mockServerKey() {
  return env.MIDTRANS_SERVER_KEY || FALLBACK_MOCK_KEY;
}

export function createMockSignature({ orderId, statusCode, grossAmount }) {
  return crypto
    .createHash("sha512")
    .update(`${orderId}${statusCode}${grossAmount}${mockServerKey()}`)
    .digest("hex");
}

export const mockPaymentProvider = {
  id: "mock",
  label: "Mock Payment (development)",

  async createSnapTransaction({ order }) {
    const token = `mock-${order.orderNumber}`;
    const redirectUrl = `${env.corsOrigins[0] || "http://localhost:5173"}/pesanan/${order.orderNumber}/pending`;
    return {
      token,
      redirectUrl,
      raw: JSON.stringify({
        mode: "mock",
        orderNumber: order.orderNumber,
        grossAmount: order.total,
        createdAt: new Date().toISOString(),
      }),
    };
  },

  verifySignature(payload) {
    const expected = createMockSignature({
      orderId: payload.order_id,
      statusCode: payload.status_code,
      grossAmount: payload.gross_amount,
    });
    return expected === payload.signature_key;
  },

  signNotification({ orderId, statusCode, grossAmount }) {
    return createMockSignature({ orderId, statusCode, grossAmount });
  },

  async getTransactionStatus() {
    return null;
  },
};
