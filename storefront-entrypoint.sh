#!/usr/bin/env bash
set -Eeuo pipefail
echo "[storefront-entrypoint] Starting storefront at $(date)"
echo "[storefront-entrypoint] PWD=$(pwd)  PORT=${PORT:-3000}"

cd /app/apps/storefront

STANDALONE_DIR="/app/apps/storefront/.next/standalone"
STANDALONE_NESTED="${STANDALONE_DIR}/apps/storefront"

if [ -f "${STANDALONE_DIR}/server.js" ]; then
  echo "[storefront-entrypoint] Detected FLAT standalone (server.js at root of standalone/)"
  if [ -d "/app/apps/storefront/public" ] && [ ! -d "${STANDALONE_DIR}/public" ]; then
    echo "[storefront-entrypoint] Copying public/ into standalone/public..."
    cp -a "/app/apps/storefront/public" "${STANDALONE_DIR}/public"
  fi
  if [ -d "/app/apps/storefront/.next/static" ] && [ ! -d "${STANDALONE_DIR}/.next/static" ]; then
    echo "[storefront-entrypoint] Copying .next/static/ into standalone/.next/static..."
    mkdir -p "${STANDALONE_DIR}/.next"
    cp -a "/app/apps/storefront/.next/static" "${STANDALONE_DIR}/.next/static"
  fi
  cd "${STANDALONE_DIR}"
  export HOSTNAME="0.0.0.0"
  echo "[storefront-entrypoint] Starting Next standalone (FLAT) HOSTNAME=${HOSTNAME} PORT=${PORT:-3000}"
  exec node server.js
fi

if [ -f "${STANDALONE_NESTED}/server.js" ]; then
  echo "[storefront-entrypoint] Detected NESTED standalone (apps/storefront/server.js inside standalone/)"
  if [ -d "/app/apps/storefront/public" ] && [ ! -d "${STANDALONE_NESTED}/public" ]; then
    echo "[storefront-entrypoint] Copying public/ into nested standalone..."
    cp -a "/app/apps/storefront/public" "${STANDALONE_NESTED}/public"
  fi
  if [ -d "/app/apps/storefront/.next/static" ] && [ ! -d "${STANDALONE_NESTED}/.next/static" ]; then
    echo "[storefront-entrypoint] Copying .next/static/ into nested standalone .next/static..."
    mkdir -p "${STANDALONE_NESTED}/.next"
    cp -a "/app/apps/storefront/.next/static" "${STANDALONE_NESTED}/.next/static"
  fi
  cd "${STANDALONE_DIR}"
  export HOSTNAME="0.0.0.0"
  echo "[storefront-entrypoint] Starting Next standalone (NESTED) HOSTNAME=${HOSTNAME} PORT=${PORT:-3000}"
  exec node "apps/storefront/server.js"
fi

echo "[storefront-entrypoint] ❌ No standalone found at either path. Listing:"
ls -la "${STANDALONE_DIR}" 2>&1 | head -20 || true
echo "[storefront-entrypoint] Fallback: direct start in /app/apps/storefront via next start"
export HOSTNAME="0.0.0.0"
exec npx --no next start --port "${PORT:-3000}" --hostname 0.0.0.0
