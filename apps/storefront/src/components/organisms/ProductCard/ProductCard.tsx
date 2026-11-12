"use client"
import {HttpTypes} from '@medusajs/types';
import {Product} from '@/types/product';
import {CatalogCard} from '@/components/yasminat/CatalogCard';
export const ProductCard = ({product,className}:{product:HttpTypes.StoreProduct|Product;className?:string}) => product ? <CatalogCard product={product as HttpTypes.StoreProduct} className={className}/> : null;
