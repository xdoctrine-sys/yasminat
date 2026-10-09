import { MedusaService } from "@medusajs/framework/utils"
import { HeroBanner, HeroBannerSlot } from "./models"
import { Context } from "@medusajs/framework/types"

export function getAllowedFileHosts(): string[] {
  const out: string[] = []
  const addHost = (h: string | null | undefined) => {
    if (h && typeof h === "string" && h.length > 0) out.push(h)
  }
  const backendUrl = process.env.PUBLIC_MEDUSA_BACKEND_URL || process.env.MEDUSA_BACKEND_URL
  const backendHost: string | null = (() => {
    try { return backendUrl ? new URL(backendUrl).hostname : null } catch { return null }
  })()
  const backendIsLocal = backendHost === "127.0.0.1" || backendHost === "localhost"
  const isProdStrict = process.env.NODE_ENV === "production"

  if (!isProdStrict || backendIsLocal) {
    out.push("127.0.0.1", "localhost")
  }
  const fbu = process.env.FILE_BACKEND_URL
  if (fbu) { try { addHost(new URL(fbu).hostname) } catch {} }
  if (backendHost) addHost(backendHost)
  const pubOverride = process.env.PUBLIC_MEDUSA_BACKEND_URL
  if (pubOverride && pubOverride !== backendUrl) {
    try { addHost(new URL(pubOverride).hostname) } catch {}
  }
  return Array.from(new Set(out))
}

let _startupWarned = false
export function emitHeroImageStartupWarning(): void {
  if (_startupWarned) return
  _startupWarned = true
  const allowed = getAllowedFileHosts()
  const onlyLocalDev =
    process.env.NODE_ENV !== "production" &&
    allowed.every((h) => h === "localhost" || h === "127.0.0.1")
  const emptyInProd = process.env.NODE_ENV === "production" && allowed.length === 0
  if (onlyLocalDev || emptyInProd) {
    const prod = process.env.NODE_ENV === "production" ? "PRODUCTION " : ""
    console.warn(
      `[hero-banners] ${prod}WARNING: allowedFileDomains for hero banner image URLs = [${allowed.join(", ")}]. ` +
      `Remote image uploads will be rejected with HTTP 422. ` +
      `Set FILE_BACKEND_URL=https://<your-file-cdn> AND PUBLIC_MEDUSA_BACKEND_URL=https://<backend-host> env vars ` +
      `so your file storage hostname (S3/R2 bucket etc.) is included in the allowed list.`
    )
  }
}

export type HeroBannerDTO = {
  id: string
  slot: HeroBannerSlot
  rank: number
  is_active: boolean
  starts_at: Date | string | null
  ends_at: Date | string | null
  title_en: string | null
  title_ar: string | null
  subtitle_en: string | null
  subtitle_ar: string | null
  cta_label_en: string | null
  cta_label_ar: string | null
  cta_link: string | null
  image_desktop: string
  image_mobile: string | null
  image_alt_en: string
  image_alt_ar: string | null
  created_at: Date | string
  updated_at: Date | string
  deleted_at?: Date | string | null
}

