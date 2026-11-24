# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Laravel 12 (PHP 8.2, runs on XAMPP locally) and MySQL/MariaDB, with Inertia and React (TypeScript) for every page. The team chose this stack. It is hosted on Foursys Cloud (HestiaCP shared hosting) at orange-cobra-186442.foursyscloud.com.

## Users

- **Customers** in the Philippines, usually browsing on a phone, who want specialty highland coffee delivered, or who are planning a visit to the sanctuary.
- **AMIHAN employees** working in the admin portal:
  - admin
  - staff
  - fulfillment-only
- **Couriers**, who update deliveries from a phone.
- **The PCU College of Informatics panel**, who evaluate the build against the e-commerce rubric in a live demo.

## Product Purpose

AMIHAN is a luxury highland "slow bar" cafe and the sister brand of the coastal Cafe-Isla Group (the story is "Coast to Crest"). The website tells that story and sells the Highland Pantry: whole beans by origin, bottled Cloud Pour slow drip, ritual kits, gift tins and hearth bakes. It must support the full transactional flow:

- catalog
- cart
- checkout
- email notifications
- returns
- an admin portal with role-based access, inventory, fulfillment, refunds and reports

## Positioning

Altitude is the organising idea. Every origin and product carries its elevation in MASL (metres above sea level): Amadeo, Sagada, Atok and Mt. Apo. The site reads as an ascent from the coast to the crest. The name comes from the *amihan*, the cool northeast monsoon that comes down from the mountains.

## Operating Context

- **Delivery** costs ₱150 nationwide and is free over ₱2,000. Customers choose a delivery window: Morning Breeze or Afternoon Hearth.
- **Payment** is simulated: card (test numbers), GCash, or cash on delivery.
- **Returns** are accepted within 7 days of delivery. Cancellations are possible while an order is pending or confirmed.
- **Order emails** are sent through Gmail SMTP.

## Capabilities and Constraints

- The demo deadline is 2026-11-25.
- The UI is mobile-first.
- The look is editorial and minimal, with lots of empty space, and must never feel crowded.
- Motion is heavy but subtle, in a quiet-luxury register.
- The image slots wait for team-generated Gemini and Veo assets. Until then, quiet placeholders show.

## Brand Commitments

- **Name and lines:** the name AMIHAN, the tagline "Steeped in Altitude.", and the line "From coast to crest."
- **Palette (from the team's vision doc):**
  - Ridge Mist `#EAE7E1`
  - Deep Cordillera Pine `#1E2D24`
  - Volcanic Basalt `#262625`
  - Burnished Brass `#B08D57`
  - Highland Moss `#768778`
- **Fonts:** the team asked for fresher fonts than the doc's Cormorant / Plus Jakarta / IBM Plex. The build uses Zodiak, Hanken Grotesk and Martian Mono.
- **Voice:** poetic, unhurried and understated.

## Evidence on Hand

- The team's Google Doc vision plan.
- No real photography yet. The prompts are in `docs/image-prompts.md`.
- All customers, orders and figures in the seed data are synthetic.
- The sanctuary address is fictional.
- There are no testimonials or press. Do not invent any.

## Product Principles

1. Altitude leads: elevation is shown wherever a product has one.
2. One idea per screen. Cut or split content rather than shrink it.
3. Motion should be felt more than seen, with one response per action.
4. The transactional flow must be complete and verifiable before any extra polish.

## Accessibility & Inclusion

- Meet WCAG AA contrast on the mist background.
- Keep keyboard focus visible.
- Honour `prefers-reduced-motion`.
- Make touch targets at least 44 px.
