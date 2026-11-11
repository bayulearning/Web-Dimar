import {
  getHelpArticle,
  listHelpArticles,
  listHelpCategories,
} from "../services/help.service.js";
import { paginationMeta, successResponse } from "../utils/apiResponse.js";

export async function getHelpArticles(req, res) {
  const { page, limit, ...filters } = req.validatedQuery;
  const result = await listHelpArticles({ page, limit, ...filters });

  return successResponse(res, {
    message: "Artikel bantuan berhasil diambil",
    data: result.items,
    meta: paginationMeta({ page, limit, total: result.total }),
  });
}

export async function getHelpCategories(_req, res) {
  const categories = await listHelpCategories();

  return successResponse(res, {
    message: "Kategori bantuan berhasil diambil",
    data: categories,
  });
}

export async function getHelpArticleDetail(req, res) {
  const article = await getHelpArticle(req.validatedParams.slug);

  return successResponse(res, {
    message: "Artikel bantuan berhasil diambil",
    data: article,
  });
}
