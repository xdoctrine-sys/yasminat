"use client"
import {DeliveryEstimate} from '@/components/yasminat/DeliveryEstimate';
import {HttpTypes} from '@medusajs/types';
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';
import {DeleteCartItemButton} from '@/components/molecules/DeleteCartItemButton/DeleteCartItemButton';
import {UpdateCartItemButton} from '@/components/molecules/UpdateCartItemButton/UpdateCartItemButton';
import {filterValidCartItems} from '@/lib/helpers/filter-valid-cart-items';
import {convertToLocale} from '@/lib/helpers/money';
import {useYasminat} from '@/components/yasminat/Provider';
export const CartItemsProducts=({products,currency_code,delete_item=true,change_quantity=true}:{products:HttpTypes.StoreCartLineItem[];currency_code:string;delete_item?:boolean;change_quantity?:boolean})=>{
 const {tr}=useYasminat();
 return <div>{filterValidCartItems(products).map(product=>{
  const options=Object.entries(product.variant_option_values||{}).filter(([key])=>key!=='__default__');
  const money=(amount:number)=>currency_code.toLowerCase()==='qar'?`${amount.toLocaleString('en-US',{maximumFractionDigits:2})} ${tr('ر.ق','QAR')}`:convertToLocale({amount,currency_code});
  return <article key={product.id} className="cart-item" data-testid={`cart-item-${product.id}`}><LocalizedClientLink className="cart-photo" href={`/products/${product.product_handle}`}><img src={product.thumbnail||'/images/placeholder.svg'} alt={product.product_title||''} width="78" height="100"/></LocalizedClientLink><div className="cart-item-details"><small>{(product as HttpTypes.StoreCartLineItem & {offer?:{seller?:{name?:string}}}).offer?.seller?.name}</small><LocalizedClientLink href={`/products/${product.product_handle}`}><h3 data-testid="cart-item-title">{product.product_title}</h3></LocalizedClientLink><DeliveryEstimate metadata={(product as HttpTypes.StoreCartLineItem & {offer?:{metadata?:Record<string,unknown>}}).offer?.metadata||product.metadata}/>{options.length>0&&<p className="cart-selection">{options.map(([key,value])=>`${key}: ${String(value)}`).join(' · ')}</p>}<div className="price"><strong data-testid="cart-item-price">{money(product.unit_price??0)}</strong></div>{!change_quantity&&<p>{tr('الكمية','Quantity')}: {product.quantity}</p>}</div><div className="cart-item-actions">{delete_item&&<DeleteCartItemButton id={product.id}/ >}{change_quantity&&<UpdateCartItemButton quantity={product.quantity} lineItemId={product.id}/>}</div></article>;
 })}</div>;
};
