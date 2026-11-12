import {YasDepartments} from '@/components/yasminat/Departments';
import {listCategories,collectCategorySubtreeIds} from '@/lib/data/categories';
import {listProducts} from '@/lib/data/products';
export const metadata={title:'الأقسام | Categories'};
export default async function Page({params}:{params:Promise<{locale:string}>}){
 const {locale}=await params;const {parentCategories}=await listCategories();
 const entries=await Promise.all(parentCategories.map(async c=>[c.id,(await listProducts({countryCode:locale,category_id:collectCategorySubtreeIds(c),queryParams:{limit:6}})).response.products] as const));
 return <YasDepartments categories={parentCategories} products={Object.fromEntries(entries)} locale={locale}/>;
}
