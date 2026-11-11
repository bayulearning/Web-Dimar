import crypto from "crypto";

export function computeMidtransSignature(
  { orderId, statusCode, grossAmount },
  serverKey,
) {
  return crypto
    .createHash("sha512")
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest("hex");
}

export function verifyMidtransSignature(payload, serverKey) {
  const expected = computeMidtransSignature(
    {
      orderId: payload.order_id,
      statusCode: payload.status_code,
      grossAmount: payload.gross_amount,
    },
    serverKey,
  );

  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(String(payload.signature_key || ""));

  if (expectedBuffer.length !== actualBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}
