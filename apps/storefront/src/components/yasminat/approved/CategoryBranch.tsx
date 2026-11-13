'use client';
import type {HttpTypes} from '@medusajs/types';
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';
import {categoryName} from '@/lib/helpers/category-tree';
import {useYasminat} from '../Provider';
import {YasIcon} from '../Icon';
export function CategoryBranch({category,parent}:{category:HttpTypes.StoreProductCategory;parent?:HttpTypes.StoreProductCategory}){
 const {tr,language}=useYasminat();
 if(!parent&&!category.category_children?.length)return null;
 return <section className="category-route-branch">{parent&&<><LocalizedClientLink className="category-parent-link" href={`/categories/${parent.handle}`}>{categoryName(parent,language)}<YasIcon name="chevron" className="sm"/></LocalizedClientLink><h2>{categoryName(category,language)}</h2></>}{!!category.category_children?.length&&<nav className="category-children" aria-label={tr('الأقسام الفرعية','Subcategories')}>{category.category_children.map(child=><LocalizedClientLink key={child.id} className="secondary" href={`/categories/${child.handle}`}>{categoryName(child,language)}<YasIcon name="chevron" className="sm"/></LocalizedClientLink>)}</nav>}</section>;
}
