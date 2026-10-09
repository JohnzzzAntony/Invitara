# Frontend design guide

All website design files live here. No React or Next.js build is involved.

```text
frontend/
  public/
    *.html       Page markup
    css/         Page, editor and invitation styles
    js/          Browser behavior and invitation renderers
    assets/      Site photos, logo and video
    mu/          Original invitation photography and fonts
    vendor/      Generated animation bundles and GSAP distributions
  motion/        Editable animation source, bundled with esbuild
```

## Run and preview

From the repository root, run `npm run dev` and open http://localhost:3000.
Edit HTML, CSS or browser JavaScript, then refresh the browser. After editing
`motion/`, run `npm run build:motion` and refresh. Do not edit generated files
in `public/vendor/`. `npm run build` also checks local HTML/CSS references and
JavaScript imports. Payment credentials are unnecessary for browsing and drafts.

Use the running app for previews: opening HTML directly from the filesystem
does not provide the API, root-relative animation imports or occasion routes.

## Find the design you want to change

Paths below are relative to `frontend/public/`.

| Area | Markup | Behavior | Main styles |
| --- | --- | --- | --- |
| Homepage | `index.html` | `js/shop.js`, `js/collection-carousel.js` | `css/site.css`, `css/studio.css` |
| Collection | `create.html` | `js/shop.js`, `js/platform-cards.js` | `css/platform-app.css`, `css/site.css` |
| Design details | `design.html` | `js/template-detail.js` | `css/studio.css`, `css/premium.css` |
| Invitation preview | `demo.html` | `js/demo.js` | Styles belonging to the selected invitation |
| Editor | `editor.html` | `js/editor.js`, `js/visual-editor.js`, `js/platform-editor.js`, `js/editor-mobile.js` | `css/commerce.css`, `css/premium.css`, `css/refinement.css` |
| Account | `account.html` | `js/account.js` | `css/studio.css`, `css/premium.css` |
| Dashboard | `dashboard.html` | `js/dashboard-studio.js` | `css/studio.css`, `css/premium.css` |
| Checkout | `checkout.html` | `js/checkout.js` | `css/studio.css`, `css/premium.css` |
| Published invitation | `invite.html` | `js/invite-live.js` | Styles belonging to the selected invitation |

Shared navigation is in `js/navigation.js`. CSS is layered in each page's
`<head>`; later styles override earlier ones. Preserve that order when styling.

## Invitation artwork versus app chrome

- `js/editions-catalog.js` defines the 14 edition designs and default content.
- `js/editions-layout.js` and `css/editions.css` render their artwork.
- `js/editions-experience.js` and `../motion/editions-*.js` handle guest interactions and animation.
- `js/premium-catalog.js`, `js/premium-layout.js` and `css/premium-wedding.css` contain the five premium wedding designs.
- `js/templates.js` holds the common state schema, defaults and registry.
- `js/mu.js`, `js/layouts/`, `js/platform-catalog.js` and `js/platform-experiences.js` support older saved designs too.

Change page CSS for the storefront/editor; change invitation CSS and renderers
for the guest-facing artwork. Keep existing template IDs, photo IDs and field
paths stable so saved invitations remain editable.

## API boundary

`js/api.js` is the browser's JSON API client. `js/commerce.js` handles local
drafts and client-side pricing helpers. The backend independently checks
ownership, prices, payment and expiry. Never put credentials in this directory.

The backend loads the catalogue/schema registration scripts in a sandbox to
share the existing invitation contract. Those scripts must remain usable without
a browser DOM during registration; rendering functions run only in the browser.

## Premium wedding collection

The five designs use premium-experience.js, premium-showroom.js and locally bundled premium-motion.js. Optimized photographs, an optional ambient track and the destination motion plate live in assets/premium/. See [implementation notes](../docs/PREMIUM-WEDDING-IMPLEMENTATION.md). Run npm run test:premium for browser interaction checks.