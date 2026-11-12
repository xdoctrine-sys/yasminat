import {fetchHeroSlides} from '@/lib/data/hero-banners';
import {listCategories} from '@/lib/data/categories';
import {listProducts} from '@/lib/data/products';
import {ApprovedHome as YasHome} from '@/components/yasminat/approved/Home';
import {
  BannerSection,
  BlogSection,
  HomeCategories,
  HomeProductSection,
  ShopByStyleSection,
} from "@/components/sections"
import { HeroSection } from "@/components/molecules"

import type { Metadata } from "next"
import { headers } from "next/headers"
import Script from "next/script"
import { listRegions } from "@/lib/data/regions"
import {
  buildHreflangAlternates,
  getStorefrontLocales,
  toHreflang,
} from "@/lib/helpers/hreflang"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  const headersList = await headers()
  const host = headersList.get("host")
  const protocol = headersList.get("x-forwarded-proto") || "https"
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`

  let locales: string[] = []
  try {
    locales = getStorefrontLocales(await listRegions())
  } catch {
    locales = [locale]
  }

  const { canonical, languages } = buildHreflangAlternates({
    baseUrl,
    path: "",
    locale,
    locales,
  })

  const title = "ياسمينات | Yasminat"
  const description =
    "نباتات وأحواض ومستلزمات البيت والحديقة — ياسمينات."
  const ogImage = "/B2C_Storefront_Open_Graph.png"

  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-video-preview": -1,
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title: `${title} | ${
        process.env.NEXT_PUBLIC_SITE_NAME ||
        "Mercur B2C Demo - Marketplace Storefront"
      }`,
      description,
      url: canonical,
      siteName:
        process.env.NEXT_PUBLIC_SITE_NAME ||
        "Mercur B2C Demo - Marketplace Storefront",
      type: "website",
      images: [
        {
          url: ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`,
          width: 1200,
          height: 630,
          alt:
            process.env.NEXT_PUBLIC_SITE_NAME ||
            "Mercur B2C Demo - Marketplace Storefront",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`],
    },
  }
}

export default async function Home({params}:{params:Promise<{locale:string}>}) {
 const {locale}=await params;
 const [{parentCategories},{response},slots]=await Promise.all([
  listCategories(),
  listProducts({countryCode:locale,queryParams:{limit:100,fields:'*categories,*variants.calculated_price,*variants.options,*options.values'}}),
  fetchHeroSlides(),
 ]);
 return <YasHome products={response.products} categories={parentCategories} locale={locale} banners={slots}/>;
}
