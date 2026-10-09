import { model } from "@medusajs/framework/utils"

export type HeroBannerSlot = "main" | "side_top" | "side_bottom"

export const HeroBanner = model.define("hero_banner", {
  id: model.id({ prefix: "hban" }).primaryKey(),

  slot: model.enum(["main", "side_top", "side_bottom"] as HeroBannerSlot[]),
  rank: model.number().default(0),

  is_active: model.boolean().default(true),
  starts_at: model.dateTime().nullable(),
  ends_at: model.dateTime().nullable(),

  title_en: model.text().nullable(),
  title_ar: model.text().nullable(),

  subtitle_en: model.text().nullable(),
  subtitle_ar: model.text().nullable(),

  cta_label_en: model.text().nullable(),
  cta_label_ar: model.text().nullable(),
  cta_link: model.text().nullable(),

  image_desktop: model.text(),
  image_mobile: model.text().nullable(),

  image_alt_en: model.text(),
  image_alt_ar: model.text().nullable(),
})
