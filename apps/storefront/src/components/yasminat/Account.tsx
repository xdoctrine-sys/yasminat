"use client";
import {useState} from 'react';
import {useYasminat} from './Provider';
import {useCartContext} from '@/components/providers';
import {YasIcon,type IconName} from './Icon';
import {ApprovedIntro} from './approved/Intro';
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';
export function ApprovedAccount({name}:{name?:string}){const {tr,favorites}=useYasminat();const {cart}=useCartContext();const [displayName,setDisplayName]=useState(''),[saved,setSaved]=useState('');return <main className="screen-content container">
<ApprovedIntro type="account"/>{!name&&<div className="account-access">
<LocalizedClientLink className="primary" href="/login">{tr('تسجيل الدخول','Sign in')}</LocalizedClientLink>
<LocalizedClientLink className="secondary" href="/register">{tr('إنشاء حساب جديد','Create account')}</LocalizedClientLink>
</div>}<div className="profile-identity">
<div className="profile-avatar">
<YasIcon name="user"/>
</div>
<h3>{name||saved||tr('زائر ياسمينات','Yasminat guest')}</h3>
<span>{name?tr('حسابي','My account'):tr('معاينة حساب','Account preview')}</span>
</div>
<div className="profile-shortcuts">
<LocalizedClientLink href="/cart">
<YasIcon name="bag"/>
<strong>{cart?.items?.reduce((n,p)=>n+p.quantity,0)||0}</strong>
<span>{tr('في السلة','In your bag')}</span>
</LocalizedClientLink>
<LocalizedClientLink href="/favorites">
<YasIcon name="heart"/>
<strong>{favorites.length}</strong>
<span>{tr('في المفضلة','Saved favourites')}</span>
</LocalizedClientLink>
</div>{name?<LocalizedClientLink className="secondary wide" href="/user/settings">{tr('تعديل بيانات الحساب','Edit account details')}</LocalizedClientLink>:<form className="form-section" onSubmit={e=>{e.preventDefault();setSaved(displayName.trim());}}>
<h3>{tr('ملفك التجريبي','Your preview profile')}</h3>
<label className="field">{tr('الاسم الظاهر','Display name')}<input name="displayName" required maxLength={50} value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder={tr('اسمك في هالمعاينة','Your name in this preview')}/>
</label>
<label className="check">
<input type="checkbox" name="plantTips"/>{tr('أحب نصائح العناية بالنباتات','I enjoy plant care tips')}</label>
<button className="primary wide" type="submit">{tr('حفظ التغييرات التجريبية','Save preview changes')}</button>
<p className="fine-print" role="status">{saved?tr('تم حفظ الاسم لهالمعاينة فقط.','Name saved for this preview only.'):tr('التعديلات لهالجلسة فقط، بدون إنشاء حساب أو تفعيل تنبيهات فعلية.','Changes apply to this session only. No account or real notifications are created.')}</p>
</form>}<div className="profile-links">{[['/user/orders','bag','طلباتي','My orders'],['/departments','leaf','تصفح الأقسام','Explore categories'],['/sellers','store','اكتشف المتاجر والمشاتل','Discover nurseries'],['/favorites','heart','المنتجات المحفوظة','Saved products']].map(([href,icon,ar,en])=>
<LocalizedClientLink key={href} href={href}>
<YasIcon name={icon as IconName}/>
<span>{tr(ar,en)}</span>
<YasIcon name="chevron" className="sm"/>
</LocalizedClientLink>)}</div>
</main>;}
