"use client"
import {DeliveryEstimate} from '@/components/yasminat/DeliveryEstimate';
import {useYasminat} from '@/components/yasminat/Provider';
import {YasIcon} from '@/components/yasminat/Icon';
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/atoms"
import { HttpTypes } from "@medusajs/types"
import { ProductVariants } from "@/components/molecules"
import useGetAllSearchParams from "@/hooks/useGetAllSearchParams"
import { getProductPrice } from "@/lib/helpers/get-product-price"
import { convertToLocale } from "@/lib/helpers/money"
import {
  getBuyboxWinner,
  rankOffers,
  getOfferAmount,
  getOfferStock,
  getVariantOffers,
  StoreOffer,
} from "@/lib/helpers/buybox"
import { Chat } from "@/components/organisms/Chat/Chat"
import { CompareOffersModal } from "@/components/organisms/CompareOffersModal/CompareOffersModal"
import { SellerDTO } from "@mercurjs/types"
import { toast } from "@/lib/helpers/toast"
import { useCartContext } from "@/components/providers"

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce(
    (
      acc: Record<string, string>,
      varopt: HttpTypes.StoreProductOptionValue
    ) => {
      acc[varopt.option?.title.toLowerCase() || ""] = varopt.value

      return acc
    },
    {}
  )
}

