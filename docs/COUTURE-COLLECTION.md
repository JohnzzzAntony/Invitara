# Couture collection

Five additive luxury occasion templates on the existing Express / vanilla JavaScript platform. No existing template, ID, field path or price changes. No new runtime packages.

| ID | Name | Occasion | Experience | Price (AED, ex VAT) | Signature opening | Mood reference (MotionSites theme names) |
| --- | --- | --- | --- | --- | --- | --- |
| `couture-lumiere` | Lumière | Wedding | Reveal | 299 | Gilded arch doors swing open, light sweep | Velia, Living Portrait |
| `couture-obsidian` | Obsidian Gala | Corporate gala | Cinematic | 279 | Faceted glass veil shatters away | Facet Glass, Nightmast Studio |
| `couture-eclipse` | Eclipse | Product launch | Cinematic | 279 | Moon slides off the sun, diamond-ring flare | Eclipsio, Sun Timeline, Lumora |
| `couture-saffron` | Saffron Soirée | Birthday | Magazine | 249 | Silk drape lifts, saffron petals drift | Saffron Field, Petalyx |
| `couture-pearl` | Pearl Tide | Anniversary | Timeline | 249 | Ink-wash tide masks in the portrait | Ink Reveal, Tide Footer |

Mood references are theme *names* only. No MotionSites prompts, code or media were copied; all artwork is original CSS/SVG or existing project photography.

## Files

- `frontend/public/js/couture-catalog.js` — registration and default content (DOM-free; loaded by `backend/catalog.mjs`).
- `frontend/public/js/couture-layout.js` — hero composition and section hooks through the `INVITARA_artDirect` chain.
- `frontend/public/js/couture-experience.js` — opening, parallax, countdown, Google/ICS calendar, pause/replay/share, disposal through `EVER_bindSite`.
- `frontend/public/css/couture.css` — scoped styles (`.couture`, `.couture-<key>`), self-hosted font faces.
- `frontend/public/assets/couture/` — original Eclipse product illustrations and OFL font subsets with licences.
- `frontend/public/js/couture-prompts.js`, `prompts.html`, `js/prompts-page.js` — the copyable prompt library (also exported as `Invitara-Couture-Prompts.xlsx`).
- `tests/couture.test.mjs`, `scripts/couture-check.mjs` — server contract and browser checks.

## Shared-file changes

- `backend/catalog.mjs`: loads `couture-catalog` after `business-catalog`.
- Pages that load the business collection now also load the three couture scripts and `css/couture.css`.
- `js/shop.js`: new "Couture occasions" collection filter.
- `js/template-detail.js`: "Copy build prompt" button for couture designs only.
- `css/finish.css`: the couture scope is exempt from the site-wide single typeface (`:not(.couture):not(.couture *)`) and from square corners (`:not([class*="cx-"])`). Everything else in that file still applies, including hidden section eyebrows.
- `tests/validation.test.mjs`: design counts 27→32 active, 81→86 total.
- Footers link to the prompt library (`prompts.html`, `noindex`).

## Behaviour

Default opening is `tap` (a real `<button>` with `aria-expanded`). `scroll` opens once the guest starts scrolling; `none` shows the finished composition. Mini cards and the editor always show the opened state. Pause motion, `prefers-reduced-motion` and the `motion: none` theme setting remove all animation without hiding content. Countdown and calendars use `sections.details.timezone`.

## Verify

```bash
npm run lint && npm run build && npm test
npm run dev            # another terminal
TEST_ORIGIN=http://localhost:3000 npm run test:couture   # CHROMIUM_PATH=… to use a specific Chromium
```

Open `/create.html?collection=couture`, `/demo.html?id=couture-<key>` and `/prompts.html`.
