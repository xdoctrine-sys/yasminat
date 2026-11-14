'use client';
import {useYasminat} from './Provider';
import {YasIcon} from './Icon';
export function DeliveryEstimate({metadata}:{metadata?:Record<string,unknown>|null}) {
 const {tr}=useYasminat();
 const ar=typeof metadata?.delivery_estimate_ar==='string'?metadata.delivery_estimate_ar:'';
 const en=typeof metadata?.delivery_estimate_en==='string'?metadata.delivery_estimate_en:'';
 return <p className="product-delivery-estimate"><YasIcon name="truck"/><span>{tr(ar||'موعد التوصيل يحدده المتجر',en||'Delivery estimate confirmed by the store')}</span></p>;
}
