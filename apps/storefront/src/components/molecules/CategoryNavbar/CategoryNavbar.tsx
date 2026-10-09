"use client"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { cn } from "@/lib/utils"
import { useParams } from "next/navigation"
import { CollapseIcon } from "@/icons"
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  getActiveParentHandle,
  findParentCategoryHandle,
  filterCategoriesByParent,
} from "@/lib/helpers/category-utils"
import { useCategoryDropdown } from "./hooks/useCategoryDropdown"
import { CategoryDropdownMenu } from "./components/CategoryDropdownMenu"

interface CategoryNavbarProps {
  categories: HttpTypes.StoreProductCategory[]
  parentCategories?: HttpTypes.StoreProductCategory[]
  /** Show top-level parent categories (homepage header row). Default true. */
  showParentCategories?: boolean
  onClose?: (state: boolean) => void
}

type NavItem = {
  id: string
  handle: string
  name: string
  url: string
  hasChildren: boolean
  isActive: boolean
  category: HttpTypes.StoreProductCategory
}

const GAP_PX = 8
const HYSTERESIS_PX = 2

export const CategoryNavbar = ({
  categories,
  parentCategories = [],
  showParentCategories = true,
  onClose,
}: CategoryNavbarProps) => {
  const { category } = useParams<{ category?: string }>()

  const {
    hoveredCategoryId,
    isDropdownVisible,
    shouldRenderDropdown,
    openDropdown,
    closeDropdown,
    scheduleClose,
    cancelClose,
    returnFocusToTrigger,
    panelWrapRef,
  } = useCategoryDropdown()

  const activeParentHandle = useMemo(
    () => getActiveParentHandle(category, categories, parentCategories),
    [category, parentCategories, categories]
  )

  const parentCategoryHandle = useMemo(
    () => findParentCategoryHandle(category, categories),
    [category, categories]
  )

  // Items to render in the nav row
  const allItems: NavItem[] = useMemo(() => {
    const source = showParentCategories ? parentCategories : activeParentHandle
      ? filterCategoriesByParent(activeParentHandle, categories, parentCategories)
      : []

    const items: NavItem[] = []
    if (!showParentCategories) {
      items.push({
        id: "__all__",
        handle: "__all__",
        name: "All Products",
        url: "/categories",
        hasChildren: false,
        isActive: !category,
        category: {} as never,
      })
    }
    source.forEach((c) => {
      items.push({
        id: c.id,
        handle: c.handle ?? "",
        name: c.name ?? "",
        url: `/categories/${c.handle ?? ""}`,
        hasChildren:
          Array.isArray((c as any).category_children) &&
          (c as any).category_children.length > 0,
        isActive: c.handle === category || c.handle === parentCategoryHandle,
        category: c as HttpTypes.StoreProductCategory,
      })
    })
    return items
  }, [
    showParentCategories,
    parentCategories,
    activeParentHandle,
    categories,
    category,
    parentCategoryHandle,
  ])

  const hoveredCategory = useMemo(
    () =>
      allItems
        .map((i) => i.category)
        .find((cat) => cat && (cat as any).id === hoveredCategoryId) as
        | HttpTypes.StoreProductCategory
        | undefined,
    [allItems, hoveredCategoryId]
  )

  // =========================================================================
  // OVERFLOW DÉTERMINISTE — dépend UNIQUEMENT des largeurs MESURÉES DANS UNE
  // RANGÉE INVISIBLE (aria-hidden, visibility:hidden, absolute) qui contient
  // TOUS les items + More. Plus de dépendance à l'état affiché.
  // =========================================================================
  const containerRef = useRef<HTMLElement | null>(null)
  const measureRowRef = useRef<HTMLDivElement | null>(null)
  const measureItemRefs = useRef<Record<string, HTMLSpanElement | null>>({})
  const measureMoreRef = useRef<HTMLButtonElement | null>(null)

  // Caches largeurs (stables tant que allItems n'évolue pas, ou fonts pas changés)
  const widthsCacheRef = useRef<{ ids: string[]; widths: number[]; moreW: number } | null>(null)
  const lastContainerWRef = useRef<number>(-1)
  const [visibleCount, setVisibleCount] = useState<number>(allItems.length)
  const [moreOpen, setMoreOpen] = useState(false)
  const moreWrapRef = useRef<HTMLDivElement | null>(null)
  const moreBtnRef = useRef<HTMLButtonElement | null>(null)
  const moreMenuRef = useRef<HTMLDivElement | null>(null)
  const [moreMenuPos, setMoreMenuPos] = useState<{ left: number; top: number; width: number; bridge: number } | null>(null)
  const rafRef = useRef<number | null>(null)

  const getMeasuredWidths = useCallback((): { itemWs: number[]; moreW: number } | null => {
    const row = measureRowRef.current
    if (!row) return null
    const moreEl = measureMoreRef.current
    if (!moreEl) return null
    const ids = allItems.map((it) => it.id)
    const widths = allItems.map((it) => {
      const el = measureItemRefs.current[it.id]
      return el ? el.getBoundingClientRect().width : 0
    })
    const moreW = moreEl.getBoundingClientRect().width
    widthsCacheRef.current = { ids, widths, moreW }
    return { itemWs: widths, moreW }
  }, [allItems])

  const computeVisibleCount = useCallback(
    (containerW: number, itemWs: number[], moreW: number): number => {
      if (itemWs.length === 0) return 0
      const cw = Math.max(0, Math.floor(containerW) - HYSTERESIS_PX)
      // Somme totale sans More
      let sumAll = 0
      for (let i = 0; i < itemWs.length; i++) sumAll += itemWs[i]
      if (itemWs.length > 1) sumAll += (itemWs.length - 1) * GAP_PX
      if (sumAll <= cw) return itemWs.length // tout rentre sans More
      // sinon, réserve More et maximise le nb items avant + More
      let used = 0
      let fit = 0
      // Pré-réserve More + 1 gap (More sera ajouté si au moins 1 item masqué)
      const reserve = moreW + (itemWs.length > 0 ? GAP_PX : 0)
      for (let i = 0; i < itemWs.length; i++) {
        const wGap = (i === 0 ? 0 : GAP_PX) + Math.ceil(itemWs[i])
        const wouldOverflowWithMore = (used + wGap + reserve) > cw
        const wouldOverflow = (used + wGap) > cw
        // On doit pouvoir ajouter cet item ET garder la place pour More (si ce n'est pas le dernier)
        if (i === itemWs.length - 1) {
          // Dernier: peut-on l'ajouter sans More ?
          if (used + wGap <= cw) fit++
          break
        }
        if (!wouldOverflowWithMore && !wouldOverflow) {
          used += wGap
          fit++
        } else {
          break
        }
      }
      // Au moins 1 item visible + More si débordement
      return Math.max(1, Math.min(itemWs.length - 1, fit))
    },
    []
  )

  const measure = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    const containerW = container.clientWidth
    if (!containerW || allItems.length === 0) {
      setVisibleCount((prev) => (prev === allItems.length ? prev : allItems.length))
      return
    }
    if (containerW === lastContainerWRef.current && widthsCacheRef.current) {
      return
    }
    lastContainerWRef.current = containerW
    const cache = widthsCacheRef.current
    let itemWs: number[]
    let moreW: number
    if (cache && cache.ids.length === allItems.length && cache.ids.every((id, i) => id === allItems[i].id)) {
      itemWs = cache.widths
      moreW = cache.moreW
    } else {
      const m = getMeasuredWidths()
      if (!m) return
      itemWs = m.itemWs
      moreW = m.moreW
    }
    const target = computeVisibleCount(containerW, itemWs, moreW)
    setVisibleCount((prev) => (prev === target ? prev : target))
  }, [allItems, getMeasuredWidths, computeVisibleCount])

  useLayoutEffect(() => {
    // Invalider cache si la liste des items change (ids ou ordre)
    widthsCacheRef.current = null
    lastContainerWRef.current = -1
    measure()
  }, [measure, allItems])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const ro = new ResizeObserver(() => {
      if (rafRef.current !== null) return
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null
        measure()
      })
    })
    ro.observe(container)
    const onResize = () => {
      if (rafRef.current !== null) return
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null
        measure()
      })
    }
    window.addEventListener("resize", onResize, { passive: true })
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", onResize)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [measure])

  const visibleItems = allItems.slice(0, visibleCount)
  const overflowItems = allItems.slice(visibleCount)
  const showMore = overflowItems.length > 0
  const anyOverflowHasChildren = overflowItems.some((it) => it.hasChildren)

  const moreBridgeAndPos = () => {
    if (!moreBtnRef.current) return null
    const btn = moreBtnRef.current
    const VIEWPORT_MARGIN = 8
    const MENU_WIDTH = 240
    const r = btn.getBoundingClientRect()
    const header =
      (btn.closest('header') as HTMLElement | null) ||
      (document.querySelector('header[class*="sticky"]') as HTMLElement | null) ||
      null
    const hBottom = header ? header.getBoundingClientRect().bottom : r.bottom
    const bridgePx = Math.max(0, Math.ceil(hBottom - r.bottom) + 1)
    const maxLeft = window.innerWidth - MENU_WIDTH - VIEWPORT_MARGIN
    const minLeft = VIEWPORT_MARGIN
    let left = r.right - MENU_WIDTH
    if (left > maxLeft) left = maxLeft
    if (left < minLeft) left = minLeft
    const top = r.bottom
    const width = Math.min(MENU_WIDTH, window.innerWidth - VIEWPORT_MARGIN * 2)
    return { left, top, width, bridge: bridgePx }
  }

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node
      if (
        moreWrapRef.current && !moreWrapRef.current.contains(t) &&
        moreMenuRef.current && !moreMenuRef.current.contains(t) &&
        moreBtnRef.current && !moreBtnRef.current.contains(t)
      ) {
        setMoreOpen(false)
      }
    }
    const onDocKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (moreOpen) {
          setMoreOpen(false)
          setTimeout(() => moreBtnRef.current?.focus(), 0)
        }
      }
    }
    const onDocResize = () => {
      if (moreOpen) setMoreOpen(false)
    }
    document.addEventListener("mousedown", onDocClick)
    document.addEventListener("keydown", onDocKey, true)
    window.addEventListener("resize", onDocResize, { passive: true })
    return () => {
      document.removeEventListener("mousedown", onDocClick)
      document.removeEventListener("keydown", onDocKey, true)
      window.removeEventListener("resize", onDocResize)
    }
  }, [moreOpen])

  useEffect(() => {
    if (!moreOpen || !moreBtnRef.current) {
      setMoreMenuPos(null)
      return
    }
    const bp = moreBridgeAndPos()
    if (bp) setMoreMenuPos(bp)
  }, [moreOpen, visibleCount, showMore, allItems])

  useEffect(() => {
    if (!moreOpen) return
    const onWin = () => {
      const bp = moreBridgeAndPos()
      if (bp) setMoreMenuPos(bp)
    }
    const t = window.setTimeout(onWin, 0)
    window.addEventListener("scroll", onWin, { passive: true })
    return () => {
      window.clearTimeout(t)
      window.removeEventListener("scroll", onWin)
    }
  }, [moreOpen, visibleCount, showMore, allItems])

  const handleClose = () => {
    onClose?.(false)
    closeDropdown()
    setMoreOpen(false)
  }

  // --- Hover handlers avec hover intent (OPEN_DELAY_MS=220 / CLOSE_DELAY_MS=160) ---
  const handleItemMouseEnter = (it: NavItem) => {
    if (!it.hasChildren) return
    openDropdown(it.id, { triggerId: it.id })
  }
  const handleItemMouseLeave = () => {
    scheduleClose()
  }
  const handlePanelMouseEnter = () => {
    cancelClose()
  }
  const handlePanelMouseLeave = () => {
    scheduleClose()
  }

  // --- Keyboard: Entrée/Espace/FlècheBas ouvre ; Échap ferme et rend focus ---
  const handleItemKeyDown = (
    e: React.KeyboardEvent<HTMLAnchorElement>,
    it: NavItem
  ) => {
    if (!it.hasChildren) return
    switch (e.key) {
      case "Enter":
      case " ":
      case "ArrowDown":
        e.preventDefault()
        openDropdown(it.id, { immediate: true, triggerId: it.id })
        break
      case "Escape":
        e.preventDefault()
        closeDropdown()
        returnFocusToTrigger()
        break
    }
  }

  // --- Keyboard: More button ---
  const handleMoreKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    switch (e.key) {
      case "Enter":
      case " ":
      case "ArrowDown":
        e.preventDefault()
        setMoreOpen((v) => !v)
        break
      case "Escape":
        e.preventDefault()
        setMoreOpen(false)
        moreBtnRef.current?.focus()
        break
    }
  }

  // Même classe liens + chevron SI anyOverflowHasChildren (More ouvre menu avec items ayant children → chevron)
  const renderItemAnchor = (it: NavItem, extraClass?: string) => (
    <LocalizedClientLink
      key={it.id}
      href={it.url}
      onClick={handleClose}
      data-cat-trigger={it.id}
      aria-haspopup={it.hasChildren ? "dialog" : undefined}
      aria-expanded={
        it.hasChildren && hoveredCategoryId === it.id
          ? isDropdownVisible
            ? "true"
            : "false"
          : undefined
      }
      onFocus={() => {
        if (it.hasChildren) openDropdown(it.id, { immediate: true, triggerId: it.id })
      }}
      onKeyDown={(e) => handleItemKeyDown(e, it)}
      className={cn(
        "label-md px-2 py-1 md:my-0 flex items-center justify-between md:whitespace-nowrap text-primary relative z-10 font-medium text-[13px] md:text-[15px] md:font-normal hover:text-action transition-colors",
        it.isActive && "md:border-b-2 md:border-action text-action",
        extraClass
      )}
      data-testid={`category-link-${it.handle}`}
    >
      <span>{it.name}</span>
      {it.hasChildren && (
        <CollapseIcon size={14} className="ms-1 -rotate-90 text-secondary shrink-0" />
      )}
    </LocalizedClientLink>
  )

  return (
    <div className="relative w-full">
      {/* ===================================================================
          RANGÉE DE MESURE INVISIBLE — TOUS items + More.
          Toujours montée (pas de dépendance à l'état affiché). Largeur contrainte
          par parent = invisible sans affecter layout.
          =================================================================== */}
      <div
        ref={measureRowRef}
        aria-hidden="true"
        className="pointer-events-none absolute -z-10 start-0 top-0 h-0 overflow-hidden"
        style={{ visibility: "hidden" }}
      >
        <div
          className="flex items-center flex-row"
          style={{ columnGap: `${GAP_PX}px` }}
        >
          {allItems.map((it) => (
            <span
              key={`meas-${it.id}`}
              ref={(el) => (measureItemRefs.current[it.id] = el)}
              className="label-md shrink-0 px-2 py-1 md:my-0 items-center justify-between whitespace-nowrap font-medium text-[13px] md:text-[15px] md:font-normal"
              style={{ display: "inline-flex" }}
            >
              <span>{it.name}</span>
              {it.hasChildren && (
                <span style={{ width: 14, height: 14, marginLeft: 4, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CollapseIcon size={14} className="-rotate-90 text-secondary shrink-0" />
                </span>
              )}
            </span>
          ))}
          <button
            ref={measureMoreRef}
            type="button"
            tabIndex={-1}
            style={{ pointerEvents: "none" }}
            className="inline-flex items-center gap-1 h-9 px-3 label-md font-medium text-[13px] md:text-[15px] md:font-normal"
          >
            More <CollapseIcon size={14} className="shrink-0 text-secondary" />
          </button>
        </div>
      </div>

      <nav
        ref={containerRef as any}
        className="flex items-center flex-row w-full min-w-0"
        style={{ columnGap: `${GAP_PX}px` }}
        aria-label="Category navigation"
        data-testid="category-navbar"
      >
        {visibleItems.map((it) => (
          <div
            key={it.id}
            className="shrink-0"
            onMouseEnter={() => handleItemMouseEnter(it)}
            onMouseLeave={handleItemMouseLeave}
          >
            {renderItemAnchor(it)}
          </div>
        ))}

        {showMore && (
          <div
            ref={moreWrapRef}
            className="shrink-0"
          >
            <button
              ref={moreBtnRef}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setMoreOpen((v) => !v)}
              onKeyDown={handleMoreKeyDown}
              aria-expanded={moreOpen ? "true" : "false"}
              aria-haspopup="menu"
              className={cn(
                "inline-flex items-center gap-1 h-9 px-3",
                "label-md font-medium text-[13px] md:text-[15px] md:font-normal text-primary",
                "hover:text-action hover:bg-action-secondary/60 rounded-sm transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-action"
              )}
              data-testid="category-navbar-more"
            >
              More {anyOverflowHasChildren && (
                <CollapseIcon size={14} className="shrink-0 text-secondary" />
              )}
            </button>
          </div>
        )}
      </nav>

      {showMore && moreOpen && moreMenuPos && (
        <div
          ref={moreMenuRef}
          className={cn(
            "fixed z-[80]",
          )}
          style={{
            left: moreMenuPos.left,
            top: moreMenuPos.top,
            width: moreMenuPos.width,
          }}
          data-testid="more-menu-root"
        >
          <div style={{ height: moreMenuPos.bridge ?? 0 }} />
          <div className="bg-primary border rounded-md shadow-lg" data-testid="more-menu-visible">
            <div className="py-1 max-h-[70vh] overflow-auto no-scrollbar">
              {overflowItems.map((it) => (
                <LocalizedClientLink
                  key={it.id}
                  href={it.url}
                  onClick={handleClose}
                  role="menuitem"
                  data-cat-trigger={it.id}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 text-sm text-primary",
                    "hover:bg-action-secondary hover:text-action transition-colors",
                    it.isActive && "font-semibold text-action bg-action-secondary/40"
                  )}
                >
                  <span className="truncate">{it.name}</span>
                  {it.hasChildren && (
                    <CollapseIcon size={12} className="ms-1 -rotate-90 text-secondary shrink-0" />
                  )}
                </LocalizedClientLink>
              ))}
            </div>
          </div>
        </div>
      )}

      {shouldRenderDropdown && hoveredCategory && (
        <CategoryDropdownMenu
          category={hoveredCategory}
          isVisible={isDropdownVisible}
          categoryId={hoveredCategoryId ?? null}
          panelWrapRef={panelWrapRef}
          onMouseEnter={handlePanelMouseEnter}
          onMouseLeave={handlePanelMouseLeave}
          onLinkClick={handleClose}
        />
      )}
    </div>
  )
}

export default CategoryNavbar
