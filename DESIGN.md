# DESIGN.md: AMIHAN

The visual system as built. The tokens live in `resources/css/app.css` and `resources/js/motion/tokens.ts`.

## World

An editorial ascent, from the coast to the crest:
- a Ridge Mist ground
- Pine ink
- thin contour hairlines in place of boxes
- very large light display type
- numbers set in a quiet monospace, so elevation always reads like an altimeter

The storefront is a Persuade surface: spacious, one idea per viewport. The admin and courier views are Operate surfaces: the same palette, denser, with no decorative motion.

## Colour

| Token | Hex | Use |
|---|---|---|
| `mist` | #EAE7E1 | Page ground |
| `mist-deep` | #DFDAD1 | Image placeholders, wells |
| `paper` | #F4F2EE | Raised admin panels, toasts |
| `pine` | #1E2D24 | Text, primary buttons, drenched chapters |
| `pine-soft` | #2B3B31 | Button hover, plates on pine |
| `basalt` | #262625 | Footer |
| `brass` | #B08D57 | The single "active / it worked" mark per view: nav dot, focus ring, success hairline |
| `brass-deep` | #8A6B3C | Brass as text (elevations) on mist |
| `moss` | #768778 | Decoration and large text only |
| `ink-soft` | #55635A | Secondary text (meets AA on mist) |
| `clay` | #9B4A37 | Errors, cancellations |
| `hair` / `hair-strong` | pine at 16% / 32% | Contour hairlines, input underlines |

**Strategy:** restrained. Mist dominates, Pine drenches whole chapters (the hearth, the footer band, the staff login), and Brass appears at most once per view.

## Type

| Role | Face | Setting |
|---|---|---|
| Display | Zodiak 300 (with italic) | `t-hero` clamp(3.25rem, 9vw, 8.5rem), `t-h1`, `t-h2`, `t-h3`; line-height 1.02 to 1.15; −0.02em |
| Text and UI | Hanken Grotesk (variable) | 17px base, 1.6 leading; labels 13px in `ink-soft` |
| Numbers | Martian Mono 300 | `t-num`: MASL, prices, order and tracking numbers, tabular figures |

All three are self-hosted from `/public/fonts`.

## Space

- 8px base unit.
- Section padding is `--section-y`, which is clamp(72px, 16vh, 200px).
- The gutter is `--gutter`, which is clamp(20px, 5vw, 72px).
- The content width is capped at 1440px, and text measures at 60ch.
- Product grids run 1, 2 or 3 columns, with gutters of clamp(24px, 4vw, 64px).
- Checkout and cart columns are at most 620px wide.

## Components

- **Buttons:** `.btn-solid` (Pine) and `.btn-line` (hairline) are 52px tall with a 2px radius and a 2px arrow nudge. `ActionButton` adds a contour loader and a done-label crossfade.
- **Fields:** a single bottom hairline that thickens on focus. A moss ✓ shows a valid value; a clay hairline plus an animated message shows an error.
- **Plates:** image frames that fade in from a mist block, or show contour placeholders with a caption.
- **Status pills:** rounded outlines whose colour follows the status.
- **Links:** `.link-line`, an underline that draws in from the left.

## Motion

Quiet luxury; the full catalogue is in `docs/motion-storyboard.md`.

- Durations: 120, 240, 380, 520 and 900 ms.
- Ease: `cubic-bezier(0.22, 1, 0.36, 1)`.
- Controls move 4px or less, and entrances rise 12px or less.
- Signatures:
  - the altitude rail
  - the "mist pass" page transition
  - the order-success contour summit

## Logo

The **Ridge Wind** mark (`components/brand/logo.tsx`, `public/favicon.svg`, master file `general assets/amihan-mark.svg`) is paired with a Zodiak wordmark tracked at 0.32em. It is a hand-drawn vector of the chosen Gemini variation: three rounded contour lines form a double peak, and the outer line rolls on as a breeze and curls once. See `docs/logo-brief.md`.
