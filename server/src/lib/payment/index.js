import { env } from "../../config/env.js";
import { midtransPaymentProvider } from "./midtrans.provider.js";
import { mockPaymentProvider } from "./mock.provider.js";

export function isMidtransConfigured() {
  return Boolean(env.MIDTRANS_SERVER_KEY && env.MIDTRANS_CLIENT_KEY);
}

export function paymentMode() {
  return isMidtransConfigured() ? "midtrans" : "mock";
}

export function getPaymentProvider(mode = paymentMode()) {
  return mode === "midtrans" ? midtransPaymentProvider : mockPaymentProvider;
}

export function getPaymentConfig() {
  const mode = paymentMode();
  return {
    mode,
    clientKey: mode === "midtrans" ? env.MIDTRANS_CLIENT_KEY : null,
    isProduction: env.MIDTRANS_IS_PRODUCTION,
    snapScriptUrl:
      mode === "midtrans"
        ? env.MIDTRANS_IS_PRODUCTION
          ? "https://app.midtrans.com/snap/snap.js"
          : "https://app.sandbox.midtrans.com/snap/snap.js"
        : null,
  };
}
