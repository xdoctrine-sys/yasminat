import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { HERO_BANNER_MODULE, validateHeroBannerPayload, getAllowedFileHosts, emitHeroImageStartupWarning } from "../../../../src/modules/hero-banners"
import { HeroBannerSlot } from "../../../../src/modules/hero-banners/models/hero-banner"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  emitHeroImageStartupWarning()
  const svc = req.scope.resolve(HERO_BANNER_MODULE) as any
  const q = (req.query || {}) as any
  const limit = Math.min(200, parseInt(q.limit || "50", 10))
  const offset = parseInt(q.offset || "0", 10)
  const where: any = {}
  if (q.slot) where.slot = q.slot
  if (q.id) where.id = q.id
  where.deleted_at = null as any
  const [rows, count] = await (svc.listAndCountHeroBanners ?? svc.listAndCount).call(svc, where, {
    order: { slot: "asc", rank: "asc", created_at: "desc" },
    skip: offset,
    take: limit,
  })
  const arr = Array.isArray(rows) ? rows : (rows?.rows ?? [])
  res.json({ rows: arr, count, limit, offset })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  emitHeroImageStartupWarning()
  const allowed = getAllowedFileHosts()
  const svc = req.scope.resolve(HERO_BANNER_MODULE) as any
  const body = (req.body || {}) as any

  if (body.__minpatch_debug === true) {
    const id = body?.id
    const rank = typeof body?.rank === "number" ? body.rank : 0
    if (!id) return res.status(422).json({ error: "id required" })
    try {
      const [rows] = await (svc.listAndCountHeroBanners ?? svc.listAndCount).call(svc, { id, deleted_at: null }, {})
      const arr = Array.isArray(rows) ? rows : (rows?.rows ?? [])
      const existing = arr.find((r: any) => r.id === id)
      if (!existing) return res.status(404).json({ error: "not found" })
      const updater: any[] = [{ id, rank }]
      const before = Date.now()
      let updated: any
      try {
        updated = await (svc.updateHeroBanners ?? svc.update).call(svc, updater)
      } catch (e: any) {
        return res.status(500).json({
          stage: "svc.updateHeroBanners threw",
          error_name: e?.name, error_msg: e?.message,
          error_stack_head: (e?.stack || "").split("\n").slice(0,5).join(" | "),
        })
      }
      const dur = Date.now() - before
      const [rows2] = await (svc.listAndCountHeroBanners ?? svc.listAndCount).call(svc, { id, deleted_at: null }, {})
      const arr2 = Array.isArray(rows2) ? rows2 : (rows2?.rows ?? [])
      const finalBanner = arr2.find((r: any) => r.id === id)
      return res.json({ ok: true, ms: dur, updated, final_rank: finalBanner?.rank })
    } catch (e: any) {
      return res.status(500).json({
        stage: "outer catch",
        error_name: e?.name, error_msg: e?.message,
        error_stack_head: (e?.stack || "").split("\n").slice(0,5).join(" | "),
      })
    }
  }

  if (body.__minpatch_debug_rank === true) {
    const id = body?.id
    const rank = typeof body?.rank === "number" ? body.rank : 0
    if (!id) return res.status(422).json({ error: "id required" })
    try {
      const [rows] = await (svc.listAndCountHeroBanners ?? svc.listAndCount).call(svc, { id, deleted_at: null }, {})
      const arr = Array.isArray(rows) ? rows : (rows?.rows ?? [])
      const existing = arr.find((r: any) => r.id === id)
      if (!existing) return res.status(404).json({ error: "not found" })
      ;(console as any).warn("[minpatch_debug_rank] calling svc.updateRank id="+id+" rank="+rank)
      let updated: any
      try {
        updated = typeof svc.updateRank === "function"
          ? await svc.updateRank(id, rank)
          : await (svc.updateHeroBanners ?? svc.update).call(svc, [{ id, rank }])
      } catch (e: any) {
        const detail = {
          stage: "svc.updateRank threw",
          error_name: e?.name, error_msg: e?.message,
          error_stack_head: (e?.stack || "").split("\n").slice(0, 6).join(" | "),
        }
        ;(console as any).error("[minpatch_debug_rank inner]", JSON.stringify(detail))
        return res.status(500).json(detail)
      }
      ;(console as any).warn("[minpatch_debug_rank] ok updated="+JSON.stringify(updated))
      const [rows2] = await (svc.listAndCountHeroBanners ?? svc.listAndCount).call(svc, { id, deleted_at: null }, {})
      const arr2 = Array.isArray(rows2) ? rows2 : (rows2?.rows ?? [])
      const finalBanner = arr2.find((r: any) => r.id === id)
      return res.json({ ok: true, updated, final_rank: finalBanner?.rank })
    } catch (e: any) {
      const detail = {
        stage: "outer minpatch_debug_rank",
        error_name: e?.name, error_msg: e?.message,
        error_stack_head: (e?.stack || "").split("\n").slice(0,6).join(" | "),
      }
      ;(console as any).error("[minpatch_debug_rank outer]", JSON.stringify(detail))
      return res.status(500).json(detail)
    }
  }

  const errs = validateHeroBannerPayload({ ...body, allowedFileDomains: allowed })
  if (Object.keys(errs).length) {
    return res.status(422).json({ errors: errs })
  }
  const payload: any = {
    slot: (body.slot ?? "main") as HeroBannerSlot,
    rank: typeof body.rank === "number" ? body.rank : 0,
    is_active: typeof body.is_active === "boolean" ? body.is_active : true,
    starts_at: body.starts_at ? new Date(body.starts_at).toISOString() : null,
    ends_at: body.ends_at ? new Date(body.ends_at).toISOString() : null,
    title_en: body.title_en ?? null,
    title_ar: body.title_ar ?? null,
    subtitle_en: body.subtitle_en ?? null,
    subtitle_ar: body.subtitle_ar ?? null,
    cta_label_en: body.cta_label_en ?? null,
    cta_label_ar: body.cta_label_ar ?? null,
    cta_link: body.cta_link ?? null,
    image_desktop: body.image_desktop,
    image_mobile: body.image_mobile ?? null,
    image_alt_en: (body.image_alt_en ?? "").trim(),
    image_alt_ar: body.image_alt_ar ?? null,
  }
  const [created] = await (svc.createHeroBanners ?? svc.create).call(svc, [payload])
  const id = created?.id ?? created
  const [rows] = await (svc.listAndCountHeroBanners ?? svc.listAndCount).call(svc, { id, deleted_at: null }, {})
  const arr = Array.isArray(rows) ? rows : (rows?.rows ?? [])
  const banner = arr.find((r: any) => r.id === id) ?? created
  res.status(201).json({ banner })
}
