# Template audit — September 2026

Code-level audit of the 27-design catalogue that preceded the 8-design one, and
the record of what was changed and why. Companion to
[ARCHITECTURE.md](ARCHITECTURE.md) and [LAYOUT-SPEC.md](LAYOUT-SPEC.md).

Method: every `SectionSpec` cross-checked against its renderer branch and its
`defaults()` entry; every theme's `content` overrides diffed against the layout
defaults they merge onto; every `<script>` graph walked; `node --check` over all
browser scripts. No screenshots — this was a code-level pass by request.

---

## 1. What was actually broken

### 1.1 Occasion copy — the big one

**20 of 27 themes were a recolour of wedding copy.** The engine merges a theme's
`content` overrides onto its layout's `defaults()`. Every non-wedding theme
overrode only `basics` (the names) and `sections.hero` (one headline, one
kicker). Everything below the fold stayed as the layout shipped it — which for
all ten layouts is a wedding.

Concretely, `balloon` — "Maya turns eight", a child's birthday — rendered:

| Section | What a guest saw |
|---|---|
| `couple` | Two portraits captioned *"Today I marry my best friend"* |
| `story` | *"How we met — a coffee shop on a rainy afternoon"* |
| `event` | *"Ceremony — three in the afternoon, under the mango tree"* |
| `rsvp` | *"Welcome to our big day"*, options *Joyfully accept / Regretfully decline* |
| `countdown` | *"Until we celebrate"* over *"Two hearts, one love"* |

The RSVP case is structural rather than per-theme: `MU.rsvpDefaults()` in
`js/mu.js` hardcodes the wedding wording for **every** layout, so a theme that
did not override `sections.rsvp` inherited it no matter what occasion it
claimed. Not one non-wedding theme overrode it.

This is what "not fully developed" meant in practice. It is a content defect,
not a rendering defect — which is why it survived a `node --check` pass.

### 1.2 Motion was wired but mostly unreachable

`js/site-scene.js` and the five scene modules are sound: three.js is fetched on
demand, the loop is `IntersectionObserver`-gated, `prefers-reduced-motion`
renders a single still frame, WebGL context loss is handled, and a device
without WebGL degrades to the photograph in silence. The defects were around it:

- **Only 7 of 27 themes named a `scene`.** The other 20 were static.
- **`create.html` and `design.html` never loaded `site-scene.js`.** The design
  detail page renders a full live demo, so a customer evaluating a design saw a
  still page and only met the motion after paying. Fixed.
- Motion stopped at the hero. Every section below it was inert.

### 1.3 `invitation.html` could never have shipped

A 46 KB standalone page, outside the `.ws` engine entirely, pulling
`cdn.tailwindcss.com`, `cdnjs.cloudflare.com/three@r128`, GSAP and Font Awesome.
`config/security-headers.mjs` sets `script-src 'self' 'unsafe-inline'`, so in
production every one of those tags is blocked and the page renders as unstyled
text with no motion at all. It was also unlinked, absent from `sitemap.xml`, and
not editable, previewable or sellable through the builder.

Its motion vocabulary was worth keeping; the page was not. Ported and deleted —
see §3.

### 1.4 Dead weight in the load graph

Ten layout modules loaded on **every** page — about 140 KB of JavaScript — to
serve designs most visitors never open. After the cut, `mandala.js` and
`serene.js` had no theme referencing them at all.

## 2. What was sound

Worth recording, because it shaped how conservative the changes could be:

- Every section id in every layout's spec had both a renderer branch and a
  `defaults()` entry. **No orphan fields, no unrendered sections** across all
  ten layouts.
- `order` is derived from the spec (`layoutOrder()`), so it cannot drift.
- **No theme id was hardcoded anywhere outside `templates.js`** — not in
  `create.js`, `picker.js`, `design.js`, `commerce.js`, nor any HTML page. This
  is why cutting 27 themes to 8 touched one data structure instead of a dozen
  call sites.
- Commerce tiers key off **layout**, not theme, so pricing survived the cut
  untouched apart from the two removed layouts.
- `esc()` / `safeUrl()` discipline held everywhere; no raw interpolation of user
  data was found.
- All 17 browser scripts passed `node --check` before and after.

## 3. What changed

### 3.1 Catalogue: 27 → 8, one per occasion

| Theme | Occasion | Layout | Hero scene | Ornament motif |
|---|---|---|---|---|
| `emerald` | Wedding | poetic | petals | petals |
| `crescent` | Wedding (Arabic) | crescent | crystal | sparkle |
| `jubilee` | Anniversary | heritage | gilded | sparkle |
| `gala` | Gala | herald | nocturne | sparkle |
| `balloon` | Birthday | terra | confetti | confetti |
| `sunshine` | Baby shower | calm | bloom | bubbles |
| `newkeys` | Housewarming | atrium | aurora | leaves |
| `lamb` | Baptism | editorial | doves | feathers |

Eight themes on eight distinct layouts, so no two designs in the gallery share a
page structure. Every one of the seven occasion landing pages still has a design
behind it.

`mandala` (Indian wedding) and `serene` (Indo-Malay) were retired because the
brief allows two weddings and `poetic` and `crescent` cover the classic and
regional cases. Their code is in git history and both are straightforward to
reinstate — register the module, add a theme, add a `TIERS` entry.

### 3.2 Every kept theme now carries full occasion content

Each of the eight overrides **every section its layout renders**, including
`rsvp` and `contact`. A baby shower asks *"Can you come and celebrate?"* with
*Yes, count me in / Sorry, can't make it*; a gala asks about table seating; a
housewarming's `event` tiles say *Parking, Doors, Supper* rather than *Ceremony,
Reception*. No wedding string reaches a non-wedding design — verified by grep
over the rendered default state of all eight.

### 3.3 Motion, ported and extended

- Three new self-hosted scenes — `confetti`, `bloom`, `doves` — built on the
  existing `INVITE_SCENES[name](THREE, renderer, ctx)` contract and carrying the
  motion vocabulary of the deleted `invitation.html` (instanced particles, drift
  with per-instance phase, palette taken from the theme).
- `js/site-motion.js`: per-section ornament layers and staggered content reveal.
  Ornaments are CSS-animated DOM, not a second WebGL context — one GPU context
  per page, and ornaments still work over the opaque section backgrounds that a
  full-page canvas would sit behind.
- Ornament count scales with section area and is capped; the whole system is
  skipped under `prefers-reduced-motion` and on devices reporting
  `hardwareConcurrency <= 4`.
- One passive, rAF-throttled scroll listener drives all parallax; transforms and
  opacity only, so nothing triggers layout.
- `site-scene.js` and `site-motion.js` now load on `create.html` and
  `design.html`, so the motion is visible before purchase.

### 3.4 Removed

- `public/invitation.html` (CSP-blocked, unlinked, unsellable)
- `public/js/layouts/mandala.js`, `public/js/layouts/serene.js` (orphaned)
- Their `<script>` tags across all eight pages, and their `TIERS` entries

## 4. Standing limitations

Unchanged by this pass, and deliberate:

- Feature gating is advisory, not a security boundary — there is no backend
  (ARCHITECTURE.md §9).
- No visual regression suite. `public/layouts-test.html` remains the fastest way
  to eyeball every layout × theme, and is the place to start after any CSS
  change.
- The published-invitation URL still carries state in its hash, so it stays long
  and a QR code remains impractical (ARCHITECTURE.md §10).
