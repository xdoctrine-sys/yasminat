import 'server-only';
import {sdk} from '../client';
import type {NurseryPreview} from '@/components/yasminat/Stores';
export async function listNurseries(){return (sdk.store.sellers.query({limit:100,fields:'id,name,handle,description,logo,banner',fetchOptions:{cache:'no-store'}} as never) as unknown as Promise<{sellers:NurseryPreview[]}>).then(r=>r.sellers).catch(()=>[] as NurseryPreview[]);}