const INTERNAL_LINK_RE = /^\/(?!\/)[A-Za-z0-9/_\-#?%.=&+,]*$/
const EXTERNAL_HTTPS_RE = /^https:\/\/[^\s"'<>]+$/i

export function validateHeroBannerPayload(payload: {
  slot?: HeroBannerSlot
  rank?: number
  is_active?: boolean
  starts_at?: string | null
  ends_at?: string | null
  title_en?: string | null
  title_ar?: string | null
  subtitle_en?: string | null
  subtitle_ar?: string | null
  cta_label_en?: string | null
  cta_label_ar?: string | null
  cta_link?: string | null
  image_desktop?: string
  image_mobile?: string | null
  image_alt_en?: string
  image_alt_ar?: string | null
  allowedFileDomains?: string[]
}): Record<string, string> {
  const errors: Record<string, string> = {}

  if (payload.slot && !["main", "side_top", "side_bottom"].includes(payload.slot)) {
    errors.slot = "Invalid slot, must be main, side_top or side_bottom"
  }
  if (typeof payload.rank === "number" && (payload.rank < 0 || !Number.isInteger(payload.rank))) {
    errors.rank = "rank must be a non-negative integer"
  }
  if (payload.starts_at !== undefined && payload.starts_at !== null) {
    const d = new Date(payload.starts_at)
    if (Number.isNaN(d.getTime())) errors.starts_at = "Invalid starts_at date"
  }
  if (payload.ends_at !== undefined && payload.ends_at !== null) {
    const d = new Date(payload.ends_at)
    if (Number.isNaN(d.getTime())) errors.ends_at = "Invalid ends_at date"
  }
  if (
    (payload.starts_at !== undefined || payload.ends_at !== undefined) &&
    payload.starts_at && payload.ends_at
  ) {
    const s = new Date(payload.starts_at).getTime()
    const e = new Date(payload.ends_at).getTime()
    if (!Number.isNaN(s) && !Number.isNaN(e) && e <= s) {
      errors.ends_at = "ends_at must be strictly after starts_at"
    }
  }
  const hasCtaLabel =
    (typeof payload.cta_label_en === "string" && payload.cta_label_en.trim().length > 0) ||
    (typeof payload.cta_label_ar === "string" && payload.cta_label_ar.trim().length > 0)
  if (hasCtaLabel && !payload.cta_link) {
    errors.cta_link = "cta_link is required when a cta_label is provided"
  }
  if (payload.cta_link) {
    const ok = INTERNAL_LINK_RE.test(payload.cta_link) || EXTERNAL_HTTPS_RE.test(payload.cta_link)
    if (!ok) {
      errors.cta_link = "cta_link must be an internal path starting with single '/' or https:// URL"
    }
    if (/^javascript:|^data:|^vbscript:|^mailto:|^tel:/i.test(payload.cta_link)) {
      errors.cta_link = "cta_link scheme is forbidden"
    }
  }
  if (typeof payload.image_desktop === "string") {
    if (!payload.image_desktop.length) {
      errors.image_desktop = "image_desktop is required"
    } else {
      let domain: string | null = null
      try { domain = new URL(payload.image_desktop).hostname } catch { domain = null }
      if (domain && payload.allowedFileDomains?.length && !payload.allowedFileDomains.includes(domain)) {
        errors.image_desktop =
          `image_desktop domain '${domain}' not allowed. Allowed hosts: [${payload.allowedFileDomains.join(", ")}]. ` +
          `Check FILE_BACKEND_URL + PUBLIC_MEDUSA_BACKEND_URL env vars include your image CDN hostname.`
      }
      if (/\.svg($|\?)/i.test(payload.image_desktop)) {
        errors.image_desktop = "SVG uploads are forbidden for hero banners"
      }
    }
  }
  if (typeof payload.image_mobile === "string" && payload.image_mobile.length) {
    let domain: string | null = null
    try { domain = new URL(payload.image_mobile).hostname } catch { domain = null }
    if (domain && payload.allowedFileDomains?.length && !payload.allowedFileDomains.includes(domain)) {
      errors.image_mobile =
        `image_mobile domain '${domain}' not allowed. Allowed hosts: [${payload.allowedFileDomains.join(", ")}]. ` +
        `Check FILE_BACKEND_URL + PUBLIC_MEDUSA_BACKEND_URL env vars include your image CDN hostname.`
    }
    if (/\.svg($|\?)/i.test(payload.image_mobile)) {
      errors.image_mobile = "SVG uploads are forbidden for hero banners"
    }
  }
  if (payload.image_alt_en !== undefined && typeof payload.image_alt_en === "string" && payload.image_alt_en.trim().length === 0) {
    errors.image_alt_en = "image_alt_en is required"
  }
  return errors
}

const cleanCtaLink = (input: string | null | undefined): string | null => {
  if (!input) return null
  if (INTERNAL_LINK_RE.test(input)) return input
  if (EXTERNAL_HTTPS_RE.test(input)) return input
  return null
}

class HeroBannersModuleService extends MedusaService({ HeroBanner }) {
  async listActiveForSlots(
    slots: HeroBannerSlot[],
    now?: Date
  ): Promise<Record<HeroBannerSlot, HeroBannerDTO | null>> {
    const at = now ?? new Date()
    const where: any = { slot: { $in: slots }, is_active: true }
    const [rows] = await (this as any).listAndCountHeroBanners(where, {
      order: { slot: "asc", rank: "asc", created_at: "asc" },
    })
    const result: Record<string, HeroBannerDTO | null> = {}
    for (const s of slots) result[s] = null
    for (const row of rows as HeroBannerDTO[]) {
      const start = row.starts_at ? new Date(row.starts_at).getTime() : NaN
      const end = row.ends_at ? new Date(row.ends_at).getTime() : NaN
      if (row.starts_at && start > at.getTime()) continue
      if (row.ends_at && end <= at.getTime()) continue
      if (!result[row.slot]) {
        result[row.slot] = {
          ...row,
          cta_link: cleanCtaLink(row.cta_link),
        }
      }
    }
    return result as Record<HeroBannerSlot, HeroBannerDTO | null>
  }

  async reorderSlot(
    slot: HeroBannerSlot,
    orderedIds: string[],
    sharedContext?: Context
  ): Promise<HeroBannerDTO[]> {
    const idsInSlot = (await (this as any).listHeroBanners({ slot } as any)) as HeroBannerDTO[]
    const byId = new Map(idsInSlot.map((r: HeroBannerDTO) => [r.id, r]))
    const toUpdate: any[] = []
    for (let i = 0; i < orderedIds.length; i++) {
      const id = orderedIds[i]
      if (!byId.has(id)) continue
      toUpdate.push({ id, rank: i })
    }
    if (!toUpdate.length) {
      return []
    }
    const updated = await (this as any).updateHeroBanners(toUpdate, sharedContext)
    return updated as HeroBannerDTO[]
  }

  async updateById(id: string, data: Partial<HeroBannerDTO>, sharedContext?: Context): Promise<HeroBannerDTO | null> {
    const payload: any = { id }
    for (const k of Object.keys(data || {})) {
      if ((data as any)[k] === undefined) continue
      payload[k] = (data as any)[k]
    }
    if (Object.keys(payload).length <= 1) {
      const rows = (await (this as any).listHeroBanners({ id, deleted_at: null }, {})) as HeroBannerDTO[]
      return rows[0] ?? null
    }
    const [updated] = (await (this as any).updateHeroBanners([payload], sharedContext)) as HeroBannerDTO[]
    return updated ?? null
  }

  async softDeleteByIds(ids: string[], sharedContext?: Context): Promise<number> {
    if (!ids || !ids.length) return 0
    const rows = (await (this as any).listHeroBanners({ id: { $in: ids }, deleted_at: null }, {})) as HeroBannerDTO[]
    const now = new Date().toISOString()
    const toUpdate = rows
      .filter((r) => ids.includes(r.id))
      .map((r) => ({ id: r.id, deleted_at: now, updated_at: now }))
    if (!toUpdate.length) return 0
    await (this as any).updateHeroBanners(toUpdate, sharedContext)
    return toUpdate.length
  }

  async updateRank(id: string, rank: number, sharedContext?: Context) {
    const toUpdate = [{ id, rank }]
    try {
      const res = await (this as any).updateHeroBanners(toUpdate, sharedContext)
      return res
    } catch (e: any) {
      const detail = {
        error_name: e?.name, error_msg: e?.message,
        stack_head: (e?.stack || "").split("\n").slice(0, 6).join(" | "),
      }
      ;(console as any).error("[hero-banners updateRank threw]", JSON.stringify(detail))
      throw e
    }
  }

  validatePayload(payload: any, allowedFileDomains?: string[]) {
    return validateHeroBannerPayload({ ...payload, allowedFileDomains })
  }
}

export default HeroBannersModuleService
