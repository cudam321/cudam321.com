# PORT_NOTES — cudam321.com static port

Ported `design_handoff_cudam321_2/Cudam321.dc.html` (a React-runtime "Design Component")
into a clean, framework-free static site. No `support.js`, `<x-dc>`, `<helmet>`, React,
`{{ }}`, `<sc-for>`, `<sc-if>`, `ref=`, `onClick=`, or `data-dc-script` remain (verified 0 of each).

## Files created
- `index.html` — resolved template; CSS inline in `<head>`; all 10 sections as real semantic HTML.
- `404.html` — campaign post-mortem (copy.md §17).
- `js/app.js` — vanilla port of `class Component extends DCLogic`.
- `images/nebula.jpg` — re-exported from `design_handoff_cudam321_2/images/nebula.png`
  (1280×860, JPEG q85 progressive) → **58 KB** (target was <200 KB). Referenced by the Stardust nebula `AsciiArt.image`.
- `favicon.svg` — cyan ✦ on dark (referenced from both pages; avoids a favicon 404).

Untouched per instructions: `js/ascii-engine.js`, `js/galaxy.js`.
Pre-existing `images/earth_eq.jpg` and `images/og.png` reused.

## Key decisions
- **Progressive enhancement.** `<html class="no-js">`; a first inline `<head>` script swaps to
  `js` (and adds `booted` when `sessionStorage.cdm_booted` is set or reduced-motion is on, to
  avoid a boot-overlay flash). `<main id="overlay">` is BOTH the no-JS linear résumé and the
  JS-on section viewer:
  - **JS off** → header / cinematic stage / 520vh scroll-track / console / starfield / boot are
    `display:none`; `#overlay` is a static linear document: hero summary + 10 sections + footer.
  - **JS on** → `#overlay` becomes a fixed (`z-index:80`) hidden section viewer; opening a galaxy
    node (or `cd <name>`) shows the overlay with only the active section + the `← galaxy` / `NN/10`
    chrome. Verified both states with headless screenshots.
- **Galaxy** uses the shipped engine: `Galaxy.mount(#galaxy, {secondsPerRotation:120})`.
  `_applyScroll` calls `gx.setActive(gOp>0.04)` / `gx.setSpotlight(gOp>0.82)` (same thresholds as
  the DC); `mousemove` feeds `gx.setPointer()` in canvas-local, scale-corrected coords. The DC's
  bespoke `_initGalaxy`/`_drawGalaxy` were dropped. Clickable system nodes stay as HTML over the canvas.
- **Earth + scene art** use `AsciiArt.globe`/`AsciiArt.image` with the DC's exact `_mountArt` params
  (hero globe colored; about/basecamp globes mono; nebula mono → `images/nebula.jpg`). Scene art is
  mounted lazily the first time a section opens (mounted-once guard; not destroyed on close — the
  engine already pauses off-screen, which is cleaner than the DC's mount/destroy churn).
- Ported faithfully: `_applyScroll` (P-phase math verbatim), `_initWormhole`, `_initStarfield`,
  `_startClock`, boot (`_initBoot`/`_endBoot`/`skipBoot`), `setLang`/tagline+lang, `_toast`, the
  command console (`run`/`print`/rooms/history/`/`-focus/`runHelp` + all easter eggs), konami `growth`,
  Spotify facade `playTrack`, `goMap`/`goHero`/`openSection`/`closeSection`, `onScroll`/`onResize`/`onMouse`.
- `style-hover="…"` → real CSS `:hover` rules. `ref=` → `id=`. `onClick=` → `data-act`/`data-go`
  delegated on `document`. Toast/growth built in JS (none in initial DOM). Konami confetti renders none initially.
- **De-slop applied** (copy.md is source of truth): About body + longer bio and the Stardust §11
  passage use the comma forms with NO em-dashes; hero tagline = §2 trilingual set (EN default → EN "on").
  Meta description uses copy.md §0 ("Top-tier go-to-market…").
- **Speedrun dropped** per README (its `sc-if` was already unreachable in the DC).
- SEO/head: title, description, `theme-color`, canonical, OG + Twitter (→ `/images/og.png`),
  favicon, JSON-LD `ProfilePage`/`Person` (`knowsLanguage:["vi","en","ja"]`, `sameAs`), Google Fonts
  (Space Mono + Martian Mono). A11y: decorative canvases `aria-hidden`, `:focus-visible` ring,
  `prefers-reduced-motion` honored (skip boot, static starfield, Galaxy self-gates).

## Unsure / couldn't fully port
- **Receipts logos (`data-art="logo:*"`) and Cinema stills (`data-art="scene:*"`)** remain the DC's
  dashed-hatch placeholder tiles — exactly as the DC shipped them (its `mountArtEl` only handled
  `globe-mono` + `nebula`). Turning the 9 logos + 5 film scenes into dense ASCII needs sourced source
  images; left as a hardening task. `data-art` attributes kept so they can be wired later.
- Headless Chrome (both `--headless=new` and legacy) ignored `--disable-javascript` on this machine;
  the no-JS path was verified by screenshotting a scripts-stripped temp copy (html stays `.no-js`).
- Reduced-motion: matched the DC exactly, including that the wormhole loop isn't gated under reduce
  (it only animates during the mid-scroll dive anyway).

## Still needs the orchestrator (harden + deploy)
- Self-host the two fonts (currently Google Fonts CDN) for green CWV; `vercel.json` already
  long-caches `/fonts`.
- `sitemap.xml` + `robots.txt`.
- Source + render the 9 company logos and 5 film stills into the ASCII slots.
- Deploy to Vercel: set the project **Root Directory to `site/`** (repo-root `vercel.json` has
  `cleanUrls`; `404.html` is picked up automatically). Attach `cudam321.com` (domain needs registering).
- Confirm `og.png` is 1200×630 for share cards.
