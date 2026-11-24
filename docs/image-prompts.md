# Image & video prompts (Gemini / Nano Banana Pro / Veo)

Every prompt below is complete: size, subject and style are all inside the block. Copy one block, paste it, generate, then save the result under the **file name** in its heading.

Also set the **aspect ratio** in the generator's settings to the one written in the prompt, at **2K** resolution (4K for the logo). The text tells the model about the shape; the setting forces it.

## Where files go

| Kind | Folder | Picked up |
|---|---|---|
| Story images | `public/images/story/<name>.jpg` | Automatically, no rebuild |
| Product photos | `public/images/products/<slug>.jpg` | On `php artisan migrate:fresh --seed` (resets demo data), or upload in **Admin → Products → Edit → Images** |
| Videos | `public/media/<name>.mp4` (+ `.webm`) | Automatically |

Until a file exists, the site shows a mist placeholder with a caption.

## Checklist (25 files)

| # | File | Generate at | Save for web at | Shown on |
|---|---|---|---|---|
| 1 | `story/hero.jpg` | 1:1 · 2048 × 2048 | 2000 × 2000 | Home, first screen |
| 2 | `story/philosophy.jpg` | 4:5 · 1856 × 2304 | 1200 × 1500 | Home, "Terroir over syrups." |
| 3 | `story/hearth.jpg` | 4:5 · 1856 × 2304 | 1200 × 1500 | Home, pine chapter |
| 4 | `story/coast.jpg` | 4:5 · 1856 × 2304 | 1600 × 2000 | Home "From coast to crest", Story |
| 5 | `story/crest.jpg` | 4:5 · 1856 × 2304 | 1600 × 2000 | Home "From coast to crest", Story |
| 6 | `story/sanctuary.jpg` | 3:2 · 2528 × 1696 | 2400 × 1600 | Visit (3:2), Story (cropped to 4:5) |
| 7 | `story/origin-amadeo.jpg` | 3:2 · 2528 × 1696 | 2400 × 1600 | Origins |
| 8 | `story/origin-sagada.jpg` | 3:2 · 2528 × 1696 | 2400 × 1600 | Origins |
| 9 | `story/origin-atok.jpg` | 3:2 · 2528 × 1696 | 2400 × 1600 | Origins (3:2), Story (cropped to 4:5) |
| 10 | `story/origin-apo.jpg` | 3:2 · 2528 × 1696 | 2400 × 1600 | Origins |
| 11–22 | `products/<slug>.jpg` (12 files) | 4:5 · 1856 × 2304 | 1600 × 2000 | Pantry cards, product page, cart (4:5); thumbnails (1:1 centre crop) |
| 23 | `media/hero.mp4` | 16:9 · 1920 × 1080, 8 s | 1280 wide, ≤ 2.5 MB | Home, first screen (optional) |
| 24 | `media/hearth.mp4` | 9:16 · 1080 × 1920, 8 s | 720 wide, ≤ 2.5 MB | Home, pine chapter (optional) |
| 25 | Logo symbol | 1:1 · 4096 × 4096 | Trace to SVG | Header, favicon, slides |

Save JPGs at quality 80 or so; aim for under 400 KB each. The site serves files as they are, so an unresized 2K PNG will slow the demo.

---

## Story images

### 1. `hero.jpg`

```text
Square 1:1 image, 2048 × 2048 px. Dawn fog rolling over layered pine ridges in the Cordillera mountains of the Philippines; in the lower right foreground a single handleless stoneware cup of black coffee resting on a weathered wooden rail; most of the frame is open, pale mist, with the upper left left empty. Keep the cup inside the lower-right quarter but at least 10% away from the edges, because the frame is cropped slightly on both desktop and phone. Editorial photograph, medium-format film look, soft overcast highland light, muted desaturated palette of mist grey, deep pine green, basalt black with a small touch of brass; generous negative space; calm, quiet, unhurried; no text, no logos, no watermark, no people.
```

### 2. `philosophy.jpg`

```text
Portrait 4:5 image, 1856 × 2304 px. Close view of two hands cradling a hand-thrown stoneware cup, thin steam rising; a folded white cotton oshibori towel on dark wood beside it; the cup sits slightly below the centre with calm empty space above. Editorial photograph, medium-format film look, soft overcast highland light, muted desaturated palette of mist grey, deep pine green, basalt black with a small touch of brass; generous negative space; calm, quiet, unhurried; no text, no logos, no watermark, no faces.
```

### 3. `hearth.jpg`

