import { Carousel } from "@/components/cells"
import { ProductCard } from "../ProductCard/ProductCard"
import { listProducts } from "@/lib/data/products"
import type { HttpTypes } from "@medusajs/types"

export const HomeProductsCarousel = async ({
  locale,
  sellerProducts,
  home,
}: {
  locale: string
  sellerProducts: HttpTypes.StoreProduct[]
  home: boolean
}) => {
  let products: HttpTypes.StoreProduct[] = []
  try {
    const res = await listProducts({
      countryCode: locale,
      queryParams: {
        limit: home ? 8 : undefined,
        order: "created_at",
        handle: home
          ? undefined
          : sellerProducts.map((product) => product.handle),
      },
    })
    products = res.response.products
  } catch {
    products = []
  }

  if (!products.length && !sellerProducts.length) return null

  return <div className="product-grid" data-testid="home-products">{(sellerProducts.length ? sellerProducts : products).map(product=><ProductCard key={product.id} product={product}/>)}</div>
}
