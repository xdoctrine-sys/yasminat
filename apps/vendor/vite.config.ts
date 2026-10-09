import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { mercurDashboardPlugin } = require('@mercurjs/dashboard-sdk/vite')

const VENDOR_BUILD_WARNINGS = {
  fallbackSameOrigin:
    '\n[@mercurjs/vendor-dashboard] WARNING: MERCUR_BACKEND_URL / VITE_MERCUR_BACKEND_URL was NOT set at build time. ' +
    'Vendor dashboard will use window.location.origin (same-origin) at runtime for all API calls. ' +
    'Correct when vendor dashboard is served by the backend under the same host. ' +
    'If running standalone, set the variable before build (no trailing slash).\n',
}

const RUNTIME_BACKEND_REWRITER_JS = `
(function(){
  try {
    if (typeof window === 'undefined') return;
    var DEV_FALLBACK_PREFIX = 'http://localhost:9000';
    var SAME_ORIGIN = window.location.origin;
    if (SAME_ORIGIN === DEV_FALLBACK_PREFIX) return;
    var rewrite = function (u) {
      try {
        var s = typeof u === 'string' ? u : String(u && u.url || u || '');
        if (s.indexOf(DEV_FALLBACK_PREFIX) === 0) {
          var rest = s.slice(DEV_FALLBACK_PREFIX.length);
          if (rest.charAt(0) === '/') return SAME_ORIGIN + rest;
          if (rest === '' || rest.charAt(0) === '?') return SAME_ORIGIN + '/' + rest;
        }
        return s;
      } catch (e) { return typeof u === 'string' ? u : u && u.url || u; }
    };
    try {
      var cfg = { value: SAME_ORIGIN, writable: false, enumerable: true, configurable: true };
      try { Object.defineProperty(window, '__BACKEND_URL__', cfg); } catch (e) {}
      try { Object.defineProperty(globalThis, '__BACKEND_URL__', cfg); } catch (e) {}
      try { Object.defineProperty(self, '__BACKEND_URL__', cfg); } catch (e) {}
    } catch (e) { /* noop */ }
    try { var __BACKEND_URL__ = SAME_ORIGIN; } catch (e) { /* noop */ }
    try {
      var OrigRequest = window.Request;
      window.Request = function Request(input, init) {
        try {
          if (typeof input === 'string') { input = rewrite(input); }
          else if (input && typeof input.url === 'string') {
            var nr = rewrite(input);
            if (nr !== String(input && input.url || input)) {
              return new OrigRequest(nr, init !== undefined ? init : input);
            }
          }
        } catch (e) { /* noop */ }
        if (init !== undefined) return new OrigRequest(input, init);
        return new OrigRequest(input);
      };
      window.Request.prototype = OrigRequest.prototype;
      try { Object.setPrototypeOf(window.Request, OrigRequest); } catch (e) {}
    } catch (e) { /* noop */ }
    try {
      var origFetch = window.fetch;
      window.fetch = function (input, init) {
        try {
          if (typeof input === 'string') { input = rewrite(input); }
          else if (input && typeof input.url === 'string') {
            var newUrl = rewrite(input);
            if (newUrl !== (input.url || String(input))) {
              input = new OrigRequest(newUrl, input);
            }
          }
        } catch (e) { /* noop */ }
        return origFetch.call(this, input, init);
      };
      try { globalThis.fetch = window.fetch; } catch (e) {}
    } catch (e) { /* noop */ }
    try {
      var XHROpen = window.XMLHttpRequest.prototype.open;
      window.XMLHttpRequest.prototype.open = function (method, url) {
        var rest = Array.prototype.slice.call(arguments, 2);
        try { url = rewrite(url); } catch (e) { /* noop */ }
        return XHROpen.apply(this, [method, url].concat(rest));
      };
    } catch (e) { /* noop */ }
  } catch (e) { /* noop */ }
})();
`

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const rawBackend = env.VITE_MERCUR_BACKEND_URL || env.MERCUR_BACKEND_URL
  const backendUrl = rawBackend ? rawBackend.replace(/\/+$/, '') : ''

  if (!backendUrl) {
    try {
      // eslint-disable-next-line no-console
      console.warn(VENDOR_BUILD_WARNINGS.fallbackSameOrigin)
    } catch {
      /* noop */
    }
  }

  const runtimeRewriterPlugin = {
    name: 'mercur-vendor-runtime-backend-rewriter',
    enforce: 'post',
    transformIndexHtml(html: string): string {
      const inject = `<script data-role="runtime-backend-rewriter">${RUNTIME_BACKEND_REWRITER_JS}</script>`
      if (/<head[^>]*>/i.test(html)) {
        return html.replace(/(<head[^>]*>)/i, `$1\n${inject}\n`)
      }
      return `${inject}\n${html}`
    },
  }

  return {
    define: backendUrl
      ? { __BACKEND_URL__: JSON.stringify(backendUrl) }
      : undefined,
    plugins: [
      react(),
      mercurDashboardPlugin({
        medusaConfigPath: '../../packages/api/medusa-config.ts',
        ...(backendUrl ? { backendUrl } : {}),
      }),
      runtimeRewriterPlugin,
    ],
  }
})
