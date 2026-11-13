import type {ExecArgs} from '@medusajs/framework/types';
import {writeFileSync,existsSync,mkdirSync,copyFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
// Idempotent, additive, preview-only seed. Default is read-only dry run.
// No auth identities, passwords, invitations, payment settings or existing records are changed.
const BATCH='yasminat-preview-2026-11';
const ASSETS='https://backend-production-43e77.up.railway.app/static/'+BATCH+'/';
const products = [
  {
    "id": "rose",
    "name": {
      "ar": "مونستيرا داخلية",
      "en": "Indoor monstera"
    },
    "category": "indoor",
    "price": 200,
    "old": 250,
    "shop": "bloom",
    "image": "assets/first-design/product-plant.jpg",
    "tags": [
      "ornamental"
    ],
    "description": {
      "ar": "نبتة داخلية بأوراق خضراء كبيرة في حوض أبيض. المقاس المعروض للتوضيح ضمن النموذج.",
      "en": "A leafy indoor plant in a white pot. Size and contents are illustrative in this prototype."
    }
  },
  {
    "id": "plant",
    "name": {
      "ar": "نبتة زينة للبيت",
      "en": "Indoor foliage plant"
    },
    "category": "indoor",
    "price": 185,
    "old": null,
    "shop": "garden",
    "image": "assets/first-design/category-plants.jpg",
    "tags": [
      "ornamental"
    ],
    "description": {
      "ar": "نبتة زينة خضراء تضيف لمسة طبيعية لركن البيت. الصورة من مواد التصميم الأصلي.",
      "en": "A green foliage plant for a favourite corner at home. Image retained from the original design."
    }
  },
  {
    "id": "gift",
    "name": {
      "ar": "حوض نباتات سيراميك",
      "en": "Ceramic plant pot"
    },
    "category": "pots",
    "price": 75,
    "old": 100,
    "shop": "gifting",
    "image": "assets/garden/pot.svg",
    "illustration": true,
    "tags": [
      "decor",
      "supplies"
    ],
    "description": {
      "ar": "حوض بلون طبيعي لتنسيق النباتات. رسم توضيحي بدل صورة منتج غير متاحة.",
      "en": "A neutral ceramic planter. Shown as an illustration because an original product photo is unavailable."
    }
  },
  {
    "id": "vase",
    "name": {
      "ar": "مزهرية سيراميك",
      "en": "Ceramic vase"
    },
    "category": "vases",
    "price": 135,
    "old": 180,
    "shop": "gifting",
    "image": "assets/first-design/product-vase.jpg",
    "tags": [
      "decor"
    ],
    "description": {
      "ar": "مزهرية سيراميك بلون عاجي لتنسيق النباتات والزهور في البيت.",
      "en": "An ivory ceramic vase for botanical arrangements at home."
    }
  },
  {
    "id": "lamp",
    "name": {
      "ar": "إضاءة ممرات الحديقة",
      "en": "Garden path light"
    },
    "category": "lighting",
    "price": 175,
    "old": 220,
    "shop": "garden",
    "image": "assets/garden/light.svg",
    "illustration": true,
    "tags": [
      "decor"
    ],
    "description": {
      "ar": "إضاءة لتوضيح تنسيق ممرات الحديقة. المواصفات والرسم هنا تجريبية.",
      "en": "Illustrative garden path lighting. Technical specifications are not final."
    }
  },
  {
    "id": "hamper",
    "name": {
      "ar": "نبات صناعي للزينة",
      "en": "Artificial foliage plant"
    },
    "category": "artificial",
    "price": 149,
    "old": null,
    "shop": "gifting",
    "image": "assets/garden/artificial.svg",
    "illustration": true,
    "tags": [
      "ornamental"
    ],
    "description": {
      "ar": "نبات صناعي للتزيين، معروض برسم توضيحي لحين توفير صورة مناسبة.",
      "en": "An artificial decorative plant shown as an illustration until a suitable photo is available."
    }
  },
  {
    "id": "blooming",
    "name": {
      "ar": "نبتة مزهرة في حوض",
      "en": "Flowering potted plant"
    },
    "category": "flowering",
    "price": 120,
    "old": 150,
    "shop": "bloom",
    "image": "assets/garden/flowering.svg",
    "illustration": true,
    "tags": [
      "ornamental",
      "outdoor"
    ],
    "description": {
      "ar": "مثال تجريبي لنبتة مزهرة في حوض، ضمن تشكيلة النباتات والحدائق.",
      "en": "An illustrative flowering potted plant from the garden collection."
    }
  },
  {
    "id": "outdoor",
    "name": {
      "ar": "نبتة خارجية للحديقة",
      "en": "Outdoor garden plant"
    },
    "category": "outdoor",
    "price": 210,
    "old": null,
    "shop": "garden",
    "image": "assets/garden/outdoor.svg",
    "illustration": true,
    "tags": [
      "ornamental"
    ],
    "description": {
      "ar": "مثال تجريبي لنباتات الحديقة الخارجية. الصورة رسم توضيحي وليست صورة مخزون فعلي.",
      "en": "An outdoor garden plant example, illustrated rather than photographed from real inventory."
    }
  },
  {
    "id": "nutrition",
    "name": {
      "ar": "مغذّي للنباتات",
      "en": "Plant nutrient feed"
    },
    "category": "nutrition",
    "price": 55,
    "old": 65,
    "shop": "bloom",
    "image": "assets/garden/nutrition.svg",
    "illustration": true,
    "tags": [
      "supplies"
    ],
    "description": {
      "ar": "مثال توضيحي لمغذيات النباتات. العبوة والسعر للمعاينة؛ النوع وطريقة الاستخدام يحددهما المنتج الفعلي عند ربط الكتالوج.",
      "en": "Illustrative plant nutrition, not a human supplement. Packaging and price are for the preview; the real product will specify its use."
    }
  },
  {
    "id": "fertilizer",
    "name": {
      "ar": "سماد حبيبي للنباتات",
      "en": "Granular plant fertilizer"
    },
    "category": "nutrition",
    "price": 65,
    "old": null,
    "shop": "bloom",
    "image": "assets/garden/fertilizer.svg",
    "illustration": true,
    "tags": [
      "supplies"
    ],
    "description": {
      "ar": "كيس سماد للنباتات برسم توضيحي، ضمن مستلزمات العناية. مثال محلي دون علامة تجارية أو مواصفات أو جرعات معتمدة.",
      "en": "An illustrated bag of plant fertilizer from the care collection. A local example without a brand or final specifications."
    }
  },
  {
    "id": "care-kit",
    "name": {
      "ar": "مجموعة أدوات العناية بالنبات",
      "en": "Plant care tools"
    },
    "category": "care",
    "price": 95,
    "old": null,
    "shop": "garden",
    "image": "assets/garden/care.svg",
    "illustration": true,
    "tags": [
      "supplies"
    ],
    "description": {
      "ar": "أدوات للري والعناية بالنباتات، معروضة برسم توضيحي. المحتويات والسعر أمثلة للمعاينة.",
      "en": "Illustrative watering and plant care tools. Contents and price are demonstration examples."
    }
  },
  {
    "id": "garden-decor",
    "name": {
      "ar": "فانوس ديكور للحديقة",
      "en": "Decorative garden lantern"
    },
    "category": "decor",
    "price": 160,
    "old": null,
    "shop": "gifting",
    "image": "assets/garden/decor.svg",
    "illustration": true,
    "tags": [],
    "description": {
      "ar": "قطعة ديكور لتنسيق الحديقة أو ركن البيت. رسم توضيحي لفانوس زخرفي، دون ادعاء وجود إضاءة كهربائية أو شمعة ضمنه.",
      "en": "An illustrated decorative lantern for a garden or home corner. No powered light or candle is implied."
    }
  },
  {
    "id": "string-lights",
    "name": {
      "ar": "سلسلة إضاءة للحديقة",
      "en": "Garden string lights"
    },
    "category": "lighting",
    "price": 145,
    "old": null,
    "shop": "garden",
    "image": "assets/garden/string-lights.svg",
    "illustration": true,
    "tags": [
      "decor"
    ],
    "description": {
      "ar": "مثال لإضاءة تنسيق الجلسات والحدائق. الرسم والسعر تجريبيان؛ مواصفات الكهرباء والتحمل تؤكد مع المنتج الفعلي.",
      "en": "Illustrative string lighting for garden seating. Electrical and weather specifications are not final."
    }
  }
];
const categories = [
  {
    "id": "plants",
    "name": {
      "ar": "النباتات",
      "en": "Plants"
    },
    "icon": "leaf",
    "visual": "rose"
  },
  {
    "id": "lighting",
    "name": {
      "ar": "أضواء الحدائق",
      "en": "Garden lighting"
    },
    "icon": "light",
    "visual": "lamp"
  },
  {
    "id": "decor",
    "name": {
      "ar": "ديكور البيت والحديقة",
      "en": "Home & garden décor"
    },
    "icon": "leaf",
    "visual": "garden-decor"
  },
  {
    "id": "pots",
    "name": {
      "ar": "الأحواض والأصص",
      "en": "Pots & planters"
    },
    "icon": "leaf",
    "visual": "gift"
  },
  {
    "id": "nutrition",
    "name": {
      "ar": "مغذيات وأسمدة النباتات",
      "en": "Plant nutrients & fertilizer"
    },
    "icon": "leaf",
    "visual": "nutrition"
  },
  {
    "id": "care",
    "name": {
      "ar": "العناية بالنبات",
      "en": "Plant care"
    },
    "icon": "leaf",
    "visual": "care-kit"
  },
  {
    "id": "artificial",
    "name": {
      "ar": "نباتات صناعية",
      "en": "Artificial plants"
    },
    "icon": "leaf",
    "visual": "hamper"
  },
  {
    "id": "indoor",
    "name": {
      "ar": "نباتات داخلية",
      "en": "Indoor plants"
    },
    "icon": "leaf",
    "visual": "rose"
  },
  {
    "id": "outdoor",
    "name": {
      "ar": "نباتات خارجية",
      "en": "Outdoor plants"
    },
    "icon": "leaf",
    "visual": "outdoor"
  },
  {
    "id": "ornamental",
    "name": {
      "ar": "نباتات زينة",
      "en": "Ornamental plants"
    },
    "icon": "leaf",
    "visual": "plant"
  },
  {
    "id": "flowering",
    "name": {
      "ar": "نباتات مزهرة",
      "en": "Flowering plants"
    },
    "icon": "flower",
    "visual": "blooming"
  },
  {
    "id": "vases",
    "name": {
      "ar": "المزهريات",
      "en": "Vases"
    },
    "icon": "leaf",
    "visual": "vase"
  },
  {
    "id": "supplies",
    "name": {
      "ar": "مستلزمات النباتات",
      "en": "Plant supplies"
    },
    "icon": "leaf",
    "visual": "care-kit"
  }
];
const shops = [
  {
    "id": "bloom",
    "name": {
      "ar": "مشتل روضة النبات",
      "en": "Rawdat Plants Nursery"
    },
    "tag": {
      "ar": "نباتات ومغذيات وأسمدة",
      "en": "Plants, nutrients and fertilizer"
    },
    "image": "rose",
    "icon": "leaf",
    "demoProducts": null
  },
  {
    "id": "garden",
    "name": {
      "ar": "مشتل الحديقة",
      "en": "The Garden Nursery"
    },
    "tag": {
      "ar": "نباتات ومستلزمات الحدائق",
      "en": "Plants and garden essentials"
    },
    "image": "plant",
    "icon": "leaf",
    "demoProducts": null
  },
  {
    "id": "gifting",
    "name": {
      "ar": "ركن الأحواض والنبات",
      "en": "Pots & Plants Corner"
    },
    "tag": {
      "ar": "أحواض ومزهريات وتفاصيل نباتية",
      "en": "Planters, vases and botanical details"
    },
    "image": "vase",
    "icon": "store",
    "demoProducts": null
  },
  {
    "id": "nursery-demo-4",
    "name": {
      "ar": "متجر إضاءة تجريبي",
      "en": "Demo lighting store"
    },
    "tag": {
      "ar": "مثال محلي للإضاءة، ليس متجرًا فعليًا",
      "en": "Local lighting example, not a real store"
    },
    "icon": "light",
    "image": "string-lights",
    "demoProducts": [
      "lamp",
      "string-lights"
    ]
  },
  {
    "id": "nursery-demo-5",
    "name": {
      "ar": "متجر ديكور تجريبي",
      "en": "Demo décor store"
    },
    "tag": {
      "ar": "مثال محلي للديكور والأحواض",
      "en": "Local décor and planter example"
    },
    "icon": "store",
    "image": "garden-decor",
    "demoProducts": [
      "garden-decor",
      "gift",
      "vase",
      "hamper"
    ]
  },
  {
    "id": "nursery-demo-6",
    "name": {
      "ar": "متجر عناية تجريبي",
      "en": "Demo plant care store"
    },
    "tag": {
      "ar": "مثال محلي لمغذيات النبات والعناية",
      "en": "Local plant nutrition and care example"
    },
    "icon": "leaf",
    "image": "nutrition",
    "demoProducts": [
      "nutrition",
      "fertilizer",
      "care-kit"
    ]
  }
];
const slides = [
  {
    "category": "plants",
    "image": "rose",
    "title": {
      "ar": "جمال البيت يبدأ بنبتة",
      "en": "A beautiful home begins with a plant"
    },
    "copy": {
      "ar": "نباتات داخلية وخارجية ومزهرة لركنك الأخضر.",
      "en": "Indoor, outdoor and flowering plants for your green corner."
    },
    "cta": {
      "ar": "تسوق النباتات",
      "en": "Shop plants"
    }
  },
  {
    "category": "decor",
    "image": "string-lights",
    "title": {
      "ar": "إضاءة ولمسات للحديقة",
      "en": "Light up your garden"
    },
    "copy": {
      "ar": "أضواء وقطع ديكور للجلسة والبيت والحديقة.",
      "en": "Lighting and decorative details for home and garden."
    },
    "cta": {
      "ar": "تسوق الإضاءة والديكور",
      "en": "Shop lighting & décor"
    }
  },
  {
    "category": "pots",
    "image": "gift",
    "title": {
      "ar": "أحواض تكمّل تنسيقك",
      "en": "Planters that complete your space"
    },
    "copy": {
      "ar": "أحواض وأصص تناسب نباتاتك ومساحتك.",
      "en": "Pots and planters for your plants and your space."
    },
    "cta": {
      "ar": "تسوق الأحواض",
      "en": "Shop planters"
    }
  },
  {
    "category": "artificial",
    "image": "hamper",
    "title": {
      "ar": "نباتات صناعية لركنك",
      "en": "Artificial greenery for your corner"
    },
    "copy": {
      "ar": "خيارات صناعية للبيت والمكتب من كتالوج المعاينة.",
      "en": "Artificial plants for home and office from the preview catalogue."
    },
    "cta": {
      "ar": "تسوق النباتات الصناعية",
      "en": "Shop artificial plants"
    }
  },
  {
    "category": "care",
    "image": "nutrition",
    "title": {
      "ar": "عناية ترافق كل نبتة",
      "en": "Care for every plant"
    },
    "copy": {
      "ar": "مغذيات وأسمدة وأدوات ري وعناية بالنبات.",
      "en": "Plant nutrients, fertilizer, watering and care tools."
    },
    "cta": {
      "ar": "تسوق العناية",
      "en": "Shop plant care"
    }
  }
];
export default async function seed({container}:ExecArgs){
 const query=container.resolve('query');
 const graph=async(entity:string,fields:string[],filters:Record<string,unknown>={})=>(await query.graph({entity,fields,filters,pagination:{take:1000,skip:0}})).data;
 const existingProducts=await graph('product',['id','handle','metadata'],{handle:products.map(p=>'yasminat-preview-'+p.id)});
 const existingCategories=await graph('product_category',['id','handle','metadata'],{handle:categories.map(c=>'yasminat-preview-'+c.id)});
 for(const record of [...existingProducts,...existingCategories])if(record.metadata?.yasminat_preview_batch!==BATCH)throw Error('Refusing to modify a handle owned by other data');
 const regions=await graph('region',['id','currency_code','countries.iso_2']);
 if(!regions.some(r=>r.currency_code==='qar'&&r.countries?.some(c=>c.iso_2==='qa')))throw Error('Existing Qatar/QAR region required; this seed will not change regions');
 const channels=await graph('sales_channel',['id','name']);
 const profiles=await graph('shipping_profile',['id','name']);
 if(channels.length!==1||profiles.length!==1)throw Error('Select the existing sales channel and shipping profile before applying this seed');
 const plan={batch:BATCH,mode:process.env.YASMINAT_PREVIEW_SEED_APPLY==='1'?'apply':'dry-run',categories:13,products:13,sellers:6,variants:21,offers:30,banners:5,stocked_quantity:0,manage_inventory:true,allow_backorder:false,existing_batch_products:existingProducts.length,existing_batch_categories:existingCategories.length};
 console.log('YASMINAT_SEED_PLAN '+JSON.stringify(plan));
 if(plan.mode!=='apply')return;
 // Use the existing persistent static volume and an isolated batch directory.
 const sourceRoot=resolve(process.cwd(),'../../apps/storefront/public/yasminat');
 const targetRoot='/app/packages/api/.medusa/server/static/'+BATCH;
 const files=[...new Set(products.map(p=>p.image.replace(/^assets\//,'')))];
 for(const file of files)if(!existsSync(resolve(sourceRoot,file)))throw Error('Deploy the approved assets before applying the seed');
 for(const file of files){const target=resolve(targetRoot,file);if(!target.startsWith(targetRoot+'/'))throw Error('Unsafe asset path');mkdirSync(dirname(target),{recursive:true});copyFileSync(resolve(sourceRoot,file),target);}
 const load=(name:string)=>require(require.resolve(name,{paths:[process.cwd()]}));
 const core=load('@mercurjs/core/workflows');
 const flows=load('@medusajs/medusa/core-flows');
 const {AttributeType,SellerStatus,MercurModules}=load('@mercurjs/types');
 const sellerModule=container.resolve(MercurModules.SELLER) as any;
 const manifest:any={batch:BATCH,categories:existingCategories.map(c=>c.id),products:existingProducts.map(p=>p.id),sellers:[],members:[],seller_members:[],stock_locations:[],attributes:[],offers:[],banners:[],created_at:new Date().toISOString()};
 const save=()=>writeFileSync('/tmp/'+BATCH+'-manifest.json',JSON.stringify(manifest,null,2));
 const missingCategories=categories.filter(c=>!existingCategories.some(e=>e.handle==='yasminat-preview-'+c.id));
 if(missingCategories.length){const {result}=await flows.createProductCategoriesWorkflow(container).run({input:{product_categories:missingCategories.map(c=>({name:c.name.ar,handle:'yasminat-preview-'+c.id,is_active:true,is_internal:false,rank:categories.indexOf(c),description:'نباتات ومستلزمات مناسبة لهذا القسم.',metadata:{yasminat_preview_batch:BATCH,yasminat_category:c.id,name_en:c.name.en,thumbnail:ASSETS+products.find(p=>p.id===c.visual)!.image.replace(/^assets\//,'')}}))}});existingCategories.push(...result);manifest.categories=existingCategories.map(c=>c.id);save();}
 const sellers=[];
 for(const shop of shops){
  const handle='yasminat-preview-'+shop.id;
  let seller=(await graph('seller',['id','handle','external_id'],{handle}))[0];
  if(seller&&seller.external_id!==BATCH+':'+shop.id)throw Error('Seller handle collision');
  if(!seller)seller=await sellerModule.createSellers({name:shop.name.ar,handle,email:shop.id+'@yasminat-preview.invalid',currency_code:'qar',status:SellerStatus.OPEN,external_id:BATCH+':'+shop.id,description:shop.tag.ar+' · متجر تجريبي للعرض فقط',logo:ASSETS+products.find(p=>p.id===shop.image)!.image.replace(/^assets\//,''),banner:ASSETS+products.find(p=>p.id===shop.image)!.image.replace(/^assets\//,''),metadata:{yasminat_preview_batch:BATCH,name_en:shop.name.en}});
  let member=(await sellerModule.listMembers({email:shop.id+'@yasminat-preview.invalid'}))[0];
  if(!member)member=await sellerModule.createMembers({email:shop.id+'@yasminat-preview.invalid',first_name:'Preview',is_active:false,metadata:{yasminat_preview_batch:BATCH}});
  if(member.metadata?.yasminat_preview_batch!==BATCH)throw Error('Member email collision');
  let membership=(await sellerModule.listSellerMembers({seller_id:seller.id,member_id:member.id}))[0];
  if(!membership)membership=await sellerModule.createSellerMembers({seller_id:seller.id,member_id:member.id,role_id:null,is_owner:false,metadata:{yasminat_preview_batch:BATCH}});
  manifest.seller_members.push(membership.id);
  let location=(await graph('stock_location',['id','name'],{name:BATCH+':'+shop.id}))[0];
  if(!location){const {result}=await core.createSellerStockLocationsWorkflow(container).run({input:{seller_id:seller.id,locations:[{name:BATCH+':'+shop.id,metadata:{yasminat_preview_batch:BATCH},address:{country_code:'qa',city:'Doha',address_1:'Preview only - no fulfillment'}}]}});location=result[0];await flows.linkSalesChannelsToStockLocationWorkflow(container).run({input:{id:location.id,add:[channels[0].id]}});}
  sellers.push({...seller,ref:shop.id,memberId:member.id,locationId:location.id});manifest.sellers.push(seller.id);manifest.members.push(member.id);manifest.stock_locations.push(location.id);save();
 }
 const axes=[{name:'المقاس',handle:'yasminat-preview-size',values:['صغير','متوسط','كبير']},{name:'اللون',handle:'yasminat-preview-color',values:['أبيض','رملي','فحمي']}];
 let attrs=await graph('product_attribute',['id','handle','values.id','values.name'],{handle:axes.map(a=>a.handle),product_id:null});
 const missing=axes.filter(a=>!attrs.some(e=>e.handle===a.handle));
 if(missing.length){await core.createProductAttributesWorkflow(container).run({input:{attributes:missing.map((a,rank)=>({name:a.name,handle:a.handle,type:AttributeType.MULTI_SELECT,is_variant_axis:true,is_filterable:true,rank,metadata:{yasminat_preview_batch:BATCH},values:a.values.map((name,rank)=>({name,rank}))}))}});attrs=await graph('product_attribute',['id','handle','values.id','values.name'],{handle:axes.map(a=>a.handle),product_id:null});}
 manifest.attributes=attrs.map(a=>a.id);save();
 for(const p of products){
  if(existingProducts.some(e=>e.handle==='yasminat-preview-'+p.id))continue;
  const sku='YAS-PREVIEW-'+p.id.toUpperCase();
  const seller=sellers.find(s=>s.ref===p.shop)!;
  const memberships=new Set([p.category,...p.tags]);
  if(['indoor','outdoor','ornamental','artificial','flowering'].includes(p.category))memberships.add('plants');
  if(p.category==='nutrition')memberships.add('care');
  const variants=p.id==='rose'?axes[0].values.flatMap((size,i)=>axes[1].values.map((color,j)=>({title:size+' / '+color,sku:sku+'-'+i+'-'+j,options:{'المقاس':size,'اللون':color},manage_inventory:false}))):[{title:'التنسيق المعروض',sku,manage_inventory:false}];
  const {result}=await core.createProductsWorkflow(container).run({input:{created_by:seller.memberId,products:[{title:p.name.ar,handle:'yasminat-preview-'+p.id,description:p.description.ar,status:'published',thumbnail:ASSETS+p.image.replace(/^assets\//,''),images:[{url:ASSETS+p.image.replace(/^assets\//,'')}],category_ids:existingCategories.filter(c=>memberships.has(c.metadata?.yasminat_category)).map(c=>c.id),sales_channels:[{id:channels[0].id}],metadata:{yasminat_preview_batch:BATCH,yasminat_product:p.id,name_en:p.name.en,description_en:p.description.en,preview_only:true,yasminat_old_price:p.old},attributes:p.id==='rose'?attrs.map(a=>({id:a.id,value_ids:a.values.map(v=>v.id)})):[],variants}]}});
  const added=Array.isArray(result)?result:result.products||[];manifest.products.push(...added.map(p=>p.id));save();
 }
 const catalog=await graph('product',['id','handle','metadata','variants.id','variants.sku'],{handle:products.map(p=>'yasminat-preview-'+p.id)});
 manifest.products=catalog.map(p=>p.id);save();
 for(const seller of sellers){
  const current=await graph('offer',['id','sku','variant_id','metadata'],{seller_id:seller.id});
  const offers=[];
  for(const p of products.filter(p=>shops.find(s=>s.id===seller.ref)?.demoProducts?.includes(p.id) || p.shop===seller.ref))for(const variant of catalog.find(c=>c.handle==='yasminat-preview-'+p.id)!.variants){
   const sku='OFFER-'+seller.ref.toUpperCase()+'-'+variant.sku;
   if(current.some(o=>o.variant_id===variant.id&&o.metadata?.yasminat_preview_batch===BATCH))continue;
   offers.push({seller_id:seller.id,created_by:seller.memberId,sku,variant_id:variant.id,shipping_profile_id:profiles[0].id,manage_inventory:true,allow_backorder:false,inventory_items:[{sku,stock_levels:[{location_id:seller.locationId,stocked_quantity:0}]}],prices:[{amount:p.price,currency_code:'qar'}],metadata:{yasminat_preview_batch:BATCH,preview_only:true,yasminat_old_price:p.old}});
  }
  if(offers.length)await core.createOffersWorkflow(container).run({input:{offers}});
  manifest.offers.push(...(await graph('offer',['id','metadata'],{seller_id:seller.id})).filter(o=>o.metadata?.yasminat_preview_batch===BATCH).map(o=>o.id));save();
 }
 const hero=container.resolve('heroBanner') as any;
 const existingBanners=await hero.listHeroBanners({}, {take:1000});
 const slots=['main','side_top','side_bottom'];
 for(let i=0;i<slides.length;i++){
  const id='hban_yasminat_preview_'+i,p=slides[i],product=products.find(c=>c.id===p.image)!;
  if(!existingBanners.some(b=>b.id===id))await hero.createHeroBanners({id,slot:slots[i%3],rank:-1000+i,is_active:true,title_ar:p.title.ar,title_en:p.title.en,subtitle_ar:p.copy.ar,subtitle_en:p.copy.en,cta_label_ar:p.cta.ar,cta_label_en:p.cta.en,cta_link:'/categories/yasminat-preview-'+p.category,image_desktop:ASSETS+product.image.replace(/^assets\//,''),image_mobile:ASSETS+product.image.replace(/^assets\//,''),image_alt_ar:p.title.ar,image_alt_en:p.title.en});
  manifest.banners.push(id);save();
 }
 const stock=await graph('offer',['id','manage_inventory','allow_backorder','inventory_item_link.inventory_item.location_levels.stocked_quantity'],{id:manifest.offers});
 for(const offer of stock){if(!offer.manage_inventory||offer.allow_backorder)throw Error('Preview offer has unsafe inventory settings');for(const link of offer.inventory_item_link||[])for(const level of link.inventory_item?.location_levels||[])if(Number(level.stocked_quantity)!==0)throw Error('Preview stock must remain zero');}
 console.log('YASMINAT_SEED_RESULT '+JSON.stringify({batch:BATCH,products:manifest.products.length,categories:manifest.categories.length,sellers:manifest.sellers.length,offers:manifest.offers.length,banners:manifest.banners.length,all_stock_zero:true,manifest:'/tmp/'+BATCH+'-manifest.json'}));
}
