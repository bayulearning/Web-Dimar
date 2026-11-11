import { http } from "./http.js";
import { toQueryString } from "../utils/query.js";

export const helpApi = {
  list(params) {
    return http.get(`/help${toQueryString(params)}`);
  },
  categories() {
    return http.get("/help/categories");
  },
  detail(slug) {
    return http.get(`/help/${encodeURIComponent(slug)}`);
  },
};

export const newsApi = {
  list(params) {
    return http.get(`/news${toQueryString(params)}`);
  },
  categories() {
    return http.get("/news/categories");
  },
  detail(slug) {
    return http.get(`/news/${encodeURIComponent(slug)}`);
  },
};

export const contactApi = {
  send(payload) {
    return http.post("/contact", payload);
  },
};

export const sitemapApi = {
  get() {
    return http.get("/sitemap");
  },
};
