'use client';
import type {HttpTypes} from '@medusajs/types';
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';
import {categoryName} from '@/lib/helpers/category-tree';
import {useYasminat} from '../Provider';
import {YasIcon} from '../Icon';

export function DesktopCategoryNav({categories}:{categories:HttpTypes.StoreProductCategory[]}){
 const {tr,language}=useYasminat();
 return <nav className="desktop-category-nav" aria-label={tr('أقسام المتجر','Store categories')}>
  {categories.filter(category=>!category.parent_category_id).map(category=><LocalizedClientLink key={category.id} href={`/categories/${category.handle}`}><span>{categoryName(category,language)}</span><YasIcon name="chevron" className="sm directional-icon"/></LocalizedClientLink>)}
 </nav>;
}
