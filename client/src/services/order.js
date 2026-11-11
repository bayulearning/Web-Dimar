import { http } from "./http.js";
import { toQueryString } from "../utils/query.js";

export const orderApi = {
  list(params) {
    return http.get(`/orders${toQueryString(params)}`);
  },
  preview(payload) {
    return http.post("/orders/preview", payload);
  },
  create(payload) {
    return http.post("/orders", payload);
  },
  detail(orderNumber) {
    return http.get(`/orders/${orderNumber}`);
  },
};
