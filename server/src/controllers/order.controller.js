import {
  createOrder,
  getOrderForUser,
  listOrdersForUser,
  previewCheckout,
} from "../services/order.service.js";
import { paginationMeta, successResponse } from "../utils/apiResponse.js";

export async function postCheckoutPreview(req, res) {
  const data = await previewCheckout(req.user.id, req.validatedBody);
  return successResponse(res, {
    message: "Ringkasan checkout berhasil dihitung",
    data,
  });
}

export async function postOrder(req, res) {
  const order = await createOrder(req.user.id, req.validatedBody);
  return successResponse(res, {
    statusCode: 201,
    message: "Pesanan berhasil dibuat",
    data: order,
  });
}

export async function getOrders(req, res) {
  const { page, limit, ...filters } = req.validatedQuery;
  const result = await listOrdersForUser(req.user.id, {
    page,
    limit,
    ...filters,
  });

  return successResponse(res, {
    message: "Daftar pesanan berhasil diambil",
    data: result.items,
    meta: paginationMeta({ page, limit, total: result.total }),
  });
}

export async function getOrder(req, res) {
  const order = await getOrderForUser(
    req.user.id,
    req.validatedParams.orderNumber,
  );
  return successResponse(res, {
    message: "Pesanan berhasil diambil",
    data: order,
  });
}
