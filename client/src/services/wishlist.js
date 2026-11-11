import { http } from "./http.js";

export const wishlistApi = {
  list() {
    return http.get("/wishlist");
  },
  add(productId) {
    return http.post("/wishlist", { productId });
  },
  remove(productId) {
    return http.delete(`/wishlist/${productId}`);
  },
  merge(productIds) {
    return http.post("/wishlist/merge", { productIds });
  },
};
