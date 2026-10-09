# Backend

This directory runs on Node 24+ and is never served as static website content.
Start it from the repository root with `npm run dev` or `npm start`.

| File | Responsibility |
| --- | --- |
| `index.mjs` | Express app, middleware, SQLite access, payment/RSVP routes and static frontend serving |
| `auth.mjs` | Accounts, password hashing, sessions and recovery |
| `access.mjs` | Event timezone expiry and paid editing access |
| `catalog.mjs` | Load frontend catalogue/schema scripts for authoritative validation and pricing |
| `invitation-state.mjs` | Validate invitation fields, sections, links and styles |
| `photo.mjs` | Validate photo values |
| `origin.mjs` | Normalize the configured application origin |
| `page-meta.mjs` | Add metadata to frontend HTML |
| `seo.mjs` | Occasion routes, SEO data, sitemap and crawler content |

Browser requests use `/api/*`. Static content comes only from
`frontend/public/`; markup and design changes belong there. The catalogue
loader intentionally shares the existing browser schema rather than copying
prices or design definitions into another source of truth.

Settings come from environment variables documented in the root `.env.example`.
SQLite lives in root `data/` by default, or `DATA_DIR` when configured. Moving
source files does not move or reset stored accounts, purchases or guest replies.

Run `npm test` for isolated test databases, and `npm run lint` and `npm run build`
before shipping. See `docs/DEPLOY.md` and `docs/RAILWAY.md` for deployment.
