import {
  addProductImage,
  addVariant,
  createCategory,
  createCoupon,
  createHelp,
  createNews,
  createProduct,
  deleteCategory,
  deleteCoupon,
  deleteHelp,
  deleteNews,
  deleteProduct,
  deleteProductImage,
  deleteVariant,
  getDashboard,
  getHelp as getHelpArticle,
  getNews as getNewsArticle,
  getOrder,
  getProduct,
  listCategories,
  listCoupons,
  listHelp,
  listNews,
  listOrders,
  listProducts,
  updateCategory,
  updateCoupon,
  updateHelp,
  updateNews,
  updateOrderStatus,
  updateProduct,
  updateProductImage,
  updateShipment,
  updateVariant,
  updateVariantStock,
} from "../services/admin.service.js";
import { paginationMeta, successResponse } from "../utils/apiResponse.js";

export async function getDashboardHandler(req, res) {
  const data = await getDashboard();
  return successResponse(res, {
    message: "Ringkasan dashboard berhasil diambil",
    data,
  });
}

function paginated(res, message, { items, total }, page, limit) {
  return successResponse(res, {
    message,
    data: items,
    meta: paginationMeta({ page, limit, total }),
  });
}

/* Products */
export async function getProducts(req, res) {
  const { page, limit, ...filters } = req.validatedQuery;
  const result = await listProducts({ ...filters, page, limit });
  return paginated(res, "Daftar produk berhasil diambil", result, page, limit);
}

export async function getProductHandler(req, res) {
  const data = await getProduct(req.validatedParams.id);
  return successResponse(res, {
    message: "Detail produk berhasil diambil",
    data,
  });
}

export async function postProduct(req, res) {
  const data = await createProduct(req.validatedBody);
  return successResponse(res, {
    statusCode: 201,
    message: "Produk berhasil dibuat",
    data,
  });
}

export async function patchProduct(req, res) {
  const data = await updateProduct(
    req.validatedParams.id,
    req.validatedBody,
  );
  return successResponse(res, {
    message: "Produk berhasil diperbarui",
    data,
  });
}

export async function removeProduct(req, res) {
  const data = await deleteProduct(req.validatedParams.id);
  return successResponse(res, {
    message: "Produk berhasil dihapus",
    data,
  });
}

/* Product images */
export async function postProductImage(req, res) {
  const data = await addProductImage(
    req.validatedParams.id,
    req.validatedBody,
  );
  return successResponse(res, {
    statusCode: 201,
    message: "Gambar produk berhasil ditambahkan",
    data,
  });
}

export async function patchProductImage(req, res) {
  const data = await updateProductImage(
    req.validatedParams.id,
    req.validatedParams.imageId,
    req.validatedBody,
  );
  return successResponse(res, {
    message: "Gambar produk berhasil diperbarui",
    data,
  });
}

export async function removeProductImage(req, res) {
  const data = await deleteProductImage(
    req.validatedParams.id,
    req.validatedParams.imageId,
  );
  return successResponse(res, {
    message: "Gambar produk berhasil dihapus",
    data,
  });
}

/* Product variants & stock */
export async function postVariant(req, res) {
  const data = await addVariant(req.validatedParams.id, req.validatedBody);
  return successResponse(res, {
    statusCode: 201,
    message: "Varian produk berhasil ditambahkan",
    data,
  });
}

export async function patchVariant(req, res) {
  const data = await updateVariant(
    req.validatedParams.id,
    req.validatedParams.variantId,
    req.validatedBody,
  );
  return successResponse(res, {
    message: "Varian produk berhasil diperbarui",
    data,
  });
}

export async function patchVariantStock(req, res) {
  const data = await updateVariantStock(
    req.validatedParams.id,
    req.validatedParams.variantId,
    req.validatedBody,
  );
  return successResponse(res, {
    message: "Stok varian berhasil diperbarui",
    data,
  });
}

export async function removeVariant(req, res) {
  const data = await deleteVariant(
    req.validatedParams.id,
    req.validatedParams.variantId,
  );
  return successResponse(res, {
    message: "Varian produk dinonaktifkan",
    data,
  });
}

/* Categories */
export async function getCategories(req, res) {
  const data = await listCategories();
  return successResponse(res, {
    message: "Daftar kategori berhasil diambil",
    data,
  });
}

export async function postCategory(req, res) {
  const data = await createCategory(req.validatedBody);
  return successResponse(res, {
    statusCode: 201,
    message: "Kategori berhasil dibuat",
    data,
  });
}

