export type CategoryPage<T>={product_categories:T[];count?:number};
/** Preserve the complete catalogue when preview categories follow older records. */
export async function collectCategoryPages<T extends {id:string}>(load:(offset:number)=>Promise<CategoryPage<T>>,limit:number,paginate=true){
 const first=await load(0);
 if(!paginate)return first.product_categories;
 const count=first.count??first.product_categories.length;
 const remaining=Math.max(0,Math.ceil(count/limit)-1);
 const pages=await Promise.all(Array.from({length:remaining},(_,i)=>load((i+1)*limit)));
 return [...new Map([first,...pages].flatMap(p=>p.product_categories).map(c=>[c.id,c])).values()];
}