```text
Portrait 4:5 image, 1856 × 2304 px. A cast-iron pan holding a golden, risen bibingka soufflé on banana leaf, a cast-iron hearth glowing softly behind, dark wood counter, low warm light; the pan sits in the lower half of the frame, darkness and soft glow above. Editorial photograph, medium-format film look, muted desaturated palette of deep pine green, basalt black and warm ember with a small touch of brass; generous negative space; calm, quiet, unhurried; no text, no logos, no watermark, no people.
```

### 4. `coast.jpg`

```text
Portrait 4:5 image, 1856 × 2304 px. Calm grey sea at first light seen from a quiet Philippine shore; the horizon sits exactly at 40% from the top of the frame; one small outrigger boat far away near the centre; the edges are only sea and sky, because the frame may be cropped closer to square on wide screens. Editorial photograph, medium-format film look, soft overcast light, muted desaturated palette of mist grey, deep pine green, basalt black with a small touch of brass; generous negative space; calm, quiet, unhurried; no text, no logos, no watermark, no people.
```

### 5. `crest.jpg`

```text
Portrait 4:5 image, 1856 × 2304 px. First light on a mountain ridge rising above a sea of clouds; the line where the ridge meets the clouds sits exactly at 40% from the top of the frame, so it mirrors a seascape whose horizon sits at the same height; the highest point of the ridge is near the centre; the edges are only cloud and sky. Editorial photograph, medium-format film look, soft overcast highland light, muted desaturated palette of mist grey, deep pine green, basalt black with a small touch of brass; generous negative space; calm, quiet, unhurried; no text, no logos, no watermark, no people.
```

> Tip: generate `coast.jpg` first, then give it to Gemini as a reference for `crest.jpg` ("match the horizon height and light of this image"). On the home page the crest wipes upward over the coast, so matching horizons make the move look intentional.

### 6. `sanctuary.jpg`

```text
Landscape 3:2 image, 2528 × 1696 px. A quiet slow-bar interior: a long pale-wood counter, a single gooseneck kettle on it, and a large window behind framing pine trees in fog; no screens. Keep the kettle and the window in the central third of the width, because this image is also cropped to a tall 4:5 frame. Editorial photograph, medium-format film look, soft overcast highland light, muted desaturated palette of mist grey, deep pine green, basalt black with a small touch of brass; generous negative space; calm, quiet, unhurried; no text, no logos, no watermark, no people.
```

### 7. `origin-amadeo.jpg`

```text
Landscape 3:2 image, 2528 × 1696 px. A shaded coffee farm in Amadeo, Cavite: dappled light through tall trees, coffee cherries drying on raised mesh beds that lead the eye toward the centre. Editorial photograph, medium-format film look, soft overcast light, muted desaturated palette of mist grey, deep pine green, basalt black with a small touch of brass; generous negative space; calm, quiet, unhurried; no text, no logos, no watermark, no people.
```

### 8. `origin-sagada.jpg`

```text
Landscape 3:2 image, 2528 × 1696 px. Limestone outcrops and pine forest above Sagada, Mountain Province, with a branch of coffee cherries ripening red in the soft-focus foreground. Editorial photograph, medium-format film look, soft overcast highland light, muted desaturated palette of mist grey, deep pine green, basalt black with a small touch of brass; the red cherries are the only warm colour; generous negative space; calm, quiet, unhurried; no text, no logos, no watermark, no people.
```

### 9. `origin-atok.jpg`

```text
Landscape 3:2 image, 2528 × 1696 px. Terraced highland slopes with coffee shrubs growing among pine trees in Atok, Benguet, morning cloud lying below the ridge line. Keep the main terraces and the ridge in the central third of the width, because this image is also cropped to a tall 4:5 frame. Editorial photograph, medium-format film look, soft overcast highland light, muted desaturated palette of mist grey, deep pine green, basalt black with a small touch of brass; generous negative space; calm, quiet, unhurried; no text, no logos, no watermark, no people.
```

### 10. `origin-apo.jpg`

```text
Landscape 3:2 image, 2528 × 1696 px. Lush volcanic slopes of Mt. Apo in Mindanao, coffee grown under tall shade trees in the foreground, the cloud-capped summit in the distance. Editorial photograph, medium-format film look, soft overcast light, muted desaturated palette of mist grey, deep pine green, basalt black with a small touch of brass; generous negative space; calm, quiet, unhurried; no text, no logos, no watermark, no people.
```

Origin images are illustrative, not real farms. Do not caption them with real farmers' names.

---

## Product photos (one consistent set)

All twelve use the same set-up, so the Pantry grid looks like one shoot. The product sits in the centre with room around it: the site shows it at 4:5 and crops the small thumbnails to a centre square.

