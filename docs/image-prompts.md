# Image & video prompts (Gemini / Nano Banana Pro / Veo)

Generate each image, then save it under the **file name** shown. The site picks the file up automatically: no code changes and no rebuild.

- Story images go in `public/images/story/`, for example `public/images/story/hero.jpg`.
- Product photos go in `public/images/products/<slug>.jpg`. You can also upload them in **Admin → Products → Edit → Images**, which is the better option to show during the demo.
- Videos go in `public/media/`, for example `public/media/hero.mp4`.

Until a file exists, the site shows a quiet mist placeholder with a caption.

## Style suffix (paste at the end of every image prompt)

> Editorial photograph, medium-format film look, soft overcast highland light, muted desaturated palette of mist grey, deep pine green, basalt black with a small touch of brass; generous negative space; calm, quiet, unhurried; no text, no logos, no watermark, no people's faces in focus.

## Story images

| File name | Used on | Aspect | Prompt (followed by the style suffix) |
|---|---|---|---|
| `hero.jpg` | Home, first screen | 1:1 (the frame is roughly square on desktop and on phones; keep the cup low and to the right) | Dawn fog rolling over layered pine ridges in the Cordillera mountains of the Philippines; in the lower right foreground a single handleless stoneware cup of black coffee resting on a weathered wooden rail; most of the frame is open, pale mist. |
| `philosophy.jpg` | Home, "Terroir over syrups." | 4:5 | Close view of two hands cradling a hand-thrown stoneware cup, thin steam rising; a folded white cotton oshibori towel on dark wood beside it. |
| `hearth.jpg` | Home, pine chapter | 4:5 | Cast-iron pan holding a golden, risen bibingka soufflé on banana leaf, a cast-iron hearth glowing softly behind, dark wood counter, low warm light. |
| `coast.jpg` | Home "From coast to crest", Story | 4:5 | Calm grey sea at first light seen from a quiet Philippine shore, a low horizon, one small outrigger boat far away. |
| `crest.jpg` | Home "From coast to crest", Story | 4:5 | The same first light on a mountain ridge above a sea of clouds; composed to mirror the coast image (horizon at the same height). |
| `sanctuary.jpg` | Visit, Story | 3:2 | A quiet slow-bar interior: long pale-wood counter, a single gooseneck kettle, a large window framing pine trees in fog; no screens. |
| `origin-amadeo.jpg` | Origins | 3:2 | Shaded coffee farm in Amadeo, Cavite, dappled light through tall trees, coffee cherries drying on raised mesh beds. |
| `origin-sagada.jpg` | Origins | 3:2 | Limestone outcrops and pine forest above Sagada, coffee cherries ripening red on a branch in the foreground. |
| `origin-atok.jpg` | Origins, Story | 3:2 | Terraced highland slopes with coffee shrubs among pine trees in Atok, Benguet, morning cloud below the ridge line. |
| `origin-apo.jpg` | Origins | 3:2 | Lush volcanic slopes of Mt. Apo in Mindanao, coffee grown under tall shade trees, distant cloud-capped summit. |

Origin images are illustrative, not real farms. Do not caption them with real farmers' names.

## Product photos (one consistent set)

Template, square 1:1:

> Studio product photograph of **{PRODUCT}** centered on a seamless pale mist-grey background (#EAE7E1), soft diffused daylight from the left, a gentle natural shadow, lots of empty space around the object; the label area is plain and blank; minimal, premium, matte materials; no text, no logos.

| File name (`public/images/products/…`) | `{PRODUCT}` |
|---|---|
| `atok-highland.jpg`, `sagada-ridge.jpg`, `mt-apo-volcanic.jpg`, `amadeo-hearth-espresso.jpg` | a matte kraft-paper coffee pouch with a fold-over top (vary the angle slightly for each) |
| `cloud-pour-atok.jpg`, `cloud-pour-mt-apo.jpg` | a slim amber glass bottle of cold-drip coffee with a cork stopper |
| `brass-gift-tin-atok.jpg` | a round brushed-brass gift tin |
| `the-morning-mist-kit.jpg` | a ceramic pour-over dripper, a small coffee pouch and a stoneware cup arranged together |
| `coast-to-crest-discovery-box.jpg` | an open pine-green rigid box holding four small coffee pouches |
| `coffee-passport-gift-card.jpg` | a small linen-bound passport booklet tied with string |
| `cast-iron-bibingka-box.jpg` | a kraft pastry box with banana-leaf-wrapped bibingka visible inside |
| `tablea-sables.jpg` | a small tin of round chocolate butter cookies |

After adding files to `public/images/products/`, run `php artisan migrate:fresh --seed` to attach them. That command resets the demo data. Alternatively, upload them through the admin.

## Veo video loops (optional)

Rules for every clip:
- 8 seconds, with a **locked-off camera (no camera movement)**.
- Slow natural motion, no people, no text.
- Add this suffix: *"Muted desaturated palette of mist grey, deep pine green and basalt; soft overcast light; calm, meditative; seamless loop, the last frame matches the first."*

| File name (`public/media/…`) | Prompt |
|---|---|
| `hero.mp4` | Static wide shot of layered pine-covered mountain ridges in the Philippine Cordillera at dawn; thin fog drifts slowly from left to right through the valleys; the upper half of the frame is open pale sky and mist. (vertical 4:5 or 9:16) |
| `hearth.mp4` | Static overhead shot of a slow pour-over: a thin stream of hot water spirals gently into a ceramic dripper, the coffee bloom rising and settling. (vertical) |

Compress each clip before adding it, with ffmpeg (already on this PC). Keep each file at 2.5 MB or less:

```
ffmpeg -i raw.mp4 -an -vf "scale=1080:-2,fps=24" -c:v libx264 -crf 28 -preset slow -movflags +faststart public/media/hero.mp4
ffmpeg -i raw.mp4 -an -vf "scale=1080:-2,fps=24" -c:v libvpx-vp9 -crf 38 -b:v 0 public/media/hero.webm
ffmpeg -i public/media/hero.mp4 -frames:v 1 public/images/story/hero.jpg   # poster frame (only if you have no hero photo)
```
