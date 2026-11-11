import {
  findCategories,
  findCategoryBySlug,
  findCategoryFacets,
} from "../repositories/category.repository.js";
import { NotFoundError } from "../utils/AppError.js";

export async function listCategories() {
  const categories = await findCategories();
  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    imageUrl: category.imageUrl,
    productCount: category._count.products,
  }));
}

export async function getCategoryBySlug(slug) {
  const category = await findCategoryBySlug(slug);
  if (!category) {
    throw new NotFoundError("Kategori tidak ditemukan");
  }

  const facets = await findCategoryFacets(slug);

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    imageUrl: category.imageUrl,
    productCount: category._count.products,
    facets,
  };
}
