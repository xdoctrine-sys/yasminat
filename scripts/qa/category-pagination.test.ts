import {expect,test} from 'bun:test';
import {collectCategoryPages} from '../../apps/storefront/src/lib/helpers/category-pages';

test('includes all 13 preview categories after 237 legacy categories',async()=>{
 const catalogue=Array.from({length:250},(_,i)=>({id:`category-${i}`,preview:i>=237}));
 const offsets:number[]=[];
 const all=await collectCategoryPages(async offset=>{offsets.push(offset);return{product_categories:catalogue.slice(offset,offset+100),count:catalogue.length};},100);
 expect(all).toHaveLength(250);expect(all.filter(c=>c.preview)).toHaveLength(13);expect(offsets.sort((a,b)=>a-b)).toEqual([0,100,200]);
});
test('honours an explicitly bounded category query',async()=>{
 const offsets:number[]=[];
 const result=await collectCategoryPages(async offset=>{offsets.push(offset);return{product_categories:[{id:'only'}],count:250};},1,false);
 expect(result).toEqual([{id:'only'}]);expect(offsets).toEqual([0]);
});
test('does not silently accept an incomplete catalogue when a later page fails',async()=>{
 await expect(collectCategoryPages(async offset=>{if(offset)throw Error('unavailable');return{product_categories:[{id:'first'}],count:2};},1)).rejects.toThrow('unavailable');
});
