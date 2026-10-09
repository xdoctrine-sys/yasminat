import Image from "next/image"

import { Button } from "@/components/atoms/Button/Button"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { ArrowRightIcon } from "@/icons"
import {
  fetchHeroBanners,
  type HeroBannerSlot,
  type PublicBanner,
} from "@/lib/data/hero-banners"

function getLocalizedText(bilingual: { en: string | null; ar: string | null }): string {
  const { en, ar } = bilingual
  if (typeof en === "string" && en.trim().length > 0) return en.trim()
  if (typeof ar === "string" && ar.trim().length > 0) return ar.trim()
  return ""
}

const isExternalHttps = (href: string | null): href is string =>
  typeof href === "string" && /^https:\/\/[^\s"'<>]+$/i.test(href)

const isInternalPath = (href: string | null): href is string =>
  typeof href === "string" && /^\/(?!\/)[A-Za-z0-9/_\-#?%.=&+,]*$/.test(href)

type BlockProps = {
  banner: PublicBanner
  priority?: boolean
  sizes: string
  ratioClass: string
  fillHeight?: boolean
  labelSize?: "lg" | "sm"
}

function HeroBlock({
  banner,
  priority = false,
  sizes,
  ratioClass,
  fillHeight = false,
  labelSize = "lg",
}: BlockProps) {
  const isMain = labelSize === "lg"

  const title = getLocalizedText({ en: banner.title_en, ar: banner.title_ar })
  const subtitle = getLocalizedText({ en: banner.subtitle_en, ar: banner.subtitle_ar })
  const alt =
    getLocalizedText({ en: banner.image_alt_en, ar: banner.image_alt_ar }) ||
    "Homepage banner"
  const ctaLabel = getLocalizedText({ en: banner.cta_label_en, ar: banner.cta_label_ar })
  const ctaLink = banner.cta_link
  const showButton = ctaLabel.length > 0 && (isInternalPath(ctaLink) || isExternalHttps(ctaLink))

  const containerBase = [
    "relative w-full overflow-hidden rounded-lg bg-neutral-100",
    ratioClass,
    fillHeight ? "h-full" : "",
  ].join(" ")

  return (
    <div className={containerBase}>
      <Image
        src={banner.image_desktop}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover hidden md:block"
        quality={80}
      />
      <Image
        src={banner.image_mobile && banner.image_mobile.trim().length > 0 ? banner.image_mobile : banner.image_desktop}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover md:hidden"
        quality={80}
      />

      {title ? (
        <h2 className="sr-only">{title}</h2>
      ) : null}
      {subtitle ? (
        <p className="sr-only">{subtitle}</p>
      ) : null}

      {showButton ? (
        <div
          className={[
            "pointer-events-auto absolute",
            isMain ? "start-4 bottom-4 sm:start-5 sm:bottom-5 md:start-6 md:bottom-6 lg:start-8 lg:bottom-8" : "start-3 bottom-3 sm:start-4 sm:bottom-4 md:start-5 md:bottom-5 lg:start-6 lg:bottom-6",
          ].join(" ")}
        >
          {isInternalPath(ctaLink) ? (
            <LocalizedClientLink
              href={ctaLink}
              className="inline-flex"
              aria-label={ctaLabel}
            >
              <Button
                variant="primary"
                size={isMain ? "md" : "sm"}
                className={[
                  "rounded-full shadow-sm whitespace-nowrap",
                  isMain ? "h-10 sm:h-10 lg:h-12 text-sm lg:text-md" : "h-8 sm:h-8 lg:h-10 text-xs lg:text-sm",
                ].join(" ")}
                rightIcon={<ArrowRightIcon className={isMain ? "h-4 w-4 lg:h-5 lg:w-5" : "h-3 w-3 lg:h-3.5 lg:w-3.5"} />}
              >
                {ctaLabel}
              </Button>
            </LocalizedClientLink>
          ) : (
            <a
              href={ctaLink as string}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
              aria-label={ctaLabel}
            >
              <Button
                variant="primary"
                size={isMain ? "md" : "sm"}
                className={[
                  "rounded-full shadow-sm whitespace-nowrap",
                  isMain ? "h-10 sm:h-10 lg:h-12 text-sm lg:text-md" : "h-8 sm:h-8 lg:h-10 text-xs lg:text-sm",
                ].join(" ")}
                rightIcon={<ArrowRightIcon className={isMain ? "h-4 w-4 lg:h-5 lg:w-5" : "h-3 w-3 lg:h-3.5 lg:w-3.5"} />}
              >
                {ctaLabel}
              </Button>
            </a>
          )}
        </div>
      ) : null}
    </div>
  )
}

type HeroSectionProps = {
  locale?: string
}

export async function HeroSection({}: HeroSectionProps = {}) {
  const slots = await fetchHeroBanners()
  const main = slots.main
  const sideTop = slots.side_top
  const sideBottom = slots.side_bottom
  const sideCards = [sideTop, sideBottom].filter(
    (b): b is PublicBanner => b !== null
  )

  if (!main && sideCards.length === 0) {
    return null
  }

  const hasMain = !!main
  const hasSides = sideCards.length > 0

  const mainSizes = "(min-width: 768px) 70vw, 100vw"
  const mainRatio = "aspect-[23/10]"
  const sideSizes = "(min-width: 768px) 30vw, 100vw"
  const sideRatioMobile = "aspect-[2001/972]"
  const wrapperGap = "gap-6"
  const sideGapDesktop = "md:gap-6"
  const sideGapMobile = ""

  if (hasMain && !hasSides) {
    return (
      <section className="relative z-0 w-full px-4 pt-5 md:px-5 lg:px-8" aria-label="Homepage banners">
        <div className="w-full">
          <HeroBlock
            banner={main as PublicBanner}
            priority
            sizes={mainSizes}
            ratioClass={mainRatio}
            labelSize="lg"
          />
        </div>
      </section>
    )
  }

  if (!hasMain && hasSides) {
    return (
      <section className="relative z-0 w-full px-4 pt-5 md:px-5 lg:px-8" aria-label="Homepage banners">
        <div
          className={[
            "grid w-full",
            sideCards.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2",
            wrapperGap,
          ].join(" ")}
        >
          {sideCards.map((b, i) => (
            <HeroBlock
              key={b.id}
              banner={b}
              priority={false}
              sizes={sideSizes}
              ratioClass={sideRatioMobile}
              labelSize="sm"
            />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="relative z-0 w-full px-4 pt-5 md:px-5 lg:px-8" aria-label="Homepage banners">
      <div
        className={[
          "grid w-full grid-cols-1 md:items-stretch",
          "md:grid-cols-10",
          wrapperGap,
        ].join(" ")}
      >
        <div className="md:col-span-7">
          <HeroBlock
            banner={main as PublicBanner}
            priority
            sizes={mainSizes}
            ratioClass={mainRatio}
            labelSize="lg"
          />
        </div>
        <div className="md:col-span-3 md:relative">
          <div
            className={[
              "grid grid-cols-1",
              wrapperGap,
              "md:absolute md:inset-0 md:grid-rows-2",
              sideGapDesktop,
            ].join(" ")}
          >
            {sideTop ? (
              <HeroBlock
                banner={sideTop}
                priority
                sizes={sideSizes}
                ratioClass={sideRatioMobile}
                fillHeight
                labelSize="sm"
              />
            ) : (
              <div className={["w-full bg-transparent", sideRatioMobile, "md:h-full"].join(" ")} aria-hidden />
            )}
            {sideBottom ? (
              <HeroBlock
                banner={sideBottom}
                priority={false}
                sizes={sideSizes}
                ratioClass={sideRatioMobile}
                fillHeight
                labelSize="sm"
              />
            ) : (
              <div className={["w-full bg-transparent", sideRatioMobile, "md:h-full"].join(" ")} aria-hidden />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
