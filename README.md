# AMIHAN: Highland Coffee Sanctuary

*Steeped in Altitude.* A storytelling cafe website with a working e-commerce store, the **Highland Pantry**.

- **Stack:** Laravel 12 (PHP 8.2) and MySQL/MariaDB, with Inertia and React (TypeScript).
- **Motion:** GSAP, Lenis and Motion.
- **Status:** a student project for PCU Dasmariñas, College of Informatics. Payments are simulated.

## Run it locally (XAMPP)

1. Start **MySQL** in the XAMPP Control Panel. Then create the database:
   ```
   C:\xampp\mysql\bin\mysql -uroot -e "CREATE DATABASE amihan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
   ```
2. In `.env`, set:
   ```
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=amihan
   DB_USERNAME=root
   DB_PASSWORD=
   ```
3. Install and seed:
   ```
   composer install
   npm install
   php artisan key:generate
   php artisan migrate:fresh --seed
   php artisan storage:link
   npm run build
   php artisan serve
   ```
   Then open http://127.0.0.1:8000.

   To use XAMPP's **Apache** instead of `php artisan serve`, point a virtual host's `DocumentRoot` at `c:/dev/amihan/public`.

During development, run `npm run dev` alongside `php artisan serve` for hot reload.

## Demo accounts

The password for every account is `amihan2026`.

| Role | Email |
|---|---|
| Customer | customer@amihan.test |
| Admin | admin@amihan.test |
| Staff | staff@amihan.test |
| Fulfillment only | fulfillment@amihan.test |
| Courier | courier@amihan.test |

The staff portal is at `/admin/login`. Couriers land on `/courier`.

## Test payments and coupons

- **Cards:** `4242 4242 4242 4242` is approved and `4000 0000 0000 0002` is declined. GCash is approved instantly, and COD is marked paid when the courier delivers.
- **Coupons:** `AMIHAN10` (10% off), `FIRSTBREEZE` (₱150 off), and `OLDMIST` (expired).

## Email

Order confirmation, shipping updates, cancellations and return or refund decisions are all emailed.

- **Gmail:** set `MAIL_MAILER=smtp`, `MAIL_HOST=smtp.gmail.com`, `MAIL_PORT=587` and `MAIL_ENCRYPTION=tls`. `MAIL_USERNAME` is your Gmail address and `MAIL_PASSWORD` is a Google **App Password** (16 characters). Set `MAIL_FROM_ADDRESS` to the same Gmail address.
- **Offline:** `MAIL_MAILER=log` writes emails to `storage/logs/laravel.log` instead.

A failed email never breaks checkout; the failure is logged.

## Tests

```
php artisan test
```

32 tests cover:
- registration with hashed passwords
- cart persistence and merging
- checkout validation and declined cards
- the full order lifecycle through return, restock and refund
- role-based access
- image upload

## Where things live

| What | Where |
|---|---|
| Database tables (ERD) | `database/migrations`, `docs/erd.md` |
| Use-case diagram | `docs/use-case.puml` |
| Business logic | `app/Services/CartService.php`, `OrderService.php`, `MockPaymentGateway.php` |
| Roles and permissions | `app/Http/Middleware/EnsureRole.php`, `app/Providers/AppServiceProvider.php` (Gates), `routes/web.php` |
| Emails | `app/Mail/*`, `resources/views/mail/*` |
| Storefront pages (React) | `resources/js/pages/store/*` |
| Admin pages (React) | `resources/js/pages/admin/*` |
| Courier app | `resources/js/pages/courier/index.tsx` |
| Motion system | `resources/js/motion/*`, `docs/motion-storyboard.md` |
| Images and video prompts | `docs/image-prompts.md` (drop files into `public/images/story`, `public/images/products`, `public/media`) |
| Logo | `docs/logo-brief.md`, `resources/js/components/brand/logo.tsx` |
| Demo script | `docs/demo-script.md` |
| Deployment | `scripts/deploy.sh`, `docs/deploy-foursys.md` |

## Notes

- All customers, orders and reviews in the seed data are synthetic.
- The sanctuary's address on the Visit page is fictional.
- Origin photos are illustrative.
