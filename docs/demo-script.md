# Demo script (about 6 minutes)

**Accounts.** The password for every account is `amihan2026`.

| Role | Email | Where to sign in |
|---|---|---|
| Customer | customer@amihan.test (or register live) | /login |
| Admin | admin@amihan.test | /admin/login |
| Staff | staff@amihan.test | /admin/login |
| Fulfillment only | fulfillment@amihan.test | /admin/login |
| Courier | courier@amihan.test | /admin/login (it redirects to /courier) |

**Test cards.**
- `4242 4242 4242 4242` is approved.
- `4000 0000 0000 0002` is declined.
- Any future expiry and any CVC work.

**Coupons.**
- `AMIHAN10` gives 10% off orders of ₱500 or more.
- `FIRSTBREEZE` gives ₱150 off orders of ₱1,000 or more.
- `OLDMIST` is expired, to show the error.

**Before the demo.** Register a customer with **your own email address**, so the confirmation emails land in a real inbox while the panel watches.

---

## Member 1: brand and storefront (about 2 min)

1. **Home.** Explain the name: *amihan*, the cool wind that comes down from the mountains. Scroll slowly and point out:
   - the altitude rail on the left, climbing from 0 to 1,800 MASL
   - the four origins
   - the hearth chapter
   - the coast-to-crest image wipe
2. Point out the logo, palette and type: Zodiak for display, Hanken Grotesk for text, Martian Mono for numbers. These are the same in the logo, the site and the emails.
3. **Pantry.**
   - Search "honey".
   - Open **Refine**, filter by altitude "1,500 m and above", sort by price.
   - Point out that the URL changes, so the back button and shared links work.
4. **Product page.** Change the size; the price crossfades. Open the "Brew guide" accordion.

## Member 2: cart, checkout, emails, returns (about 2 min)

1. Add two items. The button says "Added", and a brass line draws under Cart.
2. Go to another page to show the cart count persists. Open the drawer:
   - adjust a quantity
   - remove an item, then press **Undo**
   - apply `AMIHAN10`
   - point out the free-delivery hairline
3. **Checkout.** Walk the three steps: Details, Delivery, Payment.
   - Try a bad postal code to show validation.
   - Pay with the **decline** card first, then `4242…`.
4. The **summit** page appears. Open the email inbox: the confirmation has arrived.
5. **Account.** Show the order history with dates and statuses, and the tracking timeline.
6. Show **Request a cancellation** on that order. Explain that returns open after delivery, within 7 days.

## Member 3: admin, roles, fulfilment, refunds (about 2 min)

1. Sign in at `/admin/login` as **admin**. On the overview, point out:
   - revenue, orders and the sales chart
   - top products
   - low-stock alerts
   - conversion and abandonment
2. **Products.** Open a product and point out:
   - **upload an image** (drag and drop)
   - change the price
   - adjust stock, which writes a ledger row
   - archive versus delete
3. **Orders.** Open the new order and walk it through:
   - **Confirm**, then **Mark packed** (the customer receives a "confirmed" email)
   - **Assign courier**
4. In a phone-sized window, sign in as the **courier**:
   - tap **Picked up**, which sends the shipping email
   - **hold to confirm delivery**
5. As the customer, request a **return** on a delivered order. The seeded delivered order for `customer@amihan.test` works.
6. As admin, open **Returns** and choose **Approve, restock & refund**. Show:
   - stock went back up
   - the payment is marked refunded
   - the refund email arrived
7. **Employees.** Show the roles. Sign in as `fulfillment@amihan.test` and show that Products and Reports are hidden and blocked (403).

## If something goes wrong

- **No internet:** set `MAIL_MAILER=log` in `.env`. Emails are then written to `storage/logs/laravel.log`, and you can show them there.
- **To reset the demo data:** `php artisan migrate:fresh --seed`
