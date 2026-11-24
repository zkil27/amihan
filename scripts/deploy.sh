#!/usr/bin/env bash
# Deploy AMIHAN to Foursys Cloud (HestiaCP) over SSH.
# Usage (Git Bash, from the project root):  bash scripts/deploy.sh
# Needs the "amihan-prod" host in ~/.ssh/config (see docs/deploy-foursys.md).
set -euo pipefail

HOST="amihan-prod"
DOMAIN="orange-cobra-186442.foursyscloud.com"
REMOTE="web/${DOMAIN}/public_html"
PHP="${REMOTE_PHP:-php}"   # e.g. REMOTE_PHP=/usr/bin/php8.2 bash scripts/deploy.sh

export PATH="/c/Users/johne/tools/composer:/c/xampp/php:$PATH"
export MSYS_NO_PATHCONV=1

echo "1/4  Building front-end assets"
npm run build >/dev/null

echo "2/4  Installing production PHP packages"
composer install --no-dev --optimize-autoloader --no-interaction --quiet

echo "3/4  Uploading"
tar czf - \
  --exclude=./node_modules --exclude=./.git --exclude=./tests --exclude=./.env \
  --exclude=./.impeccable --exclude='./storage/app/public/*' --exclude='./storage/logs/*' \
  --exclude='./storage/framework/sessions/*' --exclude='./storage/framework/cache/data/*' \
  --exclude=./public/storage --exclude=./database/database.sqlite --exclude=./public/hot \
  . | ssh "$HOST" "mkdir -p ${REMOTE} && tar xzf - -C ${REMOTE}"

echo "4/4  Migrating and caching on the server"
ssh "$HOST" "cd ${REMOTE} && ${PHP} artisan migrate --force && ${PHP} artisan storage:link 2>/dev/null; ${PHP} artisan optimize && chmod -R ug+rwX storage bootstrap/cache"

# Restore dev dependencies locally.
composer install --no-interaction --quiet

echo "Done: https://${DOMAIN}"
