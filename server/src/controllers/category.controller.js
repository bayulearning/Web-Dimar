import {
  getCategoryBySlug,
  listCategories,
} from "../services/category.service.js";
import { successResponse } from "../utils/apiResponse.js";

export async function getCategories(_req, res) {
  const categories = await listCategories();

  return successResponse(res, {
    message: "Daftar kategori berhasil diambil",
    data: categories,
  });
}

export async function getCategoryDetail(req, res) {
  const category = await getCategoryBySlug(req.validatedParams.slug);

  return successResponse(res, {
    message: "Detail kategori berhasil diambil",
    data: category,
  });
}
