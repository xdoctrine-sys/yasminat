import Image from "next/image"
import { Suspense } from "react"
import { CloseIcon } from "@/icons"
import { HttpTypes } from "@medusajs/types"

import { CartDropdown, MobileNavbar } from "@/components/cells"
import { UserDropdown } from "@/components/cells/UserDropdown/UserDropdown"
import {
  CategoryNavbar,
  NavbarSearch,
} from "@/components/molecules"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { listCategories } from "@/lib/data/categories"
import { retrieveCustomer } from "@/lib/data/customer"
import { cn } from "@/lib/utils"
import { Badge, IconButton, ShowAt } from "@/components/atoms"

/* =========================================================================
   TEXTES STATIQUES DU HEADER — REGROUPÉS POUR FUTURE I18N REACT-I18NEXT.
   Toute string "visible" du composant vit ici. Ne pas disperser de texte
   en dur dans le JSX (sauf commentaires).
   ======================================================================= */

const HEADER_TEXTS = {
  /** Alt du logo (avec interpolation SITE_NAME côté rendu). */
  logoAltSuffix: "logo",
  /** Label aria du bouton fermer la bannière PWA (jamais rendu tant que PWA_* absents). */
  pwaCloseAria: "Close the app install banner",
  /** Aria label fallback du conteneur panier + user skeleton. */
  cartSkeletonAriaHidden: true,
  /** Aria label du header lui-même. */
  headerMainAria: "Main navigation header",
  /** (future) Texte par défaut de la bannière PWA, SI on n'a PAS NEXT_PUBLIC_PWA_BANNER_TEXT. */
  pwaBannerDefault: "Download our mobile app",
  /** Label des boutons app store (jamais rendu tant que PWA_* absents). */
  pwaAppStore: "App Store",
  pwaPlayStore: "Play Store",
  /** data-testid utilisés pour les captures + e2e — pas des textes visibles. */
  testIds: {
    header: "header",
    pwaBanner: "pwa-install-banner",
    mobileTop: "header-mobile-top",
    mobileLogoLink: "header-logo-link-mobile",
    mobileSearch: "header-mobile-search",
    mobilePills: "header-mobile-pills",
    desktopTop: "header-desktop-top",
    desktopLogoLink: "header-logo-link",
    desktopNav: "header-desktop-nav",
  },
} as const

/* =========================================================================
   ENV / CONSTANTES GLOBALES — JAMAIS DE VALEURS INVENTÉES.
   ======================================================================= */

const PWA_APP_STORE = process.env.NEXT_PUBLIC_PWA_APP_STORE_URL
const PWA_PLAY_STORE = process.env.NEXT_PUBLIC_PWA_PLAY_STORE_URL
const SHOW_PWA_BANNER = Boolean(PWA_APP_STORE && PWA_PLAY_STORE)
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Yasminat"

/* =========================================================================
   EXPORTS — Header SERVER Component async.
   MARCHÉ UNIQUE (Qatar, QAR) : pas de CountrySelector / CurrencySwitcher.
   listRegions() N'EST PLUS APPELÉ. Le segment /[locale] reste requis par le
   middleware global (hors header).
   ======================================================================= */

