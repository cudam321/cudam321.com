/* app.js — cudam321.com
   Vanilla port of the Design Component logic class (class Component extends DCLogic).
   - scroll cinematic (_applyScroll), wormhole + starfield renderers, UTC clock
   - boot overlay, trilingual tagline toggle, toast
   - command console (history, '/' focus, help, easter eggs), konami growth
   - Spotify facade, galaxy node -> section overlay open/close
   - galaxy: shipped Galaxy engine; earth/scene art: shipped AsciiArt engine
   No framework. Runs after DOM parse (loaded with `defer`). */
(function () {
  'use strict';

  // ---------- data ----------
  var META = {
    about:   { t: 'The Origin Star', n: '01', sub: 'who is this' },
    receipts:{ t: 'The Trajectory',  n: '02', sub: 'levels cleared' },
    arsenal: { t: 'The Instruments', n: '03', sub: 'what I do' },
    labs:    { t: 'Active Builds',   n: '04', sub: 'shipping now' },
    quests:  { t: 'Side Missions',   n: '05', sub: 'tools I built' },
    jukebox: { t: 'Frequencies',     n: '06', sub: 'on repeat' },
    cinema:  { t: 'The Screening',   n: '07', sub: 'films + lessons' },
    stardust:{ t: 'One in a Million Million', n: '08', sub: 'the soul of the site' },
    horizon: { t: 'The Horizon',     n: '09', sub: 'dreams & goals' },
    basecamp:{ t: 'Hailing Frequencies', n: '10', sub: 'where I am' }
  };
  var ROOMS = {
    home:'__home', hero:'__home', top:'__home',
    about:'about', origin:'about', whoami:'about', bio:'about',
    arsenal:'arsenal', skills:'arsenal', inv:'arsenal',
    receipts:'receipts', work:'receipts', career:'receipts',
    labs:'labs', building:'labs', products:'labs',
    quests:'quests', tools:'quests', github:'quests',
    cinema:'cinema', films:'cinema', movies:'cinema',
    jukebox:'jukebox', play:'jukebox', music:'jukebox', songs:'jukebox',
    stardust:'stardust', inspired:'stardust', space:'stardust',
    horizon:'horizon', dreams:'horizon', goals:'horizon',
    basecamp:'basecamp', contact:'basecamp', hello:'basecamp', hi:'basecamp'
  };
  var TAGLINES = {
    en: 'I’m the marketing team, the dev team, and the stand-up meeting.',
    vi: 'Tôi là team marketing, team dev, kiêm luôn buổi họp stand-up.',
    jp: 'マーケチームも、開発チームも、朝会も、ぜんぶ自分。'
  };
  var LANG_CONF = {
    vi: 'language set to Tiếng Việt. (yes, I actually speak it.)',
    en: 'language set to English. (the default — but I contain multitudes.)',
    jp: 'language set to 日本語.（上手くないですが、話せます。）'
  };
  var BASE_BTN = "font-family:'Departure Mono',monospace;cursor:pointer;background:transparent;border:0;border-bottom:1px solid transparent;padding:5px 9px;font-size:11px;letter-spacing:.16em;transition:color .2s,border-color .2s;";
  var BTN_ON = BASE_BTN + 'color:#93C01F;border-bottom-color:#93C01F;';
  var BTN_OFF = BASE_BTN + 'color:#6b7689;';
  // data-art slugs that have a real image in images/art/ — others keep their placeholder
  var ART_HAVE = {
    'logo-trisolaris': 1, 'logo-near': 1, 'logo-dapdap': 1, 'logo-beratown': 1,
    'logo-giac': 1, 'logo-amige': 1,
    'album-westcoast': 1, 'album-iwonder': 1, 'album-sweet': 1,
    'album-runaway': 1, 'album-ghosttown': 1, 'album-afterthought': 1, 'album-alot': 1, 'album-afterthestorm': 1, 'album-sunshine': 1,
    'scene-scott-pilgrim': 1, 'scene-swiss-army-man': 1, 'scene-interstellar': 1,
    'scene-fireflies': 1, 'scene-breaking-bad': 1
  };
  var FILMS = [
    { img: 'scene-interstellar', title: 'Interstellar', lesson: 'the best growth loops bend time: compounding beats linear pushes' },
    { img: 'scene-scott-pilgrim', title: 'Scott Pilgrim vs. the World', lesson: 'every market has seven evil exes; you beat them one launch at a time' },
    { img: 'film-swiss-army-man', title: 'Swiss Army Man', lesson: 'your weirdest feature is your most defensible positioning' },
    { img: 'film-breaking-bad', title: 'Breaking Bad', note: '(a series; it counts)', lesson: 'the purest product still dies without distribution; own the channel' },
    { img: 'film-fireflies', title: 'Grave of the Fireflies', lesson: 'emotion is the most underrated growth lever; make them feel the stakes' }
  ];

  // ---------- module state ----------
  var E = {};                 // cached elements
  var state = { lang: 'en', section: null };
  var P_ = 0, mx_ = -99999, my_ = -99999;
  var history_ = [], hi_ = -1;
  var sceneHandles = [];
  var gx = null;              // Galaxy handle
  var COARSE = !!(window.matchMedia && matchMedia('(pointer: coarse)').matches);   // touch device
  var sbg = null;             // SpaceBG (per-section animated background) handle
  var cinePlayer = null;      // Movies ASCII player handle
  var rcpGame = null;   // Past Projects THE TRAJECTORY warp-flight game handle
  var RCP_SYS = [
    { label: "Chien Tinh '17", reach: 0, size: 5, color: [206, 168, 120], seed: 1, logo: 'chien-tinh' },
    { label: "Sio Sushi '20", reach: 0, size: 5, color: [216, 130, 110], seed: 2, logo: 'sio-sushi' },
    { label: "NEAR Insights '21", reach: 10, color: [150, 205, 232], seed: 3, logo: 'near-insights' },
    { label: "Trisolaris '22", reach: 20, color: [110, 212, 205], seed: 4, logo: 'trisolaris' },
    { label: "NEAR '22", reach: 50, color: [132, 206, 240], seed: 5, logo: 'near' },
    { label: "DapDap '24", reach: 30, color: [172, 146, 235], seed: 6, logo: 'dapdap' },
    { label: "Beratown '24", reach: 230, color: [232, 182, 110], seed: 7, logo: 'beratown' },
    { label: "NADSA '25", reach: 390, color: [160, 158, 222], seed: 8, logo: 'nadsa', logoScale: 1.5 },
    { label: "BLOND:ISH '26", reach: 0, size: 13, live: true, color: [242, 172, 150], seed: 9, mono: 'NRG' }
  ];
  var scrollQ = false;
  var toastEl = null, tt = 0, gt = 0;
  // wormhole shared flags (read by its draw loop)
  var wormActive = false, wormWarp = 1, wormDestroyed = false, wormBuild = null;
  var sfRaf = 0, sfMake = null, clockT = 0, bootT = 0, bootEnded = false;

  function reduce() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  function $(id) { return document.getElementById(id); }

  function cacheEls() {
    E.root = $('root'); E.sf = $('starfield'); E.globe = $('globe');
    E.galaxy = $('galaxy'); E.galaxyWrap = $('galaxy-wrap'); E.clock = $('clock');
    E.bootEl = $('boot-pre'); E.boot = $('boot'); E.input = $('cmd-input');
    E.logEl = $('cmd-log'); E.stage = $('stage'); E.earthWrap = $('earth-wrap');
    E.worm = $('wormhole'); E.face = $('face'); E.faceWrap = $('face-wrap'); E.heroText = $('hero-text'); E.tagEl = $('tagline');
    E.overlay = $('overlay'); E.secCounter = $('sec-counter');
  }

  // ---------- engine polling ----------
  function whenEngine(cb) {
    if (window.AsciiArt) return cb();
    var n = 0, t = setInterval(function () {
      if (window.AsciiArt) { clearInterval(t); cb(); }
      else if (++n > 240) clearInterval(t);
    }, 50);
  }
  function whenGalaxy(cb) {
    if (window.Galaxy) return cb();
    var n = 0, t = setInterval(function () {
      if (window.Galaxy) { clearInterval(t); cb(); }
      else if (++n > 240) clearInterval(t);
    }, 50);
  }

  // ---------- ascii art (earth + scene globes + nebula) ----------
  function mountHero() {
    if (!E.globe) return;
    var sm = window.innerWidth < 760;
    window.AsciiArt.globe(E.globe, {
      textureSrc: 'images/earth_eq.jpg', color: true, monoColor: '#bcd0e6',
      fontSize: sm ? 9 : 11, maxCols: sm ? 96 : 180, secondsPerRotation: 30,
      gamma: 0.82, transparent: true
    });
    if (E.face) window.AsciiArt.image(E.face, { src: 'images/face.jpg', color: true, fontSize: sm ? 7 : 9, maxCols: sm ? 120 : 210, gamma: 0.82, transparent: true });
  }
  function mountSectionArt(sec) {
    if (!sec) return;
    if (!window.AsciiArt) { whenEngine(function () { mountSectionArt(sec); }); return; }
    var sm = window.innerWidth < 760;
    var els = sec.querySelectorAll('[data-art]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el._mounted) continue;
      var kind = el.getAttribute('data-art'), h = null;
      if (kind === 'nebula') {
        h = window.AsciiArt.image(el, { src: 'images/nebula.jpg', color: true, fontSize: sm ? 8 : 10, maxCols: sm ? 120 : 220, gamma: 1.0, transparent: true });
      } else if (kind === 'globe-mono') {
        h = window.AsciiArt.globe(el, { textureSrc: 'images/earth_eq.jpg', color: false, monoColor: '#9fb6cf', fontSize: sm ? 8 : 9, maxCols: sm ? 70 : 96, secondsPerRotation: 44, gamma: 0.95, transparent: true });
      } else if (kind === 'portrait') {
        el.textContent = ''; el.style.padding = '0'; el.style.display = 'block';
        h = window.AsciiArt.image(el, { src: 'images/character.png', color: true, fontSize: sm ? 7 : 9, maxCols: sm ? 30 : 38, gamma: 0.95, transparent: true });
      } else if (kind === 'player' && window.AsciiPlayer) {
        h = cinePlayer = window.AsciiPlayer.mount(el, {
          frames: FILMS.map(function (f) { return { src: 'images/art/' + f.img + '.jpg' }; }),
          onFrame: function (i) { updateCine(i); }
        });
      } else if (kind === 'trajectory' && window.Trajectory) {
        h = rcpGame = window.Trajectory.mount(el, { systems: RCP_SYS, onDock: rcpOnDock });
        wireTraj();
      } else if (kind && /^(logo|scene|artist|album):/.test(kind)) {
        var slug = kind.replace(':', '-');
        if (ART_HAVE[slug]) {
          var logo = /^logo:/.test(kind);
          // drop the "[ ASCII ... ]" placeholder label + frame so the rendered canvas fills the tile cleanly
          el.textContent = ''; el.style.padding = '0'; el.style.display = 'block';
          h = window.AsciiArt.image(el, {
            src: 'images/art/' + slug + '.jpg', color: logo ? false : true, monoColor: '#9fb6cf',
            fontSize: sm ? 7 : 8, maxCols: logo ? (sm ? 40 : 54) : (sm ? 80 : 120),
            gamma: logo ? 0.7 : 0.95, transparent: true
          });
        }
      }
      if (h) { el._mounted = true; sceneHandles.push(h); }
    }
  }
  // Movies player: reflect the active frame into the screen label, title, lesson, dots
  function updateCine(i) {
    var f = FILMS[i]; if (!f) return;
    var fr = $('cine-frame'), ti = $('cine-title'), su = $('cine-sub');
    if (fr) fr.textContent = 'FRAME 0' + (i + 1) + ' / 0' + FILMS.length;
    if (ti) ti.innerHTML = f.title + (f.note ? ' <span style="color:#5f6b80;font-weight:400;font-size:.7em;">' + f.note + '</span>' : '');
    if (su) su.innerHTML = '<span style="color:#93C01F;">&rarr;</span> ' + f.lesson;
    var dots = document.querySelectorAll('#cine-dots [data-i]');
    for (var d = 0; d < dots.length; d++) dots[d].classList.toggle('on', +dots[d].getAttribute('data-i') === i);
  }

  // THE TRAJECTORY: reflect the docked system into the live HUD + dossier + reach + progress dots
  function rcpOnDock(i, score, warping) {
    var sc = $('traj-score'); if (sc && score != null) sc.textContent = score;
    var sec = $('traj-sector'); if (sec) sec.textContent = ('0' + (i + 1)).slice(-2) + ' / 09';
    var loc = $('traj-loc'), sys = RCP_SYS[i]; if (loc && sys) loc.textContent = sys.label.toUpperCase();
    var info = document.querySelector('#rcp2-data .sys-info[data-i="' + i + '"]'), dos = $('traj-dossier');
    if (info && dos) dos.innerHTML = info.innerHTML;
    var dots = document.querySelectorAll('#traj-progress [data-i]');
    for (var j = 0; j < dots.length; j++) { var dj = +dots[j].getAttribute('data-i'); dots[j].className = (dj === i ? 'on' : (dj < i ? 'done' : '')); }
    if (i > 0) { var pr = $('traj-prompt'); if (pr) pr.classList.add('hide'); }
  }
  // wire the press-and-hold WARP / BACK buttons + the progress dots to the game
  function wireTraj() {
    function hold(id, d) {
      var b = $(id); if (!b) return;
      var on = function (e) { e.preventDefault(); if (rcpGame) rcpGame.thrust(d); };
      var off = function () { if (rcpGame) rcpGame.thrust(0); };
      b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off);
      b.addEventListener('pointerleave', off); b.addEventListener('pointercancel', off);
    }
    hold('traj-warp', 1); hold('traj-back', -1);
    var dots = document.querySelectorAll('#traj-progress [data-i]');
    for (var i = 0; i < dots.length; i++) (function (el) { el.addEventListener('click', function () { if (rcpGame) rcpGame.warpTo(+el.getAttribute('data-i')); }); })(dots[i]);
  }

  // ---------- galaxy (shipped engine) ----------
  // each system lives at a real point on the galactic disk [radius, angle, height];
  // they orbit WITH the galaxy when you drag it (positioned every frame via gx.project).
  var GAL_ANCHORS = {
    about:    [0.26, 0.00, 0],   // ORIGIN — clear of the bright core; the rest ring out at even angles + mixed radii
    receipts: [0.50, 0.30, 0],
    arsenal:  [0.70, 1.00, 0],
    cinema:   [0.55, 1.70, 0],
    labs:     [0.78, 2.40, 0],
    quests:   [0.50, 3.10, 0],
    jukebox:  [0.74, 3.80, 0],
    stardust: [0.58, 4.50, 0],
    horizon:  [0.80, 5.20, 0],
    basecamp: [0.66, 5.90, 0]
  };
  var galNodes = null, galHint = null, galHintGone = false;
  function initGalaxyNodes() {
    galNodes = [];
    var btns = document.querySelectorAll('#galaxy-wrap .galaxy-node');
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i], a = GAL_ANCHORS[b.getAttribute('data-go')];
      if (!a) continue;
      galNodes.push({ el: b, x: a[0] * Math.cos(a[1]), y: a[0] * Math.sin(a[1]), z: a[2] });
      b.style.willChange = 'transform,opacity';
    }
    galHint = $('galaxy-hint');
  }
  function positionGalaxyNodes(project) {
    if (!galNodes || COARSE) return;   // mobile: leave the nodes at their spread, full-viewport CSS positions (no drag, so no need to track the disk)
    for (var i = 0; i < galNodes.length; i++) {
      var n = galNodes[i], p = project(n.x, n.y, n.z);
      var t = (p.depth + 0.7) / 1.4; t = t < 0 ? 0 : (t > 1 ? 1 : t);   // far side → 0, near side → 1
      var edge = (p.face - 0.10) / 0.26; edge = edge < 0 ? 0 : (edge > 1 ? 1 : edge);   // fade labels out near edge-on (they'd stack on a line)
      var s = n.el.style;
      s.left = (p.x * 100).toFixed(2) + '%';
      s.top = (p.y * 100).toFixed(2) + '%';
      s.transform = 'translate(-50%,-50%) scale(' + (0.86 + 0.20 * t).toFixed(3) + ')';
      s.opacity = ((0.55 + 0.45 * t) * edge).toFixed(3);   // these stars ARE the primary nav — readable face-on, fade only at the edge
      s.pointerEvents = edge < 0.15 ? 'none' : 'auto';      // don't catch clicks on a label you can't see
      s.zIndex = (100 + (p.depth * 80 | 0));
    }
  }
  function hideGalaxyHint() {
    if (galHintGone) return; galHintGone = true;
    if (galHint) galHint.style.opacity = '0';
  }
  function mountGalaxy() {
    if (!E.galaxy) return;
    whenGalaxy(function () {
      gx = window.Galaxy.mount(E.galaxy, { secondsPerRotation: 120, onFrame: positionGalaxyNodes, onInteract: hideGalaxyHint });
      applyScroll();
    });
  }

  // ---------- wormhole (bespoke canvas; ported verbatim) ----------
  function initWormhole() {
    var c = E.worm; if (!c) return;
    var ctx = c.getContext('2d', { alpha: false });
    var CHARS = "01<>/\\|()[]{}*+=:.-_#%&$@oOXY";
    var COLS = ['#46506a', '#93C01F', '#a895ea', '#F6ECD2'];
    var W, H, dpr, pts, cx, cy;
    function build() {
      var box = c.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, Math.round(box.width || window.innerWidth)); H = Math.max(1, Math.round(box.height || window.innerHeight));
      c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
      cx = W / 2; cy = H / 2;
      var N = Math.round(Math.min(640, W * H / 2050)); pts = [];
      for (var i = 0; i < N; i++) pts.push({ a: Math.random() * Math.PI * 2, z: Math.random(), sp: 0.45 + Math.random() * 1.2, ch: CHARS[(Math.random() * CHARS.length) | 0], col: (Math.random() * 4) | 0, ar: 0.62 + Math.random() * 0.48 });
    }
    build();
    var raf = 0, last = 0;
    function draw(now) {
      if (wormDestroyed) return;
      var dt = (now - last) / 1000; last = now; if (!(dt > 0) || dt > 0.05) dt = 0.016;
      if (!wormActive) { raf = requestAnimationFrame(draw); return; }
      ctx.fillStyle = '#04060B'; ctx.fillRect(0, 0, W, H);
      var warp = wormWarp || 1, baseR = Math.min(W, H) * 0.058;
      for (var k = 0; k < pts.length; k++) {
        var p = pts[k];
        p.z -= p.sp * dt * 0.42 * warp; if (p.z <= 0.02) { p.z = 1; p.a = Math.random() * Math.PI * 2; p.ch = CHARS[(Math.random() * CHARS.length) | 0]; p.col = (Math.random() * 4) | 0; }
        var inv = 1 / p.z, r = (inv - 1) * baseR;
        var x = cx + Math.cos(p.a) * r, y = cy + Math.sin(p.a) * r * p.ar;
        if (x < -30 || x > W + 30 || y < -30 || y > H + 30) continue;
        var b = Math.min(1, (1 - p.z) * 1.95); if (b < 0.05) continue;
        ctx.globalAlpha = b; ctx.font = Math.min(56, 6 + inv * 3.2).toFixed(0) + 'px ui-monospace, Menlo, monospace'; ctx.fillStyle = COLS[p.col];
        ctx.fillText(p.ch, x, y);
      }
      ctx.globalAlpha = 1; raf = requestAnimationFrame(draw);
    }
    last = performance.now(); raf = requestAnimationFrame(draw);
    if ('ResizeObserver' in window) { var ro = new ResizeObserver(function () { build(); }); ro.observe(c); }
    wormBuild = build;
  }

  // ---------- scroll cinematic ----------
  function applyScroll() {
    if (!E.stage) return;
    var max = Math.max(1, (document.documentElement.scrollHeight - window.innerHeight));
    var P = Math.min(1, Math.max(0, (window.scrollY || window.pageYOffset || 0) / max));
    P_ = P; var cl = function (x) { return x < 0 ? 0 : (x > 1 ? 1 : x); };
    var eIn = cl(P / 0.28), dx = (1 - eIn) * 22, baseScale = 0.82 + eIn * 0.42;
    var eThru = cl((P - 0.28) / 0.18), thru = 1 + eThru * eThru * 11, sc = baseScale * thru;
    var eOp = 1 - cl((P - 0.40) / 0.10);
    if (E.earthWrap) { E.earthWrap.style.transform = 'translate(calc(-50% + ' + dx.toFixed(2) + 'vw), -50%) scale(' + sc.toFixed(3) + ')'; E.earthWrap.style.opacity = Math.max(0, eOp).toFixed(3); }
    if (E.tagEl) { var full = E.tagEl.getAttribute('data-full') || ''; var keep = Math.round(full.length * (1 - cl(P / 0.14))); E.tagEl.textContent = keep >= full.length ? full : full.slice(0, Math.max(0, keep)); }
    if (E.heroText) { E.heroText.style.opacity = (1 - cl(P / 0.18)).toFixed(3); E.heroText.style.pointerEvents = P > 0.04 ? 'none' : 'auto'; }
    var wOp = cl((P - 0.40) / 0.10) * (1 - cl((P - 0.72) / 0.08));
    if (E.worm) E.worm.style.opacity = wOp.toFixed(3);
    wormActive = wOp > 0.02; wormWarp = 0.6 + 1.7 * cl((P - 0.40) / 0.30);
    // FACE: zooms in as the dive completes, then dissolves into the wormhole
    if (E.faceWrap) {
      var fIn = cl((P - 0.42) / 0.07), fOut = cl((P - 0.50) / 0.10);
      E.faceWrap.style.opacity = Math.max(0, Math.min(fIn, 1 - fOut)).toFixed(3);
      E.faceWrap.style.transform = 'scale(' + (0.92 + 0.40 * fIn + 3.6 * fOut).toFixed(3) + ')';
    }
    var gOp = cl((P - 0.70) / 0.18);
    if (E.galaxyWrap) { E.galaxyWrap.style.opacity = gOp.toFixed(3); E.galaxyWrap.style.transform = 'scale(' + (1.22 - gOp * 0.22).toFixed(3) + ')'; E.galaxyWrap.style.pointerEvents = gOp > 0.85 ? 'auto' : 'none'; E.galaxyWrap.inert = gOp <= 0.85; }
    if (gx) { gx.setActive(gOp > 0.04); gx.setSpotlight(gOp > 0.82); }
  }
  function onScroll() { if (scrollQ) return; scrollQ = true; requestAnimationFrame(function () { scrollQ = false; applyScroll(); }); }
  function onMouse(e) {
    mx_ = e.clientX; my_ = e.clientY;
    if (gx) gx.setPointer(e.clientX, e.clientY);   // page coords; galaxy.js maps to live canvas rect
  }

  // ---------- starfield (ported verbatim) ----------
  function initStarfield() {
    var c = E.sf; if (!c) return;
    var ctx = c.getContext('2d'); var W, H, dpr, stars;
    function make() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
      c.style.width = W + 'px'; c.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(220, W * H / 8600)); stars = [];
      for (var i = 0; i < n; i++) stars.push({ x: Math.random() * W, y: Math.random() * H, z: Math.random(), r: Math.random() * 1.2 + 0.25, tw: Math.random() * 6.28, sp: 0.5 + Math.random() * 1.7 });
    }
    make(); sfMake = make;
    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var a = reduce() ? (0.32 + s.z * 0.5) : (0.26 + 0.52 * (0.5 + 0.5 * Math.sin(t * 0.001 * s.sp + s.tw))) * (0.42 + s.z * 0.6);
        ctx.globalAlpha = Math.min(1, a);
        ctx.fillStyle = s.z > 0.86 ? '#cfe0f5' : (s.z > 0.52 ? '#9fb0c8' : '#646f84');
        var sz = s.r * (s.z > 0.86 ? 1.7 : 1); ctx.fillRect(s.x, s.y, sz, sz);
      }
      ctx.globalAlpha = 1; if (!reduce()) sfRaf = requestAnimationFrame(draw);
    }
    if (reduce()) draw(0); else sfRaf = requestAnimationFrame(draw);
  }
  function onResize() { if (sfMake) sfMake(); if (wormBuild) wormBuild(); applyScroll(); }

  // ---------- clock ----------
  function startClock() {
    var p = function (n) { return String(n).padStart(2, '0'); };
    function upd() { if (!E.clock) return; var d = new Date(); E.clock.textContent = p(d.getUTCHours()) + ':' + p(d.getUTCMinutes()) + ':' + p(d.getUTCSeconds()) + ' UTC'; }
    upd(); clockT = setInterval(upd, 1000);
  }

  // ---------- boot ----------
  function hideBoot() { if (E.boot) E.boot.style.display = 'none'; }
  function initBoot() {
    if (bootEnded) { hideBoot(); return; }
    var lines = ["> waking the star chart…", "", "> plotting systems ............ 10 found", "> calibrating ascii optics .... ok", "", "> welcome aboard, traveler."];
    var i = 0, buf = "";
    bootT = setInterval(function () {
      if (i < lines.length) { buf += lines[i] + "\n"; if (E.bootEl) E.bootEl.textContent = buf; i++; }
      else { clearInterval(bootT); bootT = 0; endBoot(900); }
    }, 215);
    var skip = function () { endBoot(0); };
    window.addEventListener('keydown', skip, { once: true });
    window.addEventListener('pointerdown', skip, { once: true });
    window.addEventListener('wheel', skip, { once: true, passive: true });
  }
  function endBoot(delay) {
    if (bootEnded) return; bootEnded = true;
    try { sessionStorage.setItem('cdm_booted', '1'); } catch (e) {}
    if (bootT) { clearInterval(bootT); bootT = 0; }
    setTimeout(hideBoot, delay);
  }
  function skipBoot() { endBoot(0); }

  // ---------- language ----------
  function setLang(l) {
    if (!TAGLINES[l]) return;
    state.lang = l;
    var btns = document.querySelectorAll('.lang-btn');
    for (var i = 0; i < btns.length; i++) btns[i].style.cssText = (btns[i].getAttribute('data-lang') === l) ? BTN_ON : BTN_OFF;
    if (E.tagEl) { E.tagEl.setAttribute('data-full', TAGLINES[l]); E.tagEl.setAttribute('lang', l === 'jp' ? 'ja' : l); E.tagEl.textContent = TAGLINES[l]; }
    applyScroll();
    toast(LANG_CONF[l] || '');
  }

  // ---------- toast ----------
  function toast(m) {
    if (!m) return;
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.setAttribute('role', 'status');
      toastEl.style.cssText = 'position:fixed;left:50%;bottom:72px;z-index:90;transform:translateX(-50%);background:rgba(8,11,19,0.96);border:1px solid rgba(147,192,31,0.28);color:#cfe0f5;font-size:13px;padding:11px 18px;max-width:90vw;text-align:center;box-shadow:0 8px 30px rgba(0,0,0,0.5);animation:cdmrise .3s ease;';
    }
    toastEl.textContent = m;
    if (!toastEl.isConnected) (E.root || document.body).appendChild(toastEl);
    clearTimeout(tt); tt = setTimeout(function () { if (toastEl) toastEl.remove(); }, 3600);
  }

  // ---------- navigation / section overlay ----------
  function openSection(id) {
    if (!META[id]) return false;
    try { document.documentElement.style.overflow = 'hidden'; } catch (e) {}
    var secs = E.overlay.querySelectorAll('.section');
    for (var i = 0; i < secs.length; i++) secs[i].classList.remove('active');
    var sec = $('sec-' + id);
    if (sec) sec.classList.add('active');
    if (E.secCounter) E.secCounter.textContent = META[id].n + ' / 10';
    E.overlay.classList.add('open');
    E.overlay.scrollTop = 0;
    state.section = id;
    mountSectionArt(sec);
    // the trajectory game draws its own (ship-responsive) background, so hide the section bg entirely for it
    var hideBg = (id === 'receipts');
    if (sbg) { sbg.setVariant(id); sbg.setActive(!hideBg); }
    var bgc = $('overlay-bg-canvas'); if (bgc) bgc.style.display = hideBg ? 'none' : '';
    var obg = E.overlay && E.overlay.querySelector('.overlay-bg'); if (obg) obg.style.display = hideBg ? 'none' : '';
    if (cinePlayer) cinePlayer.setActive(id === 'cinema');
    if (rcpGame) rcpGame.setActive(id === 'receipts');
    return true;
  }
  function closeSection() {
    try { document.documentElement.style.overflow = ''; } catch (e) {}
    if (state.section != null) {
      E.overlay.classList.remove('open');
      var a = E.overlay.querySelector('.section.active');
      if (a) a.classList.remove('active');
      state.section = null;
    }
    if (sbg) sbg.setActive(false);
    if (cinePlayer) cinePlayer.setActive(false);
    if (rcpGame) rcpGame.setActive(false);
    applyScroll();
  }
  function goMap() { closeSection(); var max = Math.max(0, (document.documentElement.scrollHeight - window.innerHeight)); window.scrollTo({ top: max, behavior: reduce() ? 'auto' : 'smooth' }); }
  function goHero() { closeSection(); window.scrollTo({ top: 0, behavior: reduce() ? 'auto' : 'smooth' }); }

  // ---------- jukebox (Spotify facade) ----------
  function playTrack(btn) {
    var track = btn.closest ? btn.closest('.jukebox-track') : null; if (!track) return;
    var embed = track.getAttribute('data-embed'), title = track.getAttribute('data-title') || '';
    var f = document.createElement('iframe');
    f.src = embed; f.width = '100%'; f.height = '352'; f.setAttribute('frameborder', '0');
    f.loading = 'lazy'; f.allow = 'encrypted-media'; f.title = title;
    f.style.cssText = 'display:block;border:0;width:100%;';
    track.innerHTML = ''; track.appendChild(f);
  }

  // ---------- command console ----------
  function lineStyle(k) {
    var base = "white-space:pre-wrap;font-size:12.5px;line-height:1.55;margin:1px 0;";
    if (k === 'in') return base + 'color:#5f93a3;';
    if (k === 'sys') return base + 'color:#93C01F;';
    if (k === 'warn') return base + 'color:#E8C079;';
    return base + 'color:#aeb9c9;';
  }
  function printLine(text, kind) {
    if (!E.logEl) return;
    var d = document.createElement('div');
    d.style.cssText = lineStyle(kind); d.textContent = text;
    E.logEl.appendChild(d);
    while (E.logEl.childNodes.length > 70) E.logEl.removeChild(E.logEl.firstChild);
    requestAnimationFrame(function () { if (E.logEl) E.logEl.scrollTop = E.logEl.scrollHeight; });
  }
  function cow(m) {
    var top = ' ' + '_'.repeat(m.length + 2); var bot = ' ' + '-'.repeat(m.length + 2);
    return top + "\n< " + m + " >\n" + bot + "\n        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||";
  }
  function pingRecruiter() {
    printLine("PING recruiter (127.0.0.1): 56 data bytes", 'out');
    var n = 0, t = setInterval(function () {
      printLine("Request timeout for icmp_seq " + n, 'out');
      if (++n >= 3) { clearInterval(t); printLine("--- recruiter ping statistics ---\n3 packets transmitted, 0 received, 100% packet loss.\n(so I built this instead.)", 'warn'); }
    }, 620);
  }
  function run(raw) {
    var cmd = (raw || '').trim(); if (!cmd) return;
    history_.push(cmd); printLine('guest@cudam321:~$ ' + cmd, 'in');
    var parts = cmd.split(/\s+/); var c = parts[0].toLowerCase(); var arg = parts.slice(1).join(' ');
    if (c === 'help' || c === '?') { printLine("COMMANDS\n  ls · map           list / open the galaxy\n  cd <system>        warp to a system\n  back · home        leave a system / hero\n  whoami · man · lang vi|en|jp\n  top · ping recruiter · coffee · 42 · sudo hire-me\n  clear              clear this log\n  (some commands are undocumented. poke around.)", 'sys'); return; }
    if (c === 'ls' || c === 'dir') { printLine("SYSTEMS — type 'cd <name>'\n  about · receipts · arsenal · labs · quests\n  jukebox · cinema · stardust · horizon · basecamp", 'sys'); return; }
    if (c === 'map') { goMap(); printLine('→ the galaxy', 'out'); return; }
    if (c === 'back') { closeSection(); printLine('→ back to the galaxy', 'out'); return; }
    if (c === 'home') { goHero(); printLine('→ hero', 'out'); return; }
    if (c === 'cd' || c === 'goto' || c === 'open' || c === 'go') { var key = (arg || '').toLowerCase().replace(/^[~/]+/, ''); var id = ROOMS[key]; if (id === '__home') { goHero(); printLine('→ home', 'out'); } else if (id && openSection(id)) { printLine('→ ' + id, 'out'); } else printLine("no such system: '" + arg + "'. try 'ls'.", 'warn'); return; }
    if (ROOMS[c]) { if (ROOMS[c] === '__home') { goHero(); } else openSection(ROOMS[c]); printLine('→ ' + c, 'out'); return; }
    if (c === 'whoami') { printLine("Cudam — @cudam321. markets crypto & AI, then builds it. native VI, fluent EN + JP.", 'out'); return; }
    if (c === 'lang') { var l = (arg || '').toLowerCase(); if (l === 'vi' || l === 'en' || l === 'jp' || l === 'ja') { setLang(l === 'ja' ? 'jp' : l); } else printLine("usage: lang vi|en|jp", 'warn'); return; }
    if (c === 'top' || c === 'htop') { printLine("PID  PROCESS            %\n  1  shipping           99\n  2  community_mgmt     71\n 12  agents_running     ●●●●●●●●●●●●\n  0  imposter_syndrome   0  (patched)", 'out'); return; }
    if (c === 'sudo') { if (/hire-?me/.test(arg)) { printLine("[sudo] you don’t have to ask. → opening basecamp.", 'sys'); setTimeout(function () { openSection('basecamp'); }, 350); } else if (/rm.*doubts/.test(arg)) { printLine("doubts removed. permanently.", 'out'); } else { printLine("we don’t do permissions here. (try: sudo hire-me)", 'out'); } return; }
    if (c === 'ping') { if (/recruiter/.test(arg)) pingRecruiter(); else printLine("usage: ping recruiter", 'warn'); return; }
    if (c === 'man') { printLine("NAME\n  cudam321 — markets crypto & AI, then builds it.\nSYNOPSIS\n  cudam321 [--fast] [--solo] [--in 3 languages]\nBUGS\n  occasionally says \"let’s circle back\". overuses \"narrative\".", 'out'); return; }
    if (c === 'coffee') { printLine("      ( (\n       ) )\n    ........\n    |      |]\n    \\      /\n     `----'\n\nbrewing… ready. now we can talk.", 'out'); return; }
    if (c === '42') { printLine("the answer. now — what was the question?", 'out'); return; }
    if (c === 'cowsay') { printLine(cow(arg || 'ship it'), 'out'); return; }
    if (c === 'vim') { printLine("you’re now in vim. good luck. (just kidding — Esc, you’re free.)", 'out'); return; }
    if (c === 'theme') { printLine("there’s only one theme here: space.", 'out'); return; }
    if (c === 'exit' || c === 'quit') { printLine("you can never leave the funnel.", 'out'); return; }
    if (c === 'clear' || c === 'cls') { E.logEl.innerHTML = ''; return; }
    printLine("command not found: '" + parts[0] + "' — try 'help'. (even I can’t optimize that typo.)", 'warn');
  }
  function onInputKey(e) {
    if (e.key === 'Enter') { var v = e.target.value; e.target.value = ''; hi_ = -1; run(v); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (history_.length) { hi_ = Math.min(history_.length - 1, hi_ + 1); e.target.value = history_[history_.length - 1 - hi_] || ''; } }
    else if (e.key === 'ArrowDown') { e.preventDefault(); if (hi_ > 0) { hi_--; e.target.value = history_[history_.length - 1 - hi_] || ''; } else { hi_ = -1; e.target.value = ''; } }
  }
  function runHelp() { run('help'); if (E.input) E.input.focus(); }

  // ---------- konami / growth ----------
  function initKonami() {
    var seq = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
    var i = 0;
    window.addEventListener('keydown', function (e) {
      var k = (e.key || '').toLowerCase();
      if (k === seq[i]) { i++; if (i === seq.length) { i = 0; growth(); } }
      else { i = (k === seq[0]) ? 1 : 0; }
    });
  }
  function growth() {
    if (reduce()) { toast("GROWTH +400% (reduced-motion: imagine the confetti)"); return; }
    var chars = ['+', '$', '↑', '▲', '✦', '%', '◆', '9', '★', '▓'];
    var cols = ['#93C01F', '#E8C079', '#9fb0c8', '#9A86E6'];
    var wrap = document.createElement('div');
    wrap.setAttribute('aria-hidden', 'true');
    wrap.style.cssText = 'position:fixed;inset:0;z-index:95;pointer-events:none;overflow:hidden;';
    for (var i = 0; i < 32; i++) {
      var left = Math.random() * 100, dur = 2.4 + Math.random() * 2.7, delay = Math.random() * 1.3, size = 12 + Math.random() * 22;
      var s = document.createElement('span');
      s.textContent = chars[(Math.random() * chars.length) | 0];
      s.style.cssText = 'position:absolute;top:-12vh;left:' + left.toFixed(2) + '%;font-size:' + size.toFixed(0) + 'px;color:' + cols[(Math.random() * cols.length) | 0] + ';animation:cdmconfetti ' + dur.toFixed(2) + 's linear ' + delay.toFixed(2) + 's forwards;text-shadow:0 0 12px currentColor;';
      wrap.appendChild(s);
    }
    var big = document.createElement('div');
    big.style.cssText = 'position:absolute;top:42%;left:50%;transform:translate(-50%,-50%);text-align:center;';
    big.innerHTML = '<div style="font-family:\'Departure Mono\';font-size:clamp(40px,9vw,96px);font-weight:700;color:#E8C079;text-shadow:0 0 30px rgba(232,192,121,0.6);">+400%</div><div style="font-family:\'Departure Mono\',monospace;font-size:12px;letter-spacing:.4em;color:#93C01F;text-transform:uppercase;margin-top:6px;">growth hack engaged</div>';
    wrap.appendChild(big);
    (E.root || document.body).appendChild(wrap);
    toast("GROWTH HACK ENGAGED · +400% · 51% confidence");
    clearTimeout(gt); gt = setTimeout(function () { wrap.remove(); }, 5400);
  }

  // ---------- global keys ----------
  function initGlobalKeys() {
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && state.section != null) { closeSection(); }
      else if (e.key === '/' && document.activeElement !== E.input) { e.preventDefault(); if (E.input) E.input.focus(); }
      else if (state.section === 'cinema' && cinePlayer && (e.key === 'ArrowLeft' || e.key === 'ArrowRight') && document.activeElement !== E.input) { e.preventDefault(); e.key === 'ArrowRight' ? cinePlayer.next() : cinePlayer.prev(); }
    });
  }

  // ---------- event wiring ----------
  function bindInput() { if (E.input) E.input.addEventListener('keydown', onInputKey); }
  function bindClicks() {
    document.addEventListener('click', function (e) {
      var go = e.target.closest('[data-go]');
      if (go) { openSection(go.getAttribute('data-go')); return; }
      var lang = e.target.closest('.lang-btn');
      if (lang) { setLang(lang.getAttribute('data-lang')); return; }
      var play = e.target.closest('[data-act="play-track"]');
      if (play) { playTrack(play); return; }
      var act = e.target.closest('[data-act]');
      if (act) {
        var a = act.getAttribute('data-act');
        if (a === 'map') goMap();
        else if (a === 'home') goHero();
        else if (a === 'help') runHelp();
        else if (a === 'back-close') closeSection();
        else if (a === 'skip-boot') skipBoot();
        else if (a === 'cine-prev') { if (cinePlayer) cinePlayer.prev(); }
        else if (a === 'cine-next') { if (cinePlayer) cinePlayer.next(); }
        else if (a === 'cine-go') { if (cinePlayer) cinePlayer.go(+act.getAttribute('data-i')); }
      }
    });
  }

  // ---------- init ----------
  function init() {
    cacheEls();
    var booted = false; try { booted = !!sessionStorage.getItem('cdm_booted'); } catch (e) {}
    if (reduce() || booted) { bootEnded = true; hideBoot(); }
    whenEngine(mountHero);
    initStarfield();
    initWormhole();
    initGalaxyNodes();
    mountGalaxy();
    if (window.SpaceBG) { var bgc = $('overlay-bg-canvas'); if (bgc) sbg = window.SpaceBG.mount(bgc, { variant: 'about' }); }
    startClock();
    initKonami();
    initGlobalKeys();
    bindInput();
    bindClicks();
    initBoot();
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMouse, { passive: true });
    applyScroll();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
