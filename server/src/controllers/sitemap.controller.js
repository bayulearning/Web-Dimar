import { getSitemap } from "../services/sitemap.service.js";
import { successResponse } from "../utils/apiResponse.js";

export async function getSitemapController(_req, res) {
  const data = await getSitemap();

  return successResponse(res, {
    message: "Sitemap berhasil diambil",
    data,
  });
}
