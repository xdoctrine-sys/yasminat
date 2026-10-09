"use client"

import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import React, { MouseEventHandler } from "react"

const KNOWN_REGION_RE = /^\/[a-z]{2}(\/|$)/i

function stripRegionPrefix(href: string, currentLocale: string | undefined): string {
  if (typeof href !== "string") return href
  if (!href.startsWith("/")) return href
  if (KNOWN_REGION_RE.test(href)) {
    const firstSegment = href.split("/")[1] || ""
    if (firstSegment.length === 2) {
      const withoutFirst = href.slice(firstSegment.length + 1)
      return withoutFirst.startsWith("/") ? withoutFirst : "/" + withoutFirst
    }
  }
  if (currentLocale && typeof currentLocale === "string") {
    const prefix = `/${currentLocale}`
    if (href === prefix) return "/"
    if (href.startsWith(prefix + "/")) return href.slice(prefix.length)
  }
  return href
}

const LocalizedClientLink = ({
  children,
  href,
  ...props
}: {
  children?: React.ReactNode
  href: string
  className?: string
  onClick?: MouseEventHandler<HTMLAnchorElement> | undefined
  passHref?: true
  [x: string]: any
}) => {
  const params = useParams()
  const pathname = usePathname()
  
  const locale = (params?.locale as string | undefined) || pathname?.split('/')[1] || 'en'
  const cleanHref = stripRegionPrefix(href, locale)

  return (
    <Link href={`/${locale}${cleanHref}`} {...props}>
      {children}
    </Link>
  )
}

export default LocalizedClientLink