> Tip: after the first one comes out right, give it to Gemini as a reference for the rest ("same background, light and camera height as this image").

### 11. `atok-highland.jpg`

```text
Portrait 4:5 image, 1856 × 2304 px. Studio product photograph of a matte kraft-paper coffee pouch with a fold-over top, standing upright, seen straight on, centred in the frame and filling about half its height, on a seamless pale mist-grey background (#EAE7E1); soft diffused daylight from the left, a gentle natural shadow; the label area is plain and blank; minimal, premium, matte materials; no text, no logos, no watermark.
```

### 12. `sagada-ridge.jpg`

```text
Portrait 4:5 image, 1856 × 2304 px. Studio product photograph of a matte kraft-paper coffee pouch with a fold-over top, standing upright and turned slightly to the left, with a few dark roasted coffee beans scattered at its base, centred in the frame and filling about half its height, on a seamless pale mist-grey background (#EAE7E1); soft diffused daylight from the left, a gentle natural shadow; the label area is plain and blank; minimal, premium, matte materials; no text, no logos, no watermark.
```

### 13. `mt-apo-volcanic.jpg`

```text
Portrait 4:5 image, 1856 × 2304 px. Studio product photograph of a matte kraft-paper coffee pouch with a fold-over top, standing upright and turned slightly to the right, resting beside a small piece of dark volcanic stone, centred in the frame and filling about half its height, on a seamless pale mist-grey background (#EAE7E1); soft diffused daylight from the left, a gentle natural shadow; the label area is plain and blank; minimal, premium, matte materials; no text, no logos, no watermark.
```

### 14. `amadeo-hearth-espresso.jpg`

```text
Portrait 4:5 image, 1856 × 2304 px. Studio product photograph of a matte kraft-paper coffee pouch with a fold-over top, standing upright, seen straight on, with a small stoneware espresso cup beside it, centred in the frame and filling about half its height, on a seamless pale mist-grey background (#EAE7E1); soft diffused daylight from the left, a gentle natural shadow; the label area is plain and blank; minimal, premium, matte materials; no text, no logos, no watermark.
```

### 15. `cloud-pour-atok.jpg`

```text
Portrait 4:5 image, 1856 × 2304 px. Studio product photograph of a slim amber glass bottle of cold-drip coffee with a cork stopper, standing upright, centred in the frame and filling about 60% of its height, on a seamless pale mist-grey background (#EAE7E1); soft diffused daylight from the left, a gentle natural shadow and a faint amber glow cast through the glass; the label area is plain and blank; minimal, premium; no text, no logos, no watermark.
```

### 16. `cloud-pour-mt-apo.jpg`

```text
Portrait 4:5 image, 1856 × 2304 px. Studio product photograph of a slim amber glass bottle of cold-drip coffee with a cork stopper, standing upright beside a short clear glass of the same coffee over a single large ice cube, centred together in the frame and filling about 60% of its height, on a seamless pale mist-grey background (#EAE7E1); soft diffused daylight from the left, a gentle natural shadow; the label area is plain and blank; minimal, premium; no text, no logos, no watermark.
```

### 17. `brass-gift-tin-atok.jpg`

```text
Portrait 4:5 image, 1856 × 2304 px. Studio product photograph of a round brushed-brass gift tin with its lid on, seen from slightly above, a small blank cream note card leaning against it, centred in the frame and filling about 40% of its height, on a seamless pale mist-grey background (#EAE7E1); soft diffused daylight from the left, a gentle natural shadow, soft satin highlights on the brass; minimal, premium; no text, no logos, no engraving, no watermark.
```

### 18. `the-morning-mist-kit.jpg`

```text
Portrait 4:5 image, 1856 × 2304 px. Studio product photograph of a hand-thrown ceramic pour-over dripper, a small matte kraft-paper coffee pouch and a handleless stoneware cup arranged together as a loose, balanced group, centred in the frame and filling about half its height, on a seamless pale mist-grey background (#EAE7E1); soft diffused daylight from the left, gentle natural shadows; the pouch label area is plain and blank; minimal, premium, matte materials; no text, no logos, no watermark.
```

### 19. `coast-to-crest-discovery-box.jpg`

```text
Portrait 4:5 image, 1856 × 2304 px. Studio product photograph of an open deep pine-green rigid gift box holding four small matte kraft-paper coffee pouches standing in a row, seen from slightly above, the lid leaning behind it, centred in the frame and filling about half its height, on a seamless pale mist-grey background (#EAE7E1); soft diffused daylight from the left, a gentle natural shadow; all label areas are plain and blank; minimal, premium, matte materials; no text, no logos, no watermark.
```

