import {ApprovedFrame} from '@/components/yasminat/approved/Frame';
import type { Metadata } from 'next';
import {yasLanguage} from '@/components/yasminat/server';
import {YasminatProvider} from '@/components/yasminat/Provider';
import './yasminat.css';
import './approved-design.css';
import './approved-frame.css';

import './globals.css';

import { Toaster } from '@medusajs/ui';
import Head from 'next/head';

import { retrieveCart } from '@/lib/data/cart';

import { Providers } from './providers';



export const metadata: Metadata = {
  title: {
    template: `%s | ${
      process.env.NEXT_PUBLIC_SITE_NAME || 'Yasminat'
    }`,
    default: process.env.NEXT_PUBLIC_SITE_NAME || 'Yasminat'
  },
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Yasminat',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000')
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cart = await retrieveCart();

  // default lang updated by HtmlLangSetter
  const htmlLang = await yasLanguage();

  return (
    <html
      lang={htmlLang}
      dir={htmlLang === 'ar' ? 'rtl' : 'ltr'}
      className=""
    >
      <Head>
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://fonts.gstatic.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://i.imgur.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://i.imgur.com"
        />
        {/* Image origins for faster LCP */}
        <link
          rel="preconnect"
          href="https://medusa-public-images.s3.eu-west-1.amazonaws.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://medusa-public-images.s3.eu-west-1.amazonaws.com"
        />
        <link
          rel="preconnect"
          href="https://mercur-connect.s3.eu-central-1.amazonaws.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://mercur-connect.s3.eu-central-1.amazonaws.com"
        />
        <link
          rel="preconnect"
          href="https://s3.eu-central-1.amazonaws.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://s3.eu-central-1.amazonaws.com"
        />
        <link
          rel="preconnect"
          href="https://api.mercurjs.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://api.mercurjs.com"
        />
      </Head>
      <body className={`yasminat-site relative bg-primary text-secondary antialiased`}>
        <YasminatProvider initialLanguage={htmlLang}>
          <Providers cart={cart}><ApprovedFrame>{children}</ApprovedFrame></Providers>
          <Toaster position="top-right" />
        </YasminatProvider>
      </body>
    </html>
  );
}
