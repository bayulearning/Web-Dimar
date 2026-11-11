import { prisma } from "../lib/prisma.js";
import { cardInclude } from "./product.repository.js";

export function ensureWishlist(userId) {
  return prisma.wishlist.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export function findWishlistItems(wishlistId) {
  return prisma.wishlistItem.findMany({
    where: { wishlistId },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        include: cardInclude,
      },
    },
  });
}

export function findPublishedProduct(productId) {
  return prisma.product.findFirst({
    where: { id: productId, isPublished: true, deletedAt: null },
    select: { id: true },
  });
}

export function addWishlistItem(wishlistId, productId) {
  return prisma.wishlistItem.upsert({
    where: { wishlistId_productId: { wishlistId, productId } },
    update: {},
    create: { wishlistId, productId },
  });
}

export function deleteWishlistItem(wishlistId, productId) {
  return prisma.wishlistItem.deleteMany({ where: { wishlistId, productId } });
}
