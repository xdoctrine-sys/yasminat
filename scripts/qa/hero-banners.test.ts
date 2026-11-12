import {describe,test,expect} from 'bun:test';
import {GET} from '../../packages/api/src/api/store/hero-banners/route';
const banner=(id:string,extra:Record<string,unknown>={})=>({id,slot:'main',image_desktop:'https://example.invalid/plant.jpg',cta_link:'/categories',...extra});
async function request(rows:unknown[]){
 const slots={main:banner('old-main'),side_top:null,side_bottom:null};
 let body:any,status=0;const response={set(){},status(code:number){status=code;return this;},json(value:unknown){body=value;}};
 const req={scope:{resolve(){return {listActiveForSlots:async()=>slots,listHeroBanners:async()=>rows};}}};
 await GET(req as never,response as never);return {body,status};
}
describe('Public hero carousel compatibility',()=>{
 test('preserves slots and selects the five active preview slides',async()=>{
  const rows=[banner('existing'),...Array.from({length:5},(_,i)=>banner('hban_yasminat_preview_'+i)),banner('hban_yasminat_preview_future',{starts_at:'2099-01-01'}),banner('hban_yasminat_preview_expired',{ends_at:'2000-01-01'})];
  const {body,status}=await request(rows);expect(status).toBe(200);expect(body.slots.main.id).toBe('old-main');expect(body.banners).toHaveLength(5);expect(body.banners.every((b:any)=>b.id.startsWith('hban_yasminat_preview_'))).toBe(true);
 });
 test('uses normal CMS banners when no preview batch exists and sanitizes links',async()=>{
  const {body}=await request([banner('normal',{cta_link:'javascript:alert(1)'})]);expect(body.banners).toHaveLength(1);expect(body.banners[0].cta_link).toBeNull();
 });
});
