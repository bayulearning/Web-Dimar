import {
  addItem,
  clearCart,
  getCart,
  mergeCart,
  removeItem,
  updateItem,
} from "../services/cart.service.js";
import { successResponse } from "../utils/apiResponse.js";

export async function getCartHandler(req, res) {
  const cart = await getCart(req.user.id);
  return successResponse(res, {
    message: "Keranjang berhasil diambil",
    data: cart,
  });
}

export async function postCartItem(req, res) {
  const cart = await addItem(req.user.id, req.validatedBody);
  return successResponse(res, {
    statusCode: 201,
    message: "Produk ditambahkan ke keranjang",
    data: cart,
  });
}

export async function patchCartItem(req, res) {
  const cart = await updateItem(
    req.user.id,
    req.validatedParams.id,
    req.validatedBody.quantity,
  );
  return successResponse(res, {
    message: "Jumlah item diperbarui",
    data: cart,
  });
}

export async function deleteCartItem(req, res) {
  const cart = await removeItem(req.user.id, req.validatedParams.id);
  return successResponse(res, {
    message: "Item dihapus dari keranjang",
    data: cart,
  });
}

export async function deleteCart(req, res) {
  const cart = await clearCart(req.user.id);
  return successResponse(res, {
    message: "Keranjang dikosongkan",
    data: cart,
  });
}

export async function postCartMerge(req, res) {
  const cart = await mergeCart(req.user.id, req.validatedBody.items);
  return successResponse(res, {
    message: "Keranjang tamu berhasil digabungkan",
    data: cart,
  });
}
