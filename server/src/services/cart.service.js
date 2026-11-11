import { prisma } from "../lib/prisma.js";
import {
  findCartByUserId,
  findCartItem,
  findVariantForCart,
} from "../repositories/cart.repository.js";
import { AppError, NotFoundError } from "../utils/AppError.js";
import { availableStock } from "../utils/pricing.js";

const MAX_QUANTITY = 10;

function stockOf(variant) {
  return availableStock(variant?.inventory);
}

function serializeCart(cart) {
  const items = (cart?.items ?? []).map((item) => {
    const image =
      item.product.images.find((entry) => entry.isPrimary) ??
      item.product.images[0] ??
      null;

    return {
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      slug: item.product.slug,
      name: item.product.name,
      size: item.variant.size,
      color: item.variant.color,
      price: item.variant.priceOverride ?? item.product.effectivePrice,
      image,
      quantity: item.quantity,
      stock: stockOf(item.variant),
    };
  });

  return {
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    ),
  };
}

async function ensureCart(userId) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export async function getCart(userId) {
  await ensureCart(userId);
  return serializeCart(await findCartByUserId(userId));
}

export async function addItem(userId, { variantId, quantity }) {
  const variant = await findVariantForCart(variantId);
  if (!variant) throw new NotFoundError("Varian produk tidak ditemukan");

  const stock = stockOf(variant);
  if (stock < 1) throw new AppError("Stok varian ini habis", 409);

  const cart = await ensureCart(userId);
  const existing = await prisma.cartItem.findUnique({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
  });

  const nextQuantity = Math.min(
    (existing?.quantity ?? 0) + quantity,
    stock,
    MAX_QUANTITY,
  );

  await prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
    update: { quantity: nextQuantity },
    create: {
      cartId: cart.id,
      productId: variant.productId,
      variantId,
      quantity: nextQuantity,
    },
  });

  return serializeCart(await findCartByUserId(userId));
}

export async function updateItem(userId, itemId, quantity) {
  const item = await findCartItem(userId, itemId);
  if (!item) throw new NotFoundError("Item keranjang tidak ditemukan");

  const stock = stockOf(item.variant);
  if (stock < 1) throw new AppError("Stok varian ini habis", 409);

  await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity: Math.min(quantity, stock, MAX_QUANTITY) },
  });

  return serializeCart(await findCartByUserId(userId));
}

export async function removeItem(userId, itemId) {
  const item = await findCartItem(userId, itemId);
  if (!item) throw new NotFoundError("Item keranjang tidak ditemukan");

  await prisma.cartItem.delete({ where: { id: itemId } });
  return serializeCart(await findCartByUserId(userId));
}

export async function clearCart(userId) {
  const cart = await ensureCart(userId);
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  return serializeCart(await findCartByUserId(userId));
}

export async function mergeCart(userId, items) {
  const cart = await ensureCart(userId);
  let mergedCount = 0;
  let rejectedCount = 0;

  for (const entry of items) {
    const variant = await findVariantForCart(entry.variantId);
    const stock = variant ? stockOf(variant) : 0;

    if (!variant || stock < 1) {
      rejectedCount += 1;
      continue;
    }

    const existing = await prisma.cartItem.findUnique({
      where: {
        cartId_variantId: { cartId: cart.id, variantId: entry.variantId },
      },
    });

    const quantity = Math.min(
      Math.max(existing?.quantity ?? 0, entry.quantity),
      stock,
      MAX_QUANTITY,
    );

    await prisma.cartItem.upsert({
      where: {
        cartId_variantId: { cartId: cart.id, variantId: entry.variantId },
      },
      update: { quantity },
      create: {
        cartId: cart.id,
        productId: variant.productId,
        variantId: entry.variantId,
        quantity,
      },
    });
    mergedCount += 1;
  }

  return {
    ...serializeCart(await findCartByUserId(userId)),
    mergedCount,
    rejectedCount,
  };
}
