"use client";

import {useEffect, useRef, useId} from 'react';
import {useYasminat} from '../Provider';
import {YasIcon} from '../Icon';
import {mountMascot} from './mascot-controller';
import narration from './mascotNarration.json';

/** Informational preview only: this card does not submit photos, chats or orders. */
export function MascotCard({language}: {language: 'ar' | 'en'}) {
 const root=useRef<HTMLElement>(null),titleId=useId();
 const {tr}=useYasminat();
 useEffect(()=>root.current ? mountMascot(root.current,{silentMotion:true}) : undefined, []);
 return <section ref={root} className="mascot-welcome" data-mascot-welcome data-mascot-state="still" data-audio-state="idle"
   data-audio-error={tr('تعذّر تشغيل الصوت. اضغط لإعادة المحاولة.','Audio could not play. Press play to try again.')}
   aria-label={tr('مساعد ياسمينات — معاينة تعريفية','Yasminat assistant — introduction preview')}>
  <button type="button" className="mascot-art" aria-label={tr('إعادة حركة الروبوت','Replay mascot motion')}>
   {/* Approved transparent artwork; object-fit preserves its proportions. */}
   {/* eslint-disable-next-line @next/next/no-img-element */}
   <img className="mascot-still" src="/assets/mascot/yasminat-logo-512.png" width="512" height="512" alt=""/>
   {/* eslint-disable-next-line @next/next/no-img-element */}
   <img className="mascot-motion" data-src="/assets/mascot/yasminat-anime.webp" width="324" height="405" alt="" hidden/>
  </button>
  <div className="mascot-copy">
   <h2>{tr('حيّاك في ياسمينات','Welcome to Yasminat')}</h2>
   <p>{tr('تعرف على مساعد ياسمينات · معاينة','Meet the Yasminat AI assistant · Preview')}</p>
   <details className="mascot-transcript"><summary>{tr('نص المقدمة الصوتية','Read the introduction')}</summary><p>{narration[language]}</p></details>
   <button type="button" className="mascot-video-open"><YasIcon name="play"/>{tr('شوف الفكرة بالفيديو','Watch the concept video')}</button>
   <p className="mascot-audio-status" role="status" aria-live="polite"/>
  </div>
  <button type="button" className="mascot-play" aria-label={tr('تشغيل التعريف الصوتي','Play audio introduction')}
   data-play-label={tr('تشغيل التعريف الصوتي','Play audio introduction')}
   data-pause-label={tr('إيقاف الصوت مؤقتًا','Pause audio introduction')}
   data-resume-label={tr('إكمال التعريف الصوتي','Resume audio introduction')}
   data-replay-label={tr('إعادة التعريف الصوتي','Replay audio introduction')}>
   <span data-mascot-play-icon><YasIcon name="play"/></span><span data-mascot-pause-icon hidden><YasIcon name="pause"/></span>
  </button>
  <audio className="mascot-narration" preload="none" data-src={language==='ar' ? '/assets/mascot/audio/yasminat-intro-ar-elevenlabs-v4.mp3' : '/assets/mascot/audio/yasminat-intro-en-neural-v3.mp3'} hidden/>
  <dialog className="mascot-presentation" aria-labelledby={titleId} data-play-hint={tr('اضغط تشغيل لمشاهدة عرض الفكرة.','Press play to watch the concept presentation.')}>
   <header className="mascot-presentation-header"><div><h2 id={titleId}>{tr('خلّنا نشوف الفكرة','See the idea in action')}</h2>
    <p>{tr('صورة المكان، الميزانية، المنتجات، والتنسيق المقترح.','Your space, your budget, products, and a suggested arrangement.')}</p></div>
    <button type="button" className="mascot-presentation-close" aria-label={tr('إغلاق الفيديو','Close video')}><YasIcon name="x"/></button>
   </header>
   <video className="mascot-presentation-video" controls playsInline preload="none"
    data-src-phone={`/assets/presentation/decor-presentation-${language}-phone-v2.mp4`}
    data-src-desktop={`/assets/presentation/decor-presentation-${language}-desktop-v2.mp4`}
    aria-label={tr('عرض توضيحي لفكرة تنسيق البيت','Home styling concept presentation')}/>
   <footer className="mascot-presentation-footer"><p className="mascot-presentation-status" role="status"/>
    <span>{tr('عرض توضيحي · الخدمة قيد التطوير','Concept preview · Service in development')}</span>
    <button type="button" className="mascot-presentation-fullscreen">{tr('ملء الشاشة','Full screen')}</button>
   </footer>
  </dialog>
 </section>;
}

export function MascotWelcome(){
 const {language}=useYasminat();
 // Remount media when the language changes; cleanup pauses the previous track.
 return <MascotCard key={language} language={language}/>;
}
