# ASCII Art Tiles — slug → file mapping & notes

The engine `AsciiArt.image()` maps **bright pixels → dense ASCII chars** and
**dark pixels (`L<6`) → blank**. So logos must have the **mark bright on a dark
background** to read; white-background art was inverted/stripped to black.

Logos render **mono** (`color:false`, `#9fb6cf`, `maxCols 40/54`, `gamma 0.7`);
scenes render **colored** (`color:true`, `maxCols 80/120`, `gamma 0.95`). Wired in
`js/app.js` → `mountSectionArt()`, guarded by the `ART_HAVE` map so only the slugs
below mount; every other `data-art` tile keeps its dashed placeholder.

## Filled — logos (`images/art/<slug>.jpg`)

| data-art            | slug              | source | processing | quality |
|---------------------|-------------------|--------|------------|---------|
| `logo:trisolaris`   | logo-trisolaris   | https://www.trisolaris.io/images/384x384_App_Icon.png (og/app icon, RGBA) | composite transparent→black, autocontrast, contrast 1.45 | Good — three tri-planet circles read clearly |
| `logo:near`         | logo-near         | https://near.org og:image (neon "N" on dark dot-matrix) | center-square crop, light contrast | Good — the NEAR "N" reads; faint bg dot speckle suppressed by gamma 0.7 |
| `logo:dapdap`       | logo-dapdap       | https://dapdap.net/favicon.ico (only real asset; site is a SPA, logo.png 404s to shell) | crop to alpha bbox, →black, contrast/bright boost | Marginal — source is only 28×31px, so the mark is blocky. Reads as a logo blob, not crisp |
| `logo:beratown`     | logo-beratown     | https://bera.town/images/favicon.svg → rasterized 512px via `qlmanage` | strip near-white→black, crop, →black | Marginal — bear-in-blue-circle reads as a textured orb; bear silhouette is soft |

## Filled — scenes (`images/art/<slug>.jpg`)

| data-art               | slug                 | source (Wikipedia/Wikimedia) | quality |
|------------------------|----------------------|------------------------------|---------|
| `scene:fireflies`      | scene-fireflies      | Grave_of_the_Fireflies_Japanese_poster.jpg | Excellent — two kids + umbrella glow on black |
| `scene:breaking-bad`   | scene-breaking-bad   | Breaking_Bad_logo.svg (500px PNG) | Good — iconic Br/Ba green periodic boxes; logo not a still (Wikipedia has no free still) |
| `scene:interstellar`   | scene-interstellar   | Interstellar_film_poster.jpg | Good — lone astronaut silhouette in icy field; some scanline banding on the sky gradient |
| `scene:scott-pilgrim`  | scene-scott-pilgrim  | Scott_Pilgrim_vs._the_World_teaser.jpg | Busy — colorful comic poster reads as chaotic color speckle (on-brand), figure soft |
| `scene:swiss-army-man` | scene-swiss-army-man | Swiss_Army_Man_poster.png | Busy — two faces in a bright cloud field; faces faintly discernible, banding on sky |

All scene sources are low-res non-free poster thumbnails (~220–260px wide); fine
since ASCII downsamples to ~80–120 cols. Posters are portrait, square-cropped on
the subject. Processing: square crop → autocontrast → Color 1.3–1.4 → Contrast 1.2–1.25.

## Skipped (placeholder left intact)

| data-art             | reason |
|----------------------|--------|
| `logo:chien-tinh`    | Vietnamese restaurant — no usable logo (per brief) |
| `logo:sio-sushi`     | Japanese restaurant — no usable logo (per brief) |
| `logo:blondish`      | BLOND:ISH $NRG — no clean wordmark that ASCIIs well (per brief) |
| `logo:near-insights` | Defunct crypto-media brand — no distinct logo; reusing NEAR's "N" would mislead |
| `logo:nadsa`         | nadsa.space unreachable during sourcing (curl `http=000`, 0 bytes) |

No `artist:*` tiles exist in `index.html`, so the Jukebox section needed no art
(the `artist:` prefix is still handled in `mountSectionArt` for forward-compat,
but nothing mounts without a matching `ART_HAVE` entry).

## Verification
- `node --check js/app.js` → OK
- All 9 `images/art/*.jpg` are valid JPEGs; `ART_HAVE` matches them 1:1.
- ASCII legibility spot-checked with `scripts/img2ascii.py` at tile dimensions.