export const Header = async () => {
  const [{ categories, parentCategories }, user] = await Promise.all([
    listCategories({
      query: { include_ancestors_tree: true, include_descendants_tree: true },
    }) as Promise<{
      categories: HttpTypes.StoreProductCategory[]
      parentCategories: HttpTypes.StoreProductCategory[]
    }>,
    retrieveCustomer().catch(() => null),
  ])

  const isLoggedIn = Boolean(user)

  // Pool de noms utilisés pour faire tourner le placeholder de la search bar
  // (100% backend réel, aucune string hardcodée).
  const placeholderCategoryNames: string[] = [...parentCategories, ...categories]
    .map((c) => (c?.name || "").trim())
    .filter(Boolean)
    .slice(0, 16)

  // -----------------------------------------------------------------------
  // RENDU — UN SEUL BLOC VISUEL (A) : AUCUNE bordure interne entre la
  // rangée du haut et la rangée catégories. SEULEMENT border-bottom token
  // `border-secondary` sur le <header> racine pour séparer du contenu page.
  // -----------------------------------------------------------------------
  return (
    <header
      data-testid={HEADER_TEXTS.testIds.header}
      className={cn(
        "sticky top-0 z-30 bg-primary border-b border-primary"
      )}
      aria-label={HEADER_TEXTS.headerMainAria}
    >
      {/* --- PWA install banner (only if REAL app URLs configured) -------- */}
      {SHOW_PWA_BANNER && <PwaInstallBanner />}

      {/* --- Mobile top row (< md) ---------------------------------------- */}
      <div
        className={cn(
          "md:hidden flex items-center gap-2 px-4 py-3"
        )}
        data-testid={HEADER_TEXTS.testIds.mobileTop}
      >
        <ShowAt maxWidth={767.98}>
          <MobileNavbar parentCategories={parentCategories} categories={categories} />
        </ShowAt>
        <LocalizedClientLink
          href="/"
          className="mx-auto flex items-center"
          data-testid={HEADER_TEXTS.testIds.mobileLogoLink}
        >
          <Image
            src="/Logo.svg"
            width={110}
            height={34}
            alt={`${SITE_NAME} ${HEADER_TEXTS.logoAltSuffix}`}
            priority
            className="h-auto w-auto"
          />
        </LocalizedClientLink>
        <div className="flex items-center gap-1">
          <ShowAt maxWidth={767.98}>
            <UserDropdown isLoggedIn={isLoggedIn} />
            <Suspense fallback={<CartSkeletonBadge />}>
              <CartDropdown />
            </Suspense>
          </ShowAt>
        </div>
      </div>

      {/* --- Mobile second row: search full width (< md) ------------------ */}
      <div
        className="md:hidden px-4 pb-3"
        data-testid={HEADER_TEXTS.testIds.mobileSearch}
      >
        <ShowAt maxWidth={767.98}>
          <NavbarSearch
            placeholderCategoryNames={placeholderCategoryNames}
            placeholderIntervalMs={3500}
          />
        </ShowAt>
      </div>

      {/* --- Mobile pills row: horizontal category image tiles (< md) ----- */}
      <MobileCategoryPills parentCategories={parentCategories} categories={categories} />

      {/* --- Tablet/Desktop content wrapper — ALIGNÉ avec le container global du site
             (px-4 md:px-5 lg:px-8). Contient RANGÉE HAUT + RANGÉE CATÉGORIES =
             UN SEUL BLOC VISUEL sans bordure interne. --------------------------- */}
      <div className="hidden md:block px-5 lg:px-8">
        {/* --- Rangée haut (logo + search + actions) ----------------------- */}
        <div
          className="py-3"
          data-testid={HEADER_TEXTS.testIds.desktopTop}
        >
          <div className="flex items-center gap-3 lg:gap-4">
            {/* Logo — gauche */}
            <LocalizedClientLink
              href="/"
              className="flex items-center shrink-0 me-2 lg:me-4"
              data-testid={HEADER_TEXTS.testIds.desktopLogoLink}
            >
              <Image
                src="/Logo.svg"
                width={136}
                height={44}
                alt={`${SITE_NAME} logo`}
                priority
                className="h-auto w-auto"
              />
            </LocalizedClientLink>

            {/* Main search bar — large (flex-1), proportions proches fnp.qa */}
            <div className="flex-1 min-w-0 max-w-[820px]">
              <ShowAt minWidth={768}>
                <NavbarSearch
                  placeholderCategoryNames={placeholderCategoryNames}
                  placeholderIntervalMs={3500}
                />
              </ShowAt>
            </div>

            {/* Cart + User — droite */}
            <div className="flex items-center gap-1 lg:gap-2 ms-auto shrink-0">
              <ShowAt minWidth={768}>
                <UserDropdown isLoggedIn={isLoggedIn} />
                <Suspense fallback={<CartSkeletonBadge />}>
                  <CartDropdown />
                </Suspense>
              </ShowAt>
            </div>
          </div>
        </div>

        {/* --- Rangée catégories — AUCUNE bordure interne, juste moins de padding vertical ---
               Overflow ResizeObserver dynamique "More ▾". ------------------------------ */}
        <div
          className="pb-3 pt-1"
          data-testid={HEADER_TEXTS.testIds.desktopNav}
        >
          <ShowAt minWidth={768}>
            <CategoryNavbar
              categories={categories}
              parentCategories={parentCategories}
              showParentCategories
            />
          </ShowAt>
        </div>
      </div>
    </header>
  )
}

