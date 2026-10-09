/* ==========================================================================
   Invitara — Muhibbi shared layout runtime
   --------------------------------------------------------------------------
   The ten layouts in js/layouts/*.js are ports of the Muhibbi template's ten
   invitation home pages. They all reuse the same header, section title,
   slider, RSVP form and footer, so those live here once.

   Markup keeps the template's own class names (`wpo-*`, `.grid`, `.theme-btn`
   …) so css/mu.css styles it exactly like the original design, and adds the
   engine's classes (`ws-sec`, `#ws-sec-<id>`) so the editor's show/hide,
   reorder, scroll-reveal and anchor code keeps working.

   No jQuery / Owl / WOW: the preview re-renders on every keystroke, so the
   carousels are a small vanilla slider (bound in MU.bind) and the WOW classes
   are simply omitted — sections reveal through the engine's own observer.
   ========================================================================== */
(function () {
  'use strict';
  var E = window;

  function esc(s) { return E.EVER_esc(s); }
  function safe(u) { return E.EVER_safeUrl(u); }
  function photo(p) { return E.EVER_photoSrc(p); }

  /* ------------------------------------------------------------------ *
   *  Small helpers                                                      *
   * ------------------------------------------------------------------ */

  /* Themify icon (the template's icon font, shipped in public/mu/fonts). */
  function ti(name) { return '<i class="ti-' + esc(name) + '"></i>'; }

  /* An <img> that never breaks the layout when the source is empty. */
  function img(src, alt, cls) {
    return '<img' + (cls ? ' class="' + esc(cls) + '"' : '') +
      ' src="' + esc(photo(src)) + '" alt="' + esc(alt || '') + '" loading="lazy"/>';
  }

  /* Section wrapper: template class for the design, ws-* for the engine.
     `s` is the section state — its background/spacing overrides are applied. */
  function sec(id, cls, inner, s) {
    return '<section class="ws-sec ws-' + esc(id) + ' ' + cls + '" id="ws-sec-' + esc(id) + '"' +
      secStyle(s) + '>' + inner + '</section>';
  }

  /* The ornate centred heading used above most sections. */
  function title(text, cls) {
    if (!text) return '';
    return '<div class="wpo-section-title' + (cls ? ' ' + cls : '') + '">' +
      '<div class="section-image"><img src="mu/images/section-title-icon.svg" alt=""/></div>' +
      '<h2>' + esc(text) + '</h2>' +
    '</div>';
  }

  /* Primary button. `goto` scrolls to a section, `href` opens a link. */
  function btn(text, goto, cls) {
    if (!text) return '';
    var c = 'theme-btn' + (cls ? ' ' + cls : '');
    return '<a class="' + c + '" href="#ws-sec-' + esc(goto || 'rsvp') + '" data-goto="' + esc(goto || 'rsvp') + '">' +
      esc(text) + '</a>';
  }

  /* ------------------------------------------------------------------ *
   *  Slider (replaces Owl Carousel — see the header note)               *
   * ------------------------------------------------------------------ */
  /* items: array of HTML strings. opts.per = slides per view at desktop. */
  function slider(items, opts) {
    opts = opts || {};
    if (!items || !items.length) return '';
    var per = opts.per || 3;
    var cells = items.map(function (h) {
      return '<div class="mu-slide' + (opts.slideCls ? ' ' + opts.slideCls : '') + '">' + h + '</div>';
    }).join('');
    /* a single slide needs no controls — render it plain so nothing overlaps */
    if (items.length < 2 && opts.per !== undefined && opts.per <= 1) {
      return '<div class="mu-slider is-single' + (opts.cls ? ' ' + opts.cls : '') + '">' +
        '<div class="mu-slider-view"><div class="mu-slider-track">' + cells + '</div></div></div>';
    }
    return '<div class="mu-slider' + (opts.cls ? ' ' + opts.cls : '') + '" data-mu-slider data-per="' + per + '">' +
        '<div class="mu-slider-view"><div class="mu-slider-track">' + cells + '</div></div>' +
        (opts.nav === false ? '' :
          '<button class="mu-arrow mu-prev" type="button" aria-label="Previous">' + ti('angle-left') + '</button>' +
          '<button class="mu-arrow mu-next" type="button" aria-label="Next">' + ti('angle-right') + '</button>') +
        '<div class="mu-dots" role="tablist"></div>' +
      '</div>';
  }

  /* ------------------------------------------------------------------ *
   *  Header — simplified single-level nav using the template's classes  *
   * ------------------------------------------------------------------ */
  /* links: [[sectionId, label], …] — filtered to the sections that are on. */
  function head(d, tpl, opts) {
    opts = opts || {};
    var B = d.basics;
    var S = d.sections;
    var on = {};
    (d.order || []).forEach(function (id) { if (S[id] && S[id].on !== false) on[id] = true; });

    var links = (opts.links || []).filter(function (l) { return on[l[0]]; })
      .map(function (l) {
        return '<li><a href="#ws-sec-' + esc(l[0]) + '" data-goto="' + esc(l[0]) + '">' + esc(l[1]) + '</a></li>';
      }).join('');

    var brand = esc(B.brand || E.EVER_monogram(B.nameA, B.nameB));

    return '<header class="ws-head' + (opts.cls ? ' ' + opts.cls : '') + '">' +
      '<div class="wpo-site-header">' +
        '<nav class="navigation navbar navbar-expand-lg navbar-light">' +
          '<div class="container-fluid">' +
            '<div class="mu-head-row">' +
              /* NOT `mobile-menu`: styles.css uses that class for the
                 builder's own full-screen menu, and it would leak in here */
              '<div class="mu-menu-btn">' +
                '<button type="button" class="navbar-toggler open-btn" data-mu-menu aria-label="Menu">' +
                  '<span class="icon-bar first-angle"></span>' +
                  '<span class="icon-bar middle-angle"></span>' +
                  '<span class="icon-bar last-angle"></span>' +
                '</button>' +
              '</div>' +
              '<div class="navbar-header">' +
                '<a class="navbar-brand mu-brand" href="#ws-sec-' + esc((d.order || ['hero'])[0]) + '" data-goto="' + esc((d.order || ['hero'])[0]) + '">' + brand + '</a>' +
              '</div>' +
              /* deliberately NOT `navigation-holder`: that class carries the
                 template's jQuery-driven off-canvas panel, which we replace
                 with the simple dropdown in mu-extra.css */
              '<div class="site-navbar mu-nav" data-mu-nav>' +
                '<button class="menu-close" type="button" data-mu-menu-close>' + ti('close') + '</button>' +
                '<ul class="nav navbar-nav">' + links + '</ul>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</nav>' +
      '</div>' +
    '</header>';
  }

  /* ------------------------------------------------------------------ *
   *  Countdown — the engine's timer inside the template's styling       *
   * ------------------------------------------------------------------ */
  function timer(dateISO, label) {
    return '<div class="mu-timer-wrap">' +
      (label ? '<span class="mu-timer-label">' + esc(label) + '</span>' : '') +
      E.EVER_timerHtml(dateISO) +
    '</div>';
  }

  /* The template's big circular countdown (its "wedding date" band). The
     original filled it with a jQuery plugin; the markup below is what that
     plugin produced, wired to the engine's own tickCountdowns instead. */
  function clock(dateISO, labels) {
    labels = labels || {};
    var units = [['d', labels.d || 'Days'], ['h', labels.h || 'Hours'],
                 ['m', labels.m || 'Minutes'], ['s', labels.s || 'Seconds']];
    return '<div id="clock" data-ws-deadline="' + esc(dateISO) + 'T17:00:00" aria-label="Countdown timer">' +
      units.map(function (u) {
        return '<div class="box"><div><div class="time" data-u="' + u[0] + '">00</div>' +
          '<span>' + esc(u[1]) + '</span></div></div>';
      }).join('') +
    '</div>';
  }

  /* ------------------------------------------------------------------ *
   *  RSVP form — engine field names, template form styling              *
   * ------------------------------------------------------------------ */
  function rsvpForm(r) {
    r = r || {};
    var guests = '<option value="">Number of guests</option>';
    for (var i = 1; i <= (parseInt(r.guestsMax, 10) || 6); i++) guests += '<option value="' + i + '">' + i + '</option>';
    var meals = '';
    (r.meals || []).forEach(function (m) { meals += '<option>' + esc(m) + '</option>'; });

    function cell(w, inner) {
      return '<div class="col col-lg-' + w + ' col-md-' + w + ' col-12"><div class="input-item">' +
        inner + '</div></div>';
    }
    return '<div class="wpo-contact-form-area">' +
      '<form class="ws-rsvp-form contact-validation-active" novalidate>' +
      '<div class="row">' +
        cell(6, '<input type="text" class="form-control" name="name" placeholder="' + esc(r.phName || 'Your name') + '" required/>') +
        (r.showPhone === false ? '' :
        cell(6, '<input type="tel" class="form-control" name="phone" placeholder="' + esc(r.phPhone || 'Phone number') + '"/>')) +
        cell(6, '<select name="guests" class="form-control">' + guests + '</select>') +
        cell(6, '<select name="attend" class="form-control" required>' +
          '<option value="">' + esc(r.phAttend || 'Will you attend?') + '</option>' +
          '<option>' + esc(r.yes || 'Joyfully accept') + '</option>' +
          '<option>' + esc(r.no || 'Regretfully decline') + '</option>' +
        '</select>') +
        (meals ? cell(12, '<select name="meal" class="form-control last">' +
          '<option value="">' + esc(r.phMeal || 'Meal preference') + '</option>' + meals + '</select>') : '') +
        (r.showMsg === false ? '' :
        cell(12, '<textarea name="msg" class="form-control" rows="4" placeholder="' +
          esc(r.phMsg || 'Your message (optional)') + '"></textarea>')) +
        '<div class="col col-lg-12 col-12"><div class="submit-area">' +
          '<button type="submit" class="theme-btn ws-submit">' + esc(r.submit || 'Send RSVP') + '</button>' +
        '</div></div>' +
      '</div>' +
      '</form>' +
    '</div>';
  }

  /* The RSVP section shared by every layout (image panel + titled form). */
  function rsvpSection(s) {
    var deadline = s.deadline ? E.EVER_fmtLongDate(s.deadline) : '';
    return sec('rsvp', 'wpo-contact-section section-padding',
      '<div class="container-fluid"><div class="contact-wrap"><div class="row align-items-center">' +
        (s.photo === '' ? '' :
        '<div class="col-lg-5"><div class="contact-left"><div class="image mu-zoom">' +
          img(s.photo || 'mu-portfolio-3', '') + '</div></div></div>') +
        '<div class="col-lg-' + (s.photo === '' ? '12' : '7') + ' col-md-12">' +
          '<div class="wpo-contact-section-wrapper"><div class="contact-title">' +
            '<div class="title-image"><img src="mu/images/section-title-icon.svg" alt=""/></div>' +
            '<h2>' + esc(s.title) + '</h2>' +
            (s.note ? '<p>' + esc(s.note) + (deadline ? ' <b>' + esc(deadline) + '</b>' : '') + '</p>' : '') +
          '</div>' + rsvpForm(s) + '</div>' +
        '</div>' +
      '</div></div></div>', s);
  }

  function rsvpSpec(label) {
    return {
      id: 'rsvp', label: label || 'RSVP',
      fields: [
        { k: 'title',     label: 'Heading', type: 'text', ph: 'Welcome to our big day' },
        { k: 'note',      label: 'Note above the form', type: 'text', ph: 'Kindly reply by' },
        { k: 'deadline',  label: 'Reply deadline', type: 'date' },
        { k: 'photo',     label: 'Side photo', type: 'photo' },
        { k: 'showPhone', label: 'Ask for a phone number', type: 'check' },
        { k: 'showMsg',   label: 'Include a message box', type: 'check' },
        { k: 'guestsMax', label: 'Max guests per reply', type: 'number', min: 1, max: 20 },
        { k: 'yes',       label: '“Attending” wording', type: 'text', ph: 'Joyfully accept' },
        { k: 'no',        label: '“Not attending” wording', type: 'text', ph: 'Regretfully decline' },
        { k: 'submit',    label: 'Button text', type: 'text', ph: 'Send RSVP' },
        { k: 'success',   label: 'Message after sending', type: 'textarea', ph: 'Thank you!' }
      ],
      list: {
        k: 'meals', label: 'Menu choice',
        blank: function () { return 'New choice'; },
        fields: [{ k: '', label: 'Choice', type: 'text', ph: 'Vegetarian' }]
      }
    };
  }

  function rsvpDefaults(extra) {
    var d = {
      on: true,
      title: 'Welcome to our big day',
      note: 'Your presence will make the day complete. Kindly reply by',
      deadline: E.EVER_futureISO(2, 10),
      photo: 'mu-portfolio-3',
      showPhone: true, showMsg: true, guestsMax: 6,
      yes: 'Joyfully accept', no: 'Regretfully decline',
      submit: 'Send RSVP',
      meals: ['Vegetarian', 'Non vegetarian', 'Vegan', 'Not sure yet'],
      success: 'Thank you! Your reply has been received — we can’t wait to celebrate with you.'
    };
    if (extra) E.EVER_deepMerge(d, extra);
    return d;
  }

  /* ------------------------------------------------------------------ *
   *  Footer                                                             *
   * ------------------------------------------------------------------ */
  function foot(d, tpl, s) {
    var B = d.basics;
    s = s || {};
    var soc = '';
    var SOC = [['fb', 'facebook'], ['ig', 'instagram'], ['tw', 'twitter-alt'], ['wa', 'comment']];
    SOC.forEach(function (p) {
      if (!s.social || !s.social[p[0]]) return;
      var href = safe(s['url' + p[0].toUpperCase()]) || '#ws-sec-contact';
      soc += '<li><a href="' + esc(href) + '"' +
        (href.charAt(0) === '#' ? '' : ' target="_blank" rel="noopener noreferrer"') +
        ' aria-label="' + esc(p[1]) + '">' + ti(p[1]) + '</a></li>';
    });

    var quick = (d.order || []).filter(function (id) {
      return d.sections[id] && d.sections[id].on !== false && id !== 'hero' && id !== 'contact';
    }).slice(0, 6);
    var half = Math.ceil(quick.length / 2);
    function linkList(arr) {
      return '<ul>' + arr.map(function (id) {
        var lab = (E.EVER_findLayout(d.layoutId).sections.filter(function (x) { return x.id === id; })[0] || {}).label || id;
        return '<li><a href="#ws-sec-' + esc(id) + '" data-goto="' + esc(id) + '">' + esc(lab) + '</a></li>';
      }).join('') + '</ul>';
    }

    return '<footer class="ws-footer wpo-site-footer" id="ws-sec-contact">' +
      '<div class="container">' +
        '<div class="wpo-upper-footer"><div class="row align-items-center">' +
          '<div class="col col-xl-3 col-lg-4 col-md-6 col-12">' +
            '<div class="widget link-widget">' +
              '<div class="widget-title"><h2>' + esc(s.linksTitle || 'Explore') + '</h2></div>' +
              '<div class="link-wrap">' + linkList(quick.slice(0, half)) + linkList(quick.slice(half)) + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="col col-xl-6 col-lg-4 col-md-6 col-12">' +
            '<div class="widget about-widget">' +
              '<div class="logo widget-title"><span class="mu-brand">' +
                esc(B.brand || E.EVER_monogram(B.nameA, B.nameB)) + '</span></div>' +
              '<p>' + esc(s.thanks) + '</p>' +
              (soc ? '<ul class="mu-social">' + soc + '</ul>' : '') +
            '</div>' +
          '</div>' +
          '<div class="col col-xl-3 col-lg-4 col-md-6 col-12">' +
            '<div class="widget wpo-service-link-widget">' +
              '<div class="widget-title"><h2>' + esc(s.contactTitle || 'Contact') + '</h2></div>' +
              '<div class="link-widget"><ul>' +
                (s.email ? '<li><a href="mailto:' + esc(s.email) + '">' + esc(s.email) + '</a></li>' : '') +
                (s.phone ? '<li><a href="tel:' + esc(String(s.phone).replace(/\s/g, '')) + '">' + esc(s.phone) + '</a></li>' : '') +
                (s.address ? '<li>' + esc(s.address) + '</li>' : '') +
              '</ul></div>' +
            '</div>' +
          '</div>' +
        '</div></div>' +
        '<div class="wpo-lower-footer"><div class="row"><div class="col col-xs-12">' +
          '<p class="copyright">© ' + new Date().getFullYear() + ' ' +
            esc(B.brand || (B.nameA + ' & ' + B.nameB)) +
            (s.credit ? ' | ' + esc(s.credit) : '') + '</p>' +
        '</div></div></div>' +
      '</div>' +
      '<div class="shape-1"><img src="mu/images/shape-1.svg" alt=""/></div>' +
      '<div class="shape-2"><img src="mu/images/shape-2.svg" alt=""/></div>' +
    '</footer>';
  }

  /* ------------------------------------------------------------------ *
   *  Section loop honouring state.order + per-section on/off            *
   * ------------------------------------------------------------------ */
  function build(d, layoutId, fn) {
    var order = (d.order && d.order.length) ? d.order : E.EVER_layoutOrder(E.EVER_findLayout(layoutId));
    var html = '';
    order.forEach(function (id) {
      var s = d.sections[id];
      if (!s || s.on === false) return;
      html += fn(id, s) || '';
    });
    return html;
  }

  /* Per-section style overrides the editor exposes (background + padding). */
  function secStyle(s) {
    var st = '';
    if (s && s.bg && /^#[0-9a-fA-F]{3,8}$/.test(s.bg)) st += 'background-color:' + s.bg + ';';
    if (s && s.pad === 'tight') st += 'padding-top:40px;padding-bottom:40px;';
    if (s && s.pad === 'roomy') st += 'padding-top:140px;padding-bottom:140px;';
    return st ? ' style="' + st + '"' : '';
  }

  /* ------------------------------------------------------------------ *
   *  Behaviours — called by EVER_bindSite after every render            *
   * ------------------------------------------------------------------ */
  function bindSliders(root) {
    var sliders = root.querySelectorAll('[data-mu-slider]');
    Array.prototype.forEach.call(sliders, function (sl) {
      if (sl.__muBound) return;
      sl.__muBound = true;
      var track = sl.querySelector('.mu-slider-track');
      var dots = sl.querySelector('.mu-dots');
      var slides = track ? track.children : [];
      if (!track || !slides.length) return;
      var idx = 0;

      function per() {
        var want = parseInt(sl.getAttribute('data-per'), 10) || 3;
        var w = sl.clientWidth;
        if (w < 560) return 1;
        if (w < 900) return Math.min(2, want);
        return want;
      }
      function pages() { return Math.max(1, slides.length - per() + 1); }
      function layout() {
        var p = per();
        for (var i = 0; i < slides.length; i++) slides[i].style.flex = '0 0 ' + (100 / p) + '%';
        if (idx > pages() - 1) idx = pages() - 1;
        apply();
      }
      function apply() {
        var p = per();
        track.style.transform = 'translateX(' + (-idx * (100 / p)) + '%)';
        if (dots) {
          var d = '';
          for (var i = 0; i < pages(); i++) {
            d += '<button type="button" class="mu-dot' + (i === idx ? ' is-on' : '') +
              '" data-i="' + i + '" aria-label="Slide ' + (i + 1) + '"></button>';
          }
          dots.innerHTML = d;
        }
        var prev = sl.querySelector('.mu-prev'), next = sl.querySelector('.mu-next');
        if (prev) prev.disabled = idx <= 0;
        if (next) next.disabled = idx >= pages() - 1;
      }
      function go(n) { idx = Math.max(0, Math.min(pages() - 1, n)); apply(); }

      sl.addEventListener('click', function (e) {
        var t = e.target.closest ? e.target.closest('.mu-prev,.mu-next,.mu-dot') : null;
        if (!t) return;
        e.preventDefault();
        if (t.classList.contains('mu-prev')) go(idx - 1);
        else if (t.classList.contains('mu-next')) go(idx + 1);
        else go(parseInt(t.getAttribute('data-i'), 10) || 0);
      });
      if ('ResizeObserver' in window) {
        var ro = new ResizeObserver(function () { layout(); });
        ro.observe(sl);
        root.__muDisposers.push(function(){ro.disconnect();});
      } else {
        window.addEventListener('resize', layout);
        root.__muDisposers.push(function(){window.removeEventListener('resize',layout);});
      }
      layout();
    });
  }

  function bindMenu(root) {
    var holder = root.querySelector('[data-mu-nav]');
    if (!holder) return;
    root.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('[data-mu-menu],[data-mu-menu-close],[data-mu-nav] a') : null;
      if (!t) return;
      if (t.hasAttribute('data-mu-menu')) holder.classList.toggle('is-open');
      else holder.classList.remove('is-open');
    });
  }

  /* Lightbox for gallery / photo strips (replaces fancybox). */
  function bindLightbox(root) {
    root.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('[data-mu-zoom]') : null;
      if (!a) return;
      e.preventDefault();
      var src = a.getAttribute('href');
      if (!src) return;
      var box = document.createElement('div');
      box.className = 'mu-lightbox';
      box.innerHTML = '<button class="mu-lb-close" type="button" aria-label="Close">&times;</button>' +
        '<img src="' + esc(src) + '" alt=""/>';
      box.addEventListener('click', function () { box.remove(); });
      root.appendChild(box);
    });
  }

  function bind(root) {
    if (!root) return;
    root.__muDisposers = root.__muDisposers || [];
    bindSliders(root);
    bindMenu(root);
    bindLightbox(root);
  }

  /* ------------------------------------------------------------------ *
   *  Mini preview — the real layout, rendered small                     *
   * ------------------------------------------------------------------ */
  /* Design cards and the checkout summary show a thumbnail. Rather than
     maintaining a second, simplified renderer per layout (which always drifts
     from the real thing), render the actual layout at a fixed 1280px width
     inside a scaled wrapper. What the customer previews is what they get. */
  var MINI_W = 1280;

  /* One ResizeObserver for every miniature on the page, not one each.
     A contact sheet is nine minis and the gallery is 27 cards, so the
     per-box observer this used to create meant ~225 live observers — each
     with its own callback and its own entry in the resize work the browser
     does on every layout pass. One observer with a lookup does the same job
     for a fraction of the cost. */
  var sharedRO = null;
  var fitJobs = (typeof WeakMap === 'function') ? new WeakMap() : null;

  function resizeObserver() {
    if (sharedRO || !('ResizeObserver' in window) || !fitJobs) return sharedRO;
    sharedRO = new ResizeObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        var job = fitJobs.get(entries[i].target);
        if (job) job();
      }
    });
    return sharedRO;
  }

  function fit(box, scale) {
    function apply() {
      var w = box.clientWidth;
      if (!w) return false;
      var k = w / MINI_W;
      scale.style.transform = 'scale(' + k + ')';
      /* the wrapper's aspect-ratio decides the crop; height follows the scale */
      scale.style.height = (box.clientHeight / k) + 'px';
      return true;
    }
    if (!apply()) {
      /* not in the document yet — retry on the next frames until it is */
      var tries = 0;
      (function spin() {
        if (apply() || ++tries > 60) return;
        requestAnimationFrame(spin);
      })();
    }
    var ro = resizeObserver();
    if (ro) {
      fitJobs.set(box, apply);
      ro.observe(box);
      box.__dispose = function(){ro.unobserve(box);fitJobs.delete(box);};
    }
  }

  function clone(d) {
    try { return JSON.parse(JSON.stringify(d)); } catch (e) { return d; }
  }

  function liveOrder(d) {
    return (d.order || []).filter(function (id) {
      return d.sections[id] && d.sections[id].on !== false;
    });
  }

  /* Build one scaled miniature box around whatever `render` produces. */
  function miniBox(d, tpl, render, cls) {
    var inner = render(d, tpl, { mini: true });
    var box = document.createElement('div');
    box.className = cls;
    box.setAttribute('aria-hidden', 'true');
    E.EVER_applyVars(box, tpl, d);
    var scale = document.createElement('div');
    scale.className = 'wsm-scale';
    scale.appendChild(inner);
    box.appendChild(scale);
    fit(box, scale);
    return box;
  }

  /* A contact sheet: every section of the design rendered as its own
     miniature and laid out in a grid, so one card shows the whole thing
     rather than only the first few sections. Every layout reaches this
     through miniWrap, so none of them need to know about it. */
  function miniSheet(d, tpl, opts, render) {
    var ids = liveOrder(d).slice(0, opts.tiles);
    var sheet = document.createElement('div');
    sheet.className = 'wsm-sheet ws-' + (d.layoutId || tpl.layout);
    sheet.setAttribute('aria-hidden', 'true');

    ids.forEach(function (id) {
      var d2 = clone(d);
      d2.order = [id];
      var tile = miniBox(d2, tpl, render, 'wsm wsm-tile');
      /* Every layout's render() prepends the site nav. One copy per tile
         would be nine identical headers and no design; the sheet is about
         the sections. */
      var nav = tile.querySelector('.ws-head');
      if (nav) nav.parentNode.removeChild(nav);
      sheet.appendChild(tile);
    });
    return sheet;
  }

  function miniWrap(d, tpl, opts, render) {
    opts = opts || {};
    if (opts.tiles) return miniSheet(d, tpl, opts, render);
    var keep = opts.short ? 2 : 4;
    var d2 = clone(d);
    d2.order = liveOrder(d2).slice(0, keep);

    return miniBox(d2, tpl, render,
      'wsm ws-' + (d.layoutId || tpl.layout) + (opts.short ? ' wsm-short' : ''));
  }

  /* ------------------------------------------------------------------ *
   *  Shared editor field specs (every layout reuses these)              *
   * ------------------------------------------------------------------ */
  /* Appended to each section so the owner can restyle any section. */
  function styleFields() {
    return [
      { k: 'bg',  label: 'Section background (empty = theme)', type: 'color' },
      { k: 'pad', label: 'Section spacing', type: 'select',
        options: [['', 'Default'], ['tight', 'Tight'], ['roomy', 'Roomy']] }
    ];
  }

  function contactSection(label) {
    return {
      id: 'contact', label: label || 'Footer & contact',
      fields: [
        { k: 'thanks',       label: 'Footer note', type: 'textarea', ph: 'We can’t wait to celebrate with you.' },
        { k: 'linksTitle',   label: 'Links column heading', type: 'text', ph: 'Explore' },
        { k: 'contactTitle', label: 'Contact column heading', type: 'text', ph: 'Contact' },
        { k: 'email',        label: 'E-mail', type: 'text', ph: 'hello@example.com' },
        { k: 'phone',        label: 'Phone', type: 'text', ph: '+91 98765 43210' },
        { k: 'address',      label: 'Address line', type: 'text', ph: '12 Rosewood Lane, Kent' },
        { k: 'credit',       label: 'Credit line', type: 'text', ph: 'Made with love' },
        { k: 'social.fb',    label: 'Show Facebook', type: 'check' },
        { k: 'social.ig',    label: 'Show Instagram', type: 'check' },
        { k: 'social.tw',    label: 'Show X / Twitter', type: 'check' },
        { k: 'social.wa',    label: 'Show WhatsApp', type: 'check' },
        { k: 'urlFB',        label: 'Facebook link', type: 'text', ph: 'https://facebook.com/…' },
        { k: 'urlIG',        label: 'Instagram link', type: 'text', ph: 'https://instagram.com/…' },
        { k: 'urlTW',        label: 'X / Twitter link', type: 'text', ph: 'https://x.com/…' },
        { k: 'urlWA',        label: 'WhatsApp link', type: 'text', ph: 'https://wa.me/…' }
      ]
    };
  }

  function contactDefaults(extra) {
    var d = {
      on: true,
      thanks: 'We can’t wait to see all of our beloved friends and family on our special day.',
      linksTitle: 'Explore', contactTitle: 'Contact',
      email: 'hello@example.com', phone: '+91 98765 43210',
      address: '12 Rosewood Lane, Kent',
      credit: 'Made with ♥',
      social: { fb: true, ig: true, tw: false, wa: true },
      urlFB: '', urlIG: '', urlTW: '', urlWA: ''
    };
    if (extra) E.EVER_deepMerge(d, extra);
    return d;
  }

  /* Attach the two style fields to every section spec of a layout. */
  function withStyleFields(sections) {
    return sections.map(function (s) {
      var out = { id: s.id, label: s.label, fields: (s.fields || []).concat(styleFields()) };
      if (s.list) out.list = s.list;      /* keep the repeater's blank() by reference */
      return out;
    });
  }

  E.MU = {
    esc: esc, safe: safe, photo: photo, ti: ti, img: img,
    sec: sec, title: title, btn: btn, slider: slider,
    head: head, foot: foot, timer: timer, clock: clock, rsvpForm: rsvpForm,
    rsvpSection: rsvpSection, rsvpSpec: rsvpSpec, rsvpDefaults: rsvpDefaults,
    build: build, secStyle: secStyle, miniWrap: miniWrap,
    styleFields: styleFields, withStyleFields: withStyleFields,
    contactSection: contactSection, contactDefaults: contactDefaults
  };
  E.MU_bind = bind;
})();
