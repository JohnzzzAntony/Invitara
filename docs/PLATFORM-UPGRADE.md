# Invitation platform upgrade

## What ships

- 14 active, individually art-directed editions across all 14 catalogue occasions. The previous 54 designs are archived from discovery, with saved invitations still supported.
- Homepage occasion and experience discovery; searchable/filterable catalogue with pagination; dedicated interactive template details and related designs.
- Classic, Story, Book, Magazine, Cinematic, Reveal, Timeline and Gallery rendering. Book supports tap, keyboard arrows, swipe, natural scroll and desktop spreads. Gallery includes a keyboard/swipe lightbox.
- Guided creation toolbar, inline text editing, contextual image/button/section controls, optional text/image/button/divider/directions blocks, section duplication/reordering, autosave and undo/redo.
- Eight theme presets, saved personal theme, typography, colours, layout, image treatments, decorative details and reduced-motion settings. Photo uploads are resized before storage; fit and focal-point controls provide nondestructive cropping.
- Real guest preview in the editor and dashboard, mobile/desktop checks before publishing, authenticated QR generation, copy/open/native sharing.
- RSVP meal choices, guest search/attendance filtering, CSV export, private reply counts and unique browser-session view counts. Host previews do not add views.

## Data and extension points

`public/js/platform-catalog.js` defines occasion, style, palette, experience and template content independently. New visual variants reuse `public/js/layouts/platform.js`, whose section schemas drive both the editor and server validation. `public/js/platform-experiences.js` binds guest interactions and disposes timers, observers, animations and lightboxes when a preview changes.

The existing v4 invitation state adds optional `theme`, `elementStyles`, `elementLinks` and `sectionTypes`. Section `order` remains the source of display order. Each rendered editable node has a stable element identity plus its logical data path. This is the foundation for a future internal template builder; no public admin permissions or arbitrary HTML/CSS execution were added.

The server loads the same catalogue to calculate prices and validate fields. Paid invitations retain their purchased template and event date. Style properties, theme choices and link schemes are allowlisted. QR endpoints require ownership and published/paid state. Views use a separate SQLite table with one row per invitation/session hash, not fabricated analytics.

Existing invitations remain on their original renderers and continue to support their original interactive openings.

## Verification

Run the local server with `npm start`, then:

```sh
npm run check
npm test
npm run test:browser
npm run test:visual-editor
npm run test:editions
npm run test:platform
npm run test:paid-browser
```

The platform suite checks Wedding → Luxury → Book → edit → saved theme → mobile preview, all eight engines, gallery interaction, and 320/375/390/414/768/1024/1280/1440/1920px app layouts. The paid browser suite uses seven isolated fixtures, including the new Vow edition and archived Book, to verify saving, fixed dates, publishing, QR, meals, public replies, dashboard and expiry. Server tests cover ownership, signed payment webhooks, style/theme rejection, QR privacy and view deduplication.

Screenshots are written to ignored `artifacts/`. Browser suites use installed Microsoft Edge. Real payment transactions are not made by these tests.

## Deployment

The local implementation runs at `http://localhost:3000`. Production still requires the real HTTPS `APP_ORIGIN`, persistent `DATA_DIR`, Stripe secret and webhook keys, `BUSINESS_NAME` and `SUPPORT_EMAIL` from `.env.example`. Configure the webhook for checkout completion and asynchronous payment success. Back up the SQLite database and protect the persistent volume.

Current local Stripe credentials are absent. Draft creation and editing work; live purchasing correctly reports that payments are unconfigured. This upgrade has not been deployed or exercised with a live card transaction.


## Signature collection and motion

`editions-catalog.js` declares the 14 active compositions and archives earlier variants. `editions-layout.js` creates a different hero structure for each edition while preserving editor field paths and shared RSVP schemas. `editions.css` supplies independent typography, spatial composition, artwork and supporting-section treatments. `editions-experience.js` owns progressive-enhancement controls: chapter navigation, postcard date reveal, courtyard doors and accessible galleries.

`src/editions-motion.js` uses Anime.js for hero choreography and Motion for section entrances. `src/editions-scenes.js` renders rings, a nursery mobile, a mirrorball, an architectural sculpture, a crescent and snow with Three.js. Run `npm run build:motion` to bundle locally; no runtime CDN is needed. Static previews and editor canvases allocate no WebGL contexts. Guests load the scene chunk only when needed; reduced motion retains static artwork and functional controls. Loops pause offscreen, in hidden tabs and on user request. Scene cleanup releases GPU resources, animation frames, observers and listeners. Canvas rendering caps pixel ratio at 1.5 and frame rate near 30 fps.

The editions browser test checks 14 distinct art-direction keys and occasion coverage; visual screenshots still require human judgment. It does not assert an Awwwards award or customer conversion improvement.
