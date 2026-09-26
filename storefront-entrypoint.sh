#!/usr/bin/env bash
set -Eeuo pipefail
echo "[storefront-entrypoint] Starting storefront at $(date)"
echo "[storefront-entrypoint] PWD=$(pwd)  PORT=${PORT:-3000}"

ROOT="/app/apps/storefront"
cd /app/apps/storefront

STANDALONE_DIR="/app/apps/storefront/.next/standalone"
if [ ! -d "${STANDALONE_DIR}/apps/storefront" ]; then
  echo "[storefront-entrypoint] ❌ Missing standalone at ${STANDALONE_DIR}/apps/storefront → listing:"
  ls -la "${STANDALONE_DIR}" 2>&1 | head -20 || true
  ls -la "${STANDALONE_DIR}/apps" 2>&1 | head -10 || true
  echo "[storefront-entrypoint] Falling back to direct start in /app/apps/storefront"
  export HOSTNAME="0.0.0.0"
  exec node server.js --port "${PORT:-3000}" --hostname 0.0.0.0
fi

if [ -d "/app/apps/storefront/public" ] && [ ! -d "${STANDALONE_DIR}/apps/storefront/public" ]; then
  echo "[storefront-entrypoint] Copying public/ into standalone nested..."
  cp -a "/app/apps/storefront/public" "${STANDALONE_DIR}/apps/storefront/public"
fi

NESTED_STATIC_DIR="${STANDALONE_DIR}/apps/storefront/.next/static"
if [ -d "/app/apps/storefront/.next/static" ] && [ ! -d "${NESTED_STATIC_DIR}" ]; then
  echo "[storefront-entrypoint] Copying .next/static/ into standalone nested .next/static..."
  mkdir -p "${STANDALONE_DIR}/apps/storefront/.next"
  cp -a "/app/apps/storefront/.next/static" "${NESTED_STATIC_DIR}"
fi

cd "${STANDALONE_DIR}"
export HOSTNAME="0.0.0.0"
echo "[storefront-entrypoint] Starting Next standalone server host=${HOSTNAME} port=${PORT:-3000}"
exec node "apps/storefront/server.js"
