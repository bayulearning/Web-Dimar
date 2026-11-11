import { http } from "./http.js";
import { toQueryString } from "../utils/query.js";

export const notificationApi = {
  list(params) {
    return http.get(`/notifications${toQueryString(params)}`);
  },
  markRead(id) {
    return http.patch(`/notifications/${id}/read`);
  },
  markAllRead() {
    return http.patch("/notifications/read-all");
  },
};
