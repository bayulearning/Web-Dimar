import { prisma } from "../lib/prisma.js";

export const cardInclude = {
  category: { select: { id: true, name: true, slug: true } },
  images: { orderBy: { sortOrder: "asc" } },
  variants: {
    where: { isActive: true },
    select: {
      id: true,
      size: true,
      color: true,
      inventory: { select: { quantity: true, reserved: true } },
    },
  },
};

export function buildProductWhere(filters = {}) {
  const {
    q,
    category,
    gender,
    size,
    color,
    badge,
    minPrice,
    maxPrice,
  } = filters;

  const where = {
    deletedAt: null,
    isPublished: true,
  };

  if (q) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
      { sku: { contains: q } },
    ];
  }

  if (category) {
    where.category = { slug: category, isActive: true };
  }

  if (gender) {
    where.gender = gender;
  }

  if (badge) {
    where.badge = badge;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.effectivePrice = {
      ...(minPrice !== undefined ? { gte: minPrice } : {}),
      ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
    };
  }

  if (size || color) {
    where.variants = {
      some: {
        isActive: true,
        ...(size ? { size } : {}),
        ...(color ? { color } : {}),
        inventory: { quantity: { gt: 0 } },
      },
    };
  }

  return where;
}

export function buildProductOrderBy(sort) {
  switch (sort) {
    case "price_asc":
      return [{ effectivePrice: "asc" }, { id: "asc" }];
    case "price_desc":
      return [{ effectivePrice: "desc" }, { id: "asc" }];
    case "rating":
      return [{ ratingAverage: "desc" }, { ratingCount: "desc" }];
    case "popular":
      return [{ ratingCount: "desc" }, { createdAt: "desc" }];
    case "newest":
    default:
      return [{ publishedAt: "desc" }, { id: "desc" }];
  }
}

export function findProducts({ where, orderBy, skip, take }) {
  return prisma.product.findMany({
    where,
    orderBy,
    skip,
    take,
    include: cardInclude,
  });
}

export function countProducts(where) {
  return prisma.product.count({ where });
}

export function findProductBySlug(slug) {
  return prisma.product.findFirst({
    where: { slug, deletedAt: null, isPublished: true },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { sortOrder: "asc" } },
      variants: {
        where: { isActive: true },
        orderBy: [{ size: "asc" }, { color: "asc" }],
        include: { inventory: true },
      },
      reviews: {
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          rating: true,
          title: true,
          comment: true,
          createdAt: true,
          user: { select: { name: true } },
        },
      },
    },
  });
}

export function findRelatedProducts({ productId, categoryId, take = 4 }) {
  return prisma.product.findMany({
    where: {
      id: { not: productId },
      categoryId,
      deletedAt: null,
      isPublished: true,
    },
    orderBy: [{ ratingAverage: "desc" }, { createdAt: "desc" }],
    take,
    include: cardInclude,
  });
}
