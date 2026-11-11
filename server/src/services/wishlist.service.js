import {
  addWishlistItem,
  deleteWishlistItem,
  ensureWishlist,
  findPublishedProduct,
  findWishlistItems,
} from "../repositories/wishlist.repository.js";
import { serializeCard } from "./product.service.js";
import { NotFoundError } from "../utils/AppError.js";

async function serializeWishlist(userId) {
  const wishlist = await ensureWishlist(userId);
  const items = await findWishlistItems(wishlist.id);

  return {
    items: items.map((item) => ({
      ...serializeCard(item.product),
      wishlistItemId: item.id,
      addedAt: item.createdAt,
    })),
    itemCount: items.length,
  };
}

export function getWishlist(userId) {
  return serializeWishlist(userId);
}

export async function addToWishlist(userId, productId) {
  const product = await findPublishedProduct(productId);
  if (!product) throw new NotFoundError("Produk tidak ditemukan");

  const wishlist = await ensureWishlist(userId);
  await addWishlistItem(wishlist.id, productId);
  return serializeWishlist(userId);
}

export async function removeFromWishlist(userId, productId) {
  const wishlist = await ensureWishlist(userId);
  await deleteWishlistItem(wishlist.id, productId);
  return serializeWishlist(userId);
}

export async function mergeWishlist(userId, productIds) {
  const wishlist = await ensureWishlist(userId);

  for (const productId of productIds) {
    const product = await findPublishedProduct(productId);
    if (product) await addWishlistItem(wishlist.id, productId);
  }

  return serializeWishlist(userId);
}
