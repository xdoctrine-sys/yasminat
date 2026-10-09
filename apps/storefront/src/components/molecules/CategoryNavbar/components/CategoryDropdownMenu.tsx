"use client"

import { HttpTypes } from "@medusajs/types"
import { CategoryDropdownContainer } from "./CategoryDropdownContainer"
import { CategoryDropdownContent } from "./CategoryDropdownContent"
import { ChildCategories } from "./ChildCategories"
import type { RefObject } from "react"

interface CategoryDropdownMenuProps {
  category: HttpTypes.StoreProductCategory
  isVisible: boolean
  categoryId: string | null
  panelWrapRef?: RefObject<HTMLDivElement | null>
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  onLinkClick?: () => void
}

const gridColsForCount = (n: number) => {
  if (n <= 1) return "grid-cols-1"
  if (n === 2) return "grid-cols-2"
  if (n === 3) return "grid-cols-3"
  if (n === 4) return "grid-cols-4"
  if (n === 5) return "grid-cols-5"
  return "grid-cols-6"
}

export const CategoryDropdownMenu = ({
  category,
  isVisible,
  categoryId,
  panelWrapRef,
  onMouseEnter,
  onMouseLeave,
  onLinkClick,
}: CategoryDropdownMenuProps) => {
  const columns = (category as any).category_children || []

  if (columns.length === 0) {
    return null
  }

  return (
    <CategoryDropdownContainer
      isVisible={isVisible}
      categoryId={categoryId}
      panelWrapRef={panelWrapRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      columns={columns.length}
    >
      <CategoryDropdownContent maxHeight="30rem">
        <div
          className={`grid ${gridColsForCount(columns.length)} gap-x-6 gap-y-2 px-6 py-5`}
          role="menu"
          aria-label={`${category.name || ""} subcategories`}
        >
          {columns.map((col: HttpTypes.StoreProductCategory) => {
            const items = (col as any).category_children || []
            return (
              <div
                key={col.id}
                role="group"
                aria-labelledby={`col-${col.id}-title`}
                className="flex flex-col gap-y-1.5"
              >
                <ChildCategories
                  title={col.name}
                  titleId={`col-${col.id}-title`}
                  categories={items}
                  onLinkClick={onLinkClick}
                />
              </div>
            )
          })}
        </div>
      </CategoryDropdownContent>
    </CategoryDropdownContainer>
  )
}
