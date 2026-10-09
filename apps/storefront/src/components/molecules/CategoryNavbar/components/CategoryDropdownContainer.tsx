'use client'

import { type ReactNode, useCallback, useLayoutEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface CategoryDropdownContainerProps {
  children: ReactNode
  isVisible: boolean
  /** id de la catégorie (hoveredCategoryId); sert à retrouver l'ancre
   *  via [data-cat-trigger=id] pour positionner le panneau aligné à gauche. */
  categoryId: string | null
  /** ref vers le wrapper de panel (gestion outside clic / Escape). */
  panelWrapRef?: React.RefObject<HTMLDivElement | null>
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  /** Nombre de colonnes L2 (titres) — sert à dimensionner la largeur du
   *  panneau comme fnp.qa: ~200px par colonne. */
  columns?: number
}

/**
 * Panneau déroulant sous-catégories (style fnp.qa).
 * - Position FIXE par rapport au viewport (calculs en px viewport directs →
 *   pas de dépendance au stacking context d'un ancêtre relatif/overflow).
 * - Pont transparent de 4 px entre le trigger et le bord haut du panneau
 *   (pas de gap où la souris perdrait le hover en descendant en diagonale).
 * - Aligné à gauche de l'ancre (trigger [data-cat-trigger=categoryId]).
 *   S'il déborde à droite, on cale le bord droit au bord droit du viewport
 *   (marge de 8 px à gauche et à droite minimum).
 */
export const CategoryDropdownContainer = ({
  children,
  isVisible,
  categoryId,
  panelWrapRef,
  onMouseEnter,
  onMouseLeave,
  columns = 4,
}: CategoryDropdownContainerProps) => {
  const localRef = useRef<HTMLDivElement | null>(null)
  const setRefs = (el: HTMLDivElement | null) => {
    localRef.current = el
    if (panelWrapRef) {
      ;(panelWrapRef as React.MutableRefObject<HTMLDivElement | null>).current = el
    }
  }
  const [pos, setPos] = useState<{ left: number; top: number; width: number; bridge: number } | null>(null)
  const VIEWPORT_MARGIN = 8

  const calcPos = useCallback(
    (catId: string, cols: number): typeof pos => {
      const trigger = document.querySelector<HTMLElement>(`[data-cat-trigger="${catId}"]`)
      if (!trigger) return null
      const header =
        (trigger.closest('header') as HTMLElement | null) ||
        (document.querySelector('header[class*="sticky"]') as HTMLElement | null) ||
        null
      const tRect = trigger.getBoundingClientRect()
      const hBottom = header ? header.getBoundingClientRect().bottom : tRect.bottom
      const COL_W = 200
      const GAP_X = 24
      const PAD = 48
      const desiredWidth = Math.max(
        360,
        Math.min(1200, cols * COL_W + Math.max(0, cols - 1) * GAP_X + PAD)
      )
      const maxW = Math.min(Math.max(360, window.innerWidth - VIEWPORT_MARGIN * 2), 1280)
      const width = Math.min(desiredWidth, maxW)
      const minLeft = VIEWPORT_MARGIN
      const maxLeft = window.innerWidth - width - VIEWPORT_MARGIN
      const left = Math.max(minLeft, Math.min(maxLeft, tRect.left))
      const bridgePx = Math.max(0, Math.ceil(hBottom - tRect.bottom) + 1)
      return { left, top: tRect.bottom, width, bridge: bridgePx }
    },
    []
  )

  useLayoutEffect(() => {
    if (!isVisible || !categoryId) {
      setPos(null)
      return
    }
    const init = calcPos(categoryId, columns)
    if (init) setPos(init)
    const onWin = () => {
      const p = calcPos(categoryId, columns)
      if (p) setPos(p)
    }
    const t = window.setTimeout(onWin, 0)
    window.addEventListener("scroll", onWin, { passive: true })
    return () => {
      window.clearTimeout(t)
      window.removeEventListener("scroll", onWin)
    }
  }, [isVisible, categoryId, columns, calcPos])

  if (!isVisible && !pos) {
    return (
      <div
        ref={setRefs}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        hidden
      />
    )
  }

  return (
    <div
      ref={setRefs}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-hidden={!isVisible}
      className={cn(
        'fixed z-[70]',
        'transition-opacity duration-150 ease-out',
        isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      )}
      style={{
        left: pos?.left ?? 0,
        top: pos?.top ?? 0,
        width: pos?.width ?? 720,
      }}
    >
      {/* Pont transparent: hauteur = espace exact du trigger.bottom à header.bottom + 1 px */}
      <div style={{ height: pos?.bridge ?? 0 }} />
      <div
        className={cn(
          'bg-primary border border-primary rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)]',
          'transition-transform duration-150 ease-out',
          isVisible ? 'translate-y-0' : '-translate-y-1'
        )}
        data-testid="category-dropdown-visible"
      >
        {children}
      </div>
    </div>
  )
}
