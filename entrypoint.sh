#!/usr/bin/env bash
set -Eeuo pipefail
echo "[entrypoint] Starting backend entrypoint.sh at $(date)"
echo "[entrypoint] PWD=$(pwd)  PORT=${PORT:-9000}  DATABASE_URL=${DATABASE_URL:+SET}  REDIS_URL=${REDIS_URL:+SET}  JWT_SECRET=${JWT_SECRET:+SET}  COOKIE_SECRET=${COOKIE_SECRET:+SET}"
cd /app/packages/api
echo "[entrypoint] (1/2) Run Medusa DB migrate --execute-safe-links ..."
export PATH="/app/node_modules/.bin:/app/packages/api/node_modules/.bin:$PATH"
if command -v bun >/dev/null 2>&1; then
  echo "[entrypoint] bun available → using bunx medusa"
  bunx medusa db:migrate --execute-safe-links
else
  echo "[entrypoint] bun NOT available → using npx medusa"
  npx --no medusa db:migrate --execute-safe-links
fi
echo "[entrypoint] Migrations OK"
if [ -n "${ADMIN_EMAIL:-}" ] && [ -n "${ADMIN_PASSWORD:-}" ]; then
  echo "[entrypoint] Create/update admin user: ${ADMIN_EMAIL}"
  cd /app/packages/api/.medusa/server
  if command -v bun >/dev/null 2>&1; then
    bunx medusa user -e "${ADMIN_EMAIL}" -p "${ADMIN_PASSWORD}" || true
  else
    npx --no medusa user -e "${ADMIN_EMAIL}" -p "${ADMIN_PASSWORD}" || true
  fi
  echo "[entrypoint] Admin user step done (exit=$?)"
fi
cd /app/packages/api/.medusa/server
echo "[entrypoint] (2/2) Start Medusa server host=0.0.0.0 port=${PORT:-9000} ..."
if command -v bun >/dev/null 2>&1; then
  exec bunx medusa start --host 0.0.0.0 --port "${PORT:-9000}"
else
  exec npx --no medusa start --host 0.0.0.0 --port "${PORT:-9000}"
fi