export const ProductDetailsHeader = ({product,locale,user,offers=[],seller}:{product:HttpTypes.StoreProduct;locale:string;user:HttpTypes.StoreCustomer|null;offers?:StoreOffer[];seller?:SellerDTO}) => {
 const {addToCart,cart,isAddingItem,refreshCart}=useCartContext();
 const {allSearchParams}=useGetAllSearchParams();
 const {tr,favorites,toggleFavorite}=useYasminat();
 const [isCompareOpen,setIsCompareOpen]=useState(false);
 const [quantity,setQuantity]=useState(1),[added,setAdded]=useState(false),[error,setError]=useState('');
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null),locked=useRef(false),gift=useRef<HTMLDialogElement>(null);
 const preferred=getBuyboxWinner(rankOffers(offers));
 const defaultVariant=(product.metadata?.yasminat_product==='rose'?product.variants?.find(v=>v.options?.some(o=>o.value==='متوسط')&&v.options?.some(o=>o.value==='أبيض')):undefined)||product.variants?.find(v=>v.id===preferred?.variant_id)||product.variants?.[0];
 const selectedVariant={...optionsAsKeymap(defaultVariant?.options ?? null),...allSearchParams};
 const variantId=product.variants?.find(v=>v.options?.every(option=>selectedVariant[option.option?.title.toLowerCase()||'']===option.value))?.id || '';
 const variantOffers=getVariantOffers(offers,variantId),winnerOffer=getBuyboxWinner(variantOffers);
 const amount=winnerOffer?getOfferAmount(winnerOffer):null,currency=winnerOffer?.calculated_price?.currency_code;
 const stock=winnerOffer?getOfferStock(winnerOffer):0;
 const inCart=cart?.items?.find(item=>item.metadata?.offer_id===winnerOffer?.id)?.quantity||0;
 const available=Math.max(0,stock-inCart);
 const hasOffer=!!winnerOffer&&amount!==null&&!!currency;
 const money=(value:number)=>currency?.toLowerCase()==='qar'?`${value.toLocaleString('en-US',{maximumFractionDigits:2})} ${tr('ر.ق','QAR')}`:currency?convertToLocale({amount:value,currency_code:currency}):'';
 const original=typeof winnerOffer?.metadata?.yasminat_old_price==='number'&&winnerOffer.metadata?.yasminat_preview_batch?winnerOffer.metadata.yasminat_old_price:winnerOffer?.calculated_price?.original_amount;
 useEffect(()=>{setAdded(false);setError('');if(timer.current)clearTimeout(timer.current);},[variantId,quantity]);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
 const handleAddToCart=async()=>{
  if(locked.current||!hasOffer||!winnerOffer||quantity>available)return;
  locked.current=true;setAdded(false);setError('');
  try{
   await addToCart({offerId:winnerOffer.id,quantity,countryCode:locale});
   const updated=await refreshCart();
   if((updated?.items?.find(item=>item.metadata?.offer_id===winnerOffer.id)?.quantity||0)>=inCart+quantity){setAdded(true);if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>setAdded(false),1400);}
  }catch{setError(tr('تعذرت الإضافة. راجع توفر المنتج وحاول مرة ثانية.','Could not add this item. Check availability and try again.'));}
  finally{locked.current=false;}
 };
 return <div data-testid="product-details-header">
  {seller?.handle&&<LocalizedClientLink href={`/sellers/${seller.handle}`} className="detail-store"><YasIcon name="store" className="sm"/> {seller.name}</LocalizedClientLink>}
  <div className="detail-title-price"><div className="detail-title-label"><h2 data-testid="product-title">{product.title}</h2><DeliveryEstimate metadata={winnerOffer?.metadata||product.metadata}/></div><div className="price">{hasOffer?<><strong data-testid="product-price-current">{money(amount!)}</strong>{typeof original==='number'&&original>amount!&&<del>{money(original)}</del>}</>:<p>{tr('غير متوفر حاليًا','Currently unavailable')}</p>}</div></div>
  {product.description&&<p className="description">{product.description}</p>}
  <ProductVariants product={product} selectedVariant={selectedVariant}/>
  <div className="detail-note"><YasIcon name="truck"/>{tr('توصيل داخل قطر · التفاصيل عند إتمام الطلب','Qatar delivery · details at checkout')}</div>
  <div className="detail-note"><YasIcon name="gift"/>{tr('أضف ملاحظاتك عند إتمام الطلب','Add delivery notes at checkout')}</div>
  <div className="detail-purchase-total" role="status" aria-live="polite" aria-atomic="true"><div>{tr('إجمالي شراء المنتج','Product total')}<small>{tr('سعر القطعة: ','Unit price: ')}{hasOffer?money(amount!):'—'}</small></div><strong>{hasOffer?money(amount!*quantity):'—'}</strong></div>
  <div className="detail-actions"><div id="detail-quantity"><div className="quantity" role="group" aria-label={tr('كمية الإضافة','Purchase quantity')}><button type="button" disabled={quantity<=1||isAddingItem} onClick={()=>setQuantity(v=>v-1)} aria-label={tr('تقليل الكمية','Decrease quantity')}><YasIcon name="minus"/></button><output aria-live="polite">{quantity}</output><button type="button" disabled={quantity>=available||isAddingItem} onClick={()=>setQuantity(v=>v+1)} aria-label={tr('زيادة الكمية','Increase quantity')}><YasIcon name="plus"/></button></div></div>
  <button type="button" className="primary" data-testid="product-add-to-cart-button" disabled={!hasOffer||available<quantity||isAddingItem} onClick={handleAddToCart} aria-live="polite" data-add-status={added?'success':undefined}>{added?<><YasIcon name="check"/>{tr('تمت الإضافة','Added')}</>:isAddingItem?tr('جارٍ الإضافة…','Adding…'):available<quantity||!hasOffer?tr('غير متوفر','Unavailable'):<><YasIcon name="bag"/>{tr('أضف للسلة','Add to bag')}</>}</button>
  <button type="button" className="heart-button" aria-pressed={favorites.includes(product.id)} aria-label={tr('حفظ المنتج في المفضلة','Save to favourites')} onClick={()=>toggleFavorite(product.id)}><YasIcon name="heart"/></button></div>
  {error&&<p role="alert" className="yas-error">{error}</p>}
  <button type="button" className="secondary detail-gift-button" onClick={()=>gift.current?.showModal()}><YasIcon name="gift"/>{tr('أرسلها كهدية','Send as a gift')}</button>
  <dialog ref={gift} className="yas-dialog" onClick={event=>{if(event.target===gift.current)gift.current.close();}}><h2>{tr('معاينة الهدية','Gift preview')}</h2><p>{product.title}</p>{Object.entries(selectedVariant).filter(([key])=>product.options?.some(o=>o.title.toLowerCase()===key)).map(([key,value])=><p key={key}>{key}: {value}</p>)}<p>{tr('الكمية: ','Quantity: ')}{quantity}</p><p>{tr('قيمة المنتجات: ','Items total: ')}{hasOffer?money(amount!*quantity):'—'}</p><p className="yas-note">{tr('معاينة فقط؛ خدمة إرسال الهدايا غير مفعلة حاليًا.','Preview only. Gift delivery is not enabled yet.')}</p><form method="dialog"><button className="yas-secondary">{tr('الرجوع لاختياراتي','Back to my selection')}</button></form></dialog>
  {variantOffers.length>1&&<button type="button" className="yas-secondary" onClick={()=>setIsCompareOpen(true)}>{tr('قارن عروض البائعين','Compare seller offers')} ({variantOffers.length})</button>}
  {isCompareOpen&&<CompareOffersModal offers={variantOffers} locale={locale} variantLabel={product.variants?.find(v=>v.id===variantId)?.title||undefined} onClose={()=>setIsCompareOpen(false)}/>}
  {user&&seller&&<Chat user={user} seller={seller} buttonClassNames="w-full uppercase" product={product}/>}
 </div>;
}
