# Development scripts

Run npm commands from the repository root. These scripts are not browser code.

| Command | Script | Purpose |
| --- | --- | --- |
| `npm run build:motion` | `build-motion.mjs` | Bundle `frontend/motion/` and copy GSAP into `frontend/public/vendor/` |
| `npm run check` | `check.mjs` | Check JavaScript syntax/imports and HTML/CSS local references |
| `npm run test:browser` | `browser-check.mjs` | Storefront and original invitation flows |
| `npm run test:visual-editor` | `visual-editor-check.mjs` | Visual editing controls |
| `npm run test:refinement` | `refinement-check.mjs` | Navigation, accessibility and responsive layouts |
| `npm run test:paid-browser` | `paid-browser-check.mjs` | Paid editing with an isolated local database |
| `npm run test:platform` | `platform-check.mjs` | Earlier designs retained for saved invitations |
| `npm run test:openings` | `openings-check.mjs` | Invitation opening interactions |
| `npm run test:book` | `book-check.mjs` | Book invitation interactions |
| `npm run test:editions` | `editions-check.mjs` | Edition catalogue, animations and breakpoints |

Most browser checks require a running app at `TEST_ORIGIN` (default
http://localhost:3000) and Edge. The paid-browser check starts its own app.
Screenshots and reports go in ignored `artifacts/`.

## Asset maintenance

These commands rewrite source files; run them only when intentionally changing
the corresponding asset library:

- `node scripts/gen-photos.mjs`: rebuild the photo registry in `frontend/public/js/templates.js`.
- `node scripts/scope-css.mjs`: rebuild `frontend/public/css/mu.css` from original `vendor/muhibbi-template/assets/` styles.

The unused template-section extractor and its generated text excerpts were
removed. Original vendor source stays available for the CSS workflow.
