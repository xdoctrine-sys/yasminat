"use client";
import {HttpTypes} from '@medusajs/types';
import useUpdateSearchParams from '@/hooks/useUpdateSearchParams';
import {YasIcon} from '@/components/yasminat/Icon';
import {useYasminat} from '@/components/yasminat/Provider';
export const ProductVariants=({product,selectedVariant}:{product:HttpTypes.StoreProduct;selectedVariant:Record<string,string>})=>{
 const update=useUpdateSearchParams();const {tr}=useYasminat();
 const colorOption=product.options?.find(o=>/^(color|colour|لون|اللون)$/i.test(o.title));
 const preview=product.metadata?.yasminat_product==='rose';
 return <section className="variant-options" id="detail-variant-options" data-testid="product-variants" aria-label={tr('خيارات المنتج','Product options')}>
 {!!product.metadata?.yasminat_preview_batch&&<div className="variant-demo-label">{tr('خيارات تجريبية · بنفس السعر المعروض','Demo options · same displayed price')}</div>}
 {(product.options||[]).filter(option=>option.title!=='__default__').map(option=><div className="variant-option-row" role="group" aria-label={option.title} key={option.id}><span className="variant-option-label">{option.title}</span><div className={/^(color|colour|لون|اللون)$/i.test(option.title)?'variant-colors':'variant-size-buttons'}>{(option.values||[]).map(v=>{const selected=selectedVariant[option.title.toLowerCase()]===v.value;const isColor=/^(color|colour|لون|اللون)$/i.test(option.title);const color=({white:'#f7f6ee',sand:'#d6c2a0',charcoal:'#515953',black:'#1c211e',green:'#62785f','أبيض':'#f7f6ee','رملي':'#d6c2a0','فحمي':'#515953'} as Record<string,string>)[v.value.toLowerCase()];return <button type="button" className={isColor?'variant-color':'variant-size'} key={v.id} aria-pressed={selected} data-testid={`product-variant-chip-${option.title.toLowerCase()}-${v.value.toLowerCase().replace(/\s+/g,'-')}`} onClick={()=>update(option.title.toLowerCase(),v.value)}>{isColor&&color&&<span style={{'--option-color':color} as React.CSSProperties}/>} {v.value}<YasIcon name="check" className="option-check"/></button>;})}</div></div>)}
 {preview&&colorOption&&<div className="variant-option-row variant-image-row">
<span className="variant-option-label">{tr('بالصور','Images')}</span>
<div className="variant-thumbnails" role="group" aria-label={tr('صور خيارات الحوض','Pot options images')}>{(colorOption.values||[]).map(v=>{const key=({'أبيض':'white','رملي':'sand','فحمي':'charcoal'} as Record<string,string>)[v.value]||v.value.toLowerCase();const selected=selectedVariant[colorOption.title.toLowerCase()]===v.value;return <button className="variant-thumbnail" type="button" key={v.id} aria-pressed={selected} onClick={()=>update(colorOption.title.toLowerCase(),v.value)}>
<img src={`/yasminat/garden/variant-pot-${key}.svg`} alt="" width="800" height="800"/>
<span>{v.value}</span>
<YasIcon name="check" className="option-check"/>
</button>;})}</div>
</div>}
 {preview&&<p className="variant-help">{tr('صور الحوض والمقاسات للتوضيح التجريبي.','Pot images and sizes are illustrative demo options.')}</p>}
 {!!product.options?.some(o=>o.title!=='__default__')&&<p className="variant-selected" role="status" aria-live="polite">{tr('اختيارك','Your selection')}: <strong>{product.options.map(o=>selectedVariant[o.title.toLowerCase()]).filter(Boolean).join(' · ')}</strong>
</p>}
 </section>;
};
