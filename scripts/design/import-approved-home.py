"""One-time JSX port of the approved local design. No HTML runtime or DOM injection."""
from pathlib import Path
from html.parser import HTMLParser
import json,re,html,sys
root=Path(__file__).resolve().parents[2]
source=Path(sys.argv[1])
markup=json.loads((source/'source-ui.js').read_text().split(' = ',1)[1].strip().removesuffix(';'))
(root/'apps/storefront/src/components/yasminat/approved/home-template.html').write_text(markup)
void={'input','img','br','hr','source','track','meta','link','wbr'}
class Parser(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=True);self.root={'children':[]};self.stack=[self.root]
 def handle_starttag(self,tag,attrs):
  n={'tag':tag,'attrs':dict(attrs),'children':[]};self.stack[-1]['children'].append(n)
  if tag not in void:self.stack.append(n)
 def handle_startendtag(self,tag,attrs):self.handle_starttag(tag,attrs);self.handle_endtag(tag) if tag not in void else None
 def handle_endtag(self,tag):
  if len(self.stack)>1:self.stack.pop()
 def handle_data(self,data):self.stack[-1]['children'].append(data)
p=Parser();p.feed(markup)
slots={'FILTERS':'<ApprovedFilters {...props} />','PRODUCTS':'<ApprovedProducts {...props} />','CATEGORIES':'<ApprovedCategories {...props} />','DECOR_VIDEO':'<ApprovedVideo />','HERO_PROMOTIONS':'<ApprovedPromotions {...props} />','HOME_HEADER_ACTIONS':'<ApprovedNotifications />'}
routes={'#YAS-001':'/','#YAS-002':'/departments','#YAS-003':'/categories','#YAS-004':'/categories','#YAS-005':'/cart'}
english={'ياسمينات':'Yasminat','تسوق حسب القسم':'Shop by category','جميع الأقسام':'All categories','مختارات ياسمينات':'Yasminat selection','منتجات تستحق الاهتمام':'Products worth exploring','عرض الكل':'View all','لمسات تكمّل جمال بيتك':'Details that complete your home','اكتشف المجموعة':'Explore the collection','عالم النباتات والبيت الجميل والحدائق':'Plants, beautiful homes and gardens','نباتات ومستلزمات البيت والحديقة إلى جميع أنحاء قطر':'Plants and home & garden essentials across Qatar'}
attrs={'class':'className','for':'htmlFor','tabindex':'tabIndex','viewbox':'viewBox','stroke-width':'strokeWidth','stroke-linecap':'strokeLinecap','stroke-linejoin':'strokeLinejoin','fill-rule':'fillRule','clip-rule':'clipRule','preserveaspectratio':'preserveAspectRatio','xlink:href':'xlinkHref','readonly':'readOnly','maxlength':'maxLength','autocomplete':'autoComplete'}
def style(s):
 d={}
 for part in s.split(';'):
  if ':' not in part:continue
  k,v=part.split(':',1);k=k.strip();v=v.strip()
  if not k or not v:continue
  if k.startswith('-webkit-'):k='Webkit'+''.join(x.title() for x in k[8:].split('-'))
  elif not k.startswith('--'):k=re.sub(r'-([a-z])',lambda m:m[1].upper(),k)
  if k=='fontFamily':v='Cairo, sans-serif'
  d[k]=v
 return d

def render(n):
 if isinstance(n,str):
  bits=re.split(r'(\{\{[A-Z_]+\}\})',n);out=''
  for bit in bits:
   if bit.startswith('{{'):out+=slots[bit[2:-2]]
   elif bit.strip():
    t=bit.strip()
    if t=='تصميم تجريبي — YAS-001':continue
    out+='{tr('+json.dumps(t,ensure_ascii=False)+','+json.dumps(english.get(t,t),ensure_ascii=False)+')}'
  return out
 tag=n['tag'];a=n['attrs'];out=[]
 if tag=='a':tag='LocalizedClientLink'
 for k,v in a.items():
  if k.startswith('data-d-') or k in ['data-open-product','data-list-category']:continue
  if k=='id' and v=='global-search':continue
  if k=='dir':out.append('dir={language === "ar" ? "rtl" : "ltr"}');continue
  if k=='style':out.append('style={'+json.dumps(style(v),ensure_ascii=False)+'}');continue
  if k=='href':v=routes.get(v,v)
  if k in ['src','href'] and v and v.startswith('assets/'):v='/yasminat/'+v[7:]
  if k=='placeholder':out.append('placeholder={tr("ابحث عن نباتات وأحواض ومستلزماتها","Search plants, pots and essentials")}');continue
  if k=='aria-label' and v=='البحث في ياسمينات':out.append('aria-label={tr("البحث في ياسمينات","Search Yasminat")}');continue
  out.append(attrs.get(k,k)+'='+json.dumps(v if v is not None else '',ensure_ascii=False))
 if n['tag']=='form':out.append('onSubmit={onSearch}')
 return '<'+tag+' '+ ' '.join(out)+('/>' if n['tag'] in void else '>'+''.join(render(c) for c in n['children'])+'</'+tag+'>')
jsx=''.join(render(c) for c in p.root['children'])
code='''"use client";
// Generated from the exact approved source template; handlers are native React.
import {useRouter,useParams} from 'next/navigation';
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';
import {useYasminat} from '../Provider';
import {ApprovedFilters,ApprovedProducts,ApprovedCategories,ApprovedVideo,ApprovedPromotions,ApprovedNotifications,type ApprovedHomeProps} from './Parts';
export function ApprovedHome(props:ApprovedHomeProps){
 const {tr,language}=useYasminat();const router=useRouter(),params=useParams();
 const onSearch=(event:React.FormEvent<HTMLFormElement>)=>{event.preventDefault();const value=new FormData(event.currentTarget).get('search')?.toString().trim();router.push(`/${params.locale}/categories${value?`?query=${encodeURIComponent(value)}`:''}`);};
 return '''+jsx+''';
}
'''
(root/'apps/storefront/src/components/yasminat/approved/Home.tsx').write_text(code)
for name in ['styles.css','board.css']:(root/'apps/storefront/src/components/yasminat/approved'/name).write_text((source/name).read_text())
print('Ported approved home markup to React JSX')
