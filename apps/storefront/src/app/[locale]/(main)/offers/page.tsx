import {listOffers} from '@/lib/data/offers';
import {listProducts} from '@/lib/data/products';
import {getCategoryByHandle,collectCategorySubtreeIds} from '@/lib/data/categories';
import {yasLanguage} from '@/components/yasminat/server';
import {OfferCard} from '@/components/organisms/OfferCard/OfferCard';
import {getOfferAmount,StoreOffer} from '@/lib/helpers/buybox';
export const metadata={title:'العروض | Special offers'};
export default async function Page({params,searchParams}:{params:Promise<{locale:string}>;searchParams:Promise<{category?:string}>}){
 const {locale}=await params;const {category:handle}=await searchParams;const ar=(await yasLanguage())==='ar';
 const category=handle?await getCategoryByHandle(handle):undefined;
 const ids=category?new Set((await listProducts({countryCode:locale,category_id:collectCategorySubtreeIds(category),queryParams:{limit:100}})).response.products.map(p=>p.id)):null;
 const {offers}=await listOffers({countryCode:locale,limit:100});
 const sale=(offers as StoreOffer[]).filter(o=>{const amount=getOfferAmount(o),original=o.calculated_price?.original_amount;return amount!==null&&typeof original==='number'&&original>amount&&(!ids||ids.has(o.product_id));});
 return <main className="screen-content container yas-page"><div className="page-intro"><span>A LITTLE SOMETHING SPECIAL</span><h1>{ar?'العروض':'Special offers'}</h1>{category&&<p>{category.name}</p>}</div>{sale.length?<div className="product-grid">{sale.map(o=><OfferCard key={o.id} offer={o} locale={locale}/>)}</div>:<p className="yas-empty">{ar?'ما فيه عروض معروضة حاليًا.':'No offers are currently displayed.'}</p>}</main>;
}
