import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

import Spinner from "@/icons/spinner"

/**
 * Canonical variants (preferred):
 *   primary   → solid olive action (was "filled")
 *   secondary → pill/surface solid light (was "tonal")
 *   outline   → transparent + accent border
 *   ghost     → transparent, hover background
 *   link      → text-only, underline on hover (was "text")
 *   destructive → solid negative (unchanged)
 *
 * @deprecated Use canonical variants above. Aliases kept for backward compat:
 *   filled → primary
 *   tonal  → secondary
 *   text   → link
 */
type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "link"
  | "destructive"
  | "filled"
  | "tonal"
  | "text"

/**
 * Canonical sizes (preferred): xs / sm / md / lg / xl
 *
 * @deprecated Use canonical sizes above. Aliases kept for backward compat:
 *   small → sm
 *   large → lg
 */
type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl" | "small" | "large"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  "data-testid"?: string
}

const CANONICAL_VARIANT: Record<string, ButtonVariant> = {
  filled: "primary",
  tonal: "secondary",
  text: "link",
}

const CANONICAL_SIZE: Record<string, ButtonSize> = {
  small: "sm",
  large: "lg",
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className,
  leftIcon,
  rightIcon,
  "data-testid": dataTestId,
  ...props
}: ButtonProps) {
  const v: ButtonVariant = CANONICAL_VARIANT[variant] ?? variant
  const s: ButtonSize = CANONICAL_SIZE[size] ?? size

  const baseClasses = cn(
    "inline-flex items-center justify-center gap-2 button-text font-medium disabled:bg-disabled disabled:text-disabled disabled:cursor-not-allowed transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 select-none",
    "dark:bg-action-tertiary dark:hover:bg-action-tertiary-hover dark:active:bg-action-tertiary-pressed dark:disabled:bg-disabled"
  )

  const variantClasses: Record<Exclude<ButtonVariant, "filled" | "tonal" | "text">, string> = {
    primary: cn(
      "bg-action text-action-on-primary hover:bg-action-hover active:bg-action-pressed",
      loading && "button-text-filled"
    ),
    secondary:
      "bg-action-secondary hover:bg-action-secondary-hover active:bg-action-secondary-pressed text-action-on-secondary",
    outline:
      "border border-action bg-transparent text-action hover:bg-action-secondary/50 active:bg-action-secondary",
    ghost:
      "bg-transparent text-primary hover:bg-action-secondary active:bg-action-secondary-pressed",
    link: "bg-transparent hover:bg-transparent text-action underline-offset-4 hover:underline p-0 h-auto min-h-0 rounded-none",
    destructive: cn(
      "text-negative-on-primary bg-negative hover:bg-negative-hover active:bg-negative-pressed",
      loading && "button-text-filled"
    ),
  }

  const sizeClasses: Record<Exclude<ButtonSize, "small" | "large">, string> = {
    xs: "px-2 py-1 text-xs rounded-xs",
    sm: "px-[16px] py-[8px] text-sm rounded-sm",
    md: "px-[16px] py-[8px] text-md rounded-sm",
    lg: "px-[24px] py-[8px] text-md rounded-sm",
    xl: "px-[28px] py-[10px] text-[15px] rounded-sm",
  }

  const isLink = v === "link"
  const content = (
    <>
      {!loading && leftIcon ? <span className="shrink-0">{leftIcon}</span> : null}
      {loading ? <Spinner /> : children}
      {!loading && rightIcon ? <span className="shrink-0">{rightIcon}</span> : null}
    </>
  )

  return (
    <button
      disabled={disabled || loading}
      className={cn(
        !isLink && sizeClasses[s as Exclude<ButtonSize, "small" | "large">],
        variantClasses[v as Exclude<ButtonVariant, "filled" | "tonal" | "text">],
        baseClasses,
        className
      )}
      data-testid={dataTestId ?? `button-${v}-${s}`}
      {...props}
    >
      {content}
    </button>
  )
}
