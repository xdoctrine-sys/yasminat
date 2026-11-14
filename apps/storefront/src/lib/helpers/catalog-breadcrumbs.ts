export type CatalogCrumb = { name: string; nameEn?: string; path: string };
type Category = { id: string; name: string; handle: string; parent_category_id?: string | null; metadata?: Record<string, unknown> | null };

export const homeCrumb: CatalogCrumb = { name: 'الرئيسية', nameEn: 'Home', path: '/' };
export const productsCrumb: CatalogCrumb = { name: 'المنتجات', nameEn: 'Products', path: '/categories' };

/** Use the actual catalogue hierarchy, including ancestors of nested categories. */
export function categoryTrail(current: Category, categories: Category[]): CatalogCrumb[] {
  const byId = new Map(categories.map(category => [category.id, category]));
  const seen = new Set<string>();
  const trail: CatalogCrumb[] = [];
  let category: Category | undefined = byId.get(current.id) || current;
  while (category && !seen.has(category.id)) {
    seen.add(category.id);
    trail.unshift({ name: category.name, nameEn: typeof category.metadata?.name_en === 'string' ? category.metadata.name_en : undefined, path: `/categories/${encodeURIComponent(category.handle)}` });
    category = category.parent_category_id ? byId.get(category.parent_category_id) : undefined;
  }
  return trail;
}

export const crumbName = (item: CatalogCrumb, language: 'ar' | 'en') => language === 'en' ? item.nameEn || item.name : item.name;

/** The UI and JSON-LD consume the same ordered entries and language. */
export function breadcrumbJsonLd(items: CatalogCrumb[], baseUrl: string, locale: string, language: 'ar' | 'en') {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem', position: index + 1, name: crumbName(item, language),
      item: `${baseUrl.replace(/\/+$/, '')}/${encodeURIComponent(locale)}${item.path === '/' ? '' : item.path}`,
    })),
  };
}

export const breadcrumbJson = (items: CatalogCrumb[], baseUrl: string, locale: string, language: 'ar' | 'en') =>
  JSON.stringify(breadcrumbJsonLd(items, baseUrl, locale, language)).replace(/</g, '\\u003c');
