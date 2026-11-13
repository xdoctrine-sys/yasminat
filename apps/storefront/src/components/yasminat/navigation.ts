/** Approved review page identities, shared by header and navigation chrome. */
export function yasminatScreen(pathname:string,locale:string){
 const path=pathname.replace(new RegExp(`^/${locale}(?=/|$)`),'').replace(/\/$/,'')||'/';
 if(path==='/')return 1;
 if(path.startsWith('/departments'))return 2;
 if(path.startsWith('/categories')||path.startsWith('/offers'))return 3;
 if(path.startsWith('/products/'))return 4;
 if(path.startsWith('/cart'))return 5;
 if(path.startsWith('/checkout'))return 6;
 if(path.startsWith('/sellers'))return 7;
 if(path.startsWith('/favorites'))return 8;
 if(path==='/login')return 10;
 if(path==='/register'||path==='/user/register')return 11;
 if(/^\/user\/orders\/[^/]+\/tracking$/.test(path))return 13;
 if(path.startsWith('/user/orders/'))return 12;
 if(path==='/user/orders')return 14;
 return 9;
}
