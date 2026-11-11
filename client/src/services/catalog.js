import { http } from "./http.js";
import { toQueryString } from "../utils/query.js";

export const catalogApi = {
  listProducts(params) {
    return http.get(`/products${toQueryString(params)}`);
  },
  getProduct(slug) {
    return http.get(`/products/${encodeURIComponent(slug)}`);
  },
  getCategories() {
    return http.get("/categories");
  },
  getCategory(slug) {
    return http.get(`/categories/${encodeURIComponent(slug)}`);
  },
};

export const CATALOG_PAGE_SIZE = 12;
export const CATALOG_MAX_LIMIT = 48;
