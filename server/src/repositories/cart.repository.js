import { prisma } from "../lib/prisma.js";

const cartInclude = {
  items: {
    orderBy: { createdAt: "asc" },
    include: {
      product: {
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { sortOrder: "asc" } },
        },
      },
      variant: { include: { inventory: true } },
    },
  },
};

export function findCartByUserId(userId, client = prisma) {
  return client.cart.findUnique({
    where: { userId },
    include: cartInclude,
  });
}

export function findCartItem(userId, itemId) {
  return prisma.cartItem.findFirst({
    where: { id: itemId, cart: { userId } },
    include: {
      variant: { include: { inventory: true } },
      product: true,
    },
  });
}

export function findVariantForCart(variantId) {
  return prisma.productVariant.findFirst({
    where: {
      id: variantId,
      isActive: true,
      product: { isPublished: true, deletedAt: null },
    },
    include: {
      inventory: true,
      product: { select: { id: true, effectivePrice: true } },
    },
  });
}