### 20. `coffee-passport-gift-card.jpg`

```text
Portrait 4:5 image, 1856 × 2304 px. Studio product photograph of a small linen-bound passport booklet in deep pine green, tied closed with natural cotton string, lying at a slight angle, seen from above, centred in the frame and filling about 40% of its height, on a seamless pale mist-grey background (#EAE7E1); soft diffused daylight from the left, a gentle natural shadow; the cover is plain and blank; minimal, premium, matte materials; no text, no logos, no watermark.
```

### 21. `cast-iron-bibingka-box.jpg`

```text
Portrait 4:5 image, 1856 × 2304 px. Studio product photograph of an open kraft pastry box with four round, golden bibingka on banana leaf visible inside, seen from slightly above, centred in the frame and filling about half its height, on a seamless pale mist-grey background (#EAE7E1); soft diffused daylight from the left, a gentle natural shadow; the box is plain and blank; minimal, premium, matte materials; no text, no logos, no watermark.
```

### 22. `tablea-sables.jpg`

```text
Portrait 4:5 image, 1856 × 2304 px. Studio product photograph of a small round tin with its lid set aside, filled with round dark chocolate butter cookies, two cookies resting beside it, seen from slightly above, centred in the frame and filling about 40% of its height, on a seamless pale mist-grey background (#EAE7E1); soft diffused daylight from the left, a gentle natural shadow; the tin is plain and blank; minimal, premium, matte materials; no text, no logos, no watermark.
```

---

## Veo video loops (optional)

The photos are enough for the demo. If you add a video, its photo above (`hero.jpg` or `hearth.jpg`) becomes the poster frame shown while it loads.

### 23. `hero.mp4`

The home hero frame is wider than tall on desktop and close to square on phones, so generate landscape and keep the action in the centre.

```text
Landscape 16:9 video, 1920 × 1080, 8 seconds, 24 fps. Static wide shot with a locked-off camera (no camera movement) of layered pine-covered mountain ridges in the Philippine Cordillera at dawn; thin fog drifts slowly from left to right through the valleys; the upper half of the frame is open pale sky and mist; the most interesting ridges sit in the central half of the width, because the sides are cropped on phones. Slow natural motion, no people, no text. Muted desaturated palette of mist grey, deep pine green and basalt; soft overcast light; calm, meditative; seamless loop, the last frame matches the first.
```

### 24. `hearth.mp4`

The frame is 4:5, so generate vertical; only a little of the top and bottom gets cropped.

```text
Vertical 9:16 video, 1080 × 1920, 8 seconds, 24 fps. Static overhead shot with a locked-off camera (no camera movement) of a slow pour-over: a thin stream of hot water spirals gently into a ceramic dripper, the coffee bloom rising and settling; the dripper sits in the exact centre of the frame. Slow natural motion, no people's faces, no text. Muted desaturated palette of mist grey, deep pine green and basalt; soft overcast light; calm, meditative; seamless loop, the last frame matches the first.
```

Compress each clip with ffmpeg (already on this PC) so each file is 2.5 MB or less:

```
ffmpeg -i raw-hero.mp4 -an -vf "scale=1280:-2,fps=24" -c:v libx264 -crf 28 -preset slow -movflags +faststart public/media/hero.mp4
ffmpeg -i raw-hero.mp4 -an -vf "scale=1280:-2,fps=24" -c:v libvpx-vp9 -crf 38 -b:v 0 public/media/hero.webm

ffmpeg -i raw-hearth.mp4 -an -vf "scale=720:-2,fps=24" -c:v libx264 -crf 28 -preset slow -movflags +faststart public/media/hearth.mp4
ffmpeg -i raw-hearth.mp4 -an -vf "scale=720:-2,fps=24" -c:v libvpx-vp9 -crf 38 -b:v 0 public/media/hearth.webm
```

---

## Logo symbol

### 25. Logo (Concept A, "Ridge Wind", recommended)

The full brief, the other two concepts and the tracing steps are in `docs/logo-brief.md`.

```text
Square 1:1 image, 4096 × 4096 px, highest resolution. Minimal flat vector logo symbol: three thin parallel contour lines forming a mountain peak, like a topographic map; the topmost line continues past the summit and curls once into a soft gust of wind. Single colour deep pine green (#1E2D24) on a plain off-white background (#EAE7E1). Monoline, even stroke weight, rounded line ends, geometric and balanced, generous empty space around it. No text, no gradients, no shadows, no 3D, no mockup. Show 4 variations in a 2×2 grid.
```

Once you pick a variation, ask for it alone: "Keep variation N only, centred, square 4096 × 4096 px, same style." Then trace that file to SVG.
