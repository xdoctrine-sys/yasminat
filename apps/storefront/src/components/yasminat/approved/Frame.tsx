'use client';
import {useEffect,useRef,type ReactNode} from 'react';
import {usePathname,useParams} from 'next/navigation';
import {YasBottomNav} from '../Shell';
import {useYasminat} from '../Provider';
const whatsapp='<path d="M20.5 11.4a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.6-4.8a8.5 8.5 0 1 1 15.9-4.3Z"/><path d="M8 6.8c.4-.3.9-.1 1.1.4l.8 1.7c.2.4.1.7-.3 1l-.6.5c.7 1.6 1.9 2.8 3.5 3.5l.5-.7c.3-.4.6-.5 1-.3l1.8.8c.5.2.7.6.4 1.1-.5 1-1.1 1.5-2.4 1.3-3.4-.5-6.7-3.9-7.1-7.2-.1-1 .3-1.7 1.3-2.1Z" fill="currentColor" stroke="none"/>';
export function ApprovedFrame({children}:{children:ReactNode}){
 const pathname=usePathname(),params=useParams(),screen=useRef<HTMLDivElement>(null),contact=useRef<HTMLDialogElement>(null);const {tr}=useYasminat();
 const path=pathname.replace(`/${params.locale}`,'')||'/';
 const number=path==='/'?1:path.startsWith('/departments')?2:path.startsWith('/categories')||path.startsWith('/offers')?3:path.startsWith('/products')?4:path.startsWith('/cart')?5:path.startsWith('/checkout')?6:path.startsWith('/sellers')?7:path.startsWith('/favorites')?8:path.startsWith('/login')?10:path.startsWith('/register')?11:path.includes('/orders/')?12:path.includes('/orders')?14:9;
 useEffect(()=>{screen.current?.scrollTo({top:0,behavior:'instant'});},[pathname]);
 return <div className="yas-approved" style={{'--site-frame-width':`${process.env.NEXT_PUBLIC_YASMINAT_REVIEW_WIDTH||1024}px`} as React.CSSProperties}><section className="screen-shell actual-site-frame" id={`YAS-${String(number).padStart(3,'0')}`}><div className={`screen ${number===1?'home-screen':''}`} data-screen={number} ref={screen}>{children}</div><div className="mobile-contact-dock"><button className="whatsapp-float" aria-label={tr('WhatsApp — تجربة التواصل','WhatsApp contact preview')} onClick={()=>contact.current?.showModal()}><svg className="icon brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" dangerouslySetInnerHTML={{__html:whatsapp}}/></button></div><YasBottomNav/><dialog className="yas-dialog" ref={contact}><h2>{tr('تواصل مع ياسمينات','Contact Yasminat')}</h2><p>{tr('رابط واتساب المشروع مو مضاف بعد، وما ينرسل أي شيء من هالنافذة.','The project WhatsApp link has not been added. Nothing is sent from this window.')}</p><form method="dialog"><button className="secondary">{tr('رجوع','Back')}</button></form></dialog></section></div>;
}
