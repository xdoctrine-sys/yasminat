"use client";
import {useYasminat} from '@/components/yasminat/Provider';
export const ProductPageDetails=({details}:{details:string})=>{const {tr}=useYasminat();if(!details)return null;return <details className="disclosure" open data-testid="product-details-section"><summary>{tr('تفاصيل المنتج','Product details')}</summary><p data-testid="product-details-content">{details}</p></details>;};
