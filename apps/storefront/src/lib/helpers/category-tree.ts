type CategoryRecord={id:string;parent_category_id?:string|null;rank?:number|null;metadata?:Record<string,unknown>|null;category_children?:CategoryRecord[]};

/** Keep the visible Yasminat roots and their real descendants; retain legacy data. */
export function visibleCategoryTree<T extends CategoryRecord>(categories:T[]):T[]{
 const preview=categories.filter(c=>c.metadata?.yasminat_preview_batch);
 const visible=new Set(preview.map(c=>c.id));
 if(preview.length){
  let changed=true;
  while(changed){changed=false;for(const c of categories)if(c.parent_category_id&&visible.has(c.parent_category_id)&&!visible.has(c.id)){visible.add(c.id);changed=true;}}
 }
 const included=preview.length?categories.filter(c=>visible.has(c.id)):categories;
 const nodes=new Map(included.map(c=>[c.id,{...c,category_children:[]} as T]));
 const roots:T[]=[];
 for(const node of nodes.values()){
  const parent=node.parent_category_id?nodes.get(node.parent_category_id):undefined;
  if(parent)(parent.category_children as T[]).push(node);else roots.push(node);
 }
 const sort=(items:T[])=>{items.sort((a,b)=>(a.rank??9999)-(b.rank??9999));for(const item of items)sort((item.category_children||[]) as T[]);};
 sort(roots);return roots;
}

/** Parent-first order keeps a child next to its branch in shared selectors. */
export function flattenCategoryTree<T extends {id:string;category_children?:T[]}>(categories:T[]):T[]{
 const seen=new Set<string>(),result:T[]=[];
 const visit=(items:T[])=>{for(const item of items)if(!seen.has(item.id)){seen.add(item.id);result.push(item);visit(item.category_children||[]);}};
 visit(categories);return result;
}

export function categoryName(category:{name:string;metadata?:Record<string,unknown>|null},language:'ar'|'en'){
 return language==='en'&&typeof category.metadata?.name_en==='string'?category.metadata.name_en:category.name;
}
