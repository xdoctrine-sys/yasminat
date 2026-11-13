import {expect,test} from 'bun:test';
import {categoryName,flattenCategoryTree,visibleCategoryTree} from '../../apps/storefront/src/lib/helpers/category-tree';

test('keeps real descendants of the 13 preview roots without exposing legacy categories',()=>{
 const legacy=Array.from({length:237},(_,i)=>({id:`legacy-${i}`,rank:i}));
 const preview=Array.from({length:13},(_,i)=>({id:`preview-${i}`,rank:i,metadata:{yasminat_preview_batch:'review'}}));
 const child={id:'fragrance',parent_category_id:'preview-2',rank:0};
 const input=[...legacy,...preview,child];
 const before=JSON.stringify(input);
 const roots=visibleCategoryTree(input);
 expect(roots).toHaveLength(13);
 expect(roots[2].category_children?.map(c=>c.id)).toEqual(['fragrance']);
 const flat=flattenCategoryTree(roots);
 expect(flat).toHaveLength(14);
 expect(flat.slice(2,5).map(c=>c.id)).toEqual(['preview-2','fragrance','preview-3']);
 expect(JSON.stringify(input)).toBe(before);
});

test('preserves normal category trees when no preview catalogue exists',()=>{
 const roots=visibleCategoryTree([{id:'last',rank:2},{id:'child',parent_category_id:'first',rank:0},{id:'first',rank:0}]);
 expect(roots.map(c=>c.id)).toEqual(['first','last']);
 expect(flattenCategoryTree(roots).map(c=>c.id)).toEqual(['first','child','last']);
});

test('uses category English metadata with the existing name as a fallback',()=>{
 const category={name:'أجهزة تعطير المنزل',metadata:{name_en:'Home Fragrance Diffusers'}};
 expect(categoryName(category,'ar')).toBe('أجهزة تعطير المنزل');
 expect(categoryName(category,'en')).toBe('Home Fragrance Diffusers');
 expect(categoryName({name:'Existing category'},'en')).toBe('Existing category');
});
