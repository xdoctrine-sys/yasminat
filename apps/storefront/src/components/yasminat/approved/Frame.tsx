'use client';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import {usePathname,useParams} from 'next/navigation';
import {YasBottomNav} from '../Shell';
import {useYasminat} from '../Provider';
import {yasminatScreen} from '../navigation';
const whatsapp='<path d="M20.5 11.4a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.6-4.8a8.5 8.5 0 1 1 15.9-4.3Z"/><path d="M8 6.8c.4-.3.9-.1 1.1.4l.8 1.7c.2.4.1.7-.3 1l-.6.5c.7 1.6 1.9 2.8 3.5 3.5l.5-.7c.3-.4.6-.5 1-.3l1.8.8c.5.2.7.6.4 1.1-.5 1-1.1 1.5-2.4 1.3-3.4-.5-6.7-3.9-7.1-7.2-.1-1 .3-1.7 1.3-2.1Z" fill="currentColor" stroke="none"/>';
export function ApprovedFrame({children}:{children:ReactNode}){
 const pathname=usePathname(),params=useParams(),screen=useRef<HTMLDivElement>(null),contact=useRef<HTMLDialogElement>(null);const {tr}=useYasminat();
 const [tabsHidden,setTabsHidden]=useState(false);
 const lastScrollTop=useRef(0);
 const number=yasminatScreen(pathname,String(params.locale));
 const hasTabs=![4,5,10,11,12,13,14].includes(number);
 useEffect(()=>{setTabsHidden(false);lastScrollTop.current=0;screen.current?.scrollTo({top:0,behavior:'instant'});},[pathname]);
 const onScroll=()=>{if(!screen.current)return;const top=Math.max(0,Math.min(screen.current.scrollTop,screen.current.scrollHeight-screen.current.clientHeight)),delta=top-lastScrollTop.current;if(top<=12){setTabsHidden(false);lastScrollTop.current=top;}else if(Math.abs(delta)>=8){setTabsHidden(delta>0);lastScrollTop.current=top;}};
 return <div className="yas-approved" style={{'--site-frame-width':`${process.env.NEXT_PUBLIC_YASMINAT_REVIEW_WIDTH||1024}px`} as React.CSSProperties}><section className={`screen-shell actual-site-frame${tabsHidden?' tabs-scroll-hidden':''}`} id={`YAS-${String(number).padStart(3,'0')}`}><div className={`screen ${number===1?'home-screen':''}`} data-screen={number} ref={screen} onScroll={onScroll}>{children}</div><div className="mobile-contact-dock"><button className="whatsapp-float" aria-label={tr('WhatsApp — تجربة التواصل','WhatsApp contact preview')} onClick={()=>contact.current?.showModal()}><svg className="icon brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" dangerouslySetInnerHTML={{__html:whatsapp}}/></button></div>{hasTabs&&<YasBottomNav inactive={tabsHidden}/>}<dialog className="yas-dialog" ref={contact}><h2>{tr('تواصل مع ياسمينات','Contact Yasminat')}</h2><p>{tr('رابط واتساب المشروع مو مضاف بعد، وما ينرسل أي شيء من هالنافذة.','The project WhatsApp link has not been added. Nothing is sent from this window.')}</p><form method="dialog"><button className="secondary">{tr('رجوع','Back')}</button></form></dialog></section></div>;
}
