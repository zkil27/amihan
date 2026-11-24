# AMIHAN logo brief

## The meaning (for the Brand criterion)

- **Amihan** is the cool northeast monsoon of the Philippines, which arrives around November and lasts until about February. It brings cold, dry air down from the highlands to the lowlands.
- In Tagalog mythology, Amihan is also the **first creature**, a bird.
- The brand reads as *the breeze that comes down from the mountains*: coolness, slowness, altitude. That is what a cup at AMIHAN should do, bringing a little of the mountain down to you.
- The cool amihan months roughly coincide with the highland coffee harvest in the Cordillera. Verify this with a local source before presenting it as fact.
- The tagline is **"Steeped in Altitude."** The sister-brand story is **"From coast to crest"**: Cafe-Isla pours by the sea, and AMIHAN pours above the clouds.

## Approach

1. Gemini (Nano Banana Pro) generates only the **symbol**.
2. The **wordmark** "AMIHAN" is typeset in **Zodiak**, the website's display font, with wide letter-spacing. Using the same typeface as the site is what gives the logo "consistent typography and a clear link to the brand."
3. Trace the chosen symbol to SVG, using Inkscape (Path → Trace Bitmap) or vectorizer.ai.
4. Replace the paths in `resources/js/components/brand/logo.tsx` (`RidgeMark`) and in `public/favicon.svg`.

**Done (2026-11-25).** The chosen variation (top right of `general assets/Gemini_Generated_Image_zdrda9zdrda9zdrd.jpg`) was redrawn by hand as clean vector paths instead of auto-traced, so the stroke stays even at every size. It is live in `logo.tsx` and `public/favicon.svg`, and the master file is `general assets/amihan-mark.svg`.

## Palette

| Name | Hex | Role |
|---|---|---|
| Ridge Mist | `#EAE7E1` | Background |
| Deep Cordillera Pine | `#1E2D24` | Logo, text, dark chapters |
| Burnished Brass | `#B08D57` | Foil and packaging accent; used once per screen on the site |
| Highland Moss | `#768778` | Secondary |
| Volcanic Basalt | `#262625` | Footer |

## Concept A: "Ridge Wind" (recommended)

Three thin, nested contour lines rise into a mountain peak. The top line continues past the summit and curls once into a soft gust of wind, so the mountain and the amihan are drawn in one stroke.

> Minimal flat vector logo symbol: three thin parallel contour lines forming a mountain peak, like a topographic map; the topmost line continues past the summit and curls once into a soft gust of wind. Single colour deep pine green (#1E2D24) on a plain off-white background (#EAE7E1). Monoline, even stroke weight, rounded line ends, geometric and balanced, generous empty space around it. No text, no gradients, no shadows, no 3D, no mockup. Show 4 variations in a 2×2 grid.

## Concept B: "A-Peak" monogram

> Minimal flat vector monogram: the capital letter A drawn as a sharp mountain peak with thin elegant strokes; its crossbar is replaced by a single long horizontal wind line that passes through the letter and extends beyond both legs, slightly wavy at one end. Single colour deep pine green on off-white. No other text, no gradients, no shadows, no mockup. 4 variations in a 2×2 grid.

## Concept C: "Altitude Seal" (packaging stamp)

> Minimal circular stamp emblem for a highland coffee brand: thin double ring; inside, a simple line-drawn mountain ridge with a wisp of wind above it; around the ring the text "AMIHAN · STEEPED IN ALTITUDE · 1,800 MASL" in small evenly spaced uppercase serif letters. Single colour burnished brass (#B08D57) on off-white. Flat vector, no gradients, no mockup.

## Tips for Nano Banana Pro

- Keep "flat vector, single colour, plain background, no mockup" in every round.
- Refine by editing rather than re-prompting, for example: "Keep variation 3; make the wind curl smaller and the lines thinner."
- Ask for a 1:1 image at the highest resolution, so it traces cleanly.
- Check the mark at 32 px. It has to read as a favicon.

## Lockups to prepare for the slides

- Horizontal: symbol + `A M I H A N`
- Stacked: symbol above the wordmark
- Symbol only (favicon, social avatar)
- Colourways: Pine on Mist, Mist on Pine, Brass on Pine (foil)
