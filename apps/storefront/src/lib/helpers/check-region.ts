import { listRegions } from "../data/regions"

const FALLBACK_LOCALES = new Set([
  process.env.NEXT_PUBLIC_DEFAULT_REGION,
  "qa",
  "us",
  "de",
  "gb",
  "ae",
  "sa",
  "kw",
  "qa",
  "bh",
  "om",
  "jo",
].filter(Boolean) as string[]);

export const checkRegion = async (locale: string) => {
  try {
    const regions = await listRegions()
    if (!regions || regions.length === 0) {
      return FALLBACK_LOCALES.has(String(locale || "").toLowerCase())
    }
    const countries = regions
      ?.map((r) => {
        return r.countries?.map((c) => (c.iso_2 ?? "").toLowerCase())
      })
      .flat()
      .filter(Boolean) as string[];
    const set = new Set(countries);
    if (set.has(String(locale || "").toLowerCase())) return true;
    return FALLBACK_LOCALES.has(String(locale || "").toLowerCase())
  } catch {
    return FALLBACK_LOCALES.has(String(locale || "").toLowerCase())
  }
}
