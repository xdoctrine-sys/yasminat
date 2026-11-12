"use client";
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';
import {useYasminat} from '../Provider';
export function ApprovedBreadcrumb({name,category}:{name:string;category?:{name:string;handle:string}}){const {tr}=useYasminat();return <nav className="breadcrumb" aria-label={tr('مسار التصفح','Breadcrumb')}><ol><li><LocalizedClientLink href="/">{tr('الرئيسية','Home')}</LocalizedClientLink></li><li aria-hidden="true">/</li>{category&&<><li><LocalizedClientLink href={`/categories/${category.handle}`}>{category.name}</LocalizedClientLink></li><li aria-hidden="true">/</li></>}<li aria-current="page">{name}</li></ol></nav>;}
