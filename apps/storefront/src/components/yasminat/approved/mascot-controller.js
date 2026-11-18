// Native React lifecycle adapter for the approved Yasminat mascot controller.

// Greeting motion is brief and silent. Narration requires an explicit user click.
export function mountMascot(rootElement, {silentMotion=false}={}) {
 const abort=new AbortController();
 const on=(node,event,handler)=>node.addEventListener(event,handler,{signal:abort.signal});
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 const key='yasminat-mascot-greeting-v1';
 let greeted=false,card=null,observer=null,timer=null,motionLoading=false,visible=false,audio=null,request=0;
 try{greeted=sessionStorage.getItem(key)==='seen';}catch{}
 const remember=()=>{greeted=true;try{sessionStorage.setItem(key,'seen');}catch{}};
 function contextAvailable(){
  if(!card?.isConnected||document.hidden||card.closest('[inert]'))return false;
  const r=card.getBoundingClientRect();
  return r.width>0&&r.height>0&&r.right>0&&r.left<innerWidth&&r.bottom>0&&r.top<innerHeight;
 }
 function stopMotion(){
  clearTimeout(timer);timer=null;motionLoading=false;
  if(!card)return;
  const motion=card.querySelector('.mascot-motion'),still=card.querySelector('.mascot-still');
  motion.onload=null;motion.onerror=null;motion.hidden=true;motion.removeAttribute('src');still.hidden=false;
  card.querySelector('.mascot-burst')?.remove();
  card.querySelector('.mascot-art').disabled=preference.matches||silentMotion;
  card.dataset.mascotState=preference.matches?'reduced-motion':'still';
 }
 function playMotion(){
  if(silentMotion||!card||preference.matches||!visible||!contextAvailable()||motionLoading)return;
  stopMotion();motionLoading=true;
  const root=card,motion=root.querySelector('.mascot-motion'),still=root.querySelector('.mascot-still');
  motion.onload=()=>{
   motionLoading=false;
   if(root!==card||!visible||preference.matches||!contextAvailable())return stopMotion();
   // Freeze the supplied drawing in the browser, then move its visible pieces.
   // No source artwork is recoloured, regenerated, or permanently altered.
   const frame=document.createElement('canvas');frame.width=motion.naturalWidth;frame.height=motion.naturalHeight;
   const context=frame.getContext('2d');if(!context)return stopMotion();
   context.drawImage(motion,0,0);
   const stage=document.createElement('span');stage.className='mascot-burst';stage.setAttribute('aria-hidden','true');
   stage.style.setProperty('--mascot-frame',`url("${frame.toDataURL('image/png')}")`);
   const pieces=[
    ['cap','inset(0 0 76% 0)','0%','-10%','-7deg'],
    ['head','polygon(0% 24%,100% 24%,100% 52%,29% 52%,23% 44%,0% 44%)','-4%','-5%','7deg'],
    ['left-arm','polygon(0% 44%,23% 44%,29% 52%,39% 57%,34% 66%,0% 66%)','-16%','2%','-18deg'],
    ['body','polygon(29% 52%,69% 52%,66% 59%,65% 70%,70% 78%,30% 78%,34% 66%,39% 57%)','2%','3%','-4deg'],
    ['right-arm','polygon(69% 52%,100% 52%,100% 78%,70% 78%,65% 70%,66% 59%)','16%','4%','18deg'],
    ['wheel','inset(78% 0 0 0)','0%','12%','-12deg']
   ];
   const whole=document.createElement('span');whole.className='mascot-burst-whole';stage.append(whole);
   for(const [name,clip,x,y,turn] of pieces){const piece=document.createElement('span');piece.className='mascot-burst-piece';piece.dataset.part=name;piece.style.clipPath=clip;piece.style.setProperty('--piece-x',x);piece.style.setProperty('--piece-y',y);piece.style.setProperty('--piece-turn',turn);stage.append(piece);}
   motion.onload=null;motion.onerror=null;motion.hidden=true;motion.removeAttribute('src');
   still.hidden=true;root.querySelector('.mascot-art').append(stage);root.dataset.mascotState='playing';remember();
   timer=setTimeout(stopMotion,3600);
  };
  motion.onerror=()=>{remember();stopMotion();};
  motion.src=motion.dataset.src;
 }
 function updateButton(){
  if(!card||!audio)return;
  const button=card.querySelector('.mascot-play');
  const playing=!audio.paused||card.dataset.audioState==='loading';
  const label=playing?button.dataset.pauseLabel:audio.ended?button.dataset.replayLabel:audio.currentTime>0?button.dataset.resumeLabel:button.dataset.playLabel;
  button.disabled=false;button.setAttribute('aria-label',label);button.title=label;
  button.querySelector('[data-mascot-play-icon]').hidden=playing;
  button.querySelector('[data-mascot-pause-icon]').hidden=!playing;
 }
 function pauseNarration(){
  request++;
  if(audio){audio.pause();if(card)card.dataset.audioState=audio.ended?'ended':audio.currentTime>0?'paused':'idle';}
  stopMotion();updateButton();
 }
 function playNarration(){
  if(!audio||!contextAvailable())return;
  remember();const id=++request,root=card,track=audio;
  root.querySelector('.mascot-audio-status').textContent='';
  if(track.error){track.removeAttribute('src');track.load();}
  if(!track.getAttribute('src'))track.src=track.dataset.src;
  if(track.ended)track.currentTime=0;
  root.dataset.audioState='loading';updateButton();
  // Call play synchronously inside the click handler, preserving mobile activation.
  track.play().then(()=>{
   if(id!==request||card!==root||!contextAvailable()){track.pause();return;}
   root.dataset.audioState='playing';updateButton();playMotion();
  }).catch(()=>{
   if(id!==request||card!==root)return;
   root.dataset.audioState='error';
   root.querySelector('.mascot-audio-status').textContent=root.dataset.audioError;
   stopMotion();updateButton();
  });
 }
 function closePresentation(){
  const dialog=card?.querySelector('.mascot-presentation');
  if(!dialog)return;
  dialog.querySelector('video').pause();if(dialog.open)dialog.close();
 }
 function openPresentation(automatic=false){
  if(!contextAvailable())return;
  pauseNarration();
  const root=card,dialog=root.querySelector('.mascot-presentation'),video=dialog.querySelector('video'),status=dialog.querySelector('.mascot-presentation-status');
  const phone=innerWidth<650;dialog.dataset.format=phone?'phone':'desktop';
  const src=phone?video.dataset.srcPhone:video.dataset.srcDesktop;
  if(video.getAttribute('src')!==src)video.src=src;else video.currentTime=0;
  status.textContent='';if(!dialog.open)dialog.showModal();
  if(automatic&&preference.matches){status.textContent=dialog.dataset.playHint;return;}
  video.muted=automatic;
  video.play().catch(()=>{if(card===root&&dialog.open)status.textContent=dialog.dataset.playHint;});
 }
 function syncContext(){
  if(!contextAvailable()){
   closePresentation();
   if(audio&&(!audio.paused||card?.dataset.audioState==='loading'))pauseNarration();
   else if(card?.dataset.mascotState==='playing'||motionLoading)stopMotion();
   return;
  }
  if(!visible){if(card.dataset.mascotState==='playing'||motionLoading)stopMotion();return;}
  if(!greeted&&!preference.matches)playMotion();
 }
 function connect(){
  const next=rootElement;
  if(next===card)return syncContext();
  closePresentation();pauseNarration();observer?.disconnect();card=next;visible=false;audio=card?.querySelector('.mascot-narration')||null;
  if(!card||!audio)return;
  stopMotion();card.dataset.audioState='idle';updateButton();
  const root=card,track=audio;
  on(audio,'pause',()=>{if(card===root&&audio===track)updateButton();});
  on(audio,'ended',()=>{if(card!==root||audio!==track)return;card.dataset.audioState='ended';stopMotion();updateButton();openPresentation(true);});
  on(audio,'error',()=>{
   if(card!==root||audio!==track)return;
   card.dataset.audioState='error';card.querySelector('.mascot-audio-status').textContent=card.dataset.audioError;stopMotion();updateButton();
  });
  on(card.querySelector('.mascot-play'),'click',()=>audio.paused&&card.dataset.audioState!=='loading'?playNarration():pauseNarration());
  on(card.querySelector('.mascot-art'),'click',()=>{remember();playMotion();});
  const dialog=card.querySelector('.mascot-presentation'),video=dialog.querySelector('video');
  on(card.querySelector('.mascot-video-open'),'click',()=>openPresentation(false));
  on(dialog.querySelector('.mascot-presentation-close'),'click',closePresentation);
  on(dialog,'close',()=>video.pause());
  on(dialog.querySelector('.mascot-presentation-fullscreen'),'click',()=>{
   if(video.requestFullscreen)video.requestFullscreen().catch(()=>{});
   else if(video.webkitEnterFullscreen)video.webkitEnterFullscreen();
  });
  observer=new IntersectionObserver(entries=>{const entry=entries[0];visible=entry.isIntersecting&&entry.intersectionRatio>=.6;syncContext();},{threshold:[0,.6]});
  observer.observe(card);
 }
 on(preference,'change',()=>{remember();stopMotion();});
 on(document,'visibilitychange',syncContext);
 on(window,'hashchange',syncContext);
 on(window,'pagehide',()=>{closePresentation();pauseNarration();});
 connect();
 return ()=>{closePresentation();pauseNarration();observer?.disconnect();abort.abort();card=null;audio=null;};
}
