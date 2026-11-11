import {
  addToWishlist,
  getWishlist,
  mergeWishlist,
  removeFromWishlist,
} from "../services/wishlist.service.js";
import { successResponse } from "../utils/apiResponse.js";

export async function getWishlistHandler(req, res) {
  const wishlist = await getWishlist(req.user.id);
  return successResponse(res, {
    message: "Wishlist berhasil diambil",
    data: wishlist,
  });
}

export async function postWishlistItem(req, res) {
  const wishlist = await addToWishlist(
    req.user.id,
    req.validatedBody.productId,
  );
  return successResponse(res, {
    statusCode: 201,
    message: "Produk ditambahkan ke wishlist",
    data: wishlist,
  });
}

export async function deleteWishlistItemHandler(req, res) {
  const wishlist = await removeFromWishlist(
    req.user.id,
    req.validatedParams.productId,
  );
  return successResponse(res, {
    message: "Produk dihapus dari wishlist",
    data: wishlist,
  });
}

export async function postWishlistMerge(req, res) {
  const wishlist = await mergeWishlist(
    req.user.id,
    req.validatedBody.productIds,
  );
  return successResponse(res, {
    message: "Wishlist tamu berhasil digabungkan",
    data: wishlist,
  });
}
