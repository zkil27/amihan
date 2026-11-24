# Deploying to Foursys Cloud (HestiaCP)

| | |
|---|---|
| Site | https://orange-cobra-186442.foursyscloud.com (SSL already active) |
| SSH | `ssh -p 65002 fs000031@ssh.foursyscloud.com`, set up as the alias `amihan-prod` in `~/.ssh/config` |

## One-time setup in the Hestia panel

1. **Add the deploy key.** Click the user icon at the top right, then **Manage SSH Keys → Add SSH Key**, and paste the contents of `~/.ssh/amihan_foursys.pub`. After that, `ssh amihan-prod` works without a password.
2. **Choose the web template.** Go to **WEB**, edit the domain, and open **Advanced Options**.
   - Set **Web Template** to `laravel` if it is listed; it serves `public_html/public`.
     - Otherwise, tick **Custom document root** and point it to `public_html/public`.
   - Set **Backend Template** to `PHP-8_2` or `PHP-8_3`.
3. **Create the database.** Go to **DB → Add Database** and fill in:
   - Database: `amihan`, which Hestia saves as `fs000031_amihan`.
   - User: `amihan`, saved as `fs000031_amihan`.
   - A strong password.
   - Host: `localhost`.

## First deploy

1. Run `bash scripts/deploy.sh`. It builds, uploads and migrates. On the first run the migration fails because there is no `.env` on the server yet. That is expected.
2. Create the server `.env` (never commit it):
   ```
   ssh amihan-prod
   cd web/orange-cobra-186442.foursyscloud.com/public_html
   cp .env.example .env && nano .env
   ```
   Set these values:
   ```
   APP_NAME=AMIHAN
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://orange-cobra-186442.foursyscloud.com
   APP_TIMEZONE=Asia/Manila
   DB_CONNECTION=mysql
   DB_HOST=localhost
   DB_DATABASE=fs000031_amihan
   DB_USERNAME=fs000031_amihan
   DB_PASSWORD=...
   SESSION_DRIVER=database
   SESSION_SECURE_COOKIE=true
   QUEUE_CONNECTION=sync
   FILESYSTEM_DISK=public
   MAIL_MAILER=smtp
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_ENCRYPTION=tls
   MAIL_USERNAME=you@gmail.com
   MAIL_PASSWORD=<16-char app password>
   MAIL_FROM_ADDRESS=you@gmail.com
   MAIL_FROM_NAME="AMIHAN Highland Pantry"
   ```
3. Initialise:
   ```
   php artisan key:generate
   php artisan migrate --seed --force
   php artisan storage:link
   php artisan optimize
   ```

## Every deploy after that

Run `bash scripts/deploy.sh`.

## Checks

- Open `https://orange-cobra-186442.foursyscloud.com/.env`. It must **not** show the file (expect a 403 or 404).
- Place a test order and confirm the email arrives.
  - If Gmail SMTP is blocked from the server, test the connection with `timeout 5 bash -c "</dev/tcp/smtp.gmail.com/587" && echo open`.
  - If it is blocked, switch to the Brevo API: run `composer require symfony/brevo-mailer symfony/http-client`, then set `MAIL_MAILER=brevo` and `BREVO_API_KEY=...`. Port 443 is never blocked.
- Upload a product image in the admin, redeploy, and check the image is still there. Uploads live in `storage/app/public`, which the deploy script never overwrites.
