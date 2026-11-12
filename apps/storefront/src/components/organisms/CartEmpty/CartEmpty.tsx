"use client"
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';
import {useYasminat} from '@/components/yasminat/Provider';
import {YasIcon} from '@/components/yasminat/Icon';
export function CartEmpty(){const {tr}=useYasminat();return <div className="empty" data-testid="cart-empty"><YasIcon name="bag"/><h3>{tr('السلة تنتظر اختياراتك','Your bag is waiting')}</h3><p>{tr('اختَر نبتة أو حوضًا أو لمسة لحديقتك، وبتلقاها هنا.','Find a plant, a pot or a finishing touch for your garden.')}</p><LocalizedClientLink href="/categories" className="secondary">{tr('تصفح المنتجات','Explore products')}<YasIcon name="arrow"/></LocalizedClientLink></div>;}
