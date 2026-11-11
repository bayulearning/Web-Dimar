import { findSitemapCategories } from "../repositories/sitemap.repository.js";

const GENDERS = [
  { key: "men", label: "Pria" },
  { key: "women", label: "Wanita" },
  { key: "kids", label: "Anak" },
  { key: "unisex", label: "Unisex" },
];

export async function getSitemap() {
  const categories = await findSitemapCategories();

  return {
    genders: GENDERS,
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      productCount: category.products.length,
      products: category.products,
      groups: GENDERS.map((gender) => ({
        ...gender,
        products: category.products.filter(
          (product) => product.gender === gender.key,
        ),
      })).filter((group) => group.products.length > 0),
    })),
  };
}
