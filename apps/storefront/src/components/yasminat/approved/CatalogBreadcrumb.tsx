'use client';
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';
import {breadcrumbJson, crumbName, type CatalogCrumb} from '@/lib/helpers/catalog-breadcrumbs';
import {useYasminat} from '../Provider';
import {YasIcon} from '../Icon';
export function BreadcrumbTrail({items}:{items:CatalogCrumb[]}) {
 const {tr,language}=useYasminat();
 return <ol>{items.map((item,index)=><li key={item.path}>{index>0&&<span className="breadcrumb-separator" aria-hidden="true"><YasIcon name="chevron" className="directional-icon"/></span>}{index===items.length-1?<span aria-current="page">{crumbName(item,language)}</span>:<LocalizedClientLink href={item.path} className={index===0?'breadcrumb-home':undefined} aria-label={index===0?tr('الرئيسية','Home'):undefined}>{index===0?<YasIcon name="home"/>:crumbName(item,language)}</LocalizedClientLink>}</li>)}</ol>;
}
export function CatalogBreadcrumb({items,baseUrl,locale,placement='responsive'}:{items:CatalogCrumb[];baseUrl:string;locale:string;placement?:'responsive'|'desktop'|'compact'}) {
 const {tr,language}=useYasminat();
 return <>
 {placement!=='compact'&&items.length>=2&&<script type="application/ld+json" data-catalog-breadcrumb dangerouslySetInnerHTML={{__html:breadcrumbJson(items,baseUrl,locale,language)}}/>}
 <nav className={`breadcrumb ${placement==='compact'?'product-breadcrumb-mobile':placement==='desktop'?'product-breadcrumb-desktop':'catalog-breadcrumb-full'}`} aria-label={tr('مسار التصفح','Breadcrumb')}><BreadcrumbTrail items={items}/></nav>
 </>;
}
