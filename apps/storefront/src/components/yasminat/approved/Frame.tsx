'use client';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import {usePathname,useParams} from 'next/navigation';
import {YasBottomNav} from '../Shell';
import {useYasminat} from '../Provider';
import {MascotDock} from './MascotDock';
import {yasminatScreen} from '../navigation';
export function ApprovedFrame({children}:{children:ReactNode}){
 const pathname=usePathname(),params=useParams(),screen=useRef<HTMLDivElement>(null);const {tr}=useYasminat();
 const [tabsHidden,setTabsHidden]=useState(false);
 const lastScrollTop=useRef(0);
 const number=yasminatScreen(pathname,String(params.locale));
 const hasTabs=![4,5,10,11,12,13,14].includes(number);
 useEffect(()=>{setTabsHidden(false);lastScrollTop.current=0;screen.current?.scrollTo({top:0,behavior:'instant'});},[pathname]);
 const onScroll=()=>{if(!screen.current)return;const top=Math.max(0,Math.min(screen.current.scrollTop,screen.current.scrollHeight-screen.current.clientHeight)),delta=top-lastScrollTop.current;if(top<=12){setTabsHidden(false);lastScrollTop.current=top;}else if(Math.abs(delta)>=8){setTabsHidden(delta>0);lastScrollTop.current=top;}};
 return <div className="yas-approved" style={{'--site-frame-width':`${process.env.NEXT_PUBLIC_YASMINAT_REVIEW_WIDTH||1024}px`} as React.CSSProperties}><section className={`screen-shell actual-site-frame${tabsHidden?' tabs-scroll-hidden':''}`} id={`YAS-${String(number).padStart(3,'0')}`}><div className={`screen ${number===1?'home-screen':''}`} data-screen={number} ref={screen} onScroll={onScroll}>{children}</div>{hasTabs&&<YasBottomNav inactive={tabsHidden}/>}<MascotDock key={`${pathname}-${tr('ar','en')}`}/></section></div>;
}
