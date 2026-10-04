/* ==========================================================================
   Invitara — commerce domain
   Owns everything the rendering engine deliberately does not: plans, feature
   permissions, theme pricing, projects, the purchase state machine and orders.

   templates.js stays a pure rendering engine — no price or plan concept leaks
   into it. The two are joined by theme id through EVER_themeCommerce().

   Load order: templates.js -> mu.js -> layouts/*.js -> commerce.js -> page js
   ========================================================================== */
(function () {
  'use strict';

  var PROJECTS_KEY = 'ever-projects';
  var ORDERS_KEY   = 'ever-orders';
  var ACTIVE_KEY   = 'ever-active-project';
  /* The editor reads and writes this key directly (state v4). The active
     project mirrors it, so editor.js keeps working untouched. */
  var EVENT_KEY    = 'ever-rsvp-event';

  var CURRENCY = 'AED';
  var VAT_RATE = 0.05;            /* UAE standard rate */

  function readJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      var val = JSON.parse(raw);
      return val == null ? fallback : val;
    } catch (e) { return fallback; }
  }

  function writeJson(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch (e) { return false; }
  }

  /* ------------------------------------------------------------------ *
   *  Plans                                                              *
   * ------------------------------------------------------------------ */
  /* `grants` are permission ids checked by can(). Each plan grants its own
     list plus everything from the plans below it. */
  var PLANS = [{id:'studio',name:'Studio',price:0,editorLevel:'Full',tagline:'Every detail, entirely yours.',grants:[],includes:['All template content editable','Premium GSAP animations','Photo uploads & video support','Scratch-to-reveal date','Secure publishing & live guest replies','Editor access through your event date']}];
  var PLAN_ORDER = ['studio'];

  function findPlan(id) {
    for (var i = 0; i < PLANS.length; i++) if (PLANS[i].id === id) return PLANS[i];
    return PLANS[0];
  }

  function planRank(id) {
    var i = PLAN_ORDER.indexOf(id);
    return i < 0 ? 0 : i;
  }

  /* Every permission a plan carries, including inherited ones. */
  function grantsFor(planId) {
    var out = [];
    var top = planRank(planId);
    for (var i = 0; i <= top; i++) {
      out = out.concat(findPlan(PLAN_ORDER[i]).grants);
    }
    return out;
  }

  /** Does `planId` include permission `perm`? */
  function can(planId, perm) {
    return planId === 'studio' && /^editor\./.test(perm);
  }

  /** The cheapest plan that grants `perm`, or null if no plan does. */
  function planFor(perm) {
    for (var i = 0; i < PLAN_ORDER.length; i++) {
      if (can(PLAN_ORDER[i], perm)) return findPlan(PLAN_ORDER[i]);
    }
    return null;
  }

  /* ------------------------------------------------------------------ *
   *  Feature comparison matrix (drives the pricing table)               *
   * ------------------------------------------------------------------ */
  var MATRIX = [
    { label: 'Text editing',   basic: 'Yes',     pro: 'Yes',      advanced: 'Yes' },
    { label: 'Colours',        basic: 'Limited', pro: 'Yes',      advanced: 'Yes' },
    { label: 'Images',         basic: 'Limited', pro: 'Yes',      advanced: 'Yes' },
    { label: 'Gallery',        basic: '—',       pro: 'Yes',      advanced: 'Advanced' },
    { label: 'Countdown',      basic: '—',       pro: 'Yes',      advanced: 'Yes' },
    { label: 'Map & location', basic: '—',       pro: 'Yes',      advanced: 'Yes' },
    { label: 'Animation',      basic: 'Basic',   pro: 'Advanced', advanced: 'Full' },
    { label: 'Section control',basic: 'Limited', pro: 'Advanced', advanced: 'Full' },
    { label: 'Layout control', basic: '—',       pro: 'Limited',  advanced: 'Full' },
    { label: 'RSVP',           basic: 'Basic',   pro: 'Advanced', advanced: 'Full' },
    { label: 'Premium features', basic: '—',     pro: 'Some',     advanced: 'All' }
  ];

  /* ------------------------------------------------------------------ *
   *  Optional paid add-ons (§11 dynamic pricing)                        *
   * ------------------------------------------------------------------ */
  var ADDONS = [];

  function findAddon(id) {
    for (var i = 0; i < ADDONS.length; i++) if (ADDONS[i].id === id) return ADDONS[i];
    return null;
  }

  /* Add-ons a plan may buy — one already bundled into the plan is not sold. */
  function addonsFor(planId) {
    return ADDONS.filter(function (a) {
      if (a.id === 'anim') return !can(planId, 'editor.animation.full');
      if (a.id === 'rush') return planId !== 'advanced';
      return true;
    });
  }

  /* ------------------------------------------------------------------ *
   *  Theme commerce metadata                                            *
   * ------------------------------------------------------------------ *
   * Price tiers reflect design complexity and how much of the editor the
   * layout actually exposes. Features are DERIVED from the layout's own
   * section list, so a theme can never advertise a section its layout does
   * not render.                                                          */
  var TIERS = {"vellum":{"basePrice":89,"editorLevel":"full","plans":["studio"]},"nocturne":{"basePrice":99,"editorLevel":"full","plans":["studio"]},"confetti":{"basePrice":69,"editorLevel":"full","plans":["studio"]},"bloom":{"basePrice":79,"editorLevel":"full","plans":["studio"]},"atlas":{"basePrice":99,"editorLevel":"full","plans":["studio"]}};

  /* Visual style, used by the marketplace style filter. Derived from the
     theme's own `category` so there is one source of truth. */
  var STYLE_OF = {
    Signature: 'Elegant', Classic: 'Traditional', Elegant: 'Elegant',
    Minimal: 'Minimal', Floral: 'Floral', Garden: 'Floral',
    Modern: 'Modern', Festive: 'Modern', Luxe: 'Luxury', Custom: 'Modern',
    Playful: 'Playful', Soft: 'Soft', Coastal: 'Floral'
  };

  /* Derived, not hardcoded: the marketplace style filter should only ever
     offer styles a design actually has. A hardcoded list outlived the
     catalogue it described and left "Luxury" as a chip that matched nothing. */
  var STYLES = (function () {
    var seen = {}, out = [];
    (window.EVER_THEMES || []).forEach(function (t) {
      var s = STYLE_OF[t.category] || 'Modern';
      if (!seen[s]) { seen[s] = true; out.push(s); }
    });
    return out.sort();
  })();

  /* Section id -> the customer-facing feature name shown on a design card. */
  var FEATURE_LABEL = {
    hero: 'Hero', details: 'Event details', hosts: 'Host & couple',
    story: 'Story', schedule: 'Schedule', gallery: 'Gallery',
    countdown: 'Countdown', rsvp: 'RSVP', venue: 'Venue', map: 'Map',
    video: 'Video', registry: 'Registry', wishes: 'Wishes',
    updates: 'Updates', strip: 'Photo strip', contact: 'Contact',
    stats: 'Highlights', invitation: 'Invitation'
  };

  /** Commerce facts for a theme: price, plans, editor level, style, features. */
  function themeCommerce(tplOrId) {
    var tpl = typeof tplOrId === 'string'
      ? (window.EVER_findTemplate ? window.EVER_findTemplate(tplOrId) : null)
      : tplOrId;
    if (!tpl) return null;

    var tier = TIERS[tpl.layout] || { basePrice: 29, editorLevel: 'basic', plans: PLAN_ORDER.slice() };
    if (tpl.layout === 'platform') tier = { basePrice: tpl.price || 79, editorLevel: 'full', plans: ['studio'] };
    /* Custom user designs are always the entry tier. */
    if (tpl.custom) tier = { basePrice: 29, editorLevel: 'basic', plans: PLAN_ORDER.slice() };

    var layout = window.EVER_findLayout ? window.EVER_findLayout(tpl.layout) : null;
    var features = [];
    if (layout && layout.sections) {
      layout.sections.forEach(function (s) {
        var label = FEATURE_LABEL[s.id];
        if (label && features.indexOf(label) === -1) features.push(label);
      });
    }

    return {
      id: tpl.id,
      name: tpl.name,
      category: tpl.event || 'wedding',
      style: STYLE_OF[tpl.category] || 'Modern',
      basePrice: tier.basePrice,
      editorLevel: tier.editorLevel,
      plans: tier.plans,
      features: features,
      active: true
    };
  }

  /** Lowest total a customer could pay for this theme — the "from" price. */
  function startingPrice(tplOrId) {
    var c = themeCommerce(tplOrId);
    if (!c) return 0;
    return c.basePrice + findPlan(c.plans[0]).price;
  }

  /* ------------------------------------------------------------------ *
   *  Price calculation (§11)                                            *
   * ------------------------------------------------------------------ */
  /**
   * quote({ themeId, plan, addons, discount }) -> full itemised breakdown.
   * Every consumer (design card, plan picker, checkout, billing) uses this,
   * so a price can never disagree between two screens.
   */
  function quote(opts) {
    opts = opts || {};
    var c = themeCommerce(opts.themeId);
    var plan = findPlan(opts.plan || (c ? c.plans[0] : 'basic'));
    var chosen = opts.addons || [];

    var lines = [];
    var themePrice = c ? c.basePrice : 0;
    lines.push({ kind: 'theme', label: c ? c.name : 'Design', detail: 'Design', amount: themePrice });
    lines.push({ kind: 'plan',  label: plan.name + ' plan', detail: 'Plan', amount: plan.price });

    var addonTotal = 0;
    chosen.forEach(function (id) {
      var a = findAddon(id);
      if (!a) return;
      addonTotal += a.price;
      lines.push({ kind: 'addon', label: a.name, detail: 'Add-on', amount: a.price });
    });

    var subtotal = themePrice + plan.price + addonTotal;
    var discount = Math.max(0, Math.min(Number(opts.discount) || 0, subtotal));
    var taxable = subtotal - discount;
    var vat = Math.round(taxable * VAT_RATE * 100) / 100;
    var total = Math.round((taxable + vat) * 100) / 100;

    return {
      currency: CURRENCY,
      lines: lines,
      themePrice: themePrice,
      planPrice: plan.price,
      customization: addonTotal,
      subtotal: subtotal,
      discount: discount,
      vat: vat,
      vatRate: VAT_RATE,
      total: total
    };
  }

  function money(n) {
    var v = Math.round(Number(n) * 100) / 100;
    return CURRENCY + ' ' + (v % 1 === 0 ? String(v) : v.toFixed(2));
  }

  /* ------------------------------------------------------------------ *
   *  Purchase state machine (§32)                                       *
   * ------------------------------------------------------------------ */
  var STATES = {
    DRAFT:             ['DESIGN_SELECTED'],
    DESIGN_SELECTED:   ['PLAN_SELECTED', 'DESIGN_SELECTED'],
    PLAN_SELECTED:     ['CUSTOMIZING', 'PLAN_SELECTED'],
    CUSTOMIZING:       ['READY_FOR_PAYMENT', 'CUSTOMIZING'],
    READY_FOR_PAYMENT: ['PAYMENT_PENDING', 'CUSTOMIZING'],
    PAYMENT_PENDING:   ['PAID', 'PAYMENT_FAILED'],
    PAYMENT_FAILED:    ['RETRY_PAYMENT', 'CUSTOMIZING'],
    RETRY_PAYMENT:     ['PAYMENT_PENDING', 'CUSTOMIZING'],
    PAID:              ['READY_TO_PUBLISH'],
    READY_TO_PUBLISH:  ['PUBLISHED', 'READY_TO_PUBLISH'],
    PUBLISHED:         ['READY_TO_PUBLISH', 'ARCHIVED'],
    ARCHIVED:          []
  };

  function canTransition(from, to) {
    var allowed = STATES[from];
    return !!allowed && allowed.indexOf(to) !== -1;
  }

  /** True once payment has cleared — gates the editor and publishing. */
  function isPaid(project) {
    if (!project) return false;
    return ['PAID', 'READY_TO_PUBLISH', 'PUBLISHED', 'ARCHIVED']
      .indexOf(project.status) !== -1;
  }

  /* ------------------------------------------------------------------ *
   *  Projects                                                           *
   * ------------------------------------------------------------------ */
  function allProjects() {
    var list = readJson(PROJECTS_KEY, []);
    return Array.isArray(list) ? list : [];
  }

  function saveProjects(list) { writeJson(PROJECTS_KEY, list); }

  function findProject(id) {
    var list = allProjects();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function newId(prefix) {
    return prefix + '-' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);
  }

  function slugify(s) {
    return String(s || 'invitation').toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'invitation';
  }

  /**
   * Create a project bound to exactly one theme (§3, §9).
   * The theme is recorded permanently; changing it later means a new project.
   */
  function createProject(themeId) {
    var c = themeCommerce(themeId);
    if (!c) return null;
    var now = new Date().toISOString();
    var project = {
      id: newId('prj'),
      themeId: c.id,
      themeName: c.name,
      themeVersion: 4,
      layoutId: (window.EVER_findTemplate(c.id) || {}).layout || '',
      plan: null,
      addons: [],
      basePrice: c.basePrice,
      customizationPrice: 0,
      status: 'DESIGN_SELECTED',
      slug: '',
      published: false,
      orderId: null,
      state: null,                 /* editor state v4, filled on first edit */
      createdAt: now,
      updatedAt: now
    };
    var list = allProjects();
    list.unshift(project);
    saveProjects(list);
    setActive(project.id);
    return project;
  }

  function updateProject(id, patch) {
    var list = allProjects();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id !== id) continue;
      for (var k in patch) if (Object.prototype.hasOwnProperty.call(patch, k)) list[i][k] = patch[k];
      list[i].updatedAt = new Date().toISOString();
      saveProjects(list);
      return list[i];
    }
    return null;
  }

  /** Move a project to `status`, refusing transitions the machine forbids. */
  function setStatus(id, status) {
    var p = findProject(id);
    if (!p) return null;
    if (p.status === status) return p;
    if (!canTransition(p.status, status)) return null;
    return updateProject(id, { status: status });
  }

  function deleteProject(id) {
    saveProjects(allProjects().filter(function (p) { return p.id !== id; }));
    if (activeId() === id) clearActive();
  }

  /* ---- active project ---- */
  function activeId() {
    try { return localStorage.getItem(ACTIVE_KEY) || ''; } catch (e) { return ''; }
  }
  function setActive(id) {
    try { localStorage.setItem(ACTIVE_KEY, id); } catch (e) { /* ignore */ }
  }
  function clearActive() {
    try { localStorage.removeItem(ACTIVE_KEY); } catch (e) { /* ignore */ }
  }
  function activeProject() {
    return activeId() ? findProject(activeId()) : null;
  }

  /**
   * Load a project into the editor. The editor reads `ever-rsvp-event`
   * directly, so opening a project mirrors its state into that key; if the
   * project has no state yet, the theme's defaults are used.
   */
  function openProject(id) {
    var p = findProject(id);
    if (!p) return null;
    setActive(id);
    var state = p.state;
    if (!state && window.EVER_siteDefaults) state = window.EVER_siteDefaults(p.themeId);
    if (state) writeJson(EVENT_KEY, state);
    return p;
  }

  /** Persist the editor's current state back onto the active project. */
  function syncActiveState() {
    var id = activeId();
    if (!id) return null;
    var state = readJson(EVENT_KEY, null);
    if (!state) return null;
    return updateProject(id, { state: state });
  }

  /* ------------------------------------------------------------------ *
   *  Orders                                                             *
   * ------------------------------------------------------------------ */
  function allOrders() {
    var list = readJson(ORDERS_KEY, []);
    return Array.isArray(list) ? list : [];
  }

  function findOrder(id) {
    var list = allOrders();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  /* ------------------------------------------------------------------ *
   *  Publish validation (§26)                                           *
   * ------------------------------------------------------------------ */
  /**
   * Pre-publish checklist (§26).
   *
   * A plain "is it empty?" test would always pass: the engine backfills every
   * basic from the theme's defaults, so the date, venue and names are never
   * blank. The check that actually protects a customer is whether they have
   * REPLACED the sample content — publishing "Ananya & Rohan" at the theme's
   * placeholder venue is the real failure mode.
   *
   * So each item fails when the value is empty *or* still identical to the
   * theme's default. Each names the editor section it belongs to, so a
   * failing item can link straight there.
   */
  function validate(state) {
    if (!state) return [{ ok: false, label: 'Start editing your invitation', section: '' }];

    var b = state.basics || {};
    var defaults = {};
    try {
      var d = window.EVER_siteDefaults ? window.EVER_siteDefaults(state.templateId) : null;
      defaults = (d && d.basics) || {};
    } catch (e) { defaults = {}; }

    /* Filled in, and not left as the sample text. */
    function done(key) {
      var v = b[key];
      if (v === undefined || v === null || String(v).trim() === '') return false;
      if (defaults[key] !== undefined && String(v) === String(defaults[key])) return false;
      return true;
    }

    /* True when at least one of several equivalent fields is personalised —
       layouts name the same idea differently (nameA/title/host/child). */
    function anyDone(keys) {
      for (var i = 0; i < keys.length; i++) if (done(keys[i])) return true;
      return false;
    }

    var checks = [
      { label: 'Your event name or title',  ok: anyDone(['title', 'name', 'brand']), section: '' },
      { label: 'Host or couple names',      ok: anyDone(['nameA', 'nameB', 'host', 'family', 'child']), section: '' },
      { label: 'Your event date',           ok: /^\d{4}-\d{2}-\d{2}$/.test(b.date || ''), section: '' },
      { label: 'Your event time',           ok: done('time'), section: '' },
      { label: 'Your venue or address',     ok: anyDone(['venue', 'address', 'city']), section: '' }
    ];

    var sections = state.sections || {};
    checks.push({
      label: 'RSVP section switched on',
      ok: !!(sections.rsvp && sections.rsvp.on !== false),
      section: 'rsvp'
    });

    return checks;
  }

  function isValid(state) {
    return validate(state).every(function (c) { return c.ok; });
  }

  /**
   * Publish a project: assign a slug and flip it to PUBLISHED.
   * Refuses unless the project is paid and passes validation.
   */
  function publish(projectId) {
    var p = findProject(projectId);
    if (!p) return { ok: false, reason: 'Invitation not found.' };
    if (!isPaid(p)) return { ok: false, reason: 'Complete payment before publishing.' };
    var state = p.state || readJson(EVENT_KEY, null);
    if (!isValid(state)) return { ok: false, reason: 'Some required details are still missing.' };

    var b = (state && state.basics) || {};
    var base = b.nameA && b.nameB ? b.nameA + '-' + b.nameB : (b.title || p.themeName);
    var slug = p.slug || (slugify(base) + '-' + p.id.slice(-4));

    if (p.status === 'PAID') setStatus(projectId, 'READY_TO_PUBLISH');
    var updated = updateProject(projectId, { slug: slug, published: true, state: state });
    setStatus(projectId, 'PUBLISHED');
    return { ok: true, project: findProject(projectId) || updated, slug: slug };
  }

  /** Public invitations are loaded by ID from the server. */
  function inviteUrl(project) {
    if (!project) return '';
    return window.location.origin + '/invite.html?e=' + encodeURIComponent(project.id);
  }

  /* ------------------------------------------------------------------ *
   *  Public API                                                         *
   * ------------------------------------------------------------------ */
  window.EVER_C = {
    CURRENCY: CURRENCY,
    VAT_RATE: VAT_RATE,
    PLANS: PLANS,
    PLAN_ORDER: PLAN_ORDER,
    MATRIX: MATRIX,
    ADDONS: ADDONS,
    STYLES: STYLES,

    findPlan: findPlan,
    planRank: planRank,
    can: can,
    planFor: planFor,
    grantsFor: grantsFor,
    findAddon: findAddon,
    addonsFor: addonsFor,

    themeCommerce: themeCommerce,
    startingPrice: startingPrice,
    quote: quote,
    money: money,

    STATES: STATES,
    canTransition: canTransition,
    isPaid: isPaid,

    allProjects: allProjects,
    findProject: findProject,
    createProject: createProject,
    updateProject: updateProject,
    deleteProject: deleteProject,
    setStatus: setStatus,
    activeId: activeId,
    activeProject: activeProject,
    setActive: setActive,
    clearActive: clearActive,
    openProject: openProject,
    syncActiveState: syncActiveState,

    allOrders: allOrders,
    findOrder: findOrder,

    validate: validate,
    isValid: isValid,
    publish: publish,
    inviteUrl: inviteUrl,

    slugify: slugify
  };
})();
