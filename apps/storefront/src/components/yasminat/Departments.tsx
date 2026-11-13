'use client';
import {useEffect,useRef,useState} from 'react';
import type {HttpTypes} from '@medusajs/types';
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';
import {categoryName} from '@/lib/helpers/category-tree';
import {useYasminat} from './Provider';
import {CatalogCard} from './CatalogCard';
import {ApprovedIntro} from './approved/Intro';
import {YasIcon} from './Icon';

export function YasDepartments({categories,products,locale}:{categories:HttpTypes.StoreProductCategory[];products:Record<string,HttpTypes.StoreProduct[]>;locale:string}){
 const {tr,language}=useYasminat();
 const [id,setId]=useState(categories.find(c=>c.metadata?.yasminat_category==='indoor'||c.handle==='indoor')?.id||categories[0]?.id);
 const menu=useRef<HTMLElement>(null),current=categories.find(c=>c.id===id);
 const shown=(id?products[id]:[])||[];
 const parent=categories.find(c=>c.id===current?.parent_category_id);
 const children=categories.filter(c=>c.parent_category_id===id);
 const name=(c:HttpTypes.StoreProductCategory)=>categoryName(c,language);
 const description=current&&(language==='en'&&typeof current.metadata?.description_en==='string'?current.metadata.description_en:current.description);
 useEffect(()=>{const el=menu.current;if(!el)return;const center=()=>{const buttons=el.querySelectorAll('button'),selected=el.querySelector('[aria-pressed="true"]');if(!selected||getComputedStyle(el).flexDirection!=='row')return;el.style.setProperty('--category-start-space',`${Math.max(0,(el.clientWidth-buttons[0].getBoundingClientRect().width)/2)}px`);el.style.setProperty('--category-end-space',`${Math.max(0,(el.clientWidth-buttons[buttons.length-1].getBoundingClientRect().width)/2)}px`);const r=selected.getBoundingClientRect(),m=el.getBoundingClientRect();el.scrollBy({left:r.left+r.width/2-m.left-el.clientLeft-el.clientWidth/2,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});};center();const observer=new ResizeObserver(center);observer.observe(el);return()=>observer.disconnect();},[id,language]);
 return <main className="screen-content container yas-page"><ApprovedIntro type="categories"/>{current?<div className="category-layout">
  <nav ref={menu} className="category-menu" aria-label={tr('جميع الأقسام','All categories')}>{categories.map(c=><button type="button" className={`${id===c.id?'active ':''}${c.parent_category_id?'category-child':''}`} key={c.id} data-category={c.handle} data-parent-category={c.parent_category_id||undefined} onClick={()=>setId(c.id)} aria-pressed={id===c.id}>{name(c)}<YasIcon name="chevron"/></button>)}</nav>
  <section className="category-detail"><div className="category-banner"><div>{parent&&<button type="button" className="category-parent-link" onClick={()=>setId(parent.id)}>{name(parent)}<YasIcon name="chevron" className="sm"/></button>}<h2>{name(current)}</h2><p>{description||(shown.length?tr('نباتات ومستلزمات مناسبة لهذا القسم.','Find something for your space.'):tr('هذا القسم ضمن مجال ياسمينات؛ التشكيلة بتضاف لاحقًا.','This category is in the catalogue; its collection will be added later.'))}</p></div><div className="visual-container">{shown[0]?.thumbnail?<img className="product-visual" src={shown[0].thumbnail} alt="" width="800" height="800"/>:current.metadata?.yasminat_category==='home-fragrance-diffusers'?<YasIcon name="home" className="category-symbol"/>:null}</div></div>
   <div className="category-options"><LocalizedClientLink href={`/categories/${current.handle}`}>{tr('كل منتجات القسم','All products')} ({shown.length})</LocalizedClientLink><LocalizedClientLink href={`/offers?category=${encodeURIComponent(current.handle)}`}>{tr('العروض','Special offers')}</LocalizedClientLink><LocalizedClientLink href="/sellers">{tr('اكتشف جميع المتاجر','Discover all stores')}</LocalizedClientLink></div>
   {!!children.length&&<nav className="category-children" aria-label={tr('الأقسام الفرعية','Subcategories')}>{children.map(child=><button type="button" className="secondary" key={child.id} onClick={()=>setId(child.id)}>{name(child)}<YasIcon name="chevron" className="sm"/></button>)}</nav>}
   <div className="product-grid">{shown.map(p=><CatalogCard key={p.id} product={p} locale={locale}/>)}</div>{!shown.length&&<p className="yas-empty">{tr('ما فيه منتجات معروضة حاليًا.','No products are currently available.')}</p>}
  </section></div>:<p className="yas-empty">{tr('الأقسام غير متاحة حاليًا.','Categories are currently unavailable.')}</p>}</main>;
}
