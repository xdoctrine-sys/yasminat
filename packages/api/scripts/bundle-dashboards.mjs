#!/usr/bin/env node
/**
 * Bundles the admin and vendor panels into the Medusa build artifact so a host that deploys
 * only `.medusa/server` (for example Medusa Cloud) can serve them statically.
 *
 * Runs after `medusa build` as part of this package's `build` script:
 *  1. expects each panel's production build at apps/<name>/dist — Turborepo produces it first,
 *     because this package declares the panel workspaces as devDependencies (`^build`),
 *  2. verifies the build is servable under its sub-path (assets referenced via /dashboard/…
 *     or /seller/… — a base of "/" would 404 once the backend strips the route prefix),
 *  3. copies each dist into .medusa/server/dashboards/<name>/dist, where medusa-config.ts
 *     resolves it via dashboardAppDir(),
 *  4. removes the workspace-protocol dependencies from the artifact's package.json copy —
 *     `workspace:*` is not installable outside the monorepo and the artifact only needs
 *     the copied dist.
 *
 * In production builds (NODE_ENV=production — Medusa Cloud builds this way) the script fails
 * fast on a missing panel build, a wrong base path, or a missing MERCUR_BACKEND_URL instead
 * of shipping a panel that points at http://localhost:9000 or 404s on its own assets.
 * Outside production it warns and skips the affected panel, so local builds keep working.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const apiDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = path.resolve(apiDir, '../..')
const artifactDir = path.join(apiDir, '.medusa/server')
const isProduction = process.env.NODE_ENV === 'production'

// Keep in sync with the admin-ui / vendor-ui module options in medusa-config.ts.
const PANELS = [
  { name: 'admin', basePath: '/dashboard/' },
  { name: 'vendor', basePath: '/seller/' },
]

const fail = (message) => {
  console.error(`[bundle-dashboards] ${message}`)
  process.exit(1)
}

if (!fs.existsSync(artifactDir)) {
  fail(`${artifactDir} not found — run \`medusa build\` first (the build script chains it).`)
}

// The panels bake their backend URL into the JS bundle at build time via the
// Mercur SDK Vite plugin as a LITERAL object const OA={backendUrl:"..."}.
// There is NO runtime override — shipping http://localhost:9000 in a production
// bundle means every API call targets the end-user's own machine instead of the
// deployed backend.  There is no window.__BACKEND_URL__ / fetch interceptor layer
// anymore (those were removed in commit revert ebd2e07); we fail FAST in production.
if (isProduction && !process.env.MERCUR_BACKEND_URL && !process.env.VITE_MERCUR_BACKEND_URL) {
  fail(
    'NODE_ENV=production but NEITHER MERCUR_BACKEND_URL nor VITE_MERCUR_BACKEND_URL is set.\n' +
    '   → The admin & vendor panels bake the backend origin into the compiled JS at build time.\n' +
    '   → Leaving it unset defaults the compiled bundle to http://localhost:9000 which breaks\n' +
    '     every auth call and all /admin/* routes in a deployed environment (ECONNREFUSED user machine).\n' +
    '   FIX:\n' +
    '     export MERCUR_BACKEND_URL="https://<your-deployed-backend-public-origin>"\n' +
    '   then re-run `medusa build` / the Turborepo build pipeline.\n' +
    '   (Local development: NODE_ENV is "development" or unset — this check is SKIPPED,\n' +
    '    http://localhost:9000 default is accepted with a warning in each panel vite.config.)'
  )
} else if (!process.env.MERCUR_BACKEND_URL && !process.env.VITE_MERCUR_BACKEND_URL) {
  console.warn(
    '[bundle-dashboards] WARNING: non-production build without MERCUR_BACKEND_URL — ' +
    'panels will default their baked backend URL to http://localhost:9000 (works for local dev ONLY).'
  )
}

let bundled = 0

for (const panel of PANELS) {
  const dist = path.join(repoRoot, 'apps', panel.name, 'dist')
  const indexHtml = path.join(dist, 'index.html')

  if (!fs.existsSync(indexHtml)) {
    const message =
      `apps/${panel.name}/dist/index.html not found — build the panels first ` +
      '(run the build from the repository root so Turborepo builds them, e.g. `npm run build`).'
    if (isProduction) {
      fail(message)
    }
    console.warn(`[bundle-dashboards] ${message} Skipping the ${panel.name} panel.`)
    continue
  }

  const html = fs.readFileSync(indexHtml, 'utf8')
  if (!html.includes(`${panel.basePath}assets/`)) {
    const message =
      `the ${panel.name} panel was built with the wrong base path — index.html does not ` +
      `reference ${panel.basePath}assets/, so its assets would 404 when served under ` +
      `${panel.basePath.slice(0, -1)}. This usually means the dashboard-sdk Vite plugin ` +
      'could not load medusa-config.ts at build time (check the build output for its warning).'
    if (isProduction) {
      fail(message)
    }
    console.warn(`[bundle-dashboards] ${message} Skipping the ${panel.name} panel.`)
    continue
  }

  const target = path.join(artifactDir, 'dashboards', panel.name, 'dist')
  fs.rmSync(target, { recursive: true, force: true })
  fs.cpSync(dist, target, { recursive: true })
  bundled++
  console.log(`[bundle-dashboards] ${panel.name}: apps/${panel.name}/dist -> ${path.relative(apiDir, target)}`)
}

// `medusa build` copies this package.json verbatim into the artifact. Strip workspace-protocol
// dependencies — they exist only so the panel sources travel with this package (Turborepo
// pruning follows the workspace dependency graph), and they cannot be installed from a registry.
const artifactPkgPath = path.join(artifactDir, 'package.json')
const artifactPkg = JSON.parse(fs.readFileSync(artifactPkgPath, 'utf8'))
for (const field of ['dependencies', 'devDependencies']) {
  for (const [dep, version] of Object.entries(artifactPkg[field] ?? {})) {
    if (typeof version === 'string' && version.startsWith('workspace:')) {
      delete artifactPkg[field][dep]
    }
  }
}
fs.writeFileSync(artifactPkgPath, JSON.stringify(artifactPkg, null, 2) + '\n')

console.log(
  bundled > 0
    ? `[bundle-dashboards] done — the artifact serves ${bundled} panel(s) at their configured paths.`
    : '[bundle-dashboards] done — no panels were bundled (see the warnings above).'
)
