"use client";
import type {HttpTypes} from '@medusajs/types';
import {useYasminat} from '../Provider';
import {CatalogCard} from '../CatalogCard';
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';
export function ApprovedRelated({products,locale}:{products:HttpTypes.StoreProduct[];locale:string}){const {tr}=useYasminat();return <section className="section" style={{marginBottom:0}}><div className="section-heading"><h3>{tr('قد يعجبك أيضًا','You may also like')}</h3><LocalizedClientLink href="/categories" className="text-link">{tr('عرض الكل','View all')}</LocalizedClientLink></div><div className="product-grid">{products.map(p=><CatalogCard product={p} locale={locale} key={p.id}/>)}</div></section>;}
