import { Module } from "@medusajs/framework/utils"
import HeroBannersModuleServiceClass, {
  validateHeroBannerPayload,
  getAllowedFileHosts,
  emitHeroImageStartupWarning,
  type HeroBannerDTO,
} from "./service"

export const HERO_BANNER_MODULE = "heroBanner"
export { validateHeroBannerPayload, getAllowedFileHosts, emitHeroImageStartupWarning }
export type { HeroBannerDTO }
export const HeroBannersModuleService = HeroBannersModuleServiceClass

export default Module(HERO_BANNER_MODULE, {
  service: HeroBannersModuleServiceClass,
})
