import { listProducts, getProductBySlug } from "../services/product.service.js";
import { successResponse, paginationMeta } from "../utils/apiResponse.js";

export async function getProducts(req, res) {
  const filters = req.validatedQuery;
  const { items, total, page, limit } = await listProducts(filters);

  return successResponse(res, {
    message: "Daftar produk berhasil diambil",
    data: items,
    meta: paginationMeta({ page, limit, total }),
  });
}

export async function getProductDetail(req, res) {
  const product = await getProductBySlug(req.validatedParams.slug);

  return successResponse(res, {
    message: "Detail produk berhasil diambil",
    data: product,
  });
}
