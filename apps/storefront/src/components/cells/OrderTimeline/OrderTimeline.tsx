"use client"
import {useYasminat} from '@/components/yasminat/Provider';
import {YasIcon} from '@/components/yasminat/Icon';
type OrderStatus='received'|'preparing'|'shipped'|'delivered';
export const OrderTimeline=({currentStatus}:{currentStatus:OrderStatus})=>{
 const {tr}=useYasminat();const statuses:OrderStatus[]=['received','preparing','shipped','delivered'];const current=statuses.indexOf(currentStatus);const labels=[tr('تم الاستلام','Received'),tr('قيد التجهيز','Preparing'),tr('تم الشحن','Shipped'),tr('تم التوصيل','Delivered')];
 return <ol data-testid="order-timeline" aria-label={tr('حالة الطلب','Order progress')}>{statuses.map((s,i)=><li className="yas-order-stage" key={s} data-active={i<=current} aria-current={i===current?'step':undefined}><span>{i<=current?<YasIcon name="check"/>:i+1}</span>{labels[i]}</li>)}</ol>;
};