export async function patchCategory(req, res) {
  const data = await updateCategory(
    req.validatedParams.id,
    req.validatedBody,
  );
  return successResponse(res, {
    message: "Kategori berhasil diperbarui",
    data,
  });
}

export async function removeCategory(req, res) {
  const data = await deleteCategory(req.validatedParams.id);
  return successResponse(res, {
    message: "Kategori berhasil dinonaktifkan",
    data,
  });
}

/* Orders */
export async function getOrders(req, res) {
  const { page, limit, ...filters } = req.validatedQuery;
  const result = await listOrders({ ...filters, page, limit });
  return paginated(res, "Daftar pesanan berhasil diambil", result, page, limit);
}

export async function getOrderHandler(req, res) {
  const data = await getOrder(req.validatedParams.orderNumber);
  return successResponse(res, {
    message: "Detail pesanan berhasil diambil",
    data,
  });
}

export async function patchOrderStatus(req, res) {
  const data = await updateOrderStatus(
    req.validatedParams.orderNumber,
    req.validatedBody,
    req.user.id,
  );
  return successResponse(res, {
    message: "Status pesanan berhasil diperbarui",
    data,
  });
}

export async function patchShipment(req, res) {
  const data = await updateShipment(
    req.validatedParams.orderNumber,
    req.validatedBody,
  );
  return successResponse(res, {
    message: "Status pengiriman berhasil diperbarui",
    data,
  });
}

/* News */
export async function getNews(req, res) {
  const { page, limit, ...filters } = req.validatedQuery;
  const result = await listNews({ ...filters, page, limit });
  return paginated(res, "Daftar artikel news berhasil diambil", result, page, limit);
}

export async function getNewsHandler(req, res) {
  const data = await getNewsArticle(req.validatedParams.id);
  return successResponse(res, {
    message: "Detail artikel news berhasil diambil",
    data,
  });
}

export async function postNews(req, res) {
  const data = await createNews(req.validatedBody);
  return successResponse(res, {
    statusCode: 201,
    message: "Artikel news berhasil dibuat",
    data,
  });
}

export async function patchNews(req, res) {
  const data = await updateNews(req.validatedParams.id, req.validatedBody);
  return successResponse(res, {
    message: "Artikel news berhasil diperbarui",
    data,
  });
}

export async function removeNews(req, res) {
  const data = await deleteNews(req.validatedParams.id);
  return successResponse(res, {
    message: "Artikel news berhasil dihapus",
    data,
  });
}

/* Help */
export async function getHelp(req, res) {
  const { page, limit, ...filters } = req.validatedQuery;
  const result = await listHelp({ ...filters, page, limit });
  return paginated(
    res,
    "Daftar artikel bantuan berhasil diambil",
    result,
    page,
    limit,
  );
}

export async function getHelpHandler(req, res) {
  const data = await getHelpArticle(req.validatedParams.id);
  return successResponse(res, {
    message: "Detail artikel bantuan berhasil diambil",
    data,
  });
}

export async function postHelp(req, res) {
  const data = await createHelp(req.validatedBody);
  return successResponse(res, {
    statusCode: 201,
    message: "Artikel bantuan berhasil dibuat",
    data,
  });
}

export async function patchHelp(req, res) {
  const data = await updateHelp(req.validatedParams.id, req.validatedBody);
  return successResponse(res, {
    message: "Artikel bantuan berhasil diperbarui",
    data,
  });
}

export async function removeHelp(req, res) {
  const data = await deleteHelp(req.validatedParams.id);
  return successResponse(res, {
    message: "Artikel bantuan berhasil dihapus",
    data,
  });
}

/* Coupons */
export async function getCoupons(req, res) {
  const { page, limit, ...filters } = req.validatedQuery;
  const result = await listCoupons({ ...filters, page, limit });
  return paginated(res, "Daftar voucher berhasil diambil", result, page, limit);
}

export async function postCoupon(req, res) {
  const data = await createCoupon(req.validatedBody);
  return successResponse(res, {
    statusCode: 201,
    message: "Voucher berhasil dibuat",
    data,
  });
}

export async function patchCoupon(req, res) {
  const data = await updateCoupon(req.validatedParams.id, req.validatedBody);
  return successResponse(res, {
    message: "Voucher berhasil diperbarui",
    data,
  });
}

export async function removeCoupon(req, res) {
  const data = await deleteCoupon(req.validatedParams.id);
  return successResponse(res, {
    message: "Voucher berhasil dinonaktifkan",
    data,
  });
}
