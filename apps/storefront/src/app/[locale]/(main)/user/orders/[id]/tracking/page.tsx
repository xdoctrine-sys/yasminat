import {redirect,notFound} from 'next/navigation';
import {retrieveCustomer} from '@/lib/data/customer';
import {retrieveOrderGroup} from '@/lib/data/orders';
import {OrderParcels} from '@/components/organisms/OrderParcels/OrderParcels';
import {ApprovedOrderLinks} from '@/components/yasminat/approved/Orders';
export const metadata={title:'متابعة الطلب | Track order',robots:{index:false,follow:false}};
export default async function OrderTrackingPage({params}:{params:Promise<{locale:string;id:string}>}){
 const {locale,id}=await params;
 const customer=await retrieveCustomer();
 if(!customer)redirect(`/${locale}/login`);
 const group=await retrieveOrderGroup(id) as {orders?:unknown[]}|undefined;
 if(!group?.orders)notFound();
 // Use the same authenticated, server-provided fulfillment status as order details.
 return <main className="screen-content container order-page"><OrderParcels orders={group.orders}/><ApprovedOrderLinks id={id} tracking/></main>;
}
