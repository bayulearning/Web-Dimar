import { http } from "./http.js";

export const shippingApi = {
  services() {
    return http.get("/shipping/services");
  },
};
