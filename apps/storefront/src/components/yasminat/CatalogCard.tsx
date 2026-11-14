'use client';

import {useEffect, useRef, useState} from 'react';
import {useParams} from 'next/navigation';
import type {HttpTypes} from '@medusajs/types';
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';
import {useCartContext} from '@/components/providers';
import {convertToLocale} from '@/lib/helpers/money';
import {getOfferAmount, getOfferStock, type StoreOffer} from '@/lib/helpers/buybox';
import {resolveQuickOffer} from './actions';
import {useYasminat} from './Provider';
import {YasIcon} from './Icon';
import {DeliveryEstimate} from './DeliveryEstimate';

type ProductPreview = Pick<HttpTypes.StoreProduct,'id'|'title'|'handle'|'thumbnail'> & Partial<Pick<HttpTypes.StoreProduct,'options'|'variants'|'metadata'>>;
type OfferPreview = Awaited<ReturnType<typeof resolveQuickOffer>>;
// Repeated cards share discovery requests; stock is still enforced by the API at purchase.
const discoveries = new Map<string,Promise<OfferPreview>>();
export function CatalogCard({product, offer, locale, className=''}: {product: ProductPreview; offer?: StoreOffer; locale?: string; className?: string}) {
  const params = useParams();
  const countryCode = locale || String(params.locale || 'qa');
  const {tr, favorites, toggleFavorite} = useYasminat();
  const {addToCart, cart, refreshCart,updateCartItem,removeCartItem} = useCartContext();
  const [resolved,setResolved] = useState<OfferPreview>(offer && getOfferAmount(offer)!==null ? {id:offer.id,amount:getOfferAmount(offer)!,stock:getOfferStock(offer),currency:offer.calculated_price!.currency_code || 'qar',original:typeof offer.metadata?.yasminat_old_price==='number'&&offer.metadata?.yasminat_preview_batch?offer.metadata.yasminat_old_price:offer.calculated_price?.original_amount ?? null}:null);
  const [loaded,setLoaded] = useState(!!offer);
  const [busy,setBusy] = useState(false);
  const [added,setAdded] = useState(false);
  const [error,setError] = useState('');
  const locked=useRef(false), timer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const needsOptions=((product.variants?.length || 0)>1 || product.options?.some(option=>(option.values?.length || 0)>1));
  useEffect(()=>{
    if(offer)return;
    let cancelled=false;
    const key=`${countryCode}:${product.id}`;
    if(!discoveries.has(key)) discoveries.set(key,resolveQuickOffer(product.id,countryCode));
    discoveries.get(key)!.then(value=>{if(!cancelled){setResolved(value);setLoaded(true);}}).catch(()=>{discoveries.delete(key);if(!cancelled)setLoaded(true);});
    return ()=>{cancelled=true;};
  },[product.id,countryCode,offer]);
  useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
  const money=(amount:number)=>resolved!.currency.toLowerCase()==='qar'?`${amount.toLocaleString('en-US',{maximumFractionDigits:2})} ${tr('ر.ق','QAR')}`:convertToLocale({amount,currency_code:resolved!.currency});
  const line=resolved?cart?.items?.find(item=>item.metadata?.offer_id===resolved.id):undefined;
  const inBag=line?.quantity||0;
  const onAdd=async()=>{
    if(locked.current||!resolved||resolved.stock<=inBag)return;
    locked.current=true;setBusy(true);setAdded(false);setError('');
    try{
      await addToCart({offerId:resolved.id,quantity:1,countryCode});
      const updated=await refreshCart();
      if((updated?.items?.find(item=>item.metadata?.offer_id===resolved.id)?.quantity || 0)>inBag){setAdded(true);if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>setAdded(false),1400);}
    }catch{setError(tr('تعذرت الإضافة؛ راجع توفر المنتج وحاول مرة ثانية.','Could not add this item. Check availability and try again.'));}
    finally{locked.current=false;setBusy(false);}
  };
  return <article className={`source-product-card ${className}`} data-testid={offer?'offer-card':'product-card'} data-product-id={product.id} data-offer-id={offer?.id}>
    <LocalizedClientLink className="source-product-picture" href={`/products/${product.handle}`} aria-label={`${tr('تفاصيل','Details')}: ${product.title}`}><img className="product-visual" src={product.thumbnail || '/images/placeholder.svg'} alt={product.title || ''} loading="lazy" width="360" height="360" />{resolved&&resolved.original&&resolved.original>resolved.amount&&<span className="discount">{tr('خصم','Save')} {Math.round((1-resolved.amount/resolved.original)*100)}%</span>}</LocalizedClientLink>
    <div className="source-product-body"><div className="source-product-meta"><span>{String(product.thumbnail).endsWith('.svg')?tr('رسم توضيحي','Illustration'):tr('مختارات ياسمينات','Yasminat selection')}</span><button type="button" className="yas-favorite" aria-pressed={favorites.includes(product.id)} aria-label={`${favorites.includes(product.id)?tr('إزالة من المفضلة','Remove favourite'):tr('حفظ','Save')} ${product.title}`} onClick={()=>toggleFavorite(product.id)}><YasIcon name="heart" /></button></div>
    <LocalizedClientLink href={`/products/${product.handle}`} className="source-product-name">{product.title}</LocalizedClientLink>
    <DeliveryEstimate metadata={offer?.metadata||product.metadata}/><div className="price" data-testid="product-card-price">{resolved?<><strong>{money(resolved.amount)}</strong>{resolved.original!==null&&resolved.original>resolved.amount&&<del>{money(resolved.original)}</del>}</>:<span>{loaded?tr('غير متوفر حاليًا','Currently unavailable'):tr('جارٍ تحميل السعر…','Loading price…')}</span>}</div>
    <div data-quantity-for={product.id}>{needsOptions?<LocalizedClientLink href={`/products/${product.handle}`} className="add-button">{tr('اختَر المقاس واللون','Choose options')}<YasIcon name="arrow" /></LocalizedClientLink>:inBag>0&&!added&&!busy?<div className="quantity" role="group" aria-label={`${tr('كمية','Quantity')}: ${product.title}`}><button type="button" disabled={!line?.id} aria-label={tr('تقليل الكمية','Decrease quantity')} onClick={()=>line?.id&&(inBag===1?removeCartItem(line.id):updateCartItem(line.id,inBag-1))}><YasIcon name="minus" className="sm"/></button><output aria-live="polite">{inBag}</output><button type="button" disabled={!line?.id||inBag>=(resolved?.stock||0)} aria-label={tr('زيادة الكمية','Increase quantity')} onClick={()=>line?.id&&updateCartItem(line.id,inBag+1)}><YasIcon name="plus" className="sm"/></button></div>:<button type="button" onClick={onAdd} disabled={busy||!resolved||inBag>=resolved.stock} className="add-button" data-add-status={added?'success':undefined} aria-live="polite">{added?<><YasIcon name="check" />{tr('تمت الإضافة','Added')}</>:busy?tr('جارٍ الإضافة…','Adding…'):resolved&&inBag>=resolved.stock?tr('غير متوفر','Unavailable'):<><YasIcon name="plus" />{tr('أضف للسلة','Add to bag')}</>}</button>}</div>
    {error&&<p role="alert" className="yas-error">{error}</p>}</div>
  </article>;
}
