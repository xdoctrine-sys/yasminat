"use client";
import {useYasminat} from '@/components/yasminat/Provider';
import {YasIcon} from '@/components/yasminat/Icon';
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';
import {CartEmpty,CartItems,CartSummary} from '@/components/organisms';
import {useCartContext} from '@/components/providers';
export const Cart=()=>{const {tr}=useYasminat();const {cart}=useCartContext();if(!cart?.items?.length)return <CartEmpty/>;return <><div className="cart-items"><p className="seller-cart-note">{tr('كل متجر يجهز ويوصل منتجاته بشكل مستقل.','Each store prepares and delivers its items separately.')}</p><CartItems cart={cart}/></div><aside className="summary-card"><CartSummary deliveryPending={!cart.shipping_methods?.length} item_total={cart.item_subtotal||0} shipping_total={cart.shipping_subtotal||0} total={cart.total||0} currency_code={cart.currency_code||''} tax={cart.tax_total||0} discount_total={cart.discount_total||0}/><LocalizedClientLink href="/checkout?step=address" className="primary wide">{tr('المتابعة لإتمام الطلب','Continue to checkout')}<YasIcon name="arrow" className="sm"/></LocalizedClientLink><LocalizedClientLink href="/categories" className="text-link" style={{justifyContent:'center',display:'flex',marginTop:17}}>{tr('مواصلة التسوق','Keep exploring')}</LocalizedClientLink></aside></>;};
