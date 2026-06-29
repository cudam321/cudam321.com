# cudam321.com

The source for [cudam321.com](https://cudam321.com) — a personal résumé built as a cinematic space experience.

You scroll through Earth, dive into a wormhole, and arrive at an explorable ASCII galaxy whose star-systems are the sections of a career. Drag the galaxy to orbit it in 3D. Each section opens as its own animated ASCII instrument: a one-button warp-flight game for past projects, a vinyl gallery for music, a decode-morphing cinema screen for films, an RPG character sheet for skills.

## Stack

Static site, no framework. Plain HTML + CSS + vanilla JS, deployed on Vercel.

The visuals are custom canvas engines, all hand-written:

- `js/galaxy.js` — a live 3D ASCII spiral galaxy (particle render → colored ASCII), drag-to-orbit
- `js/trajectory.js` — "THE TRAJECTORY", the one-button warp-flight game
- `js/ascii-engine.js` — image → ASCII (the hero Earth + section art)
- `js/ascii-player.js` — the film-poster morph player
- `js/space-bg.js` — per-section animated ASCII backgrounds
- `js/app.js` — the scroll cinematic, command console, and section overlays

The full résumé ships as real semantic HTML for SEO, accessibility, and no-JS readers; the experience is layered on top as progressive enhancement.

## Run locally

It's static — serve the folder with anything:

```
npx serve .
```

— Tuan Hoang ([@cudam321](https://github.com/cudam321))
