"use client"

import { HttpTypes } from "@medusajs/types"
import {
  ProductsPagination,
  ProductSearchSidebar,
  ProductListingActiveFilters,
} from "@/components/organisms"
import {
  ProductListingLoadingView,
  ProductListingNoResultsView,
  ProductListingProductsView,
} from "@/components/molecules"
import { useYasminat } from "@/components/yasminat/Provider"
import { YasIcon } from "@/components/yasminat/Icon"
import useUpdateSearchParams from "@/hooks/useUpdateSearchParams"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { PRODUCT_LIMIT } from "@/const"
import { ProductListingSkeleton } from "@/components/organisms/ProductListingSkeleton/ProductListingSkeleton"
import { useEffect, useMemo, useState, useRef } from "react"
import {
  getSearchFacets,
  searchProducts,
  type SearchFacets,
} from "@/lib/data/products"
import type { SortOptions } from "@/types/product"

const EMPTY_FACETS: SearchFacets = { attributes: {} }

// URL params that drive the listing itself rather than attribute filters.
const RESERVED_PARAMS = new Set([
  "query",
  "page",
  "sortBy",
  "min_price",
  "max_price",
])

export const SearchProductsListing = ({
  category_id,
  collection_id,
  seller_id,
  locale = process.env.NEXT_PUBLIC_DEFAULT_REGION,
}: {
  category_id?: string | string[]
  collection_id?: string
  seller_id?: string
  locale?: string
}) => {
  const searchParams = useSearchParams()
  const {tr}=useYasminat();
  const update=useUpdateSearchParams();
  const router=useRouter(),pathname=usePathname();
  const filterDialog=useRef<HTMLDialogElement>(null);
  const categoryKey = Array.isArray(category_id)
    ? category_id.join(",")
    : category_id

  const query = searchParams.get("query") || ""
  const page = +(searchParams.get("page") || 1)
  const sortBy = (searchParams.get("sortBy") as SortOptions | null) || undefined

  const [facets, setFacets] = useState<SearchFacets>(EMPTY_FACETS)
  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>([])
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getSearchFacets()
      .then(setFacets)
      .catch(() => setFacets(EMPTY_FACETS))
  }, [])

  const searchParamsKey = searchParams.toString()
  const attributesKey = useMemo(() => {
    const selected: Record<string, string[]> = {}
    searchParams.forEach((raw, key) => {
      if (RESERVED_PARAMS.has(key) || !raw) {
        return
      }
      selected[key] = raw.split(",").filter(Boolean)
    })
    return JSON.stringify(selected)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParamsKey])
  const attributes = useMemo(
    () => JSON.parse(attributesKey) as Record<string, string[]>,
    [attributesKey]
  )

  useEffect(() => {
    async function fetchProducts() {
      if (!locale) return

      try {
        setIsLoading(true)
        const result = await searchProducts({
          query: query || undefined,
          countryCode: locale,
          category_id,
          collection_id,
          seller_id,
          attributes,
          page,
          limit: PRODUCT_LIMIT,
          sortBy,
        })

        setProducts(result.products)
        setCount(result.count)
      } catch (error) {
        setProducts([])
        setCount(0)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, categoryKey, collection_id, seller_id, query, page, sortBy, attributesKey])



  const pages = Math.ceil(count / PRODUCT_LIMIT) || 1

  return <div data-testid="product-listing-container">
   <div className="listing-toolbar"><form className="listing-search" onSubmit={event=>{event.preventDefault();const value=new FormData(event.currentTarget).get('query');update('query',String(value||''));}}><label className="visually-hidden" htmlFor="listing-search">{tr('البحث','Search')}</label><YasIcon name="search" className="sm"/><input id="listing-search" name="query" type="search" defaultValue={query} placeholder={tr('ابحث عن منتج أو متجر','Search products or stores')}/></form><button className="filter-trigger secondary" onClick={()=>filterDialog.current?.showModal()} aria-haspopup="dialog"><YasIcon name="sliders" className="sm"/>{tr('تصفية','Filter')}</button></div>
   <div className="applied-filters"><ProductListingActiveFilters/></div>
   <div className="results-bar"><span aria-live="polite">{count} {tr('منتجات','products')} · {query||tr('الكل','All')}</span><button className="text-link" onClick={()=>router.replace(pathname)}>{tr('مسح الفلاتر','Clear filters')}</button></div>
   {isLoading&&<ProductListingLoadingView/>}
   {!isLoading&&!products.length&&<ProductListingNoResultsView/>}
   {products.length>0&&<ProductListingProductsView products={products}/>}
   <ProductsPagination pages={pages}/>
   <dialog ref={filterDialog} className="yas-dialog"><h2>{tr('تصفية المنتجات','Filter products')}</h2><label className="field">{tr('الترتيب','Sort')}<select value={sortBy||'created_at'} onChange={event=>update('sortBy',event.target.value)}><option value="created_at">{tr('مختاراتنا','Recommended')}</option><option value="price_asc">{tr('السعر: من الأقل للأعلى','Price: low to high')}</option><option value="price_desc">{tr('السعر: من الأعلى للأقل','Price: high to low')}</option></select></label><ProductSearchSidebar facets={facets} inline/><form method="dialog"><button className="primary wide">{tr('عرض المنتجات','Show products')}</button></form></dialog>
  </div>
}
