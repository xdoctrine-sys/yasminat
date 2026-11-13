'use client';

import {useEffect, useRef, useState} from 'react';
import {useParams, usePathname, useRouter} from 'next/navigation';
import type {HttpTypes} from '@medusajs/types';
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';
import {useCartContext} from '@/components/providers';
import {useYasminat} from './Provider';
import {ApprovedNotifications} from './approved/Parts';
import {YasIcon, type IconName} from './Icon';
import {yasminatScreen} from './navigation';

type Category = Pick<HttpTypes.StoreProductCategory, 'id' | 'handle' | 'name'>;
export function YasHeader({categories=[]}: {categories?: Category[]}) {
 const {tr}=useYasminat();const params=useParams(),path=usePathname(),router=useRouter();
 const [canGoBack,setCanGoBack]=useState(false);
 const previousEntry=useRef<{url:string;index:number}|null>(null);
 useEffect(()=>{
  const navigation=(window as Window & {navigation?:EventTarget & {canGoBack:boolean}}).navigation;
  const sync=()=>{
   if(navigation){setCanGoBack(navigation.canGoBack);return;}
   // Older browsers: track our entries without changing Next's history fields.
   const stored=window.history.state?.yasminatNavigation as {url:string;index:number}|undefined;
   let index=stored?.url===window.location.href?stored.index:undefined;
   if(index===undefined){
    index=previousEntry.current&&previousEntry.current.url!==window.location.href?previousEntry.current.index+1:(document.referrer&&window.history.length>1?1:0);
    window.history.replaceState({...window.history.state,yasminatNavigation:{url:window.location.href,index}},'');
   }
   previousEntry.current={url:window.location.href,index};setCanGoBack(index>0);
  };
  sync();navigation?.addEventListener('currententrychange',sync);window.addEventListener('popstate',sync);window.addEventListener('pageshow',sync);
  return()=>{navigation?.removeEventListener('currententrychange',sync);window.removeEventListener('popstate',sync);window.removeEventListener('pageshow',sync);};
 },[path]);
 const screen=yasminatScreen(path,String(params.locale));
 if([4,10,11].includes(screen)){
  const canClose=screen!==4;
  if(!canGoBack&&!canClose)return null;
  if(!canGoBack)return <LocalizedClientLink className="history-back standalone-history-back" href="/" replace aria-label={tr('إغلاق','Close')}><YasIcon name="x"/></LocalizedClientLink>;
  return <button type="button" className="history-back standalone-history-back" aria-label={tr('الرجوع','Go back')} onClick={()=>router.back()}><YasIcon name="arrow"/></button>;
 }
 if([1,8].includes(screen))return null;
 const copy:Record<number,[string,string]>={
  2:[tr('كل شيء جميل، في مكان واحد','A world of beautiful things'),tr('تصفّح النباتات والأحواض ومستلزمات البيت والحديقة.','Explore plants, pots and garden essentials.')],
  3:[tr('اختَر اللي يشبه ذوقك','Find something you love'),tr('نباتات داخلية وخارجية وأحواض ومستلزمات حدائق.','Indoor and outdoor plants, pots and garden essentials.')],
  5:[tr('سلة اختياراتك','Your shopping bag'),tr('راجع المنتجات والكميات قبل إتمام الطلب.','Review your selection and quantities before checkout.')],
  6:[tr('خلّ الخضرة توصل','Let a little green arrive'),tr('بيانات التوصيل وملاحظاتك، وكل التفاصيل قبل التأكيد.','Your delivery details, notes and order, all in one place.')],
  7:[tr('اكتشف المتاجر والمشاتل','Explore stores & nurseries'),''],
  9:[tr('حسابي','My account'),tr('مساحتك للنباتات والاختيارات اللي تحبها.','Your corner for the plants and details you love.')],
  12:[tr('تفاصيل الطلب','Order details'),tr('اختياراتك وأسعارها وقت تأكيد الطلب.','Your choices and prices at order confirmation.')],
  13:[tr('متابعة الطلب','Track order'),tr('تابع حالة طلبك وتوصيله من المتجر.','Follow your order and delivery status.')],
  14:[tr('طلباتي','My orders'),tr('تابع طلباتك وتفاصيلها في مكان واحد.','Your orders and their details in one place.')],
 };
 const floating=!!copy[screen];
 const [title,subtitle]=copy[screen]||['',''];
 return <header className={`phone-header${floating?' floating-page-header':''}`}>
 {floating&&canGoBack&&<button type="button" className="history-back" aria-label={tr('الرجوع','Go back')} onClick={()=>router.back()}><YasIcon name="arrow"/></button>}
 <LocalizedClientLink className="phone-brand" href="/">{tr('ياسمينات','YASMINAT')}</LocalizedClientLink>{floating&&<><h2 className="floating-page-title">{title}</h2>{subtitle&&<p className="floating-page-subtitle">{subtitle}</p>}</>}<ApprovedNotifications/></header>;
}

export function YasBottomNav({inactive=false}:{inactive?:boolean}={}) {
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
  return <nav className="mobile-tabs" inert={inactive} aria-hidden={inactive||undefined} aria-label={tr('التنقل الرئيسي','Main navigation')}>{items.map(item => <LocalizedClientLink key={item.href} data-nav={item.icon} className={item.active?'active':undefined} href={item.href} aria-current={item.active ? 'page' : undefined}><span className="tab-icon"><YasIcon name={item.icon} />{item.icon==='bag'&&<b className="tab-count" aria-live="polite">{count}</b>}</span><span>{tr(item.ar,item.en)}</span></LocalizedClientLink>)}</nav>;
}

export function YasFooter(){return null;}
