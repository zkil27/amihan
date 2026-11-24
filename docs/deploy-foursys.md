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

From PowerShell, call Git Bash by its full path: `& "C:\Program Files\Git\bin\bash.exe" scripts/deploy.sh`. A plain `bash` in PowerShell starts WSL, which can't see the `amihan-prod` alias in the Windows SSH config, so the upload fails with "Could not resolve hostname".

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

Order, status and return emails are sent through [Resend](https://resend.com) from the `amihan.shop` domain. Laravel's built-in `resend` mailer uses the `resend/resend-php` package and sends over HTTPS, so no SMTP ports are involved. Customer replies go to the AMIHAN Gmail inbox, because `amihan.shop` has no mailbox of its own.

**One-time setup**

1. In Resend, go to **Domains → amihan.shop** and copy each DNS record into Spaceship (**Advanced DNS → Custom records → Add record**). Enter only the subdomain part as the host, because Spaceship appends `.amihan.shop` itself. Use Resend's copy buttons, since the values on screen are truncated.
   - DKIM: `TXT`, host `resend._domainkey`.
   - SPF: `CNAME`, host `rsend`, and `CNAME`, host `send`.
   - DMARC (optional): `TXT`, host `_dmarc`, value `v=DMARC1; p=none;`.

   Leave the Email Forwarding records on `@` as they are. Resend's records sit on subdomains, so they don't conflict.
2. Click **Verify DNS Records** and wait until the domain shows **Verified**. This can take from a few minutes up to a few hours.
3. In Resend, go to **API keys** and create a key with **Sending access**, restricted to `amihan.shop`.

**Server `.env`**

```
MAIL_MAILER=resend
RESEND_KEY=re_xxxxxxxxxxxxxxxx
MAIL_FROM_ADDRESS="orders@amihan.shop"
MAIL_FROM_NAME="AMIHAN Highland Pantry"
MAIL_REPLY_TO_ADDRESS="amihan.highlandpantry@gmail.com"
```

Remove the old `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_ENCRYPTION` and `MAIL_SOURCE_IP` lines; the Resend mailer doesn't use them. `MAIL_FROM_ADDRESS` must be on the verified domain, or Resend rejects the send with a 403.

After changing `.env`, run `php artisan optimize`. To check that sending works:

```bash
php artisan tinker --execute="Mail::raw('Resend test', fn (\$m) => \$m->to('amihan.highlandpantry@gmail.com')->subject('AMIHAN test'));"
```

The send then appears under **Logs** in the Resend dashboard. To roll back to logging emails instead of sending them, set `MAIL_MAILER=log`.

## Backups

The previous site, BukidBasket, is archived at `~/backups/bukidbasket-20261125-013819.tar.gz`. It contains its files only; its database login no longer worked, so the database was not dumped.
