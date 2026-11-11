import { http } from "./http.js";

export const addressApi = {
  list() {
    return http.get("/addresses");
  },
  create(payload) {
    return http.post("/addresses", payload);
  },
  update(id, payload) {
    return http.patch(`/addresses/${id}`, payload);
  },
  remove(id) {
    return http.delete(`/addresses/${id}`);
  },
};
