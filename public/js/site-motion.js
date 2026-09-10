/* ==========================================================================
   site-motion.js — the motion every section carries, below the hero.

   The hero gets a WebGL scene (js/site-scene.js). Everything below it gets
   this: drifting ornaments, a staggered content reveal, and a light parallax
   on the ornament layers.

   Why ornaments are DOM and CSS rather than a second WebGL canvas:

     1. A full-page canvas would sit BEHIND every section, and the Muhibbi
        sections have opaque backgrounds. It would be invisible for its whole
        length — which is the entire page.
     2. One WebGL context per page is a budget worth keeping. A second context
        on a mid-range phone is where the frame rate actually goes.
     3. Transform-and-opacity keyframes run on the compositor. Forty drifting
        spans cost less than one more render loop, and they keep working when
        WebGL is unavailable.

   The scene contract is `tpl.motion` naming a motif — 'petals', 'sparkle',
   'confetti', 'bubbles', 'leaves', 'feathers'. The motif only selects a CSS
   class; all six share one set of keyframes and differ in shape, tint source,
   size and speed. See the `ws-mo-*` rules in css/mu-extra.css.

   Called by EVER_bindSite, so it runs for full live renders only — never for
   the gallery miniatures, which must stay cheap.
   ========================================================================== */
(function () {
  'use strict';

  var MOTIFS = {
    petals:   { min: 5, max: 13, area: 34000 },
    sparkle:  { min: 6, max: 16, area: 27000 },
    confetti: { min: 6, max: 15, area: 29000 },
    bubbles:  { min: 4, max: 11, area: 40000 },
    leaves:   { min: 4, max: 10, area: 44000 },
    feathers: { min: 4, max: 10, area: 44000 }
  };

  function reducedMotion() {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) { return false; }
  }

  /* How many ornaments a device should carry, as a multiplier.
   *
   * Deliberately NOT an on/off switch. These are CSS transform/opacity
   * keyframes on a promoted layer — compositor work, not main-thread work —
   * so a modest device can carry them; it just should not carry as many.
   * Core count is a weak proxy for GPU capability at the best of times, and
   * plenty of current phones report 4. Gating on it removed the feature
   * outright on hardware that could easily have shown it.
   *
   * The place a core count genuinely belongs is the WebGL pixel ratio, and
   * js/site-scene.js already uses it there. */
  function density() {
    var cores = window.navigator.hardwareConcurrency;
    if (typeof cores !== 'number' || cores <= 0) return 1;
    if (cores <= 2) return 0.5;
    if (cores <= 4) return 0.72;
    return 1;
  }

  function rand(a, b) { return a + Math.random() * (b - a); }

  /**
   * Can this section host an absolutely-positioned layer without moving
   * anything that is already in it?
   *
   * Yes if it is already a containing block (the Muhibbi sections that carry
   * decorative shapes all are). Also yes if it is static but holds nothing
   * positioned, because making it relative then provably changes no layout.
   * Otherwise no — a static section with absolute children is positioning
   * them against some ancestor, and becoming their containing block would
   * move them.
   */
  function canHostLayer(sec) {
    var pos = '';
    try { pos = window.getComputedStyle(sec).position; } catch (e) { return false; }
    if (pos && pos !== 'static') return true;

    var kids = sec.querySelectorAll('*');
    for (var i = 0; i < kids.length; i++) {
      var p = '';
      try { p = window.getComputedStyle(kids[i]).position; } catch (e) { return false; }
      if (p === 'absolute' || p === 'fixed') return false;
    }
    sec.style.position = 'relative';
    return true;
  }

  function ornamentLayer(sec, motif, dens) {
    var cfg = MOTIFS[motif];
    var w = sec.clientWidth || 1;
    var h = sec.clientHeight || 1;
    var n = Math.round((w * h) / cfg.area);
    n = Math.max(cfg.min, Math.min(cfg.max, n));
    n = Math.max(3, Math.round(n * dens));

    var layer = document.createElement('div');
    layer.className = 'ws-orn';
    layer.setAttribute('aria-hidden', 'true');

    for (var i = 0; i < n; i++) {
      var bit = document.createElement('span');
      bit.className = 'ws-orn-bit';
      /* Every value is a custom property so the keyframes stay shared and the
         browser animates transform/opacity only. */
      bit.style.setProperty('--x', rand(2, 96).toFixed(2) + '%');
      bit.style.setProperty('--s', rand(0.55, 1.5).toFixed(2));
      bit.style.setProperty('--dur', rand(11, 26).toFixed(1) + 's');
      bit.style.setProperty('--delay', (-rand(0, 26)).toFixed(1) + 's');
      bit.style.setProperty('--drift', rand(-70, 70).toFixed(0) + 'px');
      bit.style.setProperty('--spin', rand(-320, 320).toFixed(0) + 'deg');
      bit.style.setProperty('--o', rand(0.22, 0.62).toFixed(2));
      layer.appendChild(bit);
    }

    sec.insertBefore(layer, sec.firstChild);
    sec.classList.add('ws-has-orn');
    return layer;
  }

  /* Stagger the section's own content, not every descendant: one level down
     from the section is where the Muhibbi markup puts its container, so we
     go one further and mark that container's children. Marking everything
     would cascade delays into the hundreds of milliseconds. */
  function firstChildWith(el, cls) {
    var kids = el.children;
    for (var i = 0; i < kids.length; i++) {
      for (var c = 0; c < cls.length; c++) {
        if (kids[i].classList.contains(cls[c])) return kids[i];
      }
    }
    return null;
  }

  function stagger(sec) {
    var host = firstChildWith(sec, ['container', 'container-fluid']) || sec;
    var row = firstChildWith(host, ['row']) || host;
    var kids = row.children;
    var n = Math.min(kids.length, 10);
    for (var i = 0; i < n; i++) {
      if (kids[i].classList.contains('ws-orn')) continue;
      kids[i].classList.add('ws-mo-item');
      kids[i].style.setProperty('--i', String(i));
    }
  }

  /**
   * One passive scroll listener, rAF-throttled, driving every ornament layer.
   * Each layer shifts by a fraction of its section's distance from the
   * viewport centre — transform only, so nothing reads back layout.
   */
  function parallax(layers) {
    if (!layers.length) return;
    var queued = false;

    function apply() {
      queued = false;
      var mid = (window.innerHeight || 1) / 2;
      for (var i = 0; i < layers.length; i++) {
        var l = layers[i];
        var r = l.parentNode.getBoundingClientRect();
        if (r.bottom < -200 || r.top > (window.innerHeight || 0) + 200) continue;
        var off = ((r.top + r.height / 2) - mid) / mid;
        l.style.transform = 'translate3d(0,' + (off * -22).toFixed(1) + 'px,0)';
      }
    }
    function onScroll() {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(apply);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    apply();
  }

  /**
   * Mount a design's section motion.
   * @param {Element} root  the rendered `.ws` site
   * @param {Object}  tpl   the theme; `tpl.motion` names the motif
   */
  function mountMotion(root, tpl) {
    if (!root || root.__wsMotion) return;
    if (reducedMotion()) return;
    root.__wsMotion = true;

    var motif = tpl && tpl.motion;
    var wantOrnaments = !!(motif && MOTIFS[motif]);
    var dens = density();
    if (wantOrnaments) root.classList.add('ws-mo-' + motif);

    var secs = root.querySelectorAll('.ws-sec');
    var layers = [];

    Array.prototype.forEach.call(secs, function (sec) {
      /* The hero already carries the WebGL scene; two motion systems in one
         viewport is noise, not richness. */
      var isHero = sec.id === 'ws-sec-hero' || sec.classList.contains('ws-hero');

      stagger(sec);

      if (!wantOrnaments || isHero) return;
      if (!canHostLayer(sec)) return;
      layers.push(ornamentLayer(sec, motif, dens));
    });

    parallax(layers);
  }

  window.EVER_mountMotion = mountMotion;
})();
