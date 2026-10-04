# Architecture

Invitara runs one Node 24+ Express process with a persistent SQLite database. Browser pages use plain JavaScript, HTML and CSS. Anime.js, Motion and Three.js source is bundled with esbuild; GSAP distributions are copied from the pinned package during the same build. There is no Next.js, React or TypeScript application.

## Runtime map

- `public/*.html`: storefront, catalogue, details, checkout, account, dashboard, editor and guest page. Older landing URLs redirect to the current catalogue.
- `public/js/templates.js`: version 4 invitation state, layout registry, defaults, safe text/URL helpers and rendering dispatch.
- `public/js/mu.js`, `layouts/collection.js`, `platform-catalog.js`, `layouts/platform.js`: shared schema plus archived designs needed by saved invitations.
- `public/js/editions-*.js`, `public/css/editions.css`: the 14 active designs and their guest controls. Data-field paths preserve editor compatibility.
- `public/js/editor.js`: editor state, autosave, history, sections and publishing. `visual-editor.js` and `platform-editor.js` provide contextual controls.
- `public/js/commerce.js`: client pricing/validation and local drafts. Server-side checks remain authoritative.
- `public/js/api.js`: JSON requests and batched cache updates. `account.js`, `dashboard-studio.js`, `checkout.js`, `invite-live.js`: API consumers.
- `src/editions-motion.js`, `src/editions-scenes.js`: animation sources with disposal, reduced-motion and visibility controls. Generated output lives in `public/vendor/editions`.
- `server/index.mjs`: application setup, middleware, routes, Stripe webhooks and database access.
- `server/catalog.mjs`: loads the same registered catalogue used by browsers for authoritative pricing and validation.
- `server/invitation-state.mjs`: validates fields, added sections, element styles, theme settings and links.
- `server/auth.mjs`: salted scrypt passwords, sessions, one-use recovery codes and account routes.
- `server/access.mjs`: event timezone expiry and paid access rules.
- `config/security-headers.mjs`: response headers. Production adds HSTS.

## Persistence and boundaries

SQLite runs in WAL mode. `projects` stores owner IDs and JSON invitation records; `sessions` maps Stripe checkout sessions to projects; `accounts` stores password/recovery hashes; `account_sessions` stores hashed session tokens and expiry. `replies` is keyed by project and guest token. `invitation_views` deduplicates project/visitor pairs. Owner and checkout indexes support common lookups. Dashboard counts are fetched with the project query.

Local storage retains drafts and a cache of server projects/orders. Cache refresh writes projects and orders once each, retaining local drafts and dropping only cached paid state on quota pressure. Local data never grants paid access. Ownership, payment, event date and expiry are checked by API routes. Only matching signed Stripe webhooks mark payments complete.

Public links contain an invitation ID. The guest endpoint serves only paid, published invitations; replies and QR sharing require their respective access checks. No guest list is included in public payloads. Non-read API requests require the configured Origin; the Stripe webhook is verified separately over its raw body.

## Compatibility and source assets

Archived designs, photo IDs, fonts and vendor source remain because existing drafts or purchased invitations may reference them. A source-code reference scan alone cannot prove stored media is unused. `scripts/scope-css.mjs`, `gen-photos.mjs` and `extract-sections.mjs` retain supported vendor-source workflows. They are not run by the production build.

See [deployment](DEPLOY.md), [platform details](PLATFORM-UPGRADE.md), [editor](PREMIUM-EDITOR.md) and [state contract](LAYOUT-SPEC.md). Historical design audits describe earlier versions and are not deployment instructions.
