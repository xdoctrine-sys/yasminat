"use client"
import {HttpTypes} from '@medusajs/types';
import {StoreOffer} from '@/lib/helpers/buybox';
import {CatalogCard} from '@/components/yasminat/CatalogCard';
export const OfferCard=({offer,locale,className}:{offer:StoreOffer;locale:string;className?:string})=>offer.product ? <CatalogCard product={{id:offer.product.id,title:offer.product.title||'',handle:offer.product.handle||'',thumbnail:offer.product.thumbnail||null}} offer={offer} locale={locale} className={className}/> : null;
