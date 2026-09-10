# LAYOUT-SPEC — Invitara multi-layout engine (v4)

Read this fully before writing any layout or editor code. The reference
implementation is `public/js/layouts/poetic.js` — mirror its structure. Every
layout is a port of one page from the Muhibbi wedding template
(`vendor/muhibbi-template/demo/index*.html`, source archive only — never deployed); they share
markup/behaviour helpers from `public/js/mu.js` and styling from
`public/css/mu.css` (generated) + `public/css/mu-extra.css` (hand-written).

## Goal

Every template is built from ONE of 8 **layouts** (genuinely different page
structures, each a Muhibbi home-page port) + a **theme** (palette / fonts /
ornament) + **content defaults** specific to its event type (wedding,
birthday, anniversary, housewarming, baptism, baby & kids, gala…). The editor
renders its sidebar groups dynamically from the layout's field specs, so every
field of every layout is fully customizable with zero editor changes.

## File layout

```
public/js/templates.js         core (registry, state v4, helpers, THEMES, dispatch)
public/js/mu.js                shared runtime: header, slider, RSVP form/section,
                                footer, mini-preview scaler, per-section style fields
public/js/layouts/poetic.js    Main Wedding Home       (reference implementation)
public/js/layouts/herald.js    Announcement Home 1
public/js/layouts/atrium.js    Announcement Home 2
public/js/layouts/editorial.js Announcement Home 3
public/js/layouts/calm.js      Korean Wedding Home
public/js/layouts/terra.js     African Wedding Home
public/js/layouts/crescent.js  Muslim Wedding Home
public/js/layouts/heritage.js  Senior Wedding Home
public/css/mu.css              GENERATED (scripts/scope-css.mjs) — the whole
                                Muhibbi design system, every selector scoped to `.ws`
public/css/mu-extra.css        hand-written companion: slider/menu/lightbox behaviour
                                CSS, theme-variable fallbacks, responsive fixes
```

Load order (already wired in the HTML): `templates.js` → `mu.js` →
`layouts/*.js` → page script. Layout files must not run renders at load time;
they only call `EVER_registerLayout(def)`.

## Layout definition contract

```js
window.EVER_registerLayout({
  id: 'poetic',                      // unique, also CSS namespace prefix
  label: 'Poetic Portrait',          // shown in the designer modal
  events: ['wedding', 'anniversary'],// event-type ids (see event registry)
  basics: [ /* Basics field specs (see "Field spec" below) */ ],
  sections: [ /* ordered SectionSpec list */ ],
  defaults: function () {            // FULL default state for this layout
    return { basics: {...}, sections: {...} };
  },
  render: function (data, tpl, opts) { /* returns a DOM element (.ws …) */ },
  mini: function (data, tpl)         { /* returns a DOM element (.wsm …) */ }
});
```

### SectionSpec (drives BOTH the renderer and the editor sidebar)

```js
{
  id: 'story',            // section key in state.sections + state.order
  label: 'Our story',     // accordion label in the editor
  fields: [ /* FieldSpec list, rendered inside the accordion */ ],
  list: {                 // optional repeatable list (repeater)
    k: 'items',           // key on the section object holding the array
    label: 'Milestone',   // item label
    blank: function () { return { title: 'New milestone' }; },
    fields: [ /* FieldSpec per item */ ]
  }
}
```

### FieldSpec types (editor implements all of these — do not invent new ones)

| type      | value                       | notes                                   |
|-----------|-----------------------------|-----------------------------------------|
| `text`    | string                      | `ph` = placeholder                      |
| `textarea`| string                      | rows=3                                  |
| `date`    | `YYYY-MM-DD`                |                                         |
| `number`  | number                      | `min`/`max`                             |
| `check`   | boolean                     | inline checkbox                         |
| `select`  | string                      | `options: [['v','Label'], …]`           |
| `photo`   | library id or URL           | library from `EVER_PHOTOS`              |
| `icon`    | icon id                     | from `EVER_ICONS`                       |
| `color`   | hex string                  | color input                             |

Dotted keys (`'social.wa'`) are supported for nested values.

## State (localStorage `ever-rsvp-event`, v=4)

