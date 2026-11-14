import type {HttpTypes} from '@medusajs/types';
type SellerLine=HttpTypes.StoreCartLineItem & {offer?:{seller_id?:string;seller?:{id:string;name?:string;handle?:string}}};
export function cartSellerGroups(items:HttpTypes.StoreCartLineItem[]) {
 const groups=new Map<string,{id:string;name?:string;handle?:string;items:HttpTypes.StoreCartLineItem[];subtotal:number}>();
 for(const line of items as SellerLine[]) {
  const seller=line.offer?.seller;
  const id=seller?.id||line.offer?.seller_id||(typeof line.metadata?.seller_id==='string'?line.metadata.seller_id:'unassigned');
  let group=groups.get(id);
  if(!group){group={id,name:seller?.name,handle:seller?.handle,items:[],subtotal:0};groups.set(id,group);}
  group.items.push(line);group.subtotal+=line.subtotal??line.unit_price*line.quantity;
 }
 return [...groups.values()];
}
