/* ==========================================================================
   Invitara — event website builder (v4, dynamic sidebar)
   The sidebar is generated 100% from the active layout's field specs
   (docs/LAYOUT-SPEC.md): "Basics" from layout.basics and one accordion per
   section in state.order from layout.sections — so every field of every
   layout is editable with zero editor changes.
   Right side: live preview rendered by templates.js (EVER_renderSite).
   ========================================================================== */
(async function () {
  'use strict';

  if (!window.EVER_findLayout || !window.EVER_loadSiteState) return;

  var FLOW_KEY = 'ever-rsvp-flow';

  /* ------------------------------------------------------------------ *
   *  Small helpers                                                      *
   * ------------------------------------------------------------------ */
  function readJson(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); }
    catch (e) { return null; }
  }
  function writeJson(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch (e) { return false; }
  }
  function esc(s) { return window.EVER_esc(s); }


  /* dotted-path access: 'social.wa' -> sections.contact.social.wa */
  function getVal(obj, path) {
    return String(path || '').split('.').reduce(function (o, k) { return o ? o[k] : undefined; }, obj);
  }
  function setVal(obj, path, val) {
    var ks = String(path || '').split('.');
    var o = obj;
    for (var i = 0; i < ks.length - 1; i++) {
      if (!o[ks[i]] || typeof o[ks[i]] !== 'object') o[ks[i]] = {};
      o = o[ks[i]];
    }
    o[ks[ks.length - 1]] = val;
  }

  var uid = 0;
  function nextId() { uid += 1; return 'ed-f' + uid; }

  /* ------------------------------------------------------------------ *
   *  State                                                              *
   * ------------------------------------------------------------------ */
  var state = null;
  var ui = { open: {} };
  var pvTimer = null;
  var saveTimer = null;
  var history = [], historyIndex = -1;
  function remember() {
    var snapshot = JSON.stringify(state);
    if (history[historyIndex] === snapshot) return;
    history = history.slice(0, historyIndex + 1);
    history.push(snapshot);
    if (history.length > 80) history.shift();
    historyIndex = history.length - 1;
    updateHistory();
  }
  function updateHistory() {
    document.getElementById('undo-btn').disabled = historyIndex <= 0;
    document.getElementById('redo-btn').disabled = historyIndex >= history.length - 1;
  }
  function travel(direction) {
    if (!accessAllowed()) return;
    var next = historyIndex + direction;
    if (next < 0 || next >= history.length) return;
    state = JSON.parse(history[next]); historyIndex = next;
    if (access) state.basics.date = access.eventDate;
    buildSidebar(); buildDesign(); render(); autosave(); updateHistory();
    var flow = readJson(FLOW_KEY) || {}; flow.design = state.templateId; writeJson(FLOW_KEY, flow);
  }

  function layout() {
    var base = window.EVER_findLayout(state.layoutId), sections = base.sections.slice();
    Object.keys(state.sectionTypes || {}).forEach(function (key) {
      var source = base.sections.find(function (s) { return s.id === state.sectionTypes[key]; });
      if (source) sections.push(Object.assign({}, source, {id:key,label:source.label + ' (copy)'}));
    });
    return Object.assign({}, base, {sections:sections});
  }

  /* Core loader: EVER_siteDefaults + v1/v2/v3 -> v4 migration + the
     flow.design (checkout) override + template existence checks. */
  function loadState() {
    state = access ? JSON.parse(JSON.stringify(access.state)) : window.EVER_loadSiteState(readJson(FLOW_KEY) || {});
  }

  /* ---- Autosave (§25) --------------------------------------------- *
     Debounced so a burst of keystrokes writes once, and mirrored onto the
     active project so the dashboard, checkout and publish all see the same
     content. The status line says "Saving…" then "Saved" so a customer can
     see their work is safe.                                              */
  var saveFailed = false;
  function saveStatus(text, failed) {
    var el = document.getElementById('ed-save');
    if (!el) return;
    el.textContent = failed ? '' : text;
    el.classList.toggle('on', !!text);
    el.classList.toggle('err', !!failed);
    if (failed) {
      var detail = document.createElement('span');
      detail.className = 'ed-save-detail';
      detail.textContent = text + ' ';
      var retry = document.createElement('button');
      retry.type = 'button';
      retry.className = 'ed-retry';
      retry.textContent = 'Retry save';
      retry.addEventListener('click', saveNow);
      el.append(detail, retry);
      /* The status is compact on phones; announce the first failure once, not on every keystroke. */
      if (!saveFailed) toast(text + ' Your previous version is safe.');
    }
    saveFailed = !!failed;
  }

  var remoteSave = Promise.resolve();
  var access = null;
  var localSaveFailed = false;
  function accessAllowed() { return !access || (access.paid && Date.now() < access.expiresAt); }
  function persist() {
    if (!accessAllowed()) { saveStatus('Editor access ended'); return; }
    localSaveFailed = !writeJson(window.EVER_EVENT_KEY, state);
    if (localSaveFailed && !access) { saveStatus('Couldn’t save — device storage is full.', true); return; }
    if (window.EVER_C && !window.EVER_C.syncActiveState() && !access) {
      localSaveFailed = true;
      saveStatus('Couldn’t save — free some device storage.', true);
      return;
    }
    if (access) {
      var snapshot = JSON.parse(JSON.stringify(state));
      saveStatus('Saving to your account…');
      remoteSave = remoteSave.catch(function(){}).then(function() {
        return window.EVER_API.request('/projects/' + access.id, 'PUT', {state:snapshot});
      }).then(function(p) { window.EVER_API.cache(p); saveStatus('✓ Saved to your account'); return true; }).catch(function(err) { saveStatus('Couldn’t save. ' + err.message, true); return false; });
    }
  }

  /* Two timers: one debounces the write, one clears the "Saved" label. They
     are separate variables because setTimeout returns a plain number in the
     browser — it cannot carry a property. */
  var statusTimer = null;

  function markSaved() {
    if (access || localSaveFailed) return;
    saveStatus('✓ Saved on this device');
    clearTimeout(statusTimer);
    statusTimer = setTimeout(function () { saveStatus(''); }, 2000);
  }

  function autosave() {
    remember();
    clearTimeout(saveTimer);
    saveStatus('Saving…');
    saveTimer = setTimeout(function () {
      persist();
      markSaved();
    }, 350);
  }

  function saveNow() {
    clearTimeout(saveTimer);
    persist();
    markSaved();
  }

  /* ------------------------------------------------------------------ *
   *  Plan permissions (§12, §35)                                        *
   * ------------------------------------------------------------------ *
   * The customer's plan decides which sections and design controls are
   * editable. Locked controls stay visible — a customer should see what a
   * higher plan would give them — but are disabled and carry an upgrade
   * prompt. Section content already bought stays rendered on the site; only
   * EDITING it is gated.                                                 */

  /* Section id -> the permission needed to edit it. Anything absent is
     editable on every plan. */
  var SECTION_PERM = {
    gallery:   'editor.gallery',
    countdown: 'editor.countdown',
    map:       'editor.map',
    schedule:  'editor.schedule.multi',
    video:     'editor.premium',
    registry:  'editor.premium',
    stats:     'editor.premium',
    updates:   'editor.premium',
    wishes:    'editor.premium'
  };

  function project() {
    return window.EVER_C ? window.EVER_C.activeProject() : null;
  }

  /* No project (someone opened the editor directly) means nothing to gate —
     the old single-price behaviour, which keeps existing links working. */
  function planId() {
    var p = project();
    return p && p.plan ? p.plan : null;
  }

  function allow(perm) {
    if (!access) return true;
    if (access && access.paid) return accessAllowed();
    var id = planId();
    if (!id) return true;
    return window.EVER_C.can(id, perm);
  }

  /** The cheapest plan granting `perm`, for the upgrade prompt's wording. */
  function needsPlan(perm) {
    var p = window.EVER_C ? window.EVER_C.planFor(perm) : null;
    return p ? p.name : 'Pro';
  }

  /** Disable a control subtree and stamp it with "🔒 Available in X". */
  function lock(el, perm) {
    if (!el || el.classList.contains('ed-locked')) return;
    el.classList.add('ed-locked');
    el.querySelectorAll('input, select, textarea, button').forEach(function (c) {
      c.disabled = true;
      c.setAttribute('tabindex', '-1');
    });
    var note = document.createElement('a');
    note.className = 'ed-lock-note';
    note.href = 'pricing.html';
    note.innerHTML = '<span aria-hidden="true">🔒</span> Available in ' +
      esc(needsPlan(perm)) + ' — <u>upgrade to unlock</u>';
    el.appendChild(note);
  }

  /**
   * Apply every plan lock. Called after the sidebar and design panel are
   * (re)built, so the gating lives in one place instead of being threaded
   * through each builder.
   */
  function applyLocks() {
    if (!planId()) return;
    var C = window.EVER_C;

    /* --- Sections --- */
    document.querySelectorAll('#sec-groups .ed-group').forEach(function (det) {
      var sid = det.getAttribute('data-sec');
      var perm = SECTION_PERM[sid];
      if (perm && !allow(perm)) {
        lock(det.querySelector('.ed-body'), perm);
        det.classList.add('ed-group-locked');
      }
      /* Reordering is layout control; hiding a section is section control. */
      var tools = det.querySelector('.sec-tools');
      if (!tools) return;
      if (!allow('editor.sections.reorder')) {
        tools.querySelectorAll('[data-tool="up"], [data-tool="down"]').forEach(function (b) {
          b.disabled = true;
          b.title = 'Reordering sections is available in ' + needsPlan('editor.sections.reorder');
        });
      }
      if (!allow('editor.sections.toggle')) {
        var eye = tools.querySelector('[data-tool="eye"]');
        if (eye) {
          eye.disabled = true;
          eye.title = 'Showing and hiding sections is available in ' +
            needsPlan('editor.sections.toggle');
        }
      }
    });

    /* --- Design panel --- */
    if (!allow('editor.typography.advanced')) {
      lock(document.getElementById('font-cards'), 'editor.typography.advanced');
    }
    if (!allow('editor.color.advanced')) {
      /* Basic keeps the theme's own palette swatches; only the free-form
         colour picker is a Pro control. */
      document.querySelectorAll('#color-dots input[type="color"]').forEach(function (i) {
        i.disabled = true;
        i.title = 'Custom colours are available in ' + needsPlan('editor.color.advanced');
      });
    }
    if (!allow('editor.layout')) {
      var shape = document.getElementById('shape-row');
      if (shape) lock(shape.parentElement || shape, 'editor.layout');
    }

    /* --- Theme switching (§49) --- *
       A project is bound to one design for life. Switching would change what
       was paid for, so the picker is replaced by an explanation rather than
       silently swapping the purchase. */
    var chips = document.getElementById('tpl-chips');
    if (chips && C.isPaid(project())) {
      chips.innerHTML =
        '<p class="ed-theme-locked">This invitation is built on <strong>' +
        esc(project().themeName) + '</strong>. A design is bought per invitation, ' +
        'so it cannot be swapped here — <a href="create.html">start another invitation</a> ' +
        'to use a different design.</p>';
    }
  }

  /* ------------------------------------------------------------------ *
   *  Preview                                                            *
   * ------------------------------------------------------------------ */
  /* The element that actually scrolls the preview (see editor.html: the
     canvas frame is full-height, its wrapper is the scroll port). */
  function previewScroller() {
    return document.querySelector('.ed-canvas-wrap') || document.getElementById('canvas-frame');
  }

  function render() {
    var canvas = document.getElementById('canvas');
    if (!canvas || !window.EVER_renderSite) return;
    /* Every keystroke rebuilds the preview; without this the reader would be
       thrown back to the top of the page mid-edit. */
    var frame = previewScroller();
    var keepTop = frame ? frame.scrollTop : 0;

    var oldSite = canvas.querySelector('.ex');
    if (oldSite && oldSite.__premiumDispose) oldSite.__premiumDispose();
    if (oldSite && oldSite.__muDisposers) oldSite.__muDisposers.forEach(function (dispose) { dispose(); });
    canvas.innerHTML = '';
    var wasOpen = oldSite && oldSite.__opened;
    if (window.EVER_visualEditor) wasOpen = !window.EVER_visualEditor.isPreview();
    var site = window.EVER_renderSite(state, { interactive: true });
    if(wasOpen) { var cover=site.querySelector('.ex-cover');if(cover)cover.remove();site.__opened=true; }
    site.__wsData = state;
    canvas.appendChild(site);
    window.EVER_bindSite(site, {editing: !window.EVER_visualEditor || !window.EVER_visualEditor.isPreview()});
    if (window.EVER_visualEditor) window.EVER_visualEditor.mount(site);
    window.EVER_tickCountdowns(site);
    clearInterval(pvTimer);
    pvTimer = setInterval(function () { window.EVER_tickCountdowns(canvas); }, 1000);

    if (frame && keepTop) frame.scrollTop = keepTop;
  }

  /* Scroll the preview to a section — the ◎ button on each sidebar group. */
  function scrollPreviewTo(sid) {
    var frame = previewScroller();
    var target = document.getElementById('ws-sec-' + sid);
    if (!frame || !target) return;
    var top = target.getBoundingClientRect().top - frame.getBoundingClientRect().top + frame.scrollTop - 8;
    window.EVER_scrollElTo(frame, top);
    target.classList.add('ed-flash');
    setTimeout(function () { target.classList.remove('ed-flash'); }, 900);
  }

  function refresh() {
    render();
    autosave();
    /* keep flow.design in step for checkout/summary consistency */
    var flow = readJson(FLOW_KEY) || {};
    if (flow.design !== state.templateId) {
      flow.design = state.templateId;
      writeJson(FLOW_KEY, flow);
    }
  }

  /* ------------------------------------------------------------------ *
   *  FieldSpec renderer — one control per spec                          *
   *  types: text | textarea | date | number | check | select | photo |  *
   *         icon | color                                                *
   * ------------------------------------------------------------------ */
  var ICON_LABELS = {
    rings: 'Rings', cocktail: 'Glasses', dinner: 'Dinner', music: 'Music',
    calendar: 'Calendar', clock: 'Clock', pin: 'Pin', dress: 'Dress',
    car: 'Parking', bell: 'Bell', chair: 'Accessible', snow: 'Cooling',
    phone: 'Phone', mail: 'Mail', whatsapp: 'WhatsApp', facebook: 'Facebook',
    instagram: 'Instagram', share: 'Share', heart: 'Heart', camera: 'Camera',
    chevron: 'Chevron', gift: 'Gift', cake: 'Cake', game: 'Games', home: 'Home',
    key: 'Key', cross: 'Cross', star: 'Star', moon: 'Moon', sun: 'Sun',
    leaf: 'Leaf', baby: 'Baby', spark: 'Sparkler', glass: 'Glass'
  };

  function fieldHtml(f, value, onInput) {
    var wrap = document.createElement('div');
    wrap.className = 'ed-field' + (f.type === 'check' ? ' ed-check' : '');
    var type = f.type || 'text';
    var id = nextId();

    if (type === 'check') {
      wrap.innerHTML = '<input type="checkbox" id="' + id + '"' + (value ? ' checked' : '') + '/>' +
        '<label for="' + id + '">' + esc(f.label) + '</label>';
      wrap.querySelector('input').addEventListener('change', function (e) { onInput(e.target.checked); });
      return wrap;
    }

    var label = '<label for="' + id + '">' + esc(f.label) + '</label>';
    var ctl = '';

    if (type === 'textarea') {
      ctl = '<textarea id="' + id + '" rows="3" placeholder="' + esc(f.ph || '') + '"></textarea>';
    } else if (type === 'date') {
      ctl = '<input id="' + id + '" type="date" value="' + esc(value || '') + '"/>';
    } else if (type === 'number') {
      var mn = typeof f.min === 'number' ? f.min : 1;
      var mx = typeof f.max === 'number' ? f.max : 12;
      ctl = '<input id="' + id + '" type="number" min="' + mn + '" max="' + mx + '" value="' + esc(value == null ? '' : value) + '"/>';
    } else if (type === 'select') {
      var sopts = '';
      (f.options || []).forEach(function (o) {
        if (!o || o.length < 2) return;
        sopts += '<option value="' + esc(o[0]) + '"' + (String(value) === String(o[0]) ? ' selected' : '') + '>' + esc(o[1]) + '</option>';
      });
      ctl = '<select id="' + id + '">' + sopts + '</select>';
    } else if (type === 'photo') {
      var isUrl = value && String(value).indexOf('/') > -1;
      var popts = '<option value="">' + (f.k === 'premiumPhoto' ? 'Use template photograph' : 'None — hide this image') + '</option>';
      window.EVER_PHOTOS.forEach(function (p) {
        popts += '<option value="' + p.id + '"' + (value === p.id ? ' selected' : '') + '>' + esc(p.label) + '</option>';
      });
      ctl = '<div class="ed-photo-row">' +
          '<select id="' + id + '" data-role="pick">' + popts + '</select>' +
          '<input type="text" aria-label="Image URL" data-role="url" placeholder="…or paste image URL" value="' + (isUrl ? esc(value) : '') + '"/>' +
          '<label class="ed-upload">Upload your photo<input type="file" data-role="upload" accept="image/jpeg,image/png,image/webp" /></label>' +
        '</div>' +
        '<div class="ed-photo-preview">' +
          (value ? '<img src="' + esc(window.EVER_photoSrc(value)) + '" alt=""/>' : '') +
        '</div>';
    } else if (type === 'icon') {
      var iopts = '';
      Object.keys(window.EVER_ICONS).forEach(function (k) {
        iopts += '<option value="' + k + '"' + (value === k ? ' selected' : '') + '>' + (ICON_LABELS[k] || k) + '</option>';
      });
      ctl = '<select id="' + id + '">' + iopts + '</select>';
    } else if (type === 'color') {
      /* An empty value means "follow the theme", which a native colour input
         cannot express — hence the reset button beside it. */
      var set = /^#[0-9a-fA-F]{6}$/.test(String(value || ''));
      ctl = '<div class="ed-color-row">' +
          '<input id="' + id + '" type="color" value="' + esc(set ? value : '#c9a45c') + '"/>' +
          '<button type="button" data-role="clear"' + (set ? '' : ' disabled') + '>Use theme</button>' +
        '</div>';
    } else { /* text */
      ctl = '<input id="' + id + '" type="text" placeholder="' + esc(f.ph || '') + '" value="' + esc(value == null ? '' : value) + '"/>';
    }
    wrap.innerHTML = label + ctl;

    if (type === 'textarea') {
      var ta = wrap.querySelector('textarea');
      ta.value = value == null ? '' : String(value);
      ta.addEventListener('input', function () { onInput(ta.value); });
    } else if (type === 'photo') {
      var upload = wrap.querySelector('[data-role="upload"]');
      upload.addEventListener('change', function () {
        var file = upload.files[0];
        if (!file) return;
        if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 8 * 1024 * 1024) { toast('Choose a JPG, PNG or WebP image under 8 MB.'); return; }
        var objectUrl = URL.createObjectURL(file), img = new Image();
        img.onload = function () {
          var scale = Math.min(1, 1400 / Math.max(img.width,img.height));
          var surface = document.createElement('canvas'); surface.width = Math.round(img.width*scale); surface.height = Math.round(img.height*scale);
          surface.getContext('2d').drawImage(img,0,0,surface.width,surface.height);
          var encoded = surface.toDataURL('image/jpeg',0.8); URL.revokeObjectURL(objectUrl);
          onInput(encoded); wrap.querySelector('.ed-photo-preview').innerHTML = '<img alt="Your uploaded photo" src="' + encoded + '" />';
        };
        img.onerror = function () { URL.revokeObjectURL(objectUrl); toast('This photo could not be opened. Try another image.'); };
        img.src = objectUrl;
      });
      var pick = wrap.querySelector('[data-role="pick"]');
      var url = wrap.querySelector('[data-role="url"]');
      var shot = wrap.querySelector('.ed-photo-preview');
      function showPhoto(v) {
        shot.innerHTML = v ? '<img src="' + esc(window.EVER_photoSrc(v)) + '" alt=""/>' : '';
      }
      pick.addEventListener('change', function () {
        url.value = '';
        showPhoto(pick.value);
        onInput(pick.value);      /* '' clears the image — see the None option */
      });
      url.addEventListener('input', function () {
        var v = url.value.trim();
        if (v) pick.value = '';
        showPhoto(v);
        onInput(v);
      });
    } else if (type === 'select' || type === 'icon') {
      var sel = wrap.querySelector('select');
      sel.addEventListener('change', function (e) { onInput(e.target.value); });
    } else if (type === 'color') {
      var col = wrap.querySelector('input[type="color"]');
      var clr = wrap.querySelector('[data-role="clear"]');
      col.addEventListener('input', function () {
        clr.disabled = false;
        onInput(col.value);
      });
      clr.addEventListener('click', function () {
        clr.disabled = true;
        onInput('');
      });
    } else if (type !== 'check') {
      var txt = wrap.querySelector('input');
      txt.addEventListener('input', function (e) { onInput(e.target.value); });
      /* UX guard for link fields: flag anything that is not an http(s) URL.
         (The renderer also enforces this — see safeUrl() in templates.js.) */
      var lastKey = String(f.k || '').split('.').pop();
      if (/Url$/.test(lastKey)) {
        txt.addEventListener('blur', function () {
          var v = txt.value.trim();
          var bad = v !== '' && !/^(https?:\/\/|#[a-z0-9_-]*)/i.test(v);
          txt.classList.toggle('ed-invalid', bad);
          txt.title = bad ? 'Use a full link starting with https://' : '';
        });
      }
    }
    return wrap;
  }

  /* ------------------------------------------------------------------ *
   *  Sidebar — Basics (from layout.basics FieldSpecs)                   *
   * ------------------------------------------------------------------ */
  function buildBasics() {
    var host = document.getElementById('basics-body');
    if (!host) return;
    host.innerHTML = '';
    var specs = layout().basics || [];

    function bind(f) {
      var field = fieldHtml(f, getVal(state.basics, f.k), function (v) {
        if (access && f.k === 'date') return;
        setVal(state.basics, f.k, v);
        refresh();
      });
      if (access && f.k === 'date') { field.querySelector('input').disabled = true; field.querySelector('input').title = 'Event date fixed at purchase'; }
      return field;
    }

    var i = 0;
    while (i < specs.length) {
      var f = specs[i];
      var n = specs[i + 1];
      /* two short text fields look better side by side (nameA + nameB …) */
      if ((f.type || 'text') === 'text' && n && (n.type || 'text') === 'text') {
        var row = document.createElement('div');
        row.className = 'ed-2col';
        row.appendChild(bind(f));
        row.appendChild(bind(n));
        host.appendChild(row);
        i += 2;
      } else {
        host.appendChild(bind(f));
        i += 1;
      }
    }
  }

  /* ------------------------------------------------------------------ *
   *  Sidebar — one accordion per section in state.order                 *
   * ------------------------------------------------------------------ */
  function buildGroups() {
    var host = document.getElementById('sec-groups');
    if (!host) return;
    host.innerHTML = '';
    var ly = layout();
    var specs = ly.sections || [];
    var order = (state.order && state.order.length) ? state.order : window.EVER_layoutOrder(ly);

    order.forEach(function (sid) {
      var meta = null;
      specs.forEach(function (s) { if (s.id === sid) meta = s; });
      if (!meta) return;
      var sec = state.sections[sid];
      if (!sec || typeof sec !== 'object') sec = state.sections[sid] = { on: true };

      var det = document.createElement('details');
      det.className = 'ed-group' + (ui.open[sid] ? ' open' : '') + (sec.on ? '' : ' sec-off');
      det.setAttribute('data-sec', sid);
      if (ui.open[sid]) det.open = true;

      var sum = document.createElement('summary');
      sum.draggable = true;
      sum.addEventListener('dragstart', function (e) { if (!accessAllowed()) { e.preventDefault(); return; } e.dataTransfer.setData('text/plain', sid); e.dataTransfer.effectAllowed = 'move'; });
      sum.addEventListener('dragover', function (e) { if (accessAllowed()) e.preventDefault(); });
      sum.addEventListener('drop', function (e) {
        e.preventDefault(); if (!accessAllowed()) return;
        var source = e.dataTransfer.getData('text/plain'), from = state.order.indexOf(source), to = state.order.indexOf(sid);
        if (from < 0 || to < 0 || from === to) return;
        state.order.splice(from, 1); state.order.splice(to, 0, source); buildGroups(); refresh();
      });
      sum.innerHTML = '<span>' + esc(meta.label) + '</span>' +
        '<span class="sec-tools">' +
          '<button type="button" data-tool="goto" aria-label="Scroll the preview to ' + esc(meta.label) + '">&#9678;</button>' +
          '<button type="button" data-tool="up" aria-label="Move ' + esc(meta.label) + ' up">&#8593;</button>' +
          '<button type="button" data-tool="down" aria-label="Move ' + esc(meta.label) + ' down">&#8595;</button>' +
          '<button type="button" data-tool="eye" aria-label="Show or hide ' + esc(meta.label) + '" aria-pressed="' + !!sec.on + '">&#128065;</button>' +
        '</span>';

      var body = document.createElement('div');
      body.className = 'ed-body';

      (meta.fields || []).forEach(function (f) {
        body.appendChild(fieldHtml(f, getVal(sec, f.k), function (v) {
          setVal(sec, f.k, v);
          refresh();
        }));
      });

      if (meta.list) buildList(body, meta, sec);

      /* tool buttons — preventDefault+stopPropagation so the accordion
         doesn't toggle when a tool is clicked */
      sum.querySelectorAll('[data-tool]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          var tool = btn.getAttribute('data-tool');
          var i = state.order.indexOf(sid);
          if (tool === 'eye') {
            sec.on = !sec.on;
            det.classList.toggle('sec-off', !sec.on);
            btn.setAttribute('aria-pressed', String(sec.on));
          } else if (tool === 'up' && i > 0) {
            state.order.splice(i, 1);
            state.order.splice(i - 1, 0, sid);
            buildGroups();
          } else if (tool === 'down' && i < state.order.length - 1) {
            state.order.splice(i, 1);
            state.order.splice(i + 1, 0, sid);
            buildGroups();
          } else if (tool === 'goto') {
            scrollPreviewTo(sid);
            return;                 /* nothing changed — no re-render needed */
          }
          refresh();
        });
      });
      det.addEventListener('toggle', function () { ui.open[sid] = det.open; });

      det.appendChild(sum);
      det.appendChild(body);
      host.appendChild(det);
    });

    var removed = specs.filter(function (spec) { return !state.order.includes(spec.id); });
    if (removed.length) {
      var restore = document.createElement('div'); restore.className = 'ed-body';
      var label = document.createElement('label'); label.className = 'ed-label'; label.htmlFor = 'restore-section'; label.textContent = 'Add or restore a section';
      var picker = document.createElement('select'); picker.id = 'restore-section'; picker.innerHTML = '<option value="">Choose section…</option>';
      removed.forEach(function (spec) { var option = document.createElement('option'); option.value = spec.id; option.textContent = spec.label; picker.appendChild(option); });
      picker.addEventListener('change', function () { if (!picker.value || !accessAllowed()) return; state.order.push(picker.value); state.sections[picker.value].on = true; buildGroups(); refresh(); });
      restore.append(label, picker); host.appendChild(restore);
    }

    applyLocks();
  }

  function buildList(body, meta, sec) {
    var cfg = meta.list;
    var arr = sec[cfg.k] = Array.isArray(sec[cfg.k]) ? sec[cfg.k] : [];
    var blank = cfg.blank || function () { return {}; };
    var listBox = document.createElement('div');
    listBox.className = 'ed-list';

    arr.forEach(function (item, idx) {
      var li = document.createElement('div');
      li.className = 'ed-li';
      var head = document.createElement('div');
      head.className = 'ed-li-head';
      head.innerHTML = '<b>' + esc(cfg.label) + ' ' + (idx + 1) + '</b>' +
        '<span>' +
          '<button type="button" data-op="up" aria-label="Move up" ' + (idx === 0 ? 'disabled' : '') + '>&#8593;</button>' +
          '<button type="button" data-op="down" aria-label="Move down" ' + (idx === arr.length - 1 ? 'disabled' : '') + '>&#8595;</button>' +
          '<button type="button" data-op="copy" aria-label="Duplicate">&#10697;</button>' +
          '<button type="button" data-op="del" aria-label="Remove">&#10005;</button>' +
        '</span>';
      li.appendChild(head);

      (cfg.fields || []).forEach(function (f) {
        var val = f.k ? (item[f.k] == null ? '' : item[f.k]) : item;
        li.appendChild(fieldHtml(f, val, function (v) {
          if (f.k) item[f.k] = v; else sec[cfg.k][idx] = v;
          refresh();
        }));
      });

      head.querySelectorAll('[data-op]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var op = btn.getAttribute('data-op');
          if (op === 'del') arr.splice(idx, 1);
          if (op === 'up' && idx > 0) arr.splice(idx - 1, 0, arr.splice(idx, 1)[0]);
          if (op === 'down' && idx < arr.length - 1) arr.splice(idx + 1, 0, arr.splice(idx, 1)[0]);
          if (op === 'copy') {
            var clone;
            try { clone = JSON.parse(JSON.stringify(arr[idx])); } catch (err) { clone = blank(); }
            arr.splice(idx + 1, 0, clone);
          }
          buildGroups();
          refresh();
        });
      });
      listBox.appendChild(li);
    });

    var add = document.createElement('button');
    add.type = 'button';
    add.className = 'ed-add';
    add.textContent = '+ Add ' + cfg.label.toLowerCase();
    add.addEventListener('click', function () {
      arr.push(blank());
      buildGroups();
      refresh();
    });
    listBox.appendChild(add);
    body.appendChild(listBox);
  }

  /* ------------------------------------------------------------------ *
   *  Sidebar assembly                                                   *
   * ------------------------------------------------------------------ */
  function buildSidebar() {
    buildBasics();
    buildGroups();
  }

  /* ------------------------------------------------------------------ *
   *  Design panel                                                       *
   * ------------------------------------------------------------------ */
  function accentList() {
    return [
      { id: 'tpl', hex: null, label: 'Template' },
      { id: '#c9a45c', label: 'Gold' },
      { id: '#b98a8e', label: 'Rose' },
      { id: '#9a7b4f', label: 'Bronze' },
      { id: '#7f9c7c', label: 'Sage' },
      { id: '#b3704e', label: 'Clay' },
      { id: '#9a7bc9', label: 'Lilac' }
    ];
  }

  /* Template switch. Same layout: keep every user edit (current behavior).
     Different layout: rebuild content over the new layout's defaults —
     universal fields and keys the NEW layout knows survive via deepMerge,
     event-type-specific keys do not leak across (e.g. birthday `name`
     would otherwise hijack another layout's publish slug) — and the sidebar
     rebuilds for the new field specs. */
  var UNIVERSAL_BASICS = ['nameA', 'nameB', 'brand', 'date', 'time', 'venue', 'city',
    'address', 'dress', 'phone', 'email'];

  function applyTemplate(t) {
    if(access)return; // Purchased designs are immutable; drafts may explore the collection.
    var cur = window.EVER_findTemplate(state.templateId);
    if (cur && cur.layout === t.layout && window.EVER_findLayout(t.layout).id === state.layoutId) {
      state.templateId = t.id;
    } else {
      var next = window.EVER_siteDefaults(t.id);
      var nl = window.EVER_findLayout(t.layout);
      var keep = {};
      (nl.basics || []).forEach(function (f) { keep[String(f.k).split('.')[0]] = true; });
      UNIVERSAL_BASICS.forEach(function (k) { keep[k] = true; });
      var bb = {};
      var ob = state.basics || {};
      for (var bk in ob) {
        if (Object.prototype.hasOwnProperty.call(ob, bk) && keep[bk]) bb[bk] = ob[bk];
      }
      window.EVER_deepMerge(next.basics, bb);
      var keepSec = state.sections || {};
      for (var k in keepSec) {
        if (next.sections[k]) window.EVER_deepMerge(next.sections[k], keepSec[k]);
      }
      /* design prefs are layout-independent user choices — carry them over */
      ['nameFont', 'bodyFont', 'accent', 'btnShape', 'spacing'].forEach(function (p) {
        if (state[p] !== undefined) next[p] = state[p];
      });
      next.templateId = t.id;
      next.layoutId = window.EVER_findLayout(t.layout).id;
      state = next;
    }
    var draft=project();if(draft&&window.EVER_C)window.EVER_C.updateProject(draft.id,{themeId:t.id,themeName:t.name,event:t.event});
    buildSidebar();
    buildDesign();
    refresh();
  }

  function buildDesign() {
    /* template chips */
    var chips = document.getElementById('tpl-chips');
    chips.innerHTML = '';
    window.EVER_allTemplates().filter(function(t){return !t.archived||t.id===state.templateId;}).forEach(function (t) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'tpl-chip' + (state.templateId === t.id ? ' on' : '');
      chip.setAttribute('role', 'radio');
      chip.setAttribute('aria-checked', String(state.templateId === t.id));
      chip.innerHTML = '<span class="tpl-swatch" style="background:' + esc(t.dark) + '">' +
          '<i style="background:' + esc(t.gold) + '"></i></span>' + esc(t.name) +
        (t.custom ? '<span class="chip-x" role="button" tabindex="0" aria-label="Edit or remove">&#9998;</span>' : '');
      chip.addEventListener('click', function (e) {
        if (e.target.closest('.chip-x')) return;
        if (state.templateId === t.id) return;
        applyTemplate(t);
      });
      if (t.custom) {
        var x = chip.querySelector('.chip-x');
        x.addEventListener('click', function () { designerEdit(t.id); });
      }
      chips.appendChild(chip);
    });

    /* name font */
    var fonts = document.getElementById('font-cards');
    fonts.innerHTML = '';
    var fontOpts = [{ id: '', label: 'Template' }].concat(Object.keys(window.EVER_NAME_FONTS).map(function (k) {
      return { id: k, label: window.EVER_NAME_FONTS[k].label };
    }));
    fontOpts.forEach(function (o) {
      var cls = o.id ? window.EVER_NAME_FONTS[o.id].cls : '';
      var sample = o.id === 'jost' ? 'AA' : 'Aa';
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'font-card' + (state.nameFont === o.id ? ' on' : '');
      card.setAttribute('role', 'radio');
      card.setAttribute('aria-checked', String(state.nameFont === o.id));
      card.innerHTML = '<span class="font-sample ' + cls + '">' + sample + '</span>' + esc(o.label);
      card.addEventListener('click', function () {
        state.nameFont = o.id;
        buildDesign();
        refresh();
      });
      fonts.appendChild(card);
    });

    /* body font */
    var body = document.getElementById('body-cards');
    body.innerHTML = '';
    Object.keys(window.EVER_BODY_FONTS).forEach(function (k) {
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'font-card' + (state.bodyFont === k ? ' on' : '');
      card.setAttribute('role', 'radio');
      card.setAttribute('aria-checked', String(state.bodyFont === k));
      card.innerHTML = '<span class="font-sample" style="font-family:' + (k === 'jost' ? 'Jost,sans-serif' : 'Lato,sans-serif') + '">Ag</span>' +
        esc(window.EVER_BODY_FONTS[k].label);
      card.addEventListener('click', function () {
        state.bodyFont = k;
        buildDesign();
        refresh();
      });
      body.appendChild(card);
    });

    /* accent dots + custom color */
    var dots = document.getElementById('color-dots');
    dots.innerHTML = '';
    accentList().forEach(function (a) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'color-dot' + (state.accent === a.id ? ' on' : '');
      dot.style.background = a.hex || 'linear-gradient(135deg,#c9a45c,#7f9c7c,#b98a8e)';
      dot.setAttribute('role', 'radio');
      dot.setAttribute('aria-checked', String(state.accent === a.id));
      dot.setAttribute('aria-label', a.label + ' accent');
      dot.title = a.label;
      dot.addEventListener('click', function () {
        state.accent = a.id;
        buildDesign();
        refresh();
      });
      dots.appendChild(dot);
    });
    var custom = document.createElement('label');
    custom.className = 'color-dot color-dot-custom' + (/^#/.test(state.accent) ? ' on' : '');
    custom.title = 'Custom accent';
    custom.innerHTML = '<input type="color" value="' + (/^#/.test(state.accent) ? esc(state.accent) : '#c9a45c') + '" aria-label="Custom accent color"/>';
    custom.querySelector('input').addEventListener('input', function (e) {
      state.accent = e.target.value;
      buildDesign();
      refresh();
    });
    dots.appendChild(custom);

    /* shape + spacing */
    var shapes = document.getElementById('shape-row');
    shapes.innerHTML = '';
    [['pill', 'Pill'], ['soft', 'Soft'], ['square', 'Square']].forEach(function (s) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'shape-btn' + (state.btnShape === s[0] ? ' on' : '');
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', String(state.btnShape === s[0]));
      b.innerHTML = '<span class="shape-demo sp-' + s[0] + '"></span>' + s[1];
      b.addEventListener('click', function () {
        state.btnShape = s[0];
        buildDesign();
        refresh();
      });
      shapes.appendChild(b);
    });
    var spacing = document.getElementById('ed-spacing');
    spacing.value = state.spacing;
    spacing.onchange = function () { state.spacing = spacing.value; refresh(); };

    applyLocks();
  }

  function designerEdit(id) {
    var tpl = window.EVER_readCustomTemplates().filter(function (t) { return t.id === id; })[0];
    if (!tpl) return;
    window.EVER_openDesigner({
      template: tpl,
      onSave: function (t) {
        if (state.templateId === id) state.templateId = t.id;
        buildDesign();
        refresh();
      }
    });
  }

  /* ------------------------------------------------------------------ *
   *  Chrome: tabs / device / save / publish                             *
   * ------------------------------------------------------------------ */
  function bindChrome() {
    document.getElementById('replay-opening').addEventListener('click',function(){var current=document.querySelector('#canvas .ex');if(current)current.__opened=false;render();previewScroller().scrollTop=0;});
    document.querySelectorAll('.ed-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        document.querySelectorAll('.ed-tab').forEach(function (t) {
          t.classList.remove('on');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('on');
        tab.setAttribute('aria-selected', 'true');
        document.querySelectorAll('.ed-panel').forEach(function (p) { p.hidden = true; });
        var panel = document.getElementById(tab.getAttribute('aria-controls'));
        if (panel) panel.hidden = false;
      });
    });

    document.querySelectorAll('.ed-dev-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.ed-dev-btn').forEach(function (b) {
          b.classList.remove('on');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('on');
        btn.setAttribute('aria-pressed', 'true');
        var dev = btn.getAttribute('data-dev');
        var frame = document.getElementById('canvas-frame');
        frame.classList.toggle('mobile', dev === 'mobile');
        frame.classList.toggle('tablet', dev === 'tablet');
      });
    });

    document.getElementById('save-btn').addEventListener('click', async function () {
      saveNow();
      if (access) { toast(await remoteSave ? 'Saved to your account.' : 'We couldn’t save your changes. Your previous version is safe — please try again.'); }
      else toast(localSaveFailed ? 'We couldn’t save your changes. Free some device storage, then try again.' : 'Draft saved on this device. Complete checkout to publish.');
    });

    document.getElementById('publish-btn').addEventListener('click', openPublish);

    var pubClose = document.getElementById('pub-close');
    if (pubClose) pubClose.addEventListener('click', closePublish);
    var pubX = document.getElementById('pub-x');
    if (pubX) pubX.addEventListener('click', closePublish);
    var pubBack = document.getElementById('pub-back');
    if (pubBack) pubBack.addEventListener('click', closePublish);
    var pubGo = document.getElementById('pub-go');
    if (pubGo) pubGo.addEventListener('click', doPublish);

    var copy = document.getElementById('copy-url');
    if (copy) {
      copy.addEventListener('click', function () {
        var input = document.getElementById('pub-url');
        input.select();
        var done = function () {
          copy.textContent = 'Copied!';
          setTimeout(function () { copy.textContent = 'Copy'; }, 1600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(input.value).then(done, done);
        } else {
          try { document.execCommand('copy'); } catch (e) { /* ignore */ }
          done();
        }
      });
    }
  }

  /* ------------------------------------------------------------------ *
   *  Publish (§26 validation, §27 publish, §6 share)                    *
   * ------------------------------------------------------------------ */
  function overlay() { return document.getElementById('pub-overlay'); }

  function closePublish() {
    overlay().hidden = true;
    document.body.classList.remove('modal-open');
    document.getElementById('publish-btn').focus();
  }

  /**
   * Stage 1 — run the checklist. Each failing item links to the editor
   * section that fixes it, per §26.
   */
  function openPublish() {
    saveNow();
    var C = window.EVER_C;
    var p = project();
    var list = document.getElementById('pub-checks');
    var goBtn = document.getElementById('pub-go');

    document.getElementById('pub-check-stage').hidden = false;
    document.getElementById('pub-live-stage').hidden = true;

    var checks = C ? C.validate(state) : [];
    list.innerHTML = '';
    checks.forEach(function (c) {
      var li = document.createElement('li');
      li.className = c.ok ? 'ok' : 'warn';
      li.innerHTML = '<span aria-hidden="true">' + (c.ok ? '✓' : '⚠') + '</span>' +
        (c.ok ? esc(c.label) : '<button type="button">' + esc(fixLabel(c)) + '</button>');
      if (!c.ok) {
        li.querySelector('button').addEventListener('click', function () {
          closePublish();
          focusFix(c);
        });
      }
      list.appendChild(li);
    });

    var allOk = checks.every(function (c) { return c.ok; });
    var paid = !p || (C && C.isPaid(p));

    if (!paid) {
      var li = document.createElement('li');
      li.className = 'warn';
      li.innerHTML = '<span aria-hidden="true">⚠</span>' +
        '<a href="checkout.html">Complete payment to publish</a>';
      list.appendChild(li);
    }

    goBtn.disabled = !(allOk && paid);
    goBtn.textContent = allOk && paid ? 'Publish now' : 'Fix the items above';

    var reviews=document.getElementById('publish-device-checks');if(!reviews){reviews=document.createElement('div');reviews.id='publish-device-checks';reviews.className='publish-device-checks';['mobile','desktop'].forEach(function(device){var b=document.createElement('button');b.type='button';b.className='btn btn-ghost';b.textContent='Check '+device+' preview';b.addEventListener('click',function(){closePublish();document.querySelector('[data-dev="'+device+'"]').click();if(!window.EVER_visualEditor.isPreview())document.getElementById('full-preview-btn').click();});reviews.appendChild(b);});list.after(reviews);}
    overlay().hidden = false;
    document.body.classList.add('modal-open');
    document.getElementById('pub-x').focus();
  }

  /* A failed item is phrased as the action that clears it. */
  function fixLabel(c) {
    if (/switched on$/.test(c.label)) return 'Switch the RSVP section on';
    return 'Add ' + c.label.charAt(0).toLowerCase() + c.label.slice(1);
  }

  /* Send the customer to the control that fixes a failed check: a named
     section if the check belongs to one, otherwise the Basics group. */
  function focusFix(c) {
    if (matchMedia('(max-width:767px)').matches) document.getElementById('mobile-edit').click();
    var target = null;
    if (c.section) {
      target = document.querySelector('#sec-groups [data-sec="' + c.section + '"]');
    }
    if (!target) target = document.querySelector('#panel-content .ed-group');
    if (!target) return;
    document.getElementById('tab-content').click();
    target.open = true;
    target.scrollIntoView({ block: 'center' });
    var input = target.querySelector('input, select, textarea');
    if (input && !input.disabled) input.focus();
  }

  /** Stage 2 — publish for real and show the shareable link. */
  async function doPublish() {
    var C = window.EVER_C;
    var p = project();
    saveNow();

    if (!C || !p) {
      toast('Open an invitation from your dashboard to publish it.');
      return;
    }

    var result;
    if (access) {
      if (!await remoteSave) { toast('Save failed. Please retry before publishing.'); return; }
      try { var live = await window.EVER_API.request('/projects/' + access.id + '/publish','POST',{}); result = {ok:true,project:window.EVER_API.cache(live)}; }
      catch(err) { toast(err.message); return; }
    } else { result = {ok:false,reason:'Complete secure checkout before publishing.'}; }
    if (!result.ok) {
      toast(result.reason);
      return;
    }

    var url = C.inviteUrl(result.project);
    document.getElementById('pub-url').value = url;

    var b = state.basics || {};
    var who = (b.nameA && b.nameB) ? b.nameA + ' & ' + b.nameB : (b.title || b.nameA || 'our event');
    var text = 'You are invited — ' + who;

    document.getElementById('pub-wa').href =
      'https://wa.me/?text=' + encodeURIComponent(text + '\n' + url);
    document.getElementById('pub-mail').href =
      'mailto:?subject=' + encodeURIComponent(text) +
      '&body=' + encodeURIComponent(text + '\n\n' + url);
    document.getElementById('pub-open').href = url;
    var qr=document.getElementById('pub-qr');qr.src='/api/projects/'+encodeURIComponent(result.project.id)+'/qr';
    document.getElementById('pub-native-share').onclick=async function(){try{if(navigator.share)await navigator.share({title:'You’re invited',url:url});else{await navigator.clipboard.writeText(url);toast('Invitation link copied.');}}catch(err){if(err.name!=='AbortError')toast('Use Copy link to share your invitation.');}};

    document.getElementById('pub-check-stage').hidden = true;
    document.getElementById('pub-live-stage').hidden = false;
    updateBadge();
  }

  function toast(msg) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(t.__tm);
    t.__tm = setTimeout(function () { t.hidden = true; }, 2600);
  }

  /* Top-bar status + the sidebar's plan strip. Both read the project, so
     they always agree with what was actually bought. */
  function updateBadge() {
    var badge = document.getElementById('ed-badge');
    var C = window.EVER_C;
    var p = project();

    if (badge) {
      if (p && p.published) {
        badge.textContent = 'Published';
        badge.classList.add('published');
      } else if (p && C.isPaid(p)) {
        badge.textContent = 'Paid';
        badge.classList.add('published');
      } else if (p) {
        badge.textContent = 'Draft — not yet paid';
        badge.classList.remove('published');
      } else {
        badge.textContent = 'Editor';
      }
    }

    var strip = document.getElementById('ed-plan');
    if (!strip) return;
    if (!p || !p.plan) { strip.hidden = true; return; }

    var plan = C.findPlan(p.plan);
    strip.hidden = false;
    document.getElementById('ed-plan-name').textContent = plan.name + ' plan';
    document.getElementById('ed-plan-sub').textContent = plan.editorLevel + ' editor access';

    var up = document.getElementById('ed-plan-up');
    var isTop = C.PLAN_ORDER[C.PLAN_ORDER.length - 1] === p.plan;
    up.textContent = isTop ? 'What you get' : 'Upgrade';
  }

  /* ------------------------------------------------------------------ *
   *  Boot                                                               *
   * ------------------------------------------------------------------ */
  /* Make sure the editor opens the invitation the customer actually chose:
     the active project's saved state is mirrored into EVER_EVENT_KEY before
     loadState() reads it. Without a project (a direct link, or an older
     single-invitation session) the previous behaviour is unchanged. */
  if (window.EVER_C && window.EVER_C.activeId()) {
    window.EVER_C.openProject(window.EVER_C.activeId());
  }

  var remoteId = new URLSearchParams(location.search).get('p');
  var active = window.EVER_C.activeProject();
  if (!remoteId && active && active.server) remoteId = active.id;
  if (remoteId) {
    var banner = document.createElement('div'); banner.className = 'access-banner'; banner.setAttribute('role','status');
    document.querySelector('.ed-sidebar').prepend(banner);
    try {
      access = await window.EVER_API.request('/projects/' + encodeURIComponent(remoteId));
      window.EVER_API.cache(access); window.EVER_C.openProject(access.id);
      banner.textContent = access.expired ? 'Your event has ended. Editor access is closed. Your published invitation remains viewable.' : access.paid ? 'Editor access through ' + access.eventDate + ' (' + access.timezone + '). Your event date is fixed.' : 'Waiting for secure payment confirmation. Refresh in a moment.';
      if (!accessAllowed()) {
        document.querySelector('.ed-canvas-wrap').prepend(banner);
        document.getElementById('full-preview-btn').disabled = true;
        document.getElementById('save-btn').disabled = true; document.getElementById('publish-btn').disabled = true;
        if (!access.paid) {
          var attempts = 0;
          var confirmTimer = setInterval(async function () {
            if (++attempts > 40) { clearInterval(confirmTimer); banner.textContent = 'Payment confirmation is taking longer than expected. Refresh to check again. Do not pay a second time.'; return; }
            try { var confirmed = await window.EVER_API.request('/projects/' + encodeURIComponent(remoteId)); if (confirmed.paid) { clearInterval(confirmTimer); location.reload(); } } catch (_) { /* Retry transient connection errors. */ }
          },3000);
        }
        var readonly = window.EVER_renderSite(access.state, {interactive:true}); readonly.__wsData = access.state; document.getElementById('canvas').appendChild(readonly); window.EVER_bindSite(readonly); return;
      }
    } catch(err) { banner.classList.add('error'); banner.textContent = err.message; document.querySelector('.ed-canvas-wrap').prepend(banner); document.getElementById('full-preview-btn').disabled = true; document.getElementById('save-btn').disabled = true; document.getElementById('publish-btn').disabled = true; return; }
  }
  loadState();
  window.EVER_EDITOR = {
    getState: function () { return state; },
    canEdit: function (path) { return accessAllowed() && !(access && path === 'basics.date'); },
    change: function (path, value, inline) {
      if (!this.canEdit(path)) return;
      if (!/^(basics\.[a-zA-Z]+|sections\.[a-zA-Z0-9]+\.(?:[a-zA-Z]+|items\.\d+\.[a-zA-Z]+))$/.test(path)) return;
      setVal(state, path, value);
      if (inline) autosave(); else refresh();
    },
    style: function (path, property, value) {
      if (!this.canEdit(path)) return;
      state.elementStyles = state.elementStyles || {};
      state.elementStyles[path] = state.elementStyles[path] || {};
      state.elementStyles[path][property] = value;
      refresh();
    },
    sync: function () { buildSidebar(); },
    theme: function (key, value) { if (!accessAllowed()) return; state.theme = state.theme || {}; state.theme[key] = value; if(key==='background'||key==='text')Object.keys(state.sections).forEach(function(id){delete state.sections[id][key==='background'?'bg':'textColor'];});refresh(); },
    link: function (path, value) { if (!this.canEdit(path)) return; state.elementLinks = state.elementLinks || {}; state.elementLinks[path] = value; refresh(); },
    section: function (id, action) {
      if (!accessAllowed() || !state.sections[id]) return;
      var index = state.order.indexOf(id), next = index + (action === 'up' ? -1 : 1);
      if (action === 'hide') state.sections[id].on = false;
      else if (action === 'delete') { if (['hero','rsvp','contact'].includes(id)) return; state.order.splice(index, 1); }
      else if (action === 'duplicate') {
        var type = (state.sectionTypes || {})[id] || id;
        if (['hero','rsvp','contact','date'].includes(type)) return;
        state.sectionTypes = state.sectionTypes || {};
        if (Object.keys(state.sectionTypes).length >= 20) { toast('Use at most 20 additional sections.'); return; }
        var n = 1; while (state.sections[type + 'Copy' + n]) n++;
        var key = type + 'Copy' + n;
        state.sectionTypes[key] = type; state.sections[key] = JSON.parse(JSON.stringify(state.sections[id]));
        state.order.splice(index + 1, 0, key);
        Object.keys(state.elementStyles || {}).filter(function (path) { return path === 'sections.'+id || path.startsWith('sections.'+id+'.'); }).forEach(function (path) { state.elementStyles[path.replace('sections.'+id,'sections.'+key)] = Object.assign({}, state.elementStyles[path]); });
      }
      else if (next >= 0 && next < state.order.length) { state.order.splice(index, 1); state.order.splice(next, 0, id); }
      buildSidebar(); refresh();
    },
    undo: function () { travel(-1); }, redo: function () { travel(1); },
    preview: function () { render(); },
    preset: function (preset) {
      if (!accessAllowed()) return;
      state.nameFont = preset.font; state.accent = preset.accent;
      state.btnShape = preset.shape; state.spacing = preset.spacing;
      state.elementStyles = {};
      state.theme = Object.assign({},state.theme,{background:preset.bg,text:preset.ink,primary:preset.ink,muted:preset.ink,button:preset.ink,secondary:preset.bg,accent:preset.accent});
      Object.keys(state.sections).forEach(function (key) { state.sections[key].bg = preset.bg; state.sections[key].textColor = preset.ink; });
      buildDesign(); buildSidebar(); refresh();
    }
  };
  if (window.EVER_visualEditor) window.EVER_visualEditor.init();
  remember();
  if(access){document.getElementById('editor-help').textContent='Every detail is yours to change. Saved automatically to your account.';}
  buildSidebar();
  buildDesign();
  bindChrome();
  if (window.INVITARA_editor) window.INVITARA_editor();
  overlay().addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { e.stopPropagation(); closePublish(); }
    if (e.key !== 'Tab') return;
    var focusable = Array.from(overlay().querySelectorAll('button:not(:disabled),a[href],input')).filter(function (el) { return el.getClientRects().length; });
    var first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  updateBadge();
  render();
  var phoneButton=document.querySelector('[data-dev=mobile]');if(phoneButton)phoneButton.click();
  if (access) {
    var expiryHandled = false;
    setInterval(function() { if (!accessAllowed() && !expiryHandled) { expiryHandled = true; document.querySelectorAll('.ed-sidebar input,.ed-sidebar select,.ed-sidebar textarea,.ed-sidebar button,.visual-inspector input,.visual-inspector select,.visual-inspector textarea,.visual-inspector button,#undo-btn,#redo-btn,#save-btn,#publish-btn').forEach(function(el) { el.disabled = true; }); document.querySelectorAll('#canvas [contenteditable]').forEach(function(el) { el.removeAttribute('contenteditable'); }); banner.textContent = 'Your event has ended. Editor access is now closed.'; document.querySelector('.ed-canvas-wrap').prepend(banner); } },1000);
  }

  /* Deep links from the dashboard: #publish opens the checklist straight
     away, #preview drops into the mobile preview. */
  if (window.location.hash === '#publish') {
    openPublish();
  } else if (window.location.hash === '#preview') {
    var mobileBtn = document.querySelector('.ed-dev-btn[data-dev="mobile"]');
    if (mobileBtn) mobileBtn.click();
  }

  window.addEventListener('beforeunload', function () { saveNow(); });
})();
