import {headers} from 'next/headers'
import { ProductDetailsPage } from "@/components/sections"
import { listProducts } from "@/lib/data/products"
import { generateProductMetadata } from "@/lib/helpers/seo"
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>
}): Promise<Metadata> {
  const { handle, locale } = await params

  const prod = await listProducts({
    countryCode: locale,
    queryParams: { handle: [handle], limit: 1 },
  }).then(({ response }) => response.products[0])

  return generateProductMetadata(prod, locale)
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>
}) {
  const { handle, locale } = await params

  const requestHeaders=await headers();
  const baseUrl=process.env.NEXT_PUBLIC_BASE_URL||`${requestHeaders.get('x-forwarded-proto')||'https'}://${requestHeaders.get('host')}`;

  return (
    <main className="screen-content container">
      <ProductDetailsPage handle={handle} locale={locale} baseUrl={baseUrl} />
    </main>
  )
}
