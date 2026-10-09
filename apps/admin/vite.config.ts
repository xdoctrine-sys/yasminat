import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { mercurDashboardPlugin } = require('@mercurjs/dashboard-sdk/vite')

const ADMIN_BUILD_WARNINGS = {
  fallbackSameOrigin:
    '\n[@mercurjs/dashboard] WARNING: MERCUR_BACKEND_URL / VITE_MERCUR_BACKEND_URL was NOT set at build time. ' +
    'Admin dashboard will use window.location.origin (same-origin) at runtime for all API calls. ' +
    'This is correct when the dashboard is served BY the backend (default Railway setup: ' +
    '/dashboard/ under the same host). If you run the dashboard standalone (vite dev or separate ' +
    'build), set the variable before build (backend origin e.g. https://api.yasminat.qa, no trailing slash).\n',
}

// Runtime backend URL fallback + fetch/XHR interceptor injected into the
// dashboard <head> BEFORE any bundle JS loads.
// THREE layers of defence:
//   1. Force a non-writable GLOBAL __BACKEND_URL__ on window & globalThis via
//      Object.defineProperty before any ES module runs so bare-identifier
//      references and window.__BACKEND_URL__ reads all resolve to origin.
//   2. Wrap the Request constructor so ANY Request object (and its url property
//      will always return the rewritten url.
//   3. Monkey-patch fetch + XMLHttpRequest to transparently rewrite any
//      outgoing URL prefixed with the dev fallback.
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
    // ── Layer 1: force __BACKEND_URL__ (Object.defineProperty so ESM bare-identifier resolves)
    try {
      var cfg = { value: SAME_ORIGIN, writable: false, enumerable: true, configurable: true };
      try { Object.defineProperty(window, '__BACKEND_URL__', cfg); } catch (e) {}
      try { Object.defineProperty(globalThis, '__BACKEND_URL__', cfg); } catch (e) {}
      try { Object.defineProperty(self, '__BACKEND_URL__', cfg); } catch (e) {}
    } catch (e) { /* noop */ }
    // Also declare a bare var as a catch-all for non-strict scripts
    try {
      var __BACKEND_URL__ = SAME_ORIGIN;
    } catch (e) { /* noop */ }
    // ── Layer 2: wrap Request constructor so url is rewritten on construction
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
    // ── Layer 3: fetch wrapper
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
    // ── Layer 3b: XMLHttpRequest.open wrapper
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
      console.warn(ADMIN_BUILD_WARNINGS.fallbackSameOrigin)
    } catch {
      /* noop */
    }
  }

  // Inject the runtime rewriter BEFORE bundle JS loads (runs at <head> top).
  const runtimeRewriterPlugin = {
    name: 'mercur-admin-runtime-backend-rewriter',
    enforce: 'post',
    transformIndexHtml(html: string): string {
      const inject = `<script data-role="runtime-backend-rewriter">${RUNTIME_BACKEND_REWRITER_JS}</script>`
      // Inject right after <head> (or <!doctype fallback if not)
      if (/<head[^>]*>/i.test(html)) {
        return html.replace(/(<head[^>]*>)/i, `$1\n${inject}\n`)
      }
      return `${inject}\n${html}`
    },
  }

  return {
    // Only set __BACKEND_URL__ as a literal when we have an explicit value.
    // Otherwise the Mercur dashboard plugin injects the hardcoded
    // `http://localhost:9000` fallback, which our runtime rewriter
    // (injected above) transparently rewrites to window.location.origin.
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