```js
{
  v: 4,
  layoutId: 'poetic',         // which layout renders this site
  templateId: 'emerald',      // theme id (builtin or custom-*)
  nameFont: '',               // '' = follow theme
  bodyFont: 'lato',
  accent: 'tpl',              // 'tpl' or '#hex'
  btnShape: 'soft',           // pill | soft | square
  spacing: 'normal',          // cozy | normal | airy
  basics: { ...layout-specific },      // e.g. title, nameA, nameB, date, time, venue, city…
  order:  ['hero', 'details', …],      // subset/perm of layout section ids
  sections: { hero: { on: true, … }, … }
}
```

### Migration (implemented in templates.js `loadSiteState`)

- v3 (old single-format state) → v4 for the wedding layouts: map
  `basics.nameA/nameB/date/time/venue/address/city/dress/quote`,
  keep `sections.story/gallery/events/venue/rsvp/contact` whose keys match,
  keep top-level fields (`templateId, nameFont, bodyFont, accent, btnShape,
  spacing`), keep `order` if its length matches the new layout's.
- v1/v2 were already migrated to v3 previously.
- If the saved `templateId`/`layoutId` is unknown → fall back to defaults.
- Migration lives in the CORE (`EVER_loadSiteState`) — layout files never
  touch localStorage.

## Core API (templates.js exposes on `window.EVER_*`)

Existing (keep, do not rename): `EVER_siteDefaults`, `EVER_renderSite`,
`EVER_renderSiteMini`, `EVER_allTemplates`, `EVER_findTemplate`,
`EVER_saveCustomTemplate`, `EVER_deleteCustomTemplate`,
`EVER_readCustomTemplates`, `EVER_tickCountdowns`, `EVER_bindSite`,
`EVER_esc`, `EVER_photoSrc`, `EVER_fmtHeroDate`, `EVER_fmtLongDate`,
`EVER_ICONS`, `EVER_PHOTOS`, `EVER_NAME_FONTS`, `EVER_BODY_FONTS`,
`EVER_THEMES`.

New in v4:
- `EVER_registerLayout(def)` — used by layout files.
- `EVER_layouts()` — array of registered layout defs.
- `EVER_findLayout(id)` — layout def or the first registered.
- `EVER_events()` — event-type registry (id → {label, tagline}).
- `EVER_siteDefaults(templateId?)` — now takes an OPTIONAL template id:
  merges the layout defaults with the template's `content` overrides.
  Called with no arg it uses the first template (emerald).
- `EVER_loadSiteState(flow)` — core state loader + v3→v4 migration used by
  the editor; returns the ready state object.
