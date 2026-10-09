import { useCallback, useEffect, useRef, useState } from "react"

const OPEN_DELAY_MS = 220
const CLOSE_DELAY_MS = 160
const IMMEDIATE = 0

export const useCategoryDropdown = () => {
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null)
  const [isDropdownVisible, setIsDropdownVisible] = useState(false)
  const [shouldRenderDropdown, setShouldRenderDropdown] = useState(false)
  const [activeTriggerId, setActiveTriggerId] = useState<string | null>(null)

  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const panelWrapRef = useRef<HTMLDivElement | null>(null)

  const clearTimers = useCallback(() => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current)
      openTimerRef.current = null
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  const showNow = useCallback((categoryId: string) => {
    clearTimers()
    setHoveredCategoryId(categoryId)
    setShouldRenderDropdown(true)
    // Next frame so display transition triggers properly
    requestAnimationFrame(() => setIsDropdownVisible(true))
  }, [clearTimers])

  const openDropdown = useCallback(
    (categoryId: string, { immediate = false, triggerId = null as string | null } = {}) => {
      clearTimers()
      setActiveTriggerId(triggerId || categoryId)
      if (immediate) {
        showNow(categoryId)
        return () => {}
      }
      setHoveredCategoryId(categoryId)
      setShouldRenderDropdown(true)
      openTimerRef.current = setTimeout(() => setIsDropdownVisible(true), OPEN_DELAY_MS)
      return () => {
        if (openTimerRef.current) {
          clearTimeout(openTimerRef.current)
          openTimerRef.current = null
        }
      }
    },
    [clearTimers, showNow]
  )

  const scheduleClose = useCallback(
    ({ delay }: { delay?: number } = {}) => {
      clearTimers()
      const useDelay = typeof delay === "number" ? delay : CLOSE_DELAY_MS
      setIsDropdownVisible(false)
      closeTimerRef.current = setTimeout(() => {
        setShouldRenderDropdown(false)
        setHoveredCategoryId(null)
      }, useDelay)
    },
    [clearTimers]
  )

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
      // Make sure panel stays visible if was scheduled to hide
      if (hoveredCategoryId) {
        setIsDropdownVisible(true)
        setShouldRenderDropdown(true)
      }
    }
  }, [hoveredCategoryId])

  const closeDropdown = useCallback(() => {
    clearTimers()
    setIsDropdownVisible(false)
    setShouldRenderDropdown(false)
    setHoveredCategoryId(null)
  }, [clearTimers])

  // Return focus to the category link trigger (e.g. Escape pressed)
  const returnFocusToTrigger = useCallback(() => {
    if (!activeTriggerId) return
    const id = String(activeTriggerId)
    const el =
      document.querySelector<HTMLElement>(`[data-cat-trigger="${id}"]`) ||
      document.getElementById(`cat-trigger-${id}`)
    if (el && typeof el.focus === "function") {
      el.focus({ preventScroll: true })
    }
  }, [activeTriggerId])

  // Cleanup timers on unmount
  useEffect(() => () => clearTimers(), [clearTimers])

  // If no category is hovered anymore, ensure dropdown closes
  useEffect(() => {
    if (!hoveredCategoryId && shouldRenderDropdown) {
      scheduleClose({ delay: IMMEDIATE })
    }
  }, [hoveredCategoryId, shouldRenderDropdown, scheduleClose])

  // Close on scroll (global page) + window resize + Escape key + outside mousedown click
  useEffect(() => {
    if (!shouldRenderDropdown) return

    const handleScroll = () => closeDropdown()
    const handleResize = () => closeDropdown()
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeDropdown()
        returnFocusToTrigger()
      }
    }
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node | null
      if (!target) return
      // Click inside the category nav links (triggers) is handled by onMouse/onClick handlers
      // and the panel itself. If neither, dismiss.
      const panel = panelWrapRef.current
      const triggers = document.querySelectorAll("[data-cat-trigger]")
      let insideTrigger = false
      triggers.forEach((t) => {
        if (t.contains(target)) insideTrigger = true
      })
      const insidePanel = panel ? panel.contains(target) : false
      const insideMore = document.querySelector('[data-testid="category-navbar-more"]')?.contains(target)
      if (!insideTrigger && !insidePanel && !insideMore) {
        closeDropdown()
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", handleResize, { passive: true })
    window.addEventListener("keydown", handleKey)
    document.addEventListener("mousedown", handleMouseDown)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("keydown", handleKey)
      document.removeEventListener("mousedown", handleMouseDown)
    }
  }, [shouldRenderDropdown, closeDropdown, returnFocusToTrigger])

  return {
    hoveredCategoryId,
    isDropdownVisible,
    shouldRenderDropdown,
    openDropdown,
    closeDropdown,
    scheduleClose,
    cancelClose,
    setHoveredCategoryId,
    returnFocusToTrigger,
    activeTriggerId,
    panelWrapRef,
  }
}
