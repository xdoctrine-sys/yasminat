"use client"

import { SearchIcon } from "@/icons"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import clsx from "clsx"
import { sdk } from "@/lib/client"
import { cn } from "@/lib/utils"

interface Props {
  className?: string
  /**
   * Real category names fetched from the backend — used to rotate the
   * search placeholder every few seconds. NEVER hard-coded placeholders.
   */
  placeholderCategoryNames?: string[]
  /** Interval in ms between placeholder rotations. */
  placeholderIntervalMs?: number
}

type Suggestion = {
  id: string
  kind: "product" | "category"
  name: string
  handle: string
  thumbnail?: string | null
}

const DEBOUNCE_MS = 200
const SUGGEST_LIMIT = 6

export const NavbarSearch = ({
  className,
  placeholderCategoryNames = [],
  placeholderIntervalMs = 3000,
}: Props) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const localeSegment = useMemo(() => {
    const m = /^\/([a-z]{2})(\/|$)/i.exec(pathname || "")
    return m ? m[1].toLowerCase() : (process.env.NEXT_PUBLIC_DEFAULT_REGION || "qa").toLowerCase()
  }, [pathname])

  const [search, setSearch] = useState(searchParams.get("query") || "")
  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  const placeholders = useMemo(
    () => (placeholderCategoryNames.length ? placeholderCategoryNames : ["Search"]),
    [placeholderCategoryNames]
  )

  // Rotate placeholder every N ms using real backend category names
  useEffect(() => {
    if (placeholders.length < 2) return
    const id = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % placeholders.length)
    }, placeholderIntervalMs)
    return () => clearInterval(id)
  }, [placeholders.length, placeholderIntervalMs])

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current) return
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [])

  const goToResults = useCallback(
    (q?: string) => {
      const query = (q ?? search).trim()
      setOpen(false)
      if (query) {
        router.push(`/${localeSegment}/categories?query=${encodeURIComponent(query)}`)
      } else {
        router.push(`/${localeSegment}/categories`)
      }
    },
    [search, router, localeSegment]
  )

  const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    goToResults()
  }

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent && (e.nativeEvent as any).isComposing) {
      return
    }
    if (e.key === "Enter") {
      e.preventDefault()
      e.stopPropagation()
      setOpen(false)
      goToResults()
    }
  }

  // Debounced fetch of suggestions (2 existing real endpoints, NO mock)
  useEffect(() => {
    const q = search.trim()
    if (!q) {
      setSuggestions([])
      setLoading(false)
      return
    }
    setLoading(true)
    setOpen(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const [productsRes, catsRes] = await Promise.all([
          sdk.store.products
            .query({
              q,
              limit: SUGGEST_LIMIT,
              fields: "id,handle,title,thumbnail",
              fetchOptions: { cache: "no-store" },
            })
            .then((r: any) => ((r as { products?: HttpTypes.StoreProduct[] }).products ?? []) as HttpTypes.StoreProduct[]),
          sdk.store.productCategories
            .query({
              q,
              limit: SUGGEST_LIMIT,
              fields: "id,handle,name",
              fetchOptions: { cache: "force-cache", next: { revalidate: 3600 } },
            })
            .then((r: any) =>
              ((r as { product_categories?: HttpTypes.StoreProductCategory[] }).product_categories ??
                []) as HttpTypes.StoreProductCategory[]
            ),
        ])
        const merged: Suggestion[] = [
          ...catsRes.slice(0, 3).map((c: HttpTypes.StoreProductCategory) => ({
            id: `cat-${c.id}`,
            kind: "category" as const,
            name: c.name ?? "",
            handle: c.handle ?? "",
            thumbnail: null,
          })),
          ...productsRes.slice(0, 5).map((p: HttpTypes.StoreProduct) => ({
            id: `prod-${p.id}`,
            kind: "product" as const,
            name: p.title ?? "",
            handle: p.handle ?? "",
            thumbnail: p.thumbnail ?? null,
          })),
        ]
        setSuggestions(merged)
      } catch {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search])

  const placeholder = `Search '${placeholders[placeholderIdx % placeholders.length]}'`

  return (
    <div
      ref={wrapRef}
      className={clsx("w-full relative", className)}
      data-testid="navbar-search"
    >
      <form method="GET" action={`/${localeSegment}/categories`} onSubmit={submitHandler} className="relative">
        <div className="relative w-full h-12 flex items-center">
          <button
            type="submit"
            aria-label="Search"
            data-testid="navbar-search-submit"
            className={cn(
              "absolute start-0 z-[1] h-12 w-12 flex items-center justify-center",
              "text-secondary hover:text-primary transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-0 rounded-s-full"
            )}
          >
            <SearchIcon size={18} />
          </button>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={onInputKeyDown}
            onFocus={() => search.trim() && setOpen(true)}
            placeholder={placeholder}
            aria-label={placeholder}
            className={cn(
              "w-full h-12 ps-12 pe-4 rounded-full bg-surface-pill border border-surface-pill",
              "text-sm text-primary placeholder:text-secondary/80",
              "focus:outline-none focus:ring-2 focus:ring-action focus:bg-primary",
              "transition-colors"
            )}
          />
        </div>
      </form>

      {open && (search.trim() || loading) && (
        <div
          className={cn(
            "absolute top-[calc(100%+8px)] inset-x-0 z-30",
            "bg-primary border rounded-md shadow-lg overflow-hidden",
            "max-h-96 overflow-auto no-scrollbar"
          )}
          role="listbox"
          data-testid="navbar-search-suggestions"
        >
          {loading && suggestions.length === 0 && (
            <div className="px-4 py-3 text-sm text-secondary">Searching…</div>
          )}
          {!loading && suggestions.length === 0 && (
            <div className="px-4 py-3 text-sm text-secondary">No results for “{search}”.</div>
          )}
          <ul>
            {suggestions.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    if (s.kind === "category") {
                      router.push(`/${localeSegment}/categories/${s.handle}`)
                      setOpen(false)
                    } else {
                      router.push(`/${localeSegment}/products/${s.handle}`)
                      setOpen(false)
                    }
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 text-start px-4 py-2.5",
                    "hover:bg-action-secondary transition-colors"
                  )}
                >
                  <span
                    className={cn(
                      "shrink-0 text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full",
                      s.kind === "category"
                        ? "bg-surface-pill text-secondary"
                        : "bg-action-secondary text-action"
                    )}
                  >
                    {s.kind}
                  </span>
                  <span className="text-sm text-primary truncate">{s.name}</span>
                </button>
              </li>
            ))}
          </ul>
          {suggestions.length > 0 && (
            <div className="border-t px-4 py-2 bg-surface-pill/40">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => goToResults()}
                className="text-sm font-medium text-action hover:underline"
              >
                See all results for “{search.trim()}” →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NavbarSearch

