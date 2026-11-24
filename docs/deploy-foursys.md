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

## Useful commands

```
ssh amihan-prod
cd web/orange-cobra-186442.foursyscloud.com/private/amihan
php artisan migrate:fresh --seed --force   # reset demo data
tail -50 storage/logs/laravel.log          # errors, and emails while MAIL_MAILER=log
nano .env && php artisan optimize          # change settings, then refresh the cache
```

## Email

Gmail SMTP (ports 587 and 465) is reachable from the server. In `.env` on the server, set:

```
MAIL_MAILER=smtp
MAIL_USERNAME=you@gmail.com
MAIL_PASSWORD="<16-char app password>"
MAIL_FROM_ADDRESS=you@gmail.com
```

Then run `php artisan optimize`.

## Backups

The previous site, BukidBasket, is archived at `~/backups/bukidbasket-20261125-013819.tar.gz`. It contains its files only; its database login no longer worked, so the database was not dumped.
