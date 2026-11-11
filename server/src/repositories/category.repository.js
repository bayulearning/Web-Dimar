import { prisma } from "../lib/prisma.js";

export function findCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: { products: { where: { isPublished: true, deletedAt: null } } },
      },
    },
  });
}

export function findCategoryBySlug(slug) {
  return prisma.category.findFirst({
    where: { slug, isActive: true },
    include: {
      _count: {
        select: { products: { where: { isPublished: true, deletedAt: null } } },
      },
    },
  });
}

export async function findCategoryFacets(slug) {
  const productWhere = {
    category: { slug, isActive: true },
    isPublished: true,
    deletedAt: null,
  };

  const [variants, prices] = await Promise.all([
    prisma.productVariant.findMany({
      where: { isActive: true, product: productWhere },
      select: { size: true, color: true },
    }),
    prisma.product.aggregate({
      where: productWhere,
      _min: { effectivePrice: true },
      _max: { effectivePrice: true },
    }),
  ]);

  const sizeNumber = (size) => Number(size.replace(/[^0-9]/g, "")) || 0;
  const sizes = [...new Set(variants.map((variant) => variant.size))].sort(
    (a, b) => sizeNumber(a) - sizeNumber(b),
  );
  const colors = [...new Set(variants.map((variant) => variant.color))].sort();

  return {
    sizes,
    colors,
    priceRange: {
      min: prices._min.effectivePrice ?? 0,
      max: prices._max.effectivePrice ?? 0,
    },
  };
}
