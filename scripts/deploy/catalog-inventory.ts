import type {ExecArgs} from '@medusajs/framework/types';
export default async function inventory({container}:ExecArgs){
 const query=container.resolve('query');
 const result:Record<string,unknown>={};
 for(const entity of ['product','product_category','seller','offer','order','customer']){
  const {data,metadata}=await query.graph({entity,fields:['id'],pagination:{take:1,skip:0}});
  result[entity]={count:metadata?.count??data.length};
 }
 for(const [entity,fields] of Object.entries({region:['id','name','currency_code','countries.iso_2'],sales_channel:['id','name'],shipping_profile:['id','name'],stock_location:['id','name'],seller:['id','handle','name','status']})){
  const {data}=await query.graph({entity,fields,pagination:{take:100,skip:0}});result[entity+'_setup']=data;
 }
 console.log('YASMINAT_INVENTORY '+JSON.stringify(result));
}
