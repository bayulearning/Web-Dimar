import {
  buildProductOrderBy,
  buildProductWhere,
  countProducts,
  findProductBySlug,
  findProducts,
  findRelatedProducts,
} from "../repositories/product.repository.js";
import { NotFoundError } from "../utils/AppError.js";

function variantStock(variant) {
  const inventory = variant.inventory;
  if (!inventory) return 0;
  return Math.max(inventory.quantity - inventory.reserved, 0);
}

function serializeCard(product) {
  const variants = product.variants ?? [];
  const availableSizes = [
    ...new Set(
      variants
        .filter((variant) => variantStock(variant) > 0)
        .map((variant) => variant.size),
    ),
  ];

  const primaryImage =
    product.images.find((image) => image.isPrimary) ?? product.images[0] ?? null;

  const discountPercent =
    product.salePrice && product.basePrice > product.salePrice
      ? Math.round((1 - product.salePrice / product.basePrice) * 100)
      : 0;

  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    slug: product.slug,
    brand: product.brand,
    category: product.category,
    gender: product.gender,
    basePrice: product.basePrice,
    salePrice: product.salePrice,
    price: product.effectivePrice,
    discountPercent,
    badge: product.badge,
    rating: {
      average: product.ratingAverage,
      count: product.ratingCount,
    },
    image: primaryImage,
    availableSizes,
    totalStock: variants.reduce((total, variant) => total + variantStock(variant), 0),
  };
}

function serializeDetail(product, related) {
  const card = serializeCard(product);

  return {
    ...card,
    description: product.description,
    images: product.images,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      colorHex: variant.colorHex,
      price: variant.priceOverride ?? product.effectivePrice,
      stock: variantStock(variant),
      isAvailable: variantStock(variant) > 0,
    })),
    reviews: product.reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      createdAt: review.createdAt,
      userName: review.user.name,
    })),
    relatedProducts: related.map(serializeCard),
  };
}

export async function listProducts(filters) {
  const where = buildProductWhere(filters);
  const orderBy = buildProductOrderBy(filters.sort);
  const { page, limit } = filters;

  const [total, products] = await Promise.all([
    countProducts(where),
    findProducts({ where, orderBy, skip: (page - 1) * limit, take: limit }),
  ]);

  return {
    items: products.map(serializeCard),
    total,
    page,
    limit,
  };
}

export async function getProductBySlug(slug) {
  const product = await findProductBySlug(slug);
  if (!product) {
    throw new NotFoundError("Produk tidak ditemukan");
  }

  const related = await findRelatedProducts({
    productId: product.id,
    categoryId: product.categoryId,
  });

  return serializeDetail(product, related);
}

export { serializeCard };
