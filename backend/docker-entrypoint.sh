#!/bin/sh
# Applies schema migrations, then hands off to the CMD.
#
# NOTE: the database seed is deliberately NOT run here. prisma/seed.ts deletes
# every row in all 24 tables; it is a manual, opt-in operation only. Migrations
# are additive and safe to re-run on every boot.
set -e

echo "==> Applying database migrations (prisma migrate deploy)"
./node_modules/.bin/prisma migrate deploy

echo "==> Starting Vilaasa Estates API"
exec "$@"
