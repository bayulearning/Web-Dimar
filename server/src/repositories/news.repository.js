import { prisma } from "../lib/prisma.js";
import { cardInclude } from "./product.repository.js";

const listSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  coverImage: true,
  category: true,
  viewCount: true,
  publishedAt: true,
};

export function findNewsArticles({ where, orderBy, skip, take }) {
  return prisma.newsArticle.findMany({
    where,
    orderBy,
    skip,
    take,
    select: listSelect,
  });
}

export function countNewsArticles(where) {
  return prisma.newsArticle.count({ where });
}

export function findNewsArticleBySlug(slug) {
  return prisma.newsArticle.findFirst({
    where: { slug, isPublished: true },
    include: {
      products: {
        include: {
          product: { include: cardInclude },
        },
      },
    },
  });
}

export function incrementNewsViewCount(id) {
  return prisma.newsArticle.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });
}

export function findRelatedNewsArticles(slug, category, take = 3) {
  return prisma.newsArticle.findMany({
    where: { slug: { not: slug }, category, isPublished: true },
    orderBy: { publishedAt: "desc" },
    take,
    select: listSelect,
  });
}

export function findLatestNewsArticles(slug, take = 3) {
  return prisma.newsArticle.findMany({
    where: { slug: { not: slug }, isPublished: true },
    orderBy: { publishedAt: "desc" },
    take,
    select: listSelect,
  });
}

export function findNewsCategories() {
  return prisma.newsArticle.groupBy({
    by: ["category"],
    where: { isPublished: true },
    _count: { _all: true },
    orderBy: { category: "asc" },
  });
}
