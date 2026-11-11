import { http } from "./http.js";

export const cartApi = {
  get() {
    return http.get("/cart");
  },
  add(variantId, quantity = 1) {
    return http.post("/cart/items", { variantId, quantity });
  },
  update(itemId, quantity) {
    return http.patch(`/cart/items/${itemId}`, { quantity });
  },
  remove(itemId) {
    return http.delete(`/cart/items/${itemId}`);
  },
  clear() {
    return http.delete("/cart");
  },
  merge(items) {
    return http.post("/cart/merge", { items });
  },
};
