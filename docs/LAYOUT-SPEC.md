# Invitation layout and state contract

The browser engine in `public/js/templates.js` registers layout objects with `EVER_registerLayout`. The server loads the same objects through `server/catalog.mjs`; catalogue formatting is not parsed with regular expressions.

A layout has `id`, `label`, `events`, `basics`, `sections`, `defaults`, `render` and `mini`. Basics and section fields carry a stable key, label and field type. Optional list schemas declare their item fields and blank-item factory. `defaults()` supplies initial values. `render(data, template, options)` returns the invitation DOM root; `mini` returns the scaled static preview. The five original layouts and the platform layout remain registered for stored invitations.

## Version 4 state

- `templateId` identifies a registered template; `layoutId` selects its renderer.
- `basics` contains event title, host names, event date/time, venue and related details.
- `sections` maps section IDs to schema-backed content, including an `on` visibility flag.
- `order` is the unique ordered list of section IDs to display.
- `nameFont`, `bodyFont`, `accent`, `btnShape`, `spacing` retain the original design controls.
- `theme` contains allowlisted global design settings.
- `elementStyles` maps stable field paths to allowlisted CSS values.
- `elementLinks` maps section button paths to supported HTTPS, email or section-anchor URLs.
- `sectionTypes` maps copied section IDs to their original schema type. Hero, RSVP, contact and date are not duplicable; at most 20 additional sections are accepted.

Template content deep-merges over layout defaults; arrays replace their default array. Existing template IDs, photo IDs and field paths must remain stable. Paid invitations retain their purchased design and event date. The server validates content with `server/invitation-state.mjs` before persistence. Unsupported fields do not grant new features or permissions.

## Editing and rendering

Editable DOM nodes carry `data-field` and `data-editable`; image/button/section controls use `data-edit-type`. `EVER_EDITOR` owns changes, undo/redo, section operations, links, theme updates and autosave. Renderers escape text with `EVER_esc` and constrain user-provided URLs. Do not insert raw user HTML.

The active edition catalogue adds `artDirection` and `editionScene` while reusing the platform schema. `editions-layout.js` creates each composition before element styles are applied. Archived templates keep their original renderer; removing an archived catalogue entry can break saved invitations.

## Lifecycle

`EVER_bindSite` installs guest interactions. Preview replacement calls `__premiumDispose` and `__muDisposers` to release animations, observers, listeners and timers. Thumbnail removal calls `__dispose` to stop resize observation. Catalogue/editor previews stay static; guest WebGL scenes load lazily. Reduced-motion preferences leave content and guest controls usable.

Add tests for changes to serialization, validation, expiry, payment state or renderer lifecycle. Run the current-edition and archived-platform browser suites after renderer changes.
