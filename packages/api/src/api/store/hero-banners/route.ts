import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { HERO_BANNER_MODULE } from "../../../../src/modules/hero-banners"
import { HeroBannerSlot } from "../../../../src/modules/hero-banners/models/hero-banner"

const SLOTS: HeroBannerSlot[] = ["main", "side_top", "side_bottom"]

const publicBannerFields = (b: any) => ({
  id: b.id,
  slot: b.slot,
  title_en: b.title_en ?? null,
  title_ar: b.title_ar ?? null,
  subtitle_en: b.subtitle_en ?? null,
  subtitle_ar: b.subtitle_ar ?? null,
  cta_label_en: b.cta_label_en ?? null,
  cta_label_ar: b.cta_label_ar ?? null,
  cta_link: (/^\/(?!\/)[A-Za-z0-9/_\-#?%.=&+,]*$/.test(b.cta_link || "") || /^https:\/\/[^\s"'<>]+$/i.test(b.cta_link || "")) ? b.cta_link : null,
  image_desktop: b.image_desktop,
  image_mobile: b.image_mobile ?? null,
  image_alt_en: b.image_alt_en ?? "",
  image_alt_ar: b.image_alt_ar ?? null,
})

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  try {
    res.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300")
    const svc = _req.scope.resolve(HERO_BANNER_MODULE) as any
    const bySlot = await svc.listActiveForSlots(SLOTS)
    const out: Record<HeroBannerSlot, ReturnType<typeof publicBannerFields> | null> = {
      main: null,
      side_top: null,
      side_bottom: null,
    }
    for (const s of SLOTS) {
      const b = bySlot[s]
      out[s] = b ? publicBannerFields(b) : null
    }
    res.status(200).json({ slots: out, fetched_at: new Date().toISOString() })
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch hero banners", slots: { main: null, side_top: null, side_bottom: null } })
  }
}
