"use client"
import * as React from "react"

interface ShowAtProps {
  children: React.ReactNode
  minWidth?: number
  maxWidth?: number
}

export function ShowAt({ children, minWidth, maxWidth }: ShowAtProps) {
  const [match, setMatch] = React.useState<boolean | null>(null)

  const query = React.useMemo(() => {
    if (typeof minWidth === "number") return `(min-width: ${minWidth}px)`
    if (typeof maxWidth === "number") return `(max-width: ${maxWidth}px)`
    return "all"
  }, [minWidth, maxWidth])

  React.useEffect(() => {
    if (typeof window === "undefined") return
    const mql = window.matchMedia(query)
    const onChange = () => setMatch(mql.matches)
    onChange()
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", onChange)
    } else if (typeof (mql as any).addListener === "function") {
      ;(mql as any).addListener(onChange)
    }
    return () => {
      if (typeof mql.removeEventListener === "function") {
        mql.removeEventListener("change", onChange)
      } else if (typeof (mql as any).removeListener === "function") {
        ;(mql as any).removeListener(onChange)
      }
    }
  }, [query])

  if (match === false) return null
  return <>{children}</>
}

export default ShowAt
