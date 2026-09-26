#!/usr/bin/env bash
set -Eeuo pipefail
echo "[storefront-entrypoint] Starting storefront at $(date)"
echo "[storefront-entrypoint] PWD=$(pwd)  PORT=${PORT:-3000}"

APP_DIR="/app/apps/storefront"
STANDALONE_DIR="${APP_DIR}/.next/standalone"
STANDALONE_NESTED="${STANDALONE_DIR}/apps/storefront"

export HOSTNAME="0.0.0.0"

try_next_start_direct() {
  echo "[storefront-entrypoint] Try #1: direct next start from apps/storefront"
  cd "${APP_DIR}"
  export PATH="/app/node_modules/.bin:/app/apps/storefront/node_modules/.bin:$PATH"
  if command -v bun >/dev/null 2>&1; then
    echo "[storefront-entrypoint] using bunx next start HOSTNAME=${HOSTNAME} PORT=${PORT:-3000}"
    exec bunx next start --hostname 0.0.0.0 --port "${PORT:-3000}"
  fi
  if command -v npx >/dev/null 2>&1; then
    echo "[storefront-entrypoint] using npx next start HOSTNAME=${HOSTNAME} PORT=${PORT:-3000}"
    exec npx --no next start --hostname 0.0.0.0 --port "${PORT:-3000}"
  fi
}

try_standalone_flat() {
  if [ ! -f "${STANDALONE_DIR}/server.js" ]; then return 1; fi
  echo "[storefront-entrypoint] Try #2: standalone FLAT at ${STANDALONE_DIR}/server.js"
  if [ -d "${APP_DIR}/public" ] && [ ! -d "${STANDALONE_DIR}/public" ]; then
    echo "[storefront-entrypoint] cp public → ${STANDALONE_DIR}/public"
    cp -a "${APP_DIR}/public" "${STANDALONE_DIR}/public"
  fi
  if [ -d "${APP_DIR}/.next/static" ] && [ ! -d "${STANDALONE_DIR}/.next/static" ]; then
    mkdir -p "${STANDALONE_DIR}/.next"
    echo "[storefront-entrypoint] cp .next/static → ${STANDALONE_DIR}/.next/static"
    cp -a "${APP_DIR}/.next/static" "${STANDALONE_DIR}/.next/static"
  fi
  cd "${STANDALONE_DIR}"
  echo "[storefront-entrypoint] node server.js PORT=${PORT:-3000}"
  exec node server.js
}

try_standalone_nested() {
  if [ ! -f "${STANDALONE_NESTED}/server.js" ]; then return 1; fi
  echo "[storefront-entrypoint] Try #3: standalone NESTED ${STANDALONE_NESTED}/server.js"
  if [ -d "${APP_DIR}/public" ] && [ ! -d "${STANDALONE_NESTED}/public" ]; then
    echo "[storefront-entrypoint] cp public → nested public"
    cp -a "${APP_DIR}/public" "${STANDALONE_NESTED}/public"
  fi
  if [ -d "${APP_DIR}/.next/static" ] && [ ! -d "${STANDALONE_NESTED}/.next/static" ]; then
    mkdir -p "${STANDALONE_NESTED}/.next"
    echo "[storefront-entrypoint] cp .next/static → nested .next/static"
    cp -a "${APP_DIR}/.next/static" "${STANDALONE_NESTED}/.next/static"
  fi
  cd "${STANDALONE_DIR}"
  echo "[storefront-entrypoint] node apps/storefront/server.js PORT=${PORT:-3000}"
  exec node "apps/storefront/server.js"
}

# Run with fallback order: direct first, then standalone variants
try_next_start_direct || true
try_standalone_flat || true
try_standalone_nested || true

echo "[storefront-entrypoint] FATAL: all 3 start methods failed"
exit 1
