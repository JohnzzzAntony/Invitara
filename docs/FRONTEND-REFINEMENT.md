# Invitara frontend refinement

## Direction and design system

Refined editorial: warm paper, olive ink, quiet borders and real invitation artwork.
Manrope is the single font for application headings, body text, navigation and
controls. The invitation designs retain their own editable typography.
The overlapping invitation covers remain the recognizable brand anchor.

Design feasibility score: 15 (impact 4, fit 5, feasibility 5, performance 5,
consistency risk 4). The skill's generated recommendations were reviewed; glass
effects and a blue/orange palette were unsuitable for the existing brand and the
brief's restrained motion requirements.

`public/css/refinement.css` is the shared application layer, loaded after existing
invitation styles. It owns the container, spacing, type hierarchy, controls, cards,
navigation and responsive application surfaces. Selectors target application
chrome and preserve the independently scoped invitation artwork. Existing legacy
styles remain available for purchased invitations and stored drafts.

- Container: 1200px; 24px side gutters, 20px on mobile.
- Sections: 72–112px; compact groups: 12–32px.
- Hero: 44–64px desktop, 34–44px mobile.
- Section titles: 30–44px; body: 16–17px; controls: 12–16px.
- Paper `#f7f5ef`, ink `#293b32`, muted `#626b61`, olive `#596c43`.
- Surfaces `#fffef9` / `#eceee3`; accent `#dce7b9`; borders `#d9ddd1`.
- Controls: 48px; pills for actions; 12px input radius; 18px card radius.
- Motion: short hover feedback, existing hero entrance, reduced-motion support.

## Audit and route map

The application is Express with static HTML/CSS/JavaScript. No Next.js or
TypeScript package is present. There is no separate About or Contact route;
the footer links to existing destinations. Operator details remain on legal pages.

| Route | Components / behavior | Refinement |
| --- | --- | --- |
| `/`, `index.html` | Hero, 14 occasions, 8 experiences, featured collection, search/sort, features, real scratch reveal, process, CTA | Shared gutters, type hierarchy, aligned 3:4 previews, meaningful SVG icons, mobile flow, structured footer |
| `create.html` | Occasion/style/experience filters, search/sort, pagination, template selection | Readable controls, consistent grid, empty-state reset, active navigation |
| `design.html` | Real interactive preview, device controls, use template, related designs | Balanced preview/details, consistent type and cards |
| `demo.html` | Full interactive invitation, device switch, start editing | Existing invitation styles preserved |
| `pricing.html` | Catalogue-backed prices, experience links, included features | Equal-width cards, aligned actions, mobile stacking |
| `account.html` | Sign in, register, recovery, recovery download, sign out | Form rhythm, password guidance, keyboard tabs and panel semantics |
| `dashboard.html` | Draft/paid invitations, status/search, previews, sharing/QR, replies/CSV, purchases | Consistent cards, loading skeleton, contextual error/retry, reply loading/retry |
| `editor.html` | Sections/theme, canvas, inspector, undo/redo, autosave, preview, publish | Larger settings text/controls, rounded actions, mobile shell spacing |
| `checkout.html` | Server authentication, real quote, event date/timezone, consent, hosted Stripe | Balanced columns, consistent inputs, readable summary and mobile stacking |
| `invite.html` | Paid published invitation, RSVP submit/update, expiry | Loading surface, styled unavailable state, real retry |
| `terms.html`, `privacy.html` | Legal content, operator configuration | Readable line length/type, common navigation/footer |
| `404.html` | Return to collection | Common shell and typography |
| `plan.html`, `layouts-test.html` | Existing compatibility redirects | Existing destinations preserved |
| Occasion landing URLs | Anniversary, baby shower, baptism, birthday, gala, housewarming, wedding | Existing catalogue redirects preserved |
| Product landing URLs | Digital invitations, online RSVP | Existing catalogue redirects preserved |

Audit findings: multiple competing layout rules, 9–11px control text, uneven
template treatments, sharp and pill actions mixed, dense tablet navigation, short
feature descriptions with forced wrapping, incomplete footer hierarchy, missing
async loading/retry treatment, and duplicate account API script loading.

## Functionality boundaries

Template selection continues through `INVITARA_CARDS.use`, the existing draft store
and editor. Catalog filters and pricing read the same registered catalogue.
`api.js`, `commerce.js`, authentication endpoints, Stripe, invitation state,
database schema and authorization contracts are preserved.

Dashboard/reply loading states reflect actual API requests. Catalogue and template
detail rendering use local bundled data synchronously, so no artificial loading
delay was introduced. Card images use lazy loading; hero artwork remains eager.
Decorative miniature invitation previews are hidden from assistive technology and
made inert; their real preview and selection actions remain keyboard-accessible.

## Validation

- `npm run build`: production bundles, JS syntax/imports and local HTML/CSS links.
- `npm run lint`: lint without warnings.
- `npm test`: backend contracts, authentication, checkout/webhooks, ownership,
  RSVP privacy, expiry, validation and production boot.
- `npm run test:browser`: storefront, legacy invitation interactions, filtering,
  responsive editor and reduced motion.
- `npm run test:visual-editor`: inline editing, persistence, undo/redo, presets,
  image controls, preview, inspector, section management, dashboard and pricing.
- `npm run test:paid-browser`: isolated paid invitation fixtures, publish, real
  public RSVP, QR, dashboard, expiry and checkout configuration handling.
- `npm run test:refinement`: application routes at 1440, 1280, 1024, 768, 430,
  390, 375 and 320px, navigation close behavior, sorting, pagination, filter reset,
  registration, draft editing, preview, checkout and outage/retry recovery.

Screenshots and machine-readable responsive results are saved under
`artifacts/refinement/`. Tests use local isolated data; no production purchase or
deployment is performed. Stripe payment completion is covered by server webhook
tests; a live card transaction requires configured Stripe credentials.

Verified on 5 October 2026: production build and lint passed; all 13 backend
tests passed; storefront, visual editor, paid invitation and edition suites passed.
The refinement suite passed 104 responsive checks across the eight requested
widths with no JavaScript errors. The paid suite additionally confirmed seven
paid editors, publishing, public RSVP, QR sharing, dashboard and checkout handling.
