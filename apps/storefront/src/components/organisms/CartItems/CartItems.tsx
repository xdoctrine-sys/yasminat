'use client';
import type {HttpTypes} from '@medusajs/types';
import {CartItemsProducts} from '@/components/cells';
import {cartSellerGroups} from '@/lib/helpers/cart-seller-groups';
import {convertToLocale} from '@/lib/helpers/money';
import {useYasminat} from '@/components/yasminat/Provider';
import {YasIcon} from '@/components/yasminat/Icon';
import {EmptyCart} from './EmptyCart';
export const CartItems=({cart}:{cart:HttpTypes.StoreCart|null})=>{
 const {tr}=useYasminat();
 if(!cart)return null;
 const groups=cartSellerGroups(cart.items||[]);
 if(!groups.length)return <EmptyCart/>;
 const money=(amount:number)=>cart.currency_code.toLowerCase()==='qar'?`${amount.toLocaleString('en-US',{maximumFractionDigits:2})} ${tr('ر.ق','QAR')}`:convertToLocale({amount,currency_code:cart.currency_code});
 return <div className="seller-cart-groups">{groups.map(group=><section key={group.id} className="seller-cart-group" data-testid={`cart-items-seller-${group.id}`}>
 <header className="seller-cart-heading"><div className="seller-cart-store"><YasIcon name="store"/><div><h3>{group.name||tr('ياسمينات','Yasminat')}</h3><small>{tr('توصيل مستقل من هذا المتجر','Separate delivery from this store')}</small></div></div><span className="seller-cart-count">{group.items.reduce((n,item)=>n+item.quantity,0)} {tr('منتجات','items')}</span></header>
 <div className="cart-lines"><CartItemsProducts products={group.items} currency_code={cart.currency_code}/></div>
 <footer className="seller-cart-totals"><div className="summary-row"><span>{tr('منتجات المتجر','Store items')}</span><strong>{money(group.subtotal)}</strong></div><p className="seller-cart-eta"><YasIcon name="truck"/>{tr('رسوم توصيل المتجر تتأكد في إتمام الطلب','Store delivery fees confirmed at checkout')}</p></footer>
 </section>)}</div>;
};
