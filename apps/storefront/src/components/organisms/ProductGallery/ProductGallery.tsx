'use client';

import {useRef,useState} from 'react';
import type {HttpTypes} from '@medusajs/types';
import {useYasminat} from '@/components/yasminat/Provider';

export const ProductGallery=({images,title=''}:{images:HttpTypes.StoreProduct['images'];title?:string})=>{
 const {tr,language}=useYasminat();
 const track=useRef<HTMLDivElement>(null);
 const [active,setActive]=useState(0);
 if(!images?.length)return null;
 const move=(index:number)=>{
  const node=track.current;if(!node)return;
  node.scrollTo({left:(language==='ar'?-1:1)*index*node.clientWidth,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 };
 return <div className="product-gallery" data-testid="product-gallery" role="region" aria-roledescription="carousel" aria-label={tr('صور المنتج','Product images')}>
  <div className="product-gallery-track" ref={track} tabIndex={0} aria-label={tr('اسحب لاستعراض الصور','Swipe to browse images')} onScroll={e=>{const node=e.currentTarget;setActive(Math.max(0,Math.min(images.length-1,Math.round(Math.abs(node.scrollLeft)/node.clientWidth))));}} onKeyDown={e=>{
   if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
   e.preventDefault();const step=e.key===(language==='ar'?'ArrowLeft':'ArrowRight')?1:-1;
   move(e.key==='Home'?0:e.key==='End'?images.length-1:Math.max(0,Math.min(images.length-1,active+step)));
  }}>
   {images.map((image,index)=><div className="product-gallery-slide" key={image.id||image.url} role="group" aria-label={`${index+1} / ${images.length}`}><img className="product-visual" src={image.url} alt={`${title||tr('صورة المنتج','Product image')} · ${index+1}`} width="800" height="800" loading={index===0?'eager':'lazy'} fetchPriority={index===0?'high':'auto'} draggable={false}/></div>)}
  </div>
  <div className="product-gallery-thumbnails" aria-label={tr('اختيار صورة المنتج','Choose product image')}>
   {images.map((image,index)=><button type="button" className="product-gallery-thumbnail" key={image.id||image.url} aria-label={tr(`عرض الصورة ${index+1}`,`Show image ${index+1}`)} aria-pressed={active===index} onClick={()=>move(index)}><img src={image.url} alt="" width="56" height="56" draggable={false}/></button>)}
  </div>
 </div>;
};
