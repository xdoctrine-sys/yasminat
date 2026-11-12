import {YasFavorites} from '@/components/yasminat/Favorites';
export const metadata={title:'المفضلة | Favourites'};
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return <YasFavorites locale={locale}/>;}