- `EVER_renderSite(data, opts)` — dispatches to the layout found via
  `data.layoutId` (falling back to the template's layout). `opts.interactive`
  adds the `ws-live` class. The root element gets `ws-<layoutId>` and
  `ws-orn-<ornament>` classes plus theme vars (`--ws-dark/--ws-gold/--ws-bg/
  --ws-ink/--ws-soft`) — layout CSS must style everything through these vars.
- `EVER_renderSiteMini(tpl, data?, opts?)` — dispatches to the layout's
  `mini()`. `opts.short` = compact (checkout summary).
- `EVER_applyVars(el, tpl, data)` — applies theme vars (accent override
  included); layouts call this on their roots.

## Renderer rules (each layout)

1. Root element: `className = 'ws ws-<layoutId> ws-orn-<orn> <bodyFontCls>
   ws-bs-<shape> ws-sp-<spacing>'` (+ `ws-live` when interactive). Apply
   `EVER_applyVars(el, tpl, data)` for the theme variables.
2. Every section root: `<section class="ws-sec ws-<key>" id="ws-sec-<key>">`
   (footer uses class `ws-footer`). The shared scroll-reveal + anchor code in
   `bindSite` depends on `#ws-sec-<key>` ids and `[data-goto]` links.
3. All user text through `EVER_esc`. All user URLs through `EVER_safeUrl`.
4. Countdown: include the shared markup with `data-ws-deadline` =
   basics.date + 'T17:00:00' and `data-u="d|h|m|s"` boxes — `tickCountdowns`
   fills them.
5. RSVP form: `class="ws-rsvp-form"` with named fields `name`, `phone`
   (optional), `attend`, optional `meal`/`msg`; submit button
   `class="ws-btn ws-submit"`. `bindSite` handles validation + success box.
6. Every layout must degrade gracefully: sections render only when
   `sections[id].on !== false`, and order comes from `data.order`.
7. Photos: `EVER_photoSrc(idOrUrl)`; the PHOTOS library now includes the
   `ev-*` images (balloons, neon, glam, tropical, anniv, silver, home,
   cottage, baptism, baby, gala, star).

## Mini renderer rules (each layout)

Root: `div.wsm.ws-<layoutId>`, `aria-hidden="true"`, theme vars applied.
Compact version of the page (hero strip + 2-4 signature blocks + footer
strip). `opts.short` cuts it to hero + one block + footer. Reuse existing
`.wsm-*` base classes from styles.css where possible; add layout-specific
classes as `wsm-<layoutId>-*`.

## Theme (template) definition

```js
{ id: 'emerald', name: 'Emerald & Gold',
  event: 'wedding',            // event-type id (chip on create page)
  layout: 'poetic',            // layout id
  category: 'Classic',         // style chip inside the event group
  scene: 'petals',             // WebGL hero scene — js/invites/scene-petals.js
  motion: 'petals',            // ornament motif — js/site-motion.js
  dark: '#17301f', gold: '#c9a45c', bg: '#f7f3e8', ink: '#3c3628',
  soft: '#efe7d2', nameFont: 'vibes', ornament: 'floral',
  content: { basics: {...overrides}, sections: {...overrides} } }
```

- `content` overrides are deep-merged over the layout defaults by
  `EVER_siteDefaults(templateId)`. Arrays REPLACE, objects merge.
- `scene` and `motion` are both optional and independent. A theme with neither
  renders as a still page and costs nothing extra. See ARCHITECTURE.md §14.
- Custom templates (designer modal) carry `layout` too and merge the same way.

### A theme MUST override every section its layout renders

This used to say "keep overrides SMALL", and that advice produced the single
worst defect in the catalogue. **Every layout's `defaults()` is a wedding.** A
theme that overrode only `basics` and `hero` therefore shipped, for example, a
child's birthday party whose `story` section explained how the couple met, whose
`event` tiles announced a ceremony, and whose RSVP form said *"Welcome to our
big day"* with the options *Joyfully accept / Regretfully decline*.

Two of those sections are not even in the layout files: `MU.rsvpDefaults()` and
`MU.contactDefaults()` in `js/mu.js` are shared, and they are wedding copy too.
So a non-wedding theme must override **`rsvp` and `contact` as well as** every
section id in its layout's spec.

The rule, concretely: write out `content.sections` for every id in
`EVER_layoutOrder(layout)`, plus `rsvp` and `contact`. It is more text than the
old guidance implied, and it is the difference between a design and a recolour.

`public/layouts-test.html` renders every layout and theme on one page; reading a
non-wedding design top to bottom there is the fastest way to catch a leak.

## Editor (dynamic)

The editor builds its sidebar from `EVER_findLayout(state.layoutId)`:
- "Basics" accordion ← `layout.basics` FieldSpecs (bound to `state.basics`).
- One accordion per SectionSpec in `state.order` with eye/up/down tools.
- FieldSpec renderer supports ALL types above (incl. textarea/select/color).
- Design panel unchanged (template chips, fonts, accent, shape, spacing) +
  template switch also updates `state.layoutId` when the template's layout
  differs, and REBUILDS basics/groups (content keys merge over the new
  layout defaults so user edits survive where keys overlap).

## CSS rules (each layout, own file)

- Namespace everything: `.ws-<id> …` (full page) and `.wsm-<id> …` (mini).
- Root element also carries `ws-sp-*`/`ws-bs-*`/`ws-orn-*`/`f-*`/`ws-body-jost`
  modifiers and the CSS vars — style ONLY via vars (var(--ws-dark) etc.) so
  themes work on every layout. Base buttons/titles/forms exist in styles.css
  (`.ws-btn`, `.ws-title`, `.ws-timer`, `.ws-rsvp-form`, inputs) — reuse them;
  add layout-specific layout/typography only.
- Include: responsive breakpoints (≤900px, ≤620px), `prefers-reduced-motion`
  guards for any animation, and `.wsm` mini styles.
- No `position: fixed` inside rendered sites. No external assets.

## Event-type registry

```
wedding      Wedding
birthday     Birthday
anniversary  Anniversary
housewarming Housewarming
baptism      Baptism & Christening
baby         Baby Shower & Kids
gala         Gala & Evening
```

## Quality bar (premium)

- Distinct hero treatment per layout (monogram crest / arch / big-age badge /
  cinematic full-bleed / doorway / soft arch / playful shapes / marquee).
- Real sample copy per event type (no lorem ipsum, no wedding copy reused).
- Consistent premium details: letter-spaced kickers, hairline dividers,
  generous whitespace, hover transitions, scroll reveal via bindSite.
