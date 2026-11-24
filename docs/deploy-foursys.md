# Deploying to Foursys Cloud (HestiaCP)

| | |
|---|---|
| Live site | https://orange-cobra-186442.foursyscloud.com |
| SSH | `ssh amihan-prod`, using the key `~/.ssh/amihan_foursys` (port 65002, user fs000031) |
| Database | `fs000031_amihan` on host `127.0.0.1`. Not `localhost`: that tries a socket that doesn't exist on this server. |
| PHP | 8.3 for both the web server and the command line |

## Layout on the server

Foursys only offers the `default` web template, so the document root cannot point at Laravel's `public/` folder. Instead:

```
~/web/orange-cobra-186442.foursyscloud.com/
├── private/amihan/          the whole Laravel app: code, .env, vendor, storage
└── public_html/             a copy of public/ (build, fonts, images, media)
    ├── index.php            require ../private/amihan/public/index.php
    └── storage -> ../private/amihan/storage/app/public   (uploaded images)
```

`.env` and the code are outside the web root, so they can't be downloaded; `/.env` returns 404.

## Deploy

From the project root in Git Bash:

```
bash scripts/deploy.sh
```

The script:
1. Builds the front-end assets.
2. Uploads the code. It never sends `.env`, uploaded images or logs.
3. Runs `composer install` and `migrate` on the server.
4. Copies `public/` into `public_html` and rewrites `index.php`.
5. Re-links the uploads folder.

### Automatic deploys (GitHub Actions)

`.github/workflows/deploy.yml` runs `scripts/deploy.sh` every time a push to `main` passes the `tests` workflow. It deploys the exact commit that was tested. You can also start it by hand: Actions → deploy → Run workflow.

It needs one repository secret, `FOURSYS_SSH_KEY`. That's a private key the server accepts for `fs000031`. The Foursys host key is pinned in the workflow.

Only files committed to git get deployed. Anything that was uploaded by hand stays on the server, because nothing is deleted there.

### Cloudflare caching

The site sits behind Cloudflare, and every static file is sent with a 10-year `Cache-Control`. Files in `build/` are safe because Vite puts a hash in each name. A file with a fixed name (`favicon.svg`, `/images/...`, `/fonts/...`) stays cached at Cloudflare after you replace it on the server. To serve the new file, add a version to its link (for example `/favicon.svg?v=2`) or purge the Cloudflare cache.

## Useful commands

```
ssh amihan-prod
cd web/orange-cobra-186442.foursyscloud.com/private/amihan
php artisan migrate:fresh --seed --force   # reset demo data
tail -50 storage/logs/laravel.log          # errors, and emails while MAIL_MAILER=log
nano .env && php artisan optimize          # change settings, then refresh the cache
```

## Email

Order, status and return emails are sent through Gmail SMTP from `amihan.highlandpantry@gmail.com`, using an app password. In `.env` on the server:

```
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_ENCRYPTION=tls
MAIL_USERNAME=amihan.highlandpantry@gmail.com
MAIL_PASSWORD=<16-char app password, no spaces>
MAIL_FROM_ADDRESS="amihan.highlandpantry@gmail.com"
MAIL_FROM_NAME="AMIHAN Highland Pantry"
MAIL_SOURCE_IP=0.0.0.0
```

Keep `MAIL_SOURCE_IP=0.0.0.0`. The server resolves `smtp.gmail.com` to an IPv6 address but has no IPv6 route, so without this setting every send times out. The setting forces IPv4.

After changing `.env`, run `php artisan optimize`. To roll back to logging emails instead of sending them, set `MAIL_MAILER=log`.

## Backups

The previous site, BukidBasket, is archived at `~/backups/bukidbasket-20261125-013819.tar.gz`. It contains its files only; its database login no longer worked, so the database was not dumped.
