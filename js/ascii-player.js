/* ascii-player.js — a retro ASCII "screen" that cycles images, morphing between them
   with a per-cell scramble/decode transition (letters shuffle, then resolve into the next art).
   AsciiPlayer.mount(canvas, { frames:[{src}], dwell, morph, onFrame, fontSize, maxCols })
     -> { go(i), next(), prev(), current(), setActive(bool), destroy() }
   No dependencies. Pauses when inactive / tab-hidden. Respects prefers-reduced-motion. */
(function () {
  'use strict';
  var RAMP = " .`'^\":;Il!i~+_-?]/\\|()1{}tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
  var SCR = "01<>[]{}/\\|=+*#%&xX".split('');
  function reduce() { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }

  function mount(canvas, opts) {
    opts = opts || {};
    var ctx = canvas.getContext('2d', { alpha: true });
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var fontSize = opts.fontSize || (window.innerWidth < 760 ? 7 : 9);
    var maxCols = opts.maxCols || (window.innerWidth < 760 ? 80 : 108);
    var dwell = opts.dwell || 3800, morphMs = opts.morph || 1500;
    var frames = opts.frames || [];
    var W = 1, H = 1, cw = 6, ch = 10, cols = 10, rows = 10, n = RAMP.length - 1;
    var grids = [], ready = false, cur = 0, nextI = 0, mode = 'hold';
    var clock = 0, ph = null, last = 0, raf = 0, active = false, hidden = !!document.hidden, destroyed = false, acc = 0, FPS = 30;

    function fit() {
      var box = canvas.getBoundingClientRect();
      W = Math.max(1, Math.round(box.width)); H = Math.max(1, Math.round(box.height || box.width * 0.75));
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = fontSize + 'px ui-monospace, "SF Mono", Menlo, monospace';
      ctx.textBaseline = 'top';
      cw = ctx.measureText('M').width || fontSize * 0.6;
      ch = Math.round(fontSize * 1.06);
      cols = Math.max(30, Math.min(maxCols, Math.round(W / cw)));
      rows = Math.max(20, Math.round(H / ch));
      cw = W / cols; ch = H / rows;   // stretch cells to fill the canvas exactly (no black edge)
    }
    function sampleImg(img) {
      var c = document.createElement('canvas'); c.width = cols; c.height = rows;
      var x = c.getContext('2d'); x.drawImage(img, 0, 0, cols, rows);
      var d; try { d = x.getImageData(0, 0, cols, rows).data; } catch (e) { return null; }
      var g = new Array(cols * rows);
      for (var i = 0; i < cols * rows; i++) {
        var p = i * 4, r = d[p], gg = d[p + 1], b = d[p + 2], L = 0.2126 * r + 0.7152 * gg + 0.0722 * b;
        g[i] = { ci: L < 6 ? 0 : (Math.pow(L / 255, 0.95) * n) | 0, r: r * 1.08, g: gg * 1.08, b: b * 1.08 };
      }
      return g;
    }
    function build() {
      fit(); grids = []; var loaded = 0;
      if (!frames.length) return;
      frames.forEach(function (f, idx) {
        var im = new Image(); im.crossOrigin = 'anonymous';
        im.onload = function () { grids[idx] = sampleImg(im); if (++loaded === frames.length) finishLoad(); };
        im.onerror = function () { grids[idx] = null; if (++loaded === frames.length) finishLoad(); };
        im.src = f.src;
      });
    }
    function finishLoad() { ready = true; if (opts.onFrame) opts.onFrame(cur, frames[cur]); render(); }

    function drawGrid(g) {
      ctx.clearRect(0, 0, W, H); if (!g) return; var prev = '';
      for (var ry = 0; ry < rows; ry++) for (var cx = 0; cx < cols; cx++) {
        var cell = g[ry * cols + cx]; if (!cell || cell.ci <= 0) continue;
        var s = 'rgb(' + (cell.r | 0) + ',' + (cell.g | 0) + ',' + (cell.b | 0) + ')';
        if (s !== prev) { ctx.fillStyle = s; prev = s; }
        ctx.fillText(RAMP[cell.ci > n ? n : cell.ci], cx * cw, ry * ch);
      }
    }
    function drawMorph(p) {
      ctx.clearRect(0, 0, W, H);
      var A = grids[cur], B = grids[nextI]; if (!B) { drawGrid(A); return; }
      for (var ry = 0; ry < rows; ry++) for (var cx = 0; cx < cols; cx++) {
        var i = ry * cols + cx, b = B[i], a = A ? A[i] : null;
        if (p >= ph[i]) { if (!b || b.ci <= 0) continue;
          ctx.fillStyle = 'rgb(' + (b.r | 0) + ',' + (b.g | 0) + ',' + (b.b | 0) + ')';
          ctx.fillText(RAMP[b.ci > n ? n : b.ci], cx * cw, ry * ch);
        } else {
          var ai = a ? a.ci : 0, bi = b ? b.ci : 0; if (ai <= 0 && bi <= 0) continue;
          var k = p / ph[i], br = b ? b.r : 120, bg = b ? b.g : 200, bb = b ? b.b : 230;
          ctx.fillStyle = 'rgba(' + ((90 + (br - 90) * k) | 0) + ',' + ((200 + (bg - 200) * k * 0.5) | 0) + ',' + ((215 + (bb - 215) * k) | 0) + ',' + (0.45 + 0.55 * k).toFixed(2) + ')';
          ctx.fillText(SCR[(Math.random() * SCR.length) | 0], cx * cw, ry * ch);
        }
      }
    }
    function render() { if (!ready) return; if (mode === 'hold') drawGrid(grids[cur]); else drawMorph(clock / morphMs); }

    function startMorph(to) {
      if (!ready || frames.length < 2) return;
      var t = ((to % frames.length) + frames.length) % frames.length; if (t === cur) return;
      nextI = t; ph = new Float32Array(cols * rows);
      for (var i = 0; i < ph.length; i++) ph[i] = Math.random() * 0.72 + 0.04;
      mode = 'morph'; clock = 0; if (opts.onFrame) opts.onFrame(nextI, frames[nextI]);
    }
    function tick(dt) {
      clock += dt;
      if (mode === 'hold') { if (clock >= dwell && frames.length > 1 && active) startMorph(cur + 1); }
      else if (clock >= morphMs) { cur = nextI; mode = 'hold'; clock = 0; }
      render();
    }
    function loop(now) {
      if (destroyed) return; var dt = now - last; last = now; if (dt > 120) dt = 120; acc += dt;
      if (acc >= 1000 / FPS) { tick(acc); acc = 0; }
      if (active && !hidden) raf = requestAnimationFrame(loop); else raf = 0;
    }
    function run() { if (raf || destroyed || !active || hidden) return; last = performance.now(); raf = requestAnimationFrame(loop); }
    function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }
    function onVis() { hidden = !!document.hidden; if (hidden) stop(); else run(); }

    document.addEventListener('visibilitychange', onVis);
    canvas.addEventListener('contextlost', function (e) { e.preventDefault(); stop(); }, false);
    canvas.addEventListener('contextrestored', function () { fit(); render(); if (active && !hidden) run(); }, false);
    var ro = ('ResizeObserver' in window) ? new ResizeObserver(function () { build(); }) : null;
    if (ro) ro.observe(canvas);
    build();

    return {
      go: function (i) {
        if (!ready) return;
        if (reduce()) { cur = ((i % frames.length) + frames.length) % frames.length; mode = 'hold'; clock = 0; if (opts.onFrame) opts.onFrame(cur, frames[cur]); render(); return; }
        if (mode === 'morph') return; startMorph(i);
      },
      next: function () { this.go(cur + 1); },
      prev: function () { this.go(cur - 1); },
      current: function () { return cur; },
      setActive: function (b) { active = !!b; clock = 0; if (reduce()) { render(); return; } if (active) run(); else stop(); },
      destroy: function () { destroyed = true; stop(); document.removeEventListener('visibilitychange', onVis); if (ro) ro.disconnect(); }
    };
  }
  window.AsciiPlayer = { mount: mount };
})();
