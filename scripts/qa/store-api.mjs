// Local-only in-memory contract fixture. Never connect this to a production service.
import http from 'node:http';
import fs from 'node:fs';
const readDesign=name=>JSON.parse(fs.readFileSync(new URL('../../apps/storefront/src/components/yasminat/approved/'+name+'.json',import.meta.url),'utf8'));
const references=readDesign('products');
const asset=path=>'/yasminat/'+path.replace(/^assets\//,'');
if(process.env.YASMINAT_QA_FIXTURE!=='1')throw Error('Set YASMINAT_QA_FIXTURE=1 for the isolated local QA fixture');
const price=(amount,original=amount)=>({calculated_amount:amount,calculated_amount_with_tax:amount,calculated_amount_without_tax:amount,original_amount:original,currency_code:'qar',calculated_price:{price_list_type:'sale'}});
const categories=readDesign('categories').map((c,i)=>({id:'pcat_qa_'+c.id,name:c.name.ar,handle:c.id,description:'نباتات ومستلزمات مناسبة لهذا القسم.',parent_category_id:null,category_children:[],rank:i,metadata:{yasminat_category:c.id,name_en:c.name.en,thumbnail:asset(references.find(p=>p.id===c.visual).image)}}));
const sellers=readDesign('nurseries').map(c=>({id:'seller_qa_'+c.id,handle:'qa-'+c.id,name:c.name.ar,description:c.tag.ar,created_at:'2026-01-01T00:00:00Z',store_status:'ACTIVE',logo:asset(references.find(p=>p.id===c.image).image)}));
const products=references.map((p,i)=>({id:'prod_qa_'+p.id,handle:p.id==='rose'?'monstera':p.id,title:p.name.ar,description:p.description.ar,thumbnail:asset(p.image),images:[{id:'img_'+i,url:asset(p.image)}],options:[],variants:[{id:'variant_qa_'+p.id,title:'Default',options:[],calculated_price:price(p.price,p.old||p.price),inventory_quantity:10,manage_inventory:true}],categories:categories.filter(c=>c.handle===p.category||p.tags.includes(c.handle)||c.handle==='plants'&&['indoor','outdoor','ornamental','artificial','flowering'].includes(p.category)||c.handle==='care'&&p.category==='nutrition'),created_at:'2026-01-01T00:00:00Z',metadata:{yasminat_preview_batch:'local-contract-only',yasminat_product:p.id,name_en:p.name.en,description_en:p.description.en}}));
const sizes=['صغير','متوسط','كبير'],colors=['أبيض','رملي','فحمي'];
products[0].options=[{id:'opt_size',title:'المقاس',values:sizes.map((value,i)=>({id:`size_${i}`,value}))},{id:'opt_color',title:'اللون',values:colors.map((value,i)=>({id:`color_${i}`,value}))}];
products[0].variants=sizes.flatMap((s,i)=>colors.map((c,j)=>({id:`variant_qa_monstera_${i}_${j}`,title:`${s} / ${c}`,options:[{id:`sv_${i}`,value:s,option:{title:'المقاس'}},{id:`cv_${j}`,value:c,option:{title:'اللون'}}],calculated_price:price(200,250),inventory_quantity:10,manage_inventory:true})));
const offers=products.flatMap((p,i)=>p.variants.map(v=>({id:`offer_${v.id}`,product_id:p.id,variant_id:v.id,product:p,seller_id:'seller_qa_'+references[i].shop,seller:sellers.find(s=>s.id==='seller_qa_'+references[i].shop),inventory_quantity:10,calculated_price:v.calculated_price,created_at:'2026-01-01T00:00:00Z'})));
const region={id:'reg_qa',name:'Qatar QA',currency_code:'qar',countries:[{iso_2:'qa',display_name:'Qatar',name:'QATAR'}]};
const carts=new Map();let requests=[];
const summarize=c=>{c.item_subtotal=c.items.reduce((s,i)=>s+i.subtotal,0);c.item_total=c.item_subtotal;c.subtotal=c.item_subtotal;c.total=c.item_subtotal+c.shipping_subtotal;c.tax_total=0;c.discount_subtotal=0;c.discount_total=0;return c;};
const read=async req=>{let s='';for await(const b of req)s+=b;return s?JSON.parse(s):{};};
const server=http.createServer(async(req,res)=>{
 const u=new URL(req.url,'http://127.0.0.1:9011'),path=u.pathname,method=req.method;
 res.setHeader('content-type','application/json');res.setHeader('access-control-allow-origin','http://localhost:3001');
 const send=(data,status=200)=>{res.statusCode=status;res.end(JSON.stringify(data));};
 if(method==='OPTIONS'){res.setHeader('access-control-allow-headers','content-type,x-publishable-api-key');res.setHeader('access-control-allow-methods','GET,POST,DELETE,OPTIONS');return send({});}
 try{
  const body=method==='POST'?await read(req):{};requests.push({method,path,body});
  if(path==='/qa/requests')return send({requests});
  if(path==='/store/regions')return send({regions:[region],count:1});
  if(path==='/store/regions/reg_qa')return send({region});
  if(path==='/store/product-categories'){const handle=u.searchParams.get('handle');return send({product_categories:handle?categories.filter(c=>c.handle===handle):categories,count:categories.length});}
  if(path==='/store/product-attributes')return send({product_attributes:[]});
  if(path==='/store/collections')return send({collections:[],count:0});
  if(path==='/store/products'){
   let data=products;const values=name=>[...u.searchParams.entries()].filter(([k])=>k===name||k.startsWith(name+'[')).map(([,v])=>v);
   const ids=values('id'),handles=values('handle'),cats=values('category_id'),q=u.searchParams.get('q');
   if(ids.length)data=data.filter(p=>ids.includes(p.id));if(handles.length)data=data.filter(p=>handles.includes(p.handle));if(cats.length)data=data.filter(p=>p.categories.some(c=>cats.includes(c.id)));if(q)data=data.filter(p=>p.title.includes(q)||p.handle.includes(q));
   const count=data.length;data=data.slice(Number(u.searchParams.get('offset')||0));return send({products:data.slice(0,Number(u.searchParams.get('limit')||24)),count});
  }
  if(path==='/store/sellers'){const handle=u.searchParams.get('handle');return send({sellers:handle?sellers.filter(s=>s.handle===handle):sellers,count:sellers.length});}
  if(path==='/store/offers'){let data=offers;for(const name of ['product_id','seller_id'])if(u.searchParams.has(name))data=data.filter(o=>o[name]===u.searchParams.get(name));return send({offers:data,count:data.length});}
  if(path==='/store/carts'&&method==='POST'){const cart=summarize({id:`cart_qa_${carts.size+1}`,region_id:region.id,region,currency_code:'qar',items:[],promotions:[],shipping_methods:[],shipping_subtotal:0,payment_collection:null,metadata:{}});carts.set(cart.id,cart);return send({cart});}
  const match=path.match(/^\/store\/carts\/([^/]+)(?:\/line-items(?:\/([^/]+))?)?$/);
  if(match){const cart=carts.get(match[1]);if(!cart)return send({message:'Unknown local QA cart'},404);if(path.includes('/line-items')){
    if(method==='POST'&&!match[2]){const offer=offers.find(o=>o.id===body.offer_id);if(!offer)return send({message:'Unknown offer'},404);const qty=Number(body.quantity);if(!Number.isInteger(qty)||qty<1||qty>offer.inventory_quantity)return send({message:'Inventory limit'},400);const variant=offer.product.variants.find(v=>v.id===offer.variant_id);cart.items.push({id:`item_${cart.items.length+1}`,product_id:offer.product_id,product:offer.product,product_handle:offer.product.handle,product_title:offer.product.title,thumbnail:offer.product.thumbnail,variant_id:offer.variant_id,variant,variant_option_values:Object.fromEntries(variant.options.map(v=>[v.option.title,v.value])),quantity:qty,unit_price:offer.calculated_price.calculated_amount,subtotal:qty*offer.calculated_price.calculated_amount,total:qty*offer.calculated_price.calculated_amount,tax_total:0,metadata:{offer_id:offer.id},offer});}
    if(match[2]){const item=cart.items.find(i=>i.id===match[2]);if(!item)return send({message:'Unknown item'},404);if(method==='DELETE')cart.items=cart.items.filter(i=>i.id!==match[2]);else{const qty=Number(body.quantity);if(!Number.isInteger(qty)||qty<1||qty>10)return send({message:'Inventory limit'},400);item.quantity=qty;item.subtotal=item.unit_price*qty;item.total=item.subtotal;}}
   }else if(method==='POST')Object.assign(cart,body);return send({cart:summarize(cart),parent:cart});}
  if(path==='/store/shipping-options')return send({shipping_options:[]});
  if(path==='/store/payment-providers')return send({payment_providers:[]});
  if(path.startsWith('/auth/')||path.startsWith('/store/customers'))return send({message:'Invalid test credentials'},401);
  return send({message:`Unsupported QA route: ${path}`},404);
 }catch(e){return send({message:e.message},500);}
});
server.listen(9011,'127.0.0.1',()=>process.stdout.write('Isolated Yasminat QA API ready on loopback port 9011\n'));
