# Premium frontend and visual editor

The application still uses the existing Express server, SQLite storage, plain HTML/CSS/JavaScript, catalogue, payment checks and RSVP endpoints. Next.js is not installed in this checkout. Existing user changes were retained.

## Application surfaces

- `frontend/public/css/premium.css` supplies shared ivory/forest-green application chrome, responsive navigation, compact template cards, pricing, dashboard and editor panels. Invitation artwork remains scoped in `collection.css`.
- The homepage and collection share search, occasion filters, catalogue pricing and working Preview / Use Template actions.
- Pricing reads the commerce catalogue, rather than duplicating prices.
- The dashboard has real project counts, search and status filters. Guest replies have search and attendance filters; CSV export remains available.

## Editing model

`layouts/collection.js` marks schema-backed content with stable `data-field` paths and `data-editable`. Decorations are not selectable. Text, image and section settings are contextual; the mobile inspector is a bottom sheet. Full preview renders the invitation without editing handlers and restores its opening experience.

`visual-editor.js` connects these elements to `EVER_EDITOR`, a small adapter exposed by the existing editor. State, permissions, purchase-date locking, local drafts, server saves, and publishing remain owned by `editor.js`. Guest forms cannot submit during editing.

- Click text to edit inline, or use the contextual text control.
- Photographs support URL replacement, upload/resizing, crop position, fit and radius.
- Click section whitespace for background, alignment, padding, move, hide, duplicate and removal controls.
- Drag section headings in the Sections panel, or use the existing arrow buttons.
- Additional content sections can be duplicated up to 20 times. Hero, RSVP, opening-date and footer sections are intentionally not duplicable, because their guest interactions require unique instances.
- Removed sections can be restored from the Sections panel or Undo. Required structural sections cannot be deleted; RSVP visibility remains subject to publish validation.
- Undo/redo stores up to 80 snapshots for the current editing session. Reloading preserves the invitation, but starts a new history session.
- Eight editable theme presets reuse the existing font, spacing, button and section colour controls.

## Stored data

The existing v4 schema is extended with optional fields, so old invitations continue rendering:

```json
{
  "elementStyles": {
    "basics.nameA": { "fontSize": "44px", "color": "#203b37" },
    "sections.letter": { "padding": "60px" }
  },
  "sectionTypes": { "letterCopy1": "letter" }
}
```

Copies keep independent section content and an explicit source type. Both the editor and public renderer use that type. The server validates source types, field paths, properties, font names, numeric bounds, and section-count limits before storing them. Arbitrary CSS properties are not accepted.

## Verification

Run `npm run check`, `npm test`, `npm run test:browser`, `npm run test:paid-browser`, and `npm run test:visual-editor`. The last two browser scripts use Edge; paid tests create isolated temporary fixture databases. The visual suite expects the development server at localhost:3000 and checks 320, 375, 390, 414, 768, 1024, 1280, 1440 and 1920px widths. Screenshots are saved to ignored `artifacts/`.

Live Stripe transactions and deployment still require the application's environment configuration. Browser purchase tests use local fixtures, not real payments.

See [PLATFORM-UPGRADE.md](PLATFORM-UPGRADE.md) for the expanded catalogue, experience engines, guided creation, themes, QR sharing and analytics.
