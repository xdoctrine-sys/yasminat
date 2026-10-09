import { CACHE_TAGS } from './cache-tags';

export type HeroBannerSlot = 'main' | 'side_top' | 'side_bottom';

export type PublicBanner = {
  id: string;
  slot: HeroBannerSlot;
  rank: number;
  image_desktop: string;
  image_mobile?: string | null;
  image_alt_en?: string | null;
  image_alt_ar?: string | null;
  title_en?: string | null;
  title_ar?: string | null;
  subtitle_en?: string | null;
  subtitle_ar?: string | null;
  cta_label_en?: string | null;
  cta_label_ar?: string | null;
  cta_link?: string | null;
  is_active: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type HeroBannersResponse = {
  slots: Record<HeroBannerSlot, PublicBanner | null>;
  fetched_at?: string;
};

const EMPTY_SLOTS: Record<HeroBannerSlot, PublicBanner | null> = {
  main: null,
  side_top: null,
  side_bottom: null,
};

const HERO_API_URL_PATH = '/store/hero-banners';

export async function fetchHeroBanners(): Promise<Record<HeroBannerSlot, PublicBanner | null>> {
  const baseUrl =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
    process.env.MEDUSA_BACKEND_URL ||
    'http://127.0.0.1:9000';
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

  try {
    const res = await fetch(`${baseUrl}${HERO_API_URL_PATH}`, {
      headers: {
        ...(publishableKey ? { 'x-publishable-api-key': publishableKey } : {}),
      },
      next: {
        revalidate: 60,
        tags: [CACHE_TAGS.heroBanners],
      },
    });

    if (!res.ok) {
      return EMPTY_SLOTS;
    }

    const data = (await res.json()) as HeroBannersResponse;
    return data?.slots ?? EMPTY_SLOTS;
  } catch (e) {
    return EMPTY_SLOTS;
  }
}
