import {
  countHelpArticles,
  findHelpArticleBySlug,
  findHelpArticles,
  findHelpCategories,
  findRelatedHelpArticles,
} from "../repositories/help.repository.js";
import { NotFoundError } from "../utils/AppError.js";

function serializeSummary(article) {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    category: article.category,
    excerpt: article.excerpt,
  };
}

export async function listHelpArticles({ q, category, page, limit }) {
  const where = { isPublished: true };
  if (category) where.category = category;
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { excerpt: { contains: q } },
      { content: { contains: q } },
    ];
  }

  const [items, total] = await Promise.all([
    findHelpArticles({ where, skip: (page - 1) * limit, take: limit }),
    countHelpArticles(where),
  ]);

  return { items: items.map(serializeSummary), total, page, limit };
}

export async function listHelpCategories() {
  const groups = await findHelpCategories();
  return groups.map((group) => ({
    category: group.category,
    count: group._count._all,
  }));
}

export async function getHelpArticle(slug) {
  const article = await findHelpArticleBySlug(slug);
  if (!article) throw new NotFoundError("Artikel bantuan tidak ditemukan");

  const related = await findRelatedHelpArticles(slug, article.category);

  return {
    ...serializeSummary(article),
    content: article.content,
    updatedAt: article.updatedAt,
    related: related.map(serializeSummary),
  };
}
