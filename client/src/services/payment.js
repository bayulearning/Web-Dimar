import { http } from "./http.js";

export const paymentApi = {
  config() {
    return http.get("/payments/config");
  },
  createSnapToken(orderNumber) {
    return http.post("/payments/midtrans/snap-token", { orderNumber });
  },
  status(orderNumber) {
    return http.get(`/payments/${orderNumber}/status`);
  },
  simulateMockSettlement(orderNumber) {
    return http.post("/payments/mock/settle", { orderNumber });
  },
};
