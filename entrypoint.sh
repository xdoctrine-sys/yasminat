#!/usr/bin/env bash
set -Eeuo pipefail
echo "[entrypoint] Starting backend entrypoint.sh at $(date)"
echo "[entrypoint] PWD=$(pwd)  PORT=${PORT:-9000}  DATABASE_URL=${DATABASE_URL:+SET(${{#DATABASE_URL}})}  REDIS_URL=${REDIS_URL:+SET}"
cd /app/packages/api
echo "[entrypoint] (1/2) Run Medusa DB migrate --no-interactive ..."
npx medusa db:migrate --no-interactive
echo "[entrypoint] Migrations OK (exit $?)"
cd /app/packages/api/.medusa/server
echo "[entrypoint] (2/2) Start Medusa server host=0.0.0.0 port=${PORT:-9000} ..."
exec npx medusa start --host 0.0.0.0 --port "${PORT:-9000}"
