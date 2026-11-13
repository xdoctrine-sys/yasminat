import { HttpTypes } from '@medusajs/types';

import { sdk } from '@/lib/client';
import { CACHE_TAGS, getGlobalCacheOptions } from './cache-tags';
import {collectCategoryPages} from '../helpers/category-pages';
import {visibleCategoryTree} from '../helpers/category-tree';

interface CategoriesProps {
  query?: Record<string, unknown>;
}

export const listCategories = async ({ query }: Partial<CategoriesProps> = {}) => {
  const limit = typeof query?.limit==='number'&&query.limit>0?query.limit:100;
  const requestedOffset=Number(query?.offset??0);
  const initialOffset=Number.isFinite(requestedOffset)?Math.max(0,requestedOffset):0;

  const loadPage=(offset:number)=>(sdk.store.productCategories
    .query({
      fields: 'id,handle,name,rank,metadata,parent_category_id,description,*category_children',
      include_descendants_tree: true,
      include_ancestors_tree: true,
      limit,
      ...query,
      offset:initialOffset+offset,
      fetchOptions: {
        cache: 'force-cache',
        next: {
          ...getGlobalCacheOptions(CACHE_TAGS.categories),
          revalidate: 3600,
        }
      }
    } as never) as unknown as Promise<{ product_categories: HttpTypes.StoreProductCategory[];count?:number }>);
  const allCategories=await collectCategoryPages(loadPage,limit,query?.limit===undefined&&query?.offset===undefined).catch(()=>[] as HttpTypes.StoreProductCategory[]);

  const parentCategories=visibleCategoryTree(allCategories).filter(cat=>cat.handle!=='test-categorie-yasminat');
  const mainCategoriesWithChildren=parentCategories.flatMap(parent=>parent.category_children||[]);

  return {
    parentCategories,
    categories: mainCategoriesWithChildren
  };
};

export const getCategoryByHandle = async (categoryHandle: string) => {
  return (sdk.store.productCategories
    .query({
      fields: 'id,name,handle,metadata,description,rank,parent_category_id,*category_children',
      handle: categoryHandle,
      include_descendants_tree: true,
      fetchOptions: {
        cache: 'force-cache',
        next: getGlobalCacheOptions(
          CACHE_TAGS.categories,
          CACHE_TAGS.category(categoryHandle)
        )
      }
    } as never) as unknown as Promise<HttpTypes.StoreProductCategoryListResponse>)
    .then(({ product_categories }) => product_categories[0])
    .catch(() => undefined);
};

// Medusa's `/store/products?category_id=` filters by the exact category only —
// it does not walk into descendants. To make a parent category page list every
// product beneath it, collect the whole subtree of ids and pass them all.
export const collectCategorySubtreeIds = (
  category: Pick<HttpTypes.StoreProductCategory, 'id' | 'category_children'>
): string[] => {
  const ids = [category.id];
  for (const child of category.category_children ?? []) {
    ids.push(...collectCategorySubtreeIds(child));
  }
  return ids;
};
