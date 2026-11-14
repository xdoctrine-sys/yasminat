import {expect,test} from 'bun:test';
import type {HttpTypes} from '@medusajs/types';
import {cartSellerGroups} from '../../apps/storefront/src/lib/helpers/cart-seller-groups';
const line=(id:string,sellerId:string,quantity=1,subtotal=20)=>({id,quantity,unit_price:25,subtotal,offer:{seller_id:sellerId,seller:{id:sellerId,name:'Same shop name'}}} as unknown as HttpTypes.StoreCartLineItem);
test('groups real seller IDs without merging same-name stores or changing line options',()=>{
 const first=line('one','a',2,40),second=line('two','b'),third=line('three','a');
 const groups=cartSellerGroups([first,second,third]);
 expect(groups.map(g=>g.id)).toEqual(['a','b']);
 expect(groups[0].items).toEqual([first,third]);
 expect(groups[0].items[0]).toBe(first);
 expect(groups[0].subtotal).toBe(60);
 expect(groups[1].subtotal).toBe(20);
});
test('missing seller expansion still uses seller ID; unknown data is never named as an unrelated store',()=>{
 const a={...line('one','a'),offer:{seller_id:'a'}} as unknown as HttpTypes.StoreCartLineItem;
 const b={...line('two','b'),offer:undefined} as unknown as HttpTypes.StoreCartLineItem;
 const groups=cartSellerGroups([a,b]);
 expect(groups.map(g=>g.id)).toEqual(['a','unassigned']);
 expect(groups[1].name).toBeUndefined();
 expect(cartSellerGroups([])).toEqual([]);
});
test('removing the last line removes that store; backend line subtotal takes priority',()=>{
 const lines=[line('one','a',3,50),line('two','b',1,0)];
 expect(cartSellerGroups(lines)[0].subtotal).toBe(50);
 expect(cartSellerGroups(lines)[1].subtotal).toBe(0);
 expect(cartSellerGroups(lines.filter(l=>l.id!=='two')).map(g=>g.id)).toEqual(['a']);
});
