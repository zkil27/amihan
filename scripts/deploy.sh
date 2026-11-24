#!/usr/bin/env bash
# Deploy AMIHAN to Foursys Cloud (HestiaCP) over SSH.
# Usage (Git Bash, from the project root):  bash scripts/deploy.sh
#
# Server layout (Foursys only offers the "default" web template, so the
# app lives outside the web root):
#   ~/web/<domain>/private/amihan   the Laravel app (code, .env, storage, vendor)
#   ~/web/<domain>/public_html      a copy of public/, plus a tiny index.php that
#                                   loads ../private/amihan/public/index.php,
#                                   and storage -> ../private/amihan/storage/app/public
# Uploaded images live in private/amihan/storage/app/public and are never overwritten.
set -euo pipefail

HOST="amihan-prod"
DOMAIN="orange-cobra-186442.foursyscloud.com"
SITE="web/${DOMAIN}"

echo "1/3  Building front-end assets"
npm run build >/dev/null

echo "2/3  Uploading code"
tar czf - \
  --exclude=./node_modules --exclude=./vendor --exclude=./.git --exclude=./tests --exclude=./.env \
  --exclude=./.impeccable --exclude='./general assets' \
  --exclude='./storage/app/public/*' --exclude='./storage/logs/*' \
  --exclude='./storage/framework/sessions/*' --exclude='./storage/framework/cache/data/*' \
  --exclude='./storage/framework/views/*' --exclude=./public/storage --exclude=./public/hot \
  --exclude=./database/database.sqlite \
  . | ssh "$HOST" "mkdir -p ${SITE}/private/amihan && tar xzf - -C ${SITE}/private/amihan"

echo "3/3  Installing, migrating and publishing on the server"
ssh "$HOST" "set -e
cd ~/${SITE}/private/amihan
composer install --no-dev --optimize-autoloader --no-interaction --quiet
php artisan migrate --force
chmod -R ug+rwX storage bootstrap/cache
cd ~/${SITE}
cp -a private/amihan/public/. public_html/
printf '%s\n' '<?php' '// The Laravel app lives outside the web root, in ../private/amihan.' \"require __DIR__.'/../private/amihan/public/index.php';\" > public_html/index.php
ln -sfn ../private/amihan/storage/app/public public_html/storage
cd private/amihan && php artisan optimize >/dev/null"

echo "Done: https://${DOMAIN}"
