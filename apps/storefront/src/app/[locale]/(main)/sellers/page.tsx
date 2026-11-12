import {redirect} from 'next/navigation';
import {listNurseries} from '@/lib/data/yasminat-sellers';
import {NurseryPicker} from '@/components/yasminat/Stores';
export const metadata={title:'المتاجر والمشاتل | Stores & nurseries'};
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;const sellers=await listNurseries();const selected=sellers.find(s=>s.handle==='yasminat-preview-garden')||sellers[0];if(selected)redirect(`/${locale}/sellers/${selected.handle}`);return <main className="screen-content container"><NurseryPicker sellers={[]}/></main>;}
