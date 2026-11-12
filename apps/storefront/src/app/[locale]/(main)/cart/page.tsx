import {ApprovedIntro} from '@/components/yasminat/approved/Intro';
import { Cart } from '@/components/sections';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Cart',
  description: 'My cart page',
  robots: { index: false, follow: false },
};

export default function CartPage({}) {
  return (
    <main className='screen-content container'><ApprovedIntro type="cart"/><div className="split-layout">
      <Suspense fallback={<>Loading...</>}>
        <Cart />
      </Suspense>
    </div></main>
  );
}
