'use client';

import {useState} from 'react';
import {useParams, usePathname, useRouter} from 'next/navigation';
import type {HttpTypes} from '@medusajs/types';
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';
import {useCartContext} from '@/components/providers';
import {useYasminat} from './Provider';
import {ApprovedNotifications} from './approved/Parts';
import {YasIcon, type IconName} from './Icon';

type Category = Pick<HttpTypes.StoreProductCategory, 'id' | 'handle' | 'name'>;
export function YasHeader({categories=[]}: {categories?: Category[]}) {
 const {tr}=useYasminat();const params=useParams(),path=usePathname();
 if(path===`/${params.locale}`||path===`/${params.locale}/`)return null;
 return <header className="phone-header"><LocalizedClientLink className="phone-brand" href="/">{tr('ياسمينات','YASMINAT')}</LocalizedClientLink><ApprovedNotifications/></header>;
}

export function YasBottomNav() {
  const {tr} = useYasminat();
  const {cart} = useCartContext();
  const pathname = usePathname();
  const params = useParams();
  const path = pathname.replace(`/${params.locale}`, '') || '/';
  const items: {href: string; ar: string; en: string; icon: IconName; active: boolean}[] = [
    {href:'/',ar:'الرئيسية',en:'Home',icon:'store',active:path==='/'},
    {href:'/departments',ar:'الأقسام',en:'Categories',icon:'grid',active:path.startsWith('/departments')||path.startsWith('/categories')},
    {href:'/cart',ar:'السلة',en:'Bag',icon:'bag',active:path.startsWith('/cart')},
    {href:'/favorites',ar:'المفضلة',en:'Favourites',icon:'heart',active:path.startsWith('/favorites')},
    {href:'/account',ar:'حسابي',en:'Account',icon:'user',active:path.startsWith('/user')||path.startsWith('/account')},
  ];
  const count = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  return <nav className="mobile-tabs" aria-label={tr('التنقل الرئيسي','Main navigation')}>{items.map(item => <LocalizedClientLink key={item.href} className={item.active?'active':undefined} href={item.href} aria-current={item.active ? 'page' : undefined}><span className="tab-icon"><YasIcon name={item.icon} />{item.icon==='bag'&&<b className="tab-count" aria-live="polite">{count}</b>}</span><span>{tr(item.ar,item.en)}</span></LocalizedClientLink>)}</nav>;
}

export function YasFooter(){return null;}
