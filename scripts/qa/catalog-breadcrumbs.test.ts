import {expect,test} from 'bun:test';
import {breadcrumbJson,breadcrumbJsonLd,categoryTrail,homeCrumb,productsCrumb} from '../../apps/storefront/src/lib/helpers/catalog-breadcrumbs';

const parent={id:'decor',name:'ديكور',handle:'decor',metadata:{name_en:'Decor'}};
const child={id:'diffusers',name:'أجهزة تعطير المنزل',handle:'home-fragrance-diffusers',parent_category_id:parent.id,metadata:{name_en:'Home Fragrance Diffusers'}};

test('nested categories use real ancestors and the canonical locale URL in order',()=>{
 const items=[homeCrumb,...categoryTrail(child,[child,parent])];
 const data=breadcrumbJsonLd(items,'https://yasminat.com/','qa','ar');
 expect(data.itemListElement.map(i=>i.name)).toEqual(['الرئيسية','ديكور','أجهزة تعطير المنزل']);
 expect(data.itemListElement.map(i=>i.position)).toEqual([1,2,3]);
 expect(data.itemListElement.map(i=>i.item)).toEqual(['https://yasminat.com/qa','https://yasminat.com/qa/categories/decor','https://yasminat.com/qa/categories/home-fragrance-diffusers']);
});

test('all-products and uncategorised product trails still have at least two entries',()=>{
 expect(breadcrumbJsonLd([homeCrumb,productsCrumb],'https://yasminat.com','qa','en').itemListElement.map(i=>i.name)).toEqual(['Home','Products']);
 const product={name:'منتج',path:'/products/example'};
 expect(breadcrumbJsonLd([homeCrumb,product],'https://yasminat.com','qa','ar').itemListElement).toHaveLength(2);
});

test('the same trail supports English labels, missing translation, and partial category records',()=>{
 const partial={...child,metadata:null};
 const items=[homeCrumb,...categoryTrail(partial,[child,parent]),{name:'عنوان المنتج',path:'/products/example'}];
 expect(breadcrumbJsonLd(items,'https://yasminat.com','qa','en').itemListElement.map(i=>i.name)).toEqual(['Home','Decor','Home Fragrance Diffusers','عنوان المنتج']);
});

test('bad hierarchy links cannot loop forever or invent missing parents',()=>{
 expect(categoryTrail({...child,parent_category_id:'missing'},[parent]).map(i=>i.path)).toEqual(['/categories/home-fragrance-diffusers']);
 const cyclicParent={...parent,parent_category_id:child.id};
 expect(categoryTrail(child,[child,cyclicParent])).toHaveLength(2);
});

test('catalogue text cannot terminate the server-rendered JSON-LD script',()=>{
 const items=[homeCrumb,{name:'</script><img src=x onerror=alert(1)>',path:'/products/example'}];
 const serialized=breadcrumbJson(items,'https://yasminat.com','qa','ar');
 expect(serialized).not.toContain('<');
 expect(JSON.parse(serialized).itemListElement[1].name).toBe(items[1].name);
});
