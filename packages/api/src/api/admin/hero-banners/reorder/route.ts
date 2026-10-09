import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { HERO_BANNER_MODULE } from "../../../../../src/modules/hero-banners"
import { HeroBannerSlot } from "../../../../../src/modules/hero-banners/models/hero-banner"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve(HERO_BANNER_MODULE) as any
  const body = (req.body || {}) as any
  const cleanSlot = body.slot as HeroBannerSlot
  const cleanOrder = body.ordered_ids as string[]
  if (!cleanSlot || !["main","side_top","side_bottom"].includes(cleanSlot)) {
    return res.status(422).json({ errors: { slot: "Required, one of main/side_top/side_bottom (hint: field is `slot` plus `ordered_ids` string array)" } })
  }
  if (!Array.isArray(cleanOrder) || cleanOrder.some((x: any) => typeof x !== "string")) {
    return res.status(422).json({ errors: { ordered_ids: "Required JSON array of string ids (field name: ordered_ids)" } })
  }
  const updated = await svc.reorderSlot(cleanSlot, cleanOrder)
  return res.status(200).json({ ok: true, updated })
}
