'use client'

import { HttpTypes } from '@medusajs/types'
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'

interface Props {
  categories: HttpTypes.StoreProductCategory[]
  onLinkClick?: () => void
  title?: string
  titleId?: string
}

export const ChildCategories = ({ categories, onLinkClick, title, titleId }: Props) => {
  if (!categories || categories.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-y-1">
      {title && (
        <h3
          id={titleId}
          className="mb-2 pb-2 border-b border-primary/30 font-semibold text-[13px] md:text-[14px] text-primary uppercase tracking-wide"
        >
          {title}
        </h3>
      )}
      {categories.map((category) => (
        <LocalizedClientLink
          key={category.id}
          href={`/categories/${category.handle}`}
          onClick={onLinkClick}
          role="menuitem"
          className="label-md text-[14px] leading-[1.45] text-secondary hover:text-action transition-colors py-1"
        >
          {category.name}
        </LocalizedClientLink>
      ))}
    </div>
  )
}

