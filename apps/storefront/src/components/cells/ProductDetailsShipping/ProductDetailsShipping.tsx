"use client";
import {useYasminat} from '@/components/yasminat/Provider';
export const ProductDetailsShipping=()=>{const {tr}=useYasminat();return <details className="disclosure"><summary>{tr('التوصيل والعناية','Delivery & care')}</summary><p>{tr('خيارات التوصيل ورسومه حسب العنوان والمنتجات تظهر عند إتمام الطلب. راجع وصف المنتج وتعليمات المتجر للعناية به.','Available delivery methods and fees depend on the address and products and are shown at checkout. See the product description and seller instructions for care information.')}</p></details>;};
