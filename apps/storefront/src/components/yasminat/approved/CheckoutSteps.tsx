'use client';
import {useSearchParams} from 'next/navigation';
import {useYasminat} from '../Provider';

export function ApprovedCheckoutSteps(){
 const {tr}=useYasminat();
 const review=useSearchParams().get('step')==='review';
 const deliveryLabel=<>01 {tr('بيانات التوصيل','Delivery')}</>;
 const reviewLabel=<>02 {tr('المراجعة والتأكيد','Review & confirm')}</>;
 return <nav className="checkout-steps" aria-label={tr('مراحل إتمام الطلب','Checkout progress')}>
  {review?<span>{deliveryLabel}</span>:<b aria-current="step">{deliveryLabel}</b>}
  <i aria-hidden="true"/>
  {review?<b aria-current="step">{reviewLabel}</b>:<span>{reviewLabel}</span>}
 </nav>;
}
