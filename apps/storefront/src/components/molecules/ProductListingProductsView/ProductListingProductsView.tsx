import { HttpTypes } from "@medusajs/types"
import { ProductCard } from "@/components/organisms"

interface Props {
  products: HttpTypes.StoreProduct[]
}

const ProductListingProductsView = ({ products }: Props) => (
  <div className="w-full">
    <ul className="product-grid">
      {products.map(
        (product) =>
           (
            <li key={product.id} className="min-w-0">
              <ProductCard
                product={product}
                className="w-full h-full lg:w-full min-w-0"
              />
            </li>
          )
      )}
    </ul>
  </div>
)

export default ProductListingProductsView
