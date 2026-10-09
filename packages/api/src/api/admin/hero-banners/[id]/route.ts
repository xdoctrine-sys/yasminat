import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { HERO_BANNER_MODULE, validateHeroBannerPayload, getAllowedFileHosts, emitHeroImageStartupWarning } from "../../../../../src/modules/hero-banners"

const findBannerById = async (svc: any, id: string): Promise<any | null> => {
  const [rows] = await (svc.listAndCountHeroBanners ?? svc.listAndCount).call(svc, { id, deleted_at: null }, {})
  const arr = Array.isArray(rows) ? rows : (rows?.rows ?? [])
  return arr.find((r: any) => r.id === id) ?? null
}

const normalizePatchValue = (k: string, v: any): any => {
  if ((k === "starts_at" || k === "ends_at")) {
    if (v === undefined || v === null) return null
    return new Date(v).toISOString()
  }
  if ((k === "image_alt_en" || k === "image_alt_ar") && typeof v === "string") return v.trim()
  return v
}

const callListHero = (svc: any, where: any, opts: any = {}) => {
  return (svc.listHeroBanners ?? svc.list).call(svc, where, opts)
}

const callUpdateHeroBanners = (svc: any, toUpdate: any[], sharedContext?: any) => {
  return (svc.updateHeroBanners ?? svc.update).call(svc, toUpdate, sharedContext)
}

const callSoftDelete = async (svc: any, ids: string[]): Promise<number> => {
  if (typeof svc.softDeleteByIds === "function") {
    return await svc.softDeleteByIds(ids)
  }
  const rowsRaw = await callListHero(svc, { id: { $in: ids }, deleted_at: null }, {}) as any
  const arr: any[] = Array.isArray(rowsRaw) ? rowsRaw : (rowsRaw?.rows ?? [])
  const now = new Date().toISOString()
  const toUpdate = arr.filter((r: any) => ids.includes(r.id)).map((r: any) => ({ id: r.id, deleted_at: now, updated_at: now }))
  if (toUpdate.length) await callUpdateHeroBanners(svc, toUpdate)
  return toUpdate.length
}

const callUpdateById = async (svc: any, id: string, patch: any): Promise<any> => {
  if (typeof svc.updateById === "function") {
    return await svc.updateById(id, patch)
  }
  return await callUpdateHeroBanners(svc, [{ id, ...patch }])
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  emitHeroImageStartupWarning()
  const svc = req.scope.resolve(HERO_BANNER_MODULE) as any
  const id = (req.params as any).id as string
  const banner = await findBannerById(svc, id)
  if (!banner) return res.status(404).json({ message: "Not found" })
  res.json({ banner })
}

export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
  emitHeroImageStartupWarning()
  const svc = req.scope.resolve(HERO_BANNER_MODULE) as any
  const id = (req.params as any).id as string
  const existing = await findBannerById(svc, id)
  if (!existing) return res.status(404).json({ message: "Not found" })
  const allowed = getAllowedFileHosts()
  const body = (req.body || {}) as any
  const merged: any = { ...existing }
  for (const k of Object.keys(body)) {
    if (body[k] !== undefined) merged[k] = body[k]
  }
  const errs = validateHeroBannerPayload({
    slot: merged.slot,
    rank: merged.rank,
    is_active: merged.is_active,
    starts_at: merged.starts_at,
    ends_at: merged.ends_at,
    title_en: merged.title_en,
    title_ar: merged.title_ar,
    subtitle_en: merged.subtitle_en,
    subtitle_ar: merged.subtitle_ar,
    cta_label_en: merged.cta_label_en,
    cta_label_ar: merged.cta_label_ar,
    cta_link: merged.cta_link,
    image_desktop: merged.image_desktop,
    image_mobile: merged.image_mobile,
    image_alt_en: merged.image_alt_en,
    image_alt_ar: merged.image_alt_ar,
    allowedFileDomains: allowed,
  })
  if (Object.keys(errs).length) {
    return res.status(422).json({ errors: errs })
  }
  const patch: any = {}
  for (const k of ["rank","is_active","starts_at","ends_at","title_en","title_ar","subtitle_en","subtitle_ar","cta_label_en","cta_label_ar","cta_link","image_desktop","image_mobile","image_alt_en","image_alt_ar","slot"]) {
    if (body[k] !== undefined) patch[k] = normalizePatchValue(k, body[k])
  }
  if (Object.keys(patch).length > 0) {
    await callUpdateById(svc, id, patch)
  }
  const updated = await findBannerById(svc, id)
  res.json({ banner: updated })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve(HERO_BANNER_MODULE) as any
  const id = (req.params as any).id as string
  const existing = await findBannerById(svc, id)
  if (!existing) return res.status(404).json({ ok: false, message: "Not found" })
  const n = await callSoftDelete(svc, [id])
  res.status(200).json({ ok: true, deleted: id, count: n })
}
