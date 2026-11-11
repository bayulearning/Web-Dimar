import {
  getNewsArticle,
  listNewsArticles,
  listNewsCategories,
} from "../services/news.service.js";
import { paginationMeta, successResponse } from "../utils/apiResponse.js";

export async function getNewsArticles(req, res) {
  const { page, limit, ...filters } = req.validatedQuery;
  const result = await listNewsArticles({ page, limit, ...filters });

  return successResponse(res, {
    message: "Artikel news berhasil diambil",
    data: result.items,
    meta: paginationMeta({ page, limit, total: result.total }),
  });
}

export async function getNewsCategories(_req, res) {
  const categories = await listNewsCategories();

  return successResponse(res, {
    message: "Kategori news berhasil diambil",
    data: categories,
  });
}

export async function getNewsArticleDetail(req, res) {
  const article = await getNewsArticle(req.validatedParams.slug);

  return successResponse(res, {
    message: "Artikel news berhasil diambil",
    data: article,
  });
}
