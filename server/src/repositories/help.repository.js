import { prisma } from "../lib/prisma.js";

export function findHelpArticles({ where, skip, take }) {
  return prisma.helpArticle.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    skip,
    take,
  });
}

export function countHelpArticles(where) {
  return prisma.helpArticle.count({ where });
}

export function findHelpArticleBySlug(slug) {
  return prisma.helpArticle.findFirst({
    where: { slug, isPublished: true },
  });
}

export function findRelatedHelpArticles(slug, category, take = 3) {
  return prisma.helpArticle.findMany({
    where: { slug: { not: slug }, category, isPublished: true },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    take,
  });
}

export function findHelpCategories() {
  return prisma.helpArticle.groupBy({
    by: ["category"],
    where: { isPublished: true },
    _count: { _all: true },
    orderBy: { category: "asc" },
  });
}
