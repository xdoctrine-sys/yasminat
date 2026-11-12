import {listCategories} from '@/lib/data/categories';
import {YasHeader} from '@/components/yasminat/Shell';
export const Header=async()=>{const {parentCategories}=await listCategories();return <YasHeader categories={parentCategories}/>;};
