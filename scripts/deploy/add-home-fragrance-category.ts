import type {ExecArgs} from '@medusajs/framework/types';
import {writeFileSync} from 'node:fs';

// Add exactly one empty real category. The default mode only reports a plan.
const HANDLE='home-fragrance-diffusers';
const AR='أجهزة تعطير المنزل',EN='Home Fragrance Diffusers';
const CHANGE='yasminat-home-fragrance-2026-11';
const normalize=(value:unknown)=>String(value||'').normalize('NFKC').toLowerCase().replace(/[\s\p{P}]+/gu,'');
export default async function fragrance({container}:ExecArgs){
 const query=container.resolve('query');
 const {data:categories}=await query.graph({entity:'product_category',fields:['id','handle','name','parent_category_id','rank','metadata','is_active','is_internal'],pagination:{take:10000,skip:0}});
 const parents=categories.filter(c=>c.handle==='yasminat-preview-decor'&&c.metadata?.yasminat_category==='decor');
 const candidates=categories.filter(c=>c.handle===HANDLE||c.metadata?.yasminat_category===HANDLE||normalize(c.name)===normalize(AR)||normalize(c.name)===normalize(EN)||normalize(c.metadata?.name_en)===normalize(EN));
 const related=categories.filter(c=>/fragrance|diffuser|تعطير|عطور/i.test(String(c.name)+' '+String(c.handle)+' '+String(c.metadata?.name_en)));
 const rank=Math.max(-1,...categories.filter(c=>c.parent_category_id===parents[0]?.id).map(c=>c.rank??-1))+1;
 const summary=(c:any)=>({id:c.id,handle:c.handle,name:c.name,parent_category_id:c.parent_category_id,rank:c.rank,name_en:c.metadata?.name_en});
 const counts:Record<string,number>={};
 for(const entity of ['product','product_category','seller','offer','order','customer']){
  const {data,metadata}=await query.graph({entity,fields:['id'],pagination:{take:1,skip:0}});counts[entity]=metadata?.count??data.length;
 }
 const plan={mode:process.env.YASMINAT_FRAGRANCE_APPLY==='1'?'apply':'dry-run',change:CHANGE,parents:parents.map(summary),existing:candidates.map(summary),related:related.map(summary),counts,create:candidates.length===0?{name:AR,handle:HANDLE,name_en:EN,parent_category_id:parents[0]?.id,rank,is_active:true,is_internal:false}:null};
 console.log('YASMINAT_FRAGRANCE_PLAN '+JSON.stringify(plan));
 if(parents.length!==1)throw Error('Exactly one existing Yasminat decor parent is required');
 if(candidates.length>1)throw Error('Multiple matching categories; refusing duplicates or automatic merging');
 if(candidates[0]&&candidates[0].parent_category_id!==parents[0].id)throw Error('Matching category belongs to another parent; no move or reassignment performed');
 if(plan.mode!=='apply')return;
 let category=candidates[0];let created=false;
 if(!category){
  const load=(name:string)=>require(require.resolve(name,{paths:[process.cwd()]}));
  const flows=load('@medusajs/medusa/core-flows');
  const {result}=await flows.createProductCategoriesWorkflow(container).run({input:{product_categories:[{name:AR,handle:HANDLE,description:'أجهزة تعطير المنزل ضمن ديكور البيت والحديقة. التشكيلة بتضاف لاحقًا.',parent_category_id:parents[0].id,rank,is_active:true,is_internal:false,metadata:{name_en:EN,description_en:'Home fragrance diffusers in Home & garden décor. Products will be added later.',yasminat_category:HANDLE,yasminat_catalogue_change:CHANGE}}]}});
  category=result[0];created=true;
 }
 const receipt={change:CHANGE,created,category:summary(category),parent:summary(parents[0]),products_created:0,offers_created:0,unrelated_records_changed:0,verified_at:new Date().toISOString()};
 writeFileSync('/tmp/'+CHANGE+'-receipt.json',JSON.stringify(receipt,null,2));
 console.log('YASMINAT_FRAGRANCE_RESULT '+JSON.stringify(receipt));
}