export default Header

/* =========================================================================
   Sous-composants locaux — 100% côté Header (Server comp ok, 0 nouveau fichier)
   ======================================================================= */

function PwaInstallBanner() {
  // Jamais affiché tant que NEXT_PUBLIC_PWA_APP_STORE_URL ET NEXT_PUBLIC_PWA_PLAY_STORE_URL
  // ne sont pas fournis EN MÊME TEMPS (pas d'app inventée).
  return (
    <div
      className="bg-action text-action-on-primary text-xs md:text-sm border-b border-action/20"
      data-testid={HEADER_TEXTS.testIds.pwaBanner}
    >
      <div className="flex items-center gap-3 px-4 md:px-5 lg:px-8 py-2">
        <span className="truncate">
          {process.env.NEXT_PUBLIC_PWA_BANNER_TEXT || HEADER_TEXTS.pwaBannerDefault}
        </span>
        <div className="flex items-center gap-2 ms-auto shrink-0">
          {PWA_APP_STORE && (
            <a
              href={PWA_APP_STORE}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 rounded-full bg-action-on-primary/15 hover:bg-action-on-primary/25 font-semibold"
            >
              {HEADER_TEXTS.pwaAppStore}
            </a>
          )}
          {PWA_PLAY_STORE && (
            <a
              href={PWA_PLAY_STORE}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 rounded-full bg-action-on-primary/15 hover:bg-action-on-primary/25 font-semibold"
            >
              {HEADER_TEXTS.pwaPlayStore}
            </a>
          )}
          <IconButton
            icon={<CloseIcon size={16} />}
            variant="ghost"
            size="xs"
            shape="pill"
            aria-label={HEADER_TEXTS.pwaCloseAria}
            onClick={() => {}}
            className="text-action-on-primary hover:bg-action-on-primary/15"
          />
        </div>
      </div>
    </div>
  )
}

function CartSkeletonBadge() {
  return (
    <div
      className="relative h-10 w-10 animate-pulse rounded-full bg-surface-pill"
      aria-hidden={HEADER_TEXTS.cartSkeletonAriaHidden}
    >
      <Badge className="absolute -top-1 -end-1 opacity-0 h-4 w-4 p-0 text-[10px]">0</Badge>
    </div>
  )
}

/**
 * Mobile horizontal pills: category tiles with metadata thumbnail.
 * Scroll horizontal, AUCUN placeholder inventé.
 */
function MobileCategoryPills({
  parentCategories,
  categories,
}: {
  parentCategories: HttpTypes.StoreProductCategory[]
  categories: HttpTypes.StoreProductCategory[]
}) {
  const tiles = [...parentCategories, ...categories].filter(
    (c): c is HttpTypes.StoreProductCategory & { handle: string; name: string } =>
      Boolean(c && c.handle && c.name)
  )

  if (tiles.length === 0) return null

  return (
    <div
      className="md:hidden overflow-x-auto no-scrollbar border-t border-border bg-primary"
      data-testid={HEADER_TEXTS.testIds.mobilePills}
    >
      <div className="flex items-start gap-3 px-4 py-3 min-w-0">
        {tiles.map((c) => {
          const thumb = (c.metadata as any)?.thumbnail || (c.metadata as any)?.image
          const safeThumb = typeof thumb === "string" ? thumb : null
          return (
            <LocalizedClientLink
              key={c.id}
              href={`/categories/${c.handle}`}
              className="shrink-0 flex flex-col items-center gap-1.5 w-[72px]"
            >
              <span
                className={cn(
                  "h-[64px] w-[64px] shrink-0 rounded-full overflow-hidden border border-surface-pill bg-surface-pill",
                  "flex items-center justify-center"
                )}
              >
                {safeThumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={safeThumb}
                    alt={c.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-[10px] leading-tight uppercase text-center px-1 text-secondary font-semibold">
                    {c.name}
                  </span>
                )}
              </span>
              <span className="text-[11px] leading-tight text-primary text-center line-clamp-2 font-medium">
                {c.name}
              </span>
            </LocalizedClientLink>
          )
        })}
      </div>
    </div>
  )
}
