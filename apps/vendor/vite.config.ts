import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { mercurDashboardPlugin } = require('@mercurjs/dashboard-sdk/vite')

const TEXTS = {
  failProdMissingBackendUrl: `
[vite.config VENDOR] FATAL: NODE_ENV=production (or 'staging') but MERCUR_BACKEND_URL or VITE_MERCUR_BACKEND_URL is not set.
→ The vendor panel bakes its backend API URL *into the JS bundle at build time* because the
  Mercur SDK writes a literal object const OA={backendUrl:"..."} at compile time.
→ Defaulting to http://localhost:9000 in a deployed bundle means the browser will call
  localhost:9000 (user's own machine) on every API call — auth and all routes will fail.
FIX:
  export MERCUR_BACKEND_URL="https://<your-deployed-backend-origin>"
  then re-run the vendor build.
(Local development: NODE_ENV=development or unset; defaults to http://localhost:9000 automatically.)
`,
  warnDevMissingBackendUrl: `[vite.config VENDOR] WARNING: MERCUR_BACKEND_URL (or VITE_MERCUR_BACKEND_URL) is not set in a non-production build.
  -> Defaulting the baked backend URL to http://localhost:9000 (works for local dev only;
     will 404 on any other host).`
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProdBuild = (process.env.NODE_ENV || mode) === 'production' || (process.env.NODE_ENV || mode) === 'staging'
  // Baked into the panel at build time. For a backend-served production build
  // (e.g. Medusa Cloud) set it to the deployed backend origin so API calls are
  // same-origin; it defaults to http://localhost:9000 for development.
  const backendUrl = env.VITE_MERCUR_BACKEND_URL || env.MERCUR_BACKEND_URL

  if (!backendUrl) {
    if (isProdBuild) {
      console.error(TEXTS.failProdMissingBackendUrl)
      process.exit(1)
    } else {
      console.warn(TEXTS.warnDevMissingBackendUrl)
    }
  }

  return {
    plugins: [
      react(),
      mercurDashboardPlugin({
        medusaConfigPath: '../../packages/api/medusa-config.ts',
        ...(backendUrl ? { backendUrl } : {}),
      }),
    ],
  }
})
