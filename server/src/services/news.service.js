import {
  countNewsArticles,
  findLatestNewsArticles,
  findNewsArticleBySlug,
  findNewsArticles,
  findNewsCategories,
  findRelatedNewsArticles,
  incrementNewsViewCount,
} from "../repositories/news.repository.js";
import { serializeCard } from "./product.service.js";
import { NotFoundError } from "../utils/AppError.js";

function serializeSummary(article) {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    coverImage: article.coverImage,
    category: article.category,
    viewCount: article.viewCount,
    publishedAt: article.publishedAt,
  };
}

export async function listNewsArticles({ q, category, sort, page, limit }) {
  const where = { isPublished: true };
  if (category) where.category = category;
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { excerpt: { contains: q } },
      { content: { contains: q } },
    ];
  }

  const orderBy =
    sort === "popular"
      ? [{ viewCount: "desc" }, { publishedAt: "desc" }]
      : [{ publishedAt: "desc" }];

  const [items, total] = await Promise.all([
    findNewsArticles({ where, orderBy, skip: (page - 1) * limit, take: limit }),
    countNewsArticles(where),
  ]);

  return { items: items.map(serializeSummary), total, page, limit };
}

export async function listNewsCategories() {
  const groups = await findNewsCategories();
  return groups.map((group) => ({
    category: group.category,
    count: group._count._all,
  }));
}

export async function getNewsArticle(slug) {
  const article = await findNewsArticleBySlug(slug);
  if (!article) throw new NotFoundError("Artikel news tidak ditemukan");

  await incrementNewsViewCount(article.id);

  const related = await findRelatedNewsArticles(slug, article.category);
  const fallback = related.length
    ? related
    : await findLatestNewsArticles(slug);

  return {
    ...serializeSummary({ ...article, viewCount: article.viewCount + 1 }),
    content: article.content,
    products: article.products.map((entry) => serializeCard(entry.product)),
    related: fallback.map(serializeSummary),
  };
}
