import { prisma } from "../lib/prisma.js";

export function findSitemapCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      products: {
        where: { isPublished: true, deletedAt: null },
        orderBy: { name: "asc" },
        select: { id: true, name: true, slug: true, gender: true },
      },
    },
  });
}
