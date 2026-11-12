"use client";
import {useEffect,useRef,useState} from 'react';
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';
import {useYasminat} from './Provider';
import {YasIcon} from './Icon';
export type NurseryPreview={id:string;handle:string;name:string;description?:string|null;logo?:string|null;banner?:string|null;metadata?:Record<string,unknown>|null};
export function NurseryPicker({sellers,current}:{sellers:NurseryPreview[];current?:string}){
 const {tr,language}=useYasminat();const ref=useRef<HTMLDivElement>(null);const [perPage,setPerPage]=useState(3),[page,setPage]=useState(0);
 useEffect(()=>{const el=ref.current;if(!el)return;const observer=new ResizeObserver(()=>setPerPage(el.clientWidth>=408?4:3));observer.observe(el);return()=>observer.disconnect();},[]);
 const pages=Array.from({length:Math.ceil(sellers.length/perPage)},(_,i)=>sellers.slice(i*perPage,(i+1)*perPage));
 return <>
<header className="vendor-picker">
<h2>{tr('اكتشف المتاجر والمشاتل','Explore stores & nurseries')}</h2>
</header>
<div className="nursery-carousel" role="region" aria-roledescription="carousel" aria-label={tr('المشاتل والمتاجر','Stores and nurseries')}>
<div className="nursery-pages" ref={ref} tabIndex={0} onScroll={e=>setPage(Math.round(Math.abs(e.currentTarget.scrollLeft)/e.currentTarget.clientWidth))}>{pages.map((entries,i)=>
<div className="nursery-page" key={i} style={{'--nursery-columns':perPage} as React.CSSProperties} role="group" aria-label={`${i+1} / ${pages.length}`}>{entries.map(s=>
<LocalizedClientLink className="nursery-choice" key={s.id} href={`/sellers/${s.handle}`} aria-current={current===s.id?'page':undefined}>
<span className="nursery-mark">
<YasIcon name="leaf"/>
</span>
<span className="nursery-name">{s.name}</span>
</LocalizedClientLink>)}</div>)}</div>{pages.length>1&&<div className="nursery-dots">{pages.map((_,i)=>
<button className={`nursery-dot ${page===i?'active':''}`} key={i} aria-label={`${tr('صفحة المتاجر والمشاتل','Nursery page')} ${i+1}`} aria-current={page===i?'true':undefined} onClick={()=>ref.current?.scrollTo({left:(language==='ar'?-1:1)*i*ref.current.clientWidth,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}>
<span aria-hidden="true"/>
</button>)}</div>}<p className="nursery-demo-note">{tr('العناصر المعلّمة «تجريبي» أمثلة للمعاينة.','Items labelled Demo are preview examples.')}</p>
</div>
</>;
}
export function NurseryBanner({seller,count}:{seller:NurseryPreview;count?:number}){const {tr}=useYasminat();return <>
<div className="vendor-banner">
<div>
<div className="vendor-icon">
<YasIcon name="leaf"/>
</div>
<h2>{seller.name}</h2>
<p>{seller.description}</p>
<div className="vendor-meta">
<span>{tr('قطر','Qatar')}{seller.handle.startsWith('yasminat-preview-')&&` · ${tr('متجر تجريبي','Demo store')}`}</span>{typeof count==='number'&&<span>{count} {tr('منتجات','products')}</span>}</div>
</div>
<div className="visual-container">{(seller.banner||seller.logo)&&<img className="product-visual" src={seller.banner||seller.logo||''} alt="" width="800" height="800"/>}</div>
</div>
<nav className="vendor-tabs" aria-label={tr('محتويات المتجر','Store content')}>
<a href="#vendor-products">{tr('منتجات المتجر','Store collection')}</a>
<a href="#vendor-about">{tr('عن المتجر','About the store')}</a>
</nav>
</>;}
