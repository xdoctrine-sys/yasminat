import {ApprovedAccount} from '@/components/yasminat/Account';
import {retrieveCustomer} from '@/lib/data/customer';
export const metadata={title:'حسابي | My account',robots:{index:false,follow:false}};
export default async function Page(){const user=await retrieveCustomer();return <ApprovedAccount name={user?.first_name||undefined}/>;}
