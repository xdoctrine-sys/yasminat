import { cn } from '@/lib/utils';

import { LoaderIcon } from '@/icons';

/**
 * Canonical variants (preferred): primary | secondary | outline | ghost | icon
 *
 * @deprecated Use canonical variants above:
 *   filled → primary
 *   tonal  → secondary
 */
type IconButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "icon"
  | "filled"
  | "tonal";

/**
 * Canonical sizes (preferred): xs | sm | md | lg | xl
 *
 * @deprecated Use canonical sizes above:
 *   small → sm
 *   large  → lg
 */
type IconButtonSize = "xs" | "sm" | "md" | "lg" | "xl" | "small" | "large";

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  loading?: boolean;
  shape?: "square" | "pill";
  "data-testid"?: string;
}

const CANONICAL_VAR: Record<string, IconButtonVariant> = {
  filled: "primary",
  tonal: "secondary",
};

const CANONICAL_SIZE: Record<string, IconButtonSize> = {
  small: "sm",
  large: "lg",
};

export function IconButton({
  icon,
  variant = 'primary',
  size = 'sm',
  loading = false,
  shape = "square",
  className,
  "data-testid": dataTestId,
  ...props
}: IconButtonProps) {
  const v: IconButtonVariant = CANONICAL_VAR[variant] ?? variant;
  const s: IconButtonSize = CANONICAL_SIZE[size] ?? size;

  const variantClasses: Record<Exclude<IconButtonVariant, "filled" | "tonal">, string> = {
    primary: "bg-action text-action-on-primary hover:bg-action-hover active:bg-action-pressed disabled:bg-disabled",
    secondary: "bg-action-secondary hover:bg-action-secondary-hover active:bg-action-secondary-pressed text-secondary",
    outline: "border border-action bg-transparent text-action hover:bg-action-secondary/50 active:bg-action-secondary",
    ghost: "bg-transparent text-primary hover:bg-action-secondary active:bg-action-secondary-pressed",
    icon: "button-icon",
  };

  const sizeClasses: Record<Exclude<IconButtonSize, "small" | "large">, string> = {
    xs: "h-[32px] w-[32px]",
    sm: "h-[40px] w-[40px]",
    md: "h-[44px] w-[44px]",
    lg: "h-[48px] w-[48px]",
    xl: "h-[56px] w-[56px]",
  };

  return (
    <button
      className={cn(
        variantClasses[v as Exclude<IconButtonVariant, "filled" | "tonal">],
        sizeClasses[s as Exclude<IconButtonSize, "small" | "large">],
        "flex items-center justify-center transition-colors duration-150 ease-out disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 select-none shrink-0",
        shape === "pill" ? "rounded-full" : "rounded-sm",
        className
      )}
      data-testid={dataTestId ?? 'icon-button'}
      aria-label={props["aria-label"] ?? (typeof icon === "string" ? icon : undefined)}
      {...props}
    >
      {loading ? <LoaderIcon /> : icon}
    </button>
  );
}
