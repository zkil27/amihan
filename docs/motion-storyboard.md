# Motion storyboard: quiet luxury

**Rule:** motion is *felt more than seen*.

- Controls move 4 px or less, and entrances rise 12 px or less.
- Nothing scales above 1.0, and nothing bounces.
- Each action gets one response.
- Brass appears at most once per screen.
- With "Reduce motion" turned on in device settings, all travel stops, but colour, opacity and feedback states stay.

## Timing tokens

The tokens are defined in `resources/js/motion/tokens.ts` and `resources/css/app.css`.

| Token | Duration | Used for |
|---|---|---|
| instant | 120 ms | Button press |
| quick | 240 ms | Hover and focus, number crossfades |
| base | 380 ms | Cart drawer, sheets, toasts |
| slow | 520 ms | Mist page transition |
| focal | 900 ms | Order-success "summit" |

Ease: `cubic-bezier(0.22, 1, 0.36, 1)`, a soft ease-out called "mist". Exits run at about 70% of their entrance duration.

## Libraries, one job each

| Library | Job |
|---|---|
| **GSAP + ScrollTrigger + SplitText** | Scroll scenes and headline reveals. The `useGSAP` hook cleans up on page change. |
| **Lenis** | Smooth wheel scrolling on desktop only. Phones keep native scrolling. |
| **Motion (React)** | Drawer, sheets, toasts, crossfades and layout changes. |
| **CSS transitions** | Links, buttons, focus, and the whole admin. |

## The Ascent (home page)

| Chapter | Altitude waypoint | Trigger | What moves | Reduced motion |
|---|---|---|---|---|
| 1 Arrival | 0 MASL | Page load | The hero image fades in over 1.4 s. The two headline lines rise 12 px, 120 ms apart. The image drifts 6% slower than the scroll. | Static |
| 2 Philosophy | 300 | Enters view | Headline lines rise through a mask; the paragraph fades. | Static |
| 3 Four origins | 500 → 1,800 | Scroll | The left column stays sticky. The big altitude figure crossfades to the origin in view, and the active origin goes from 40% to 100% opacity. Three ridge contours drift by 4–10%. | The number changes instantly; no drift |
| 4 Hearth (pine) | 1,500 | Enters view | Header colours invert. The video plays only while on screen. | The poster image shows |
| 5 Coast to crest | 0 → 1,800 | Scroll (sticky, 2 screens) | The crest photo rises over the coast through a clip mask ("mist lifting"). The caption crossfades from coast to crest. | Both captions show |
| 6 Bring home | 1,800 | Enters view | Product cards fade in. | Static |

**Altitude rail** (left margin on desktop, a hairline at the top on phones): it reads the altitude between the two waypoints around the middle of the screen. It updates the DOM directly on each frame, with no React re-render.

## Page transition: "mist pass"

A Ridge Mist band rises over the page (520 ms) while the next page loads. It holds for at least 260 ms so fast responses don't flash, then lifts away (360 ms). Only full page visits trigger it; filters and form posts do not. On product pages, the product image keeps its `view-transition-name`.

## Feedback catalogue

| Moment | Response |
|---|---|
| Cursor (storefront, mouse only) | A 6 px Pine dot tracks the pointer exactly, and a 34 px hairline ring trails a moment behind. Over links and buttons the ring opens to 1.35× and the dot fades. Over product cards it becomes a Pine disc reading "View". On Pine and Basalt sections it turns mist. In text fields the native text cursor returns. Pressing makes the ring breathe in slightly. With reduced motion, the ring follows without lag. Touch screens and the admin keep their normal pointer. |
| Link hover | A 1 px underline draws from the left and retracts to the right. |
| Active nav item | A brass dot glides between items. |
| Button | Hover: the fill deepens and the arrow moves 2 px. Press: opacity drops to 0.85. Loading: a single contour line traces. Done: the label crossfades to "Added". |
| Keyboard focus | A 2 px brass ring, offset 3 px. |
| Input | Focus: the hairline thickens to 2 px. Valid: a moss ✓ appears. Error: a clay hairline, and the message slides in below. |
| Variant picker | The underline glides to the selection and the price crossfades. |
| Add to cart | The label shows "Added"; the cart count crossfades; a brass hairline draws under the Cart link. A "In your cart · View" line appears for 4 s. |
| Cart drawer | Slides in from the right on desktop and from the bottom on phones. Removing a line fades it out, with **Undo** available for 5 s. Totals crossfade. |
| Free delivery | A hairline fills toward ₱2,000 and turns brass when reached. |
| Coupon | A contour loader runs; the discount line slides into the totals. |
| Filters | The count crossfades and the grid dims to 40% while loading. |
| Checkout | Step dots fill and the connecting hairline draws. An error sends the visitor back to the step that holds it. |
| Payment | "Processing…" with a contour loader. A decline shows an inline message, and the card field takes focus. |
| Order success | One contour line draws a peak (900 ms); the order number and copy fade in. |
| Tracking timeline | The hairline draws once up to the current step, which is marked with a static brass ring. |
| Courier | **Hold to confirm delivery**: a fill bar runs for 800 ms. On completion, the card fades out of the list. |
