'use client';
import {useEffect,useState} from 'react';
import type {HttpTypes} from '@medusajs/types';
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';
import {useYasminat} from './Provider';
import {favoriteProducts} from './actions';
import {CatalogCard} from './CatalogCard';
import {YasIcon} from './Icon';
import {ApprovedIntro} from './approved/Intro';
import {ApprovedBreadcrumb} from './approved/Breadcrumb';

export function YasFavorites({locale}:{locale:string}){
 const {favorites,tr}=useYasminat();const [products,setProducts]=useState<HttpTypes.StoreProduct[]>([]);const [loading,setLoading]=useState(false);const [failed,setFailed]=useState(false);
 useEffect(()=>{let cancelled=false;setLoading(true);setFailed(false);favoriteProducts(favorites,locale).then(items=>{if(!cancelled)setProducts(items);}).catch(()=>{if(!cancelled)setFailed(true);}).finally(()=>{if(!cancelled)setLoading(false);});return()=>{cancelled=true;};},[favorites,locale]);
 return <main className={`screen-content container ${!favorites.length?'favorites-empty-screen':''}`}>{favorites.length?<ApprovedIntro type="favorites"/>:<ApprovedBreadcrumb name={tr('المفضلة','Favourites')}/>}{loading?<p role="status">{tr('جارٍ تحميل اختياراتك…','Loading your favourites…')}</p>:failed?<p role="alert">{tr('تعذر تحميل المنتجات. حاول مرة ثانية.','Unable to load products. Please try again.')}</p>:products.length?<div className="product-grid">{products.map(p=><CatalogCard key={p.id} product={p} locale={locale}/>)}</div>:<div className="empty favorite-empty"><YasIcon name="heart"/><h3>{tr('اختياراتك الجميلة تبدأ بقلب','A little heart goes a long way')}</h3><p>{tr('اضغط القلب على أي منتج، وبتلقاه محفوظ هنا.','Save a product using its heart button and find it here.')}</p><LocalizedClientLink href="/categories" className="secondary"><span>{tr('اكتشف المنتجات','Discover products')}</span><YasIcon name="arrow"/></LocalizedClientLink></div>}</main>;
}
