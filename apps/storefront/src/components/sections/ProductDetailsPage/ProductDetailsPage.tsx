import {CatalogBreadcrumb} from '@/components/yasminat/approved/CatalogBreadcrumb'
import {homeCrumb,categoryTrail,type CatalogCrumb} from '@/lib/helpers/catalog-breadcrumbs'
import {listCategories} from '@/lib/data/categories'
import {flattenCategoryTree} from '@/lib/helpers/category-tree'
import { ProductDetails, ProductGallery } from "@/components/organisms"
import { listProducts } from "@/lib/data/products"
import { listOffers } from "@/lib/data/offers"
import { StoreOffer } from "@/lib/helpers/buybox"
import {ApprovedRelated} from '@/components/yasminat/approved/Related'
import NotFound from "@/app/not-found"

export const ProductDetailsPage = async ({
  handle,
  locale,
  baseUrl,
}: {
  handle: string
  locale: string
  baseUrl: string
}) => {
  const prod = await listProducts({
    countryCode: locale,
    queryParams: { handle: [handle], limit: 1 },
  }).then(({ response }) => response.products[0])

  if (!prod) return null


  const { offers } = await listOffers({
    productId: prod.id,
    countryCode: locale,
  })

  const {parentCategories}=await listCategories();
  const category=prod.categories?.find(c=>c.metadata?.yasminat_category!=='plants')||prod.categories?.[0];
  const crumbs:CatalogCrumb[]=[homeCrumb,...(category?categoryTrail(category,flattenCategoryTree(parentCategories)):[]),{name:prod.title,path:`/products/${encodeURIComponent(handle)}`}];
  const related = await listProducts({countryCode:locale,queryParams:{limit:4}}).then(({response})=>response.products.filter(p=>p.id!==prod.id).slice(0,3));
  return (
    <>
      <CatalogBreadcrumb items={crumbs} locale={locale} baseUrl={baseUrl} placement="desktop"/>
      <div className="product-detail" data-testid="product-details-page">
        <div className="detail-picture" data-testid="product-gallery-container">
          <ProductGallery images={prod?.images || []} title={prod.title} />
        </div>
        <div data-testid="product-details-container">
          <CatalogBreadcrumb items={crumbs} locale={locale} baseUrl={baseUrl} placement="compact"/>
          <ProductDetails
            product={prod}
            locale={locale}
            offers={offers as StoreOffer[]}
          />
        </div>
      </div>
      <ApprovedRelated products={related} locale={locale}/>
    </>
  )
}
