import { createClient, type InferClient } from "@mercurjs/client"
import type { Routes } from '@acme/api/_generated'

declare const __BACKEND_URL__: string | undefined

const BAKED = typeof __BACKEND_URL__ !== 'undefined' ? __BACKEND_URL__ : ''
const inBrowser = typeof window !== 'undefined'
const USE_SAME_ORIGIN_FALLBACK =
  !BAKED || BAKED.trim() === '' || /^http:\/\/localhost:9000\/?$/.test(BAKED)

const VENDOR_URL_TEXTS = {
  warnFallback:
    '[vendor] MERCUR_BACKEND_URL / VITE_MERCUR_BACKEND_URL not set at build time. ' +
    'Falling back to window.location.origin (same-origin). ' +
    'This is correct when the vendor dashboard is served by the backend.',
}

let resolvedBaseUrl = BAKED || ''
if (USE_SAME_ORIGIN_FALLBACK && inBrowser) {
  resolvedBaseUrl = window.location.origin
  try {
    console.warn(VENDOR_URL_TEXTS.warnFallback)
  } catch {
    /* noop */
  }
} else if (!resolvedBaseUrl) {
  resolvedBaseUrl = 'http://localhost:9000'
}

export const client: InferClient<Routes> = createClient({
  baseUrl: resolvedBaseUrl,
  fetchOptions: {
    credentials: 'include',
  },
})
