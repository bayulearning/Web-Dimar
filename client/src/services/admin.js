import { http } from "./http.js";
import { toQueryString } from "../utils/query.js";

export const adminApi = {
  dashboard() {
    return http.get("/admin/dashboard");
  },

  products: {
    list(params) {
      return http.get(`/admin/products${toQueryString(params)}`);
    },
    detail(id) {
      return http.get(`/admin/products/${id}`);
    },
    create(payload) {
      return http.post("/admin/products", payload);
    },
    update(id, payload) {
      return http.patch(`/admin/products/${id}`, payload);
    },
    remove(id) {
      return http.delete(`/admin/products/${id}`);
    },
    addImage(id, payload) {
      return http.post(`/admin/products/${id}/images`, payload);
    },
    updateImage(id, imageId, payload) {
      return http.patch(`/admin/products/${id}/images/${imageId}`, payload);
    },
    removeImage(id, imageId) {
      return http.delete(`/admin/products/${id}/images/${imageId}`);
    },
    addVariant(id, payload) {
      return http.post(`/admin/products/${id}/variants`, payload);
    },
    updateVariant(id, variantId, payload) {
      return http.patch(`/admin/products/${id}/variants/${variantId}`, payload);
    },
    updateStock(id, variantId, payload) {
      return http.patch(
        `/admin/products/${id}/variants/${variantId}/stock`,
        payload,
      );
    },
    removeVariant(id, variantId) {
      return http.delete(`/admin/products/${id}/variants/${variantId}`);
    },
  },

  categories: {
    list() {
      return http.get("/admin/categories");
    },
    create(payload) {
      return http.post("/admin/categories", payload);
    },
    update(id, payload) {
      return http.patch(`/admin/categories/${id}`, payload);
    },
    remove(id) {
      return http.delete(`/admin/categories/${id}`);
    },
  },

  orders: {
    list(params) {
      return http.get(`/admin/orders${toQueryString(params)}`);
    },
    detail(orderNumber) {
      return http.get(`/admin/orders/${encodeURIComponent(orderNumber)}`);
    },
    updateStatus(orderNumber, payload) {
      return http.patch(
        `/admin/orders/${encodeURIComponent(orderNumber)}/status`,
        payload,
      );
    },
    updateShipment(orderNumber, payload) {
      return http.patch(
        `/admin/orders/${encodeURIComponent(orderNumber)}/shipment`,
        payload,
      );
    },
  },

  news: {
    list(params) {
      return http.get(`/admin/news${toQueryString(params)}`);
    },
    detail(id) {
      return http.get(`/admin/news/${id}`);
    },
    create(payload) {
      return http.post("/admin/news", payload);
    },
    update(id, payload) {
      return http.patch(`/admin/news/${id}`, payload);
    },
    remove(id) {
      return http.delete(`/admin/news/${id}`);
    },
  },

  help: {
    list(params) {
      return http.get(`/admin/help${toQueryString(params)}`);
    },
    detail(id) {
      return http.get(`/admin/help/${id}`);
    },
    create(payload) {
      return http.post("/admin/help", payload);
    },
    update(id, payload) {
      return http.patch(`/admin/help/${id}`, payload);
    },
    remove(id) {
      return http.delete(`/admin/help/${id}`);
    },
  },

  coupons: {
    list(params) {
      return http.get(`/admin/coupons${toQueryString(params)}`);
    },
    create(payload) {
      return http.post("/admin/coupons", payload);
    },
    update(id, payload) {
      return http.patch(`/admin/coupons/${id}`, payload);
    },
    remove(id) {
      return http.delete(`/admin/coupons/${id}`);
    },
  },
};
