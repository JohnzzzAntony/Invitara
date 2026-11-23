# Issue tracker — audit of 23 Nov 2026

Source: `Momentsiz_Website_Audit_and_Improvement_Roadmap.md` (a public-page review, not a backend test). Each finding was checked against this repository before being classified.

Status values: **Confirmed** (reproduced in code), **Not reproduced**, **Needs testing**, **Improvement**, **Blocked** (needs owner input or credentials), **Fixed** (confirmed, then fixed with a test).
Severity: **P0** security/data/payment integrity · **P1** broken core journey · **P2** UX/performance/SEO · **P3** optional feature.

## Architecture (verified)

Express 5 on Node 24, SQLite (`node:sqlite`, WAL) in `DATA_DIR`, static HTML pages in `frontend/public` with server-side metadata injection (`backend/page-meta.mjs`, `backend/seo.mjs`). Sessions are an HttpOnly cookie holding a random token, stored as a SHA-256 hash. Payments use Stripe hosted Checkout with signed webhooks. The AI builder uses the NVIDIA API Catalog (`backend/ai.mjs`). Photos are validated data URLs or library/HTTPS URLs inside invitation JSON; there is no file-upload endpoint. Docker deploys to Railway or Render with a persistent volume. There is no admin UI and no CI configuration in the repo.

## Findings

| ID | Finding (route) | Sev | Status | Evidence | Fix / test | Acceptance |
|---|---|---|---|---|---|---|
| MOM-001 | Recovery was key-only; no email reset (`/account.html`, `/api/auth/*`) | P0 | **Fixed** (email delivery Blocked on credentials) | `backend/auth.mjs` had only `recover` with a recovery code | Email reset with single-use, hashed, 30-minute tokens; fragment-only link; generic replies; per-email limit; sessions revoked; `auth_events` audit. Tests: `password-reset.test.mjs`, `security-regression.test.mjs` | Valid, reused, expired, invalid and throttled tokens behave correctly ✔. Real delivery needs `RESEND_API_KEY` |
| MOM-002 | Recovery-code regeneration and sign-out everywhere | P0 | **Fixed** | Not present before | `POST /api/auth/recovery-code` (needs current password), `POST /api/auth/logout-all` | Old code rejected after regeneration ✔; other sessions revoked ✔ |
| MOM-003 | Email verification at signup | P1 | **Blocked** | No email provider configured | Owner decision D6 | — |
| MOM-004 | Support details not published (`/contact.html`) | P1 | **Not reproduced** in code; deployment-dependent | Production refuses to boot without `SUPPORT_EMAIL`; the email is now also rendered on the server | `backend/seo.mjs` contact replace | Contact page shows the configured email without JavaScript ✔ |
| MOM-005 | Price shown as AED 103.95 incl. VAT on one page and AED 99 + VAT on another | P2 | **Fixed** (owner confirmation D1) | `index.html` vs `pricing.html`, `seo.mjs` FAQs | `startingPrice` returns the VAT-inclusive quote; copy updated; a dead pricing replace (`79`) fixed | Every page shows AED 103.95, broken down as 99 + 4.95 ✔. The charged amount was already 103.95 |
| MOM-006 | Purchased date could not change | P2 | **Fixed** — **policy needs owner approval (D2)** | `PUT /api/projects/:id` rejects date changes | `POST /api/projects/:id/reschedule`, once per purchase; terms updated | Covered by `guest-features.test.mjs` ✔ |
| MOM-007 | Cookie-based RSVP identity allows duplicates | P2 | **Confirmed → Fixed (opt-in)** | Replies keyed by browser session hash | Personal guest links: 128-bit tokens; reply keyed to the guest; name pre-filled | Same guest from 2 devices = 1 reply ✔; invalid token 400 ✔ |
| MOM-008 | Object-level authorization | P0 | **Not reproduced** | `owned()` filters by owner on every private route | `security-regression.test.mjs` runs 11 private routes as another account → 404, data unchanged | ✔ |
| MOM-009 | Payment verified only by redirect | P0 | **Not reproduced** | Webhook signature + session registration + amount + currency; reconcile retrieves from Stripe | Existing `api.test.mjs`, `payment-reconcile.test.mjs`, `checkout-retry.test.mjs`; discount check added in `guest-features.test.mjs` | ✔ |
| MOM-010 | Refunds do not revoke access | P0/P2 | **Confirmed — Blocked (D4)** | No refund event handling | Owner must define the refund policy first | — |
| MOM-011 | XSS in invitation content | P0 | **Not reproduced** | 114 themes × every text field (10,426 fields) rendered with HTML payloads: 0 injected nodes; CSP `script-src 'self'` | Browser check (see `docs/QA.md`) | ✔ |
| MOM-012 | Upload validation | P1 | **Partially confirmed** | MIME + magic bytes + size checked; pixel dimensions not checked; no upload endpoint | Improvement: dimension check | — |
| MOM-013 | CSV formula injection | P1 | **Not reproduced** | Dashboard export prefixes `= + - @ tab CR` | — | ✔ |
| MOM-014 | Rate limits | P0 | **Not reproduced** | auth 15/min/IP + 10/min/email; reset 3/min/email; AI 20/min IP+account; RSVP 30/min; QR 30/min; checkout 10/min | — | ✔ |
| MOM-015 | Security headers / CSRF | P0 | **Not reproduced** | CSP, X-Frame-Options DENY, nosniff, Referrer-Policy, HSTS in production; non-GET API requires exact `Origin` | `api.test.mjs` asserts headers | ✔ |
| MOM-016 | "Eight opening styles" vs two visible | P2 | **Needs testing** on live deploy | Not reproduced locally | — | — |
| MOM-017 | Homepage hero, how-it-works, FAQ, pricing | P2 | **Not reproduced** | All present (`index.html`) | — | — |
| MOM-018 | Gallery filters, empty/error states | P2 | **Not reproduced** | See `docs/RELEASE-READINESS.md` | — | — |
| MOM-019 | Autosave, retry, undo/redo | P1 | **Not reproduced** | Present in editor | — | — |
| MOM-020 | Metadata, canonical, sitemap, robots, noindex | P2 | **Not reproduced** | 20/20 sitemap URLs return 200; one title, description, canonical, h1 and JSON-LD per public page; private pages noindex; 49/49 internal links return 200 | — | ✔ |
| MOM-021 | Share previews show date, venue and city | P2 | **Improvement — owner decision D9** | `page-meta.mjs` uses event details in OG tags for invitations | — | — |
| MOM-022 | Performance not measured | P2 | **Measured (lab)** | See `docs/PERFORMANCE.md` | `scripts/perf-check.mjs` | — |
| MOM-023 | Browser test suites fail | P1 | **Confirmed, pre-existing** (same failures on `97c0a2e`) | Selectors from the old homepage and a full-screen menu | Update the suites to the current UI | All 5 suites green |
| MOM-029 | Editor overflow at 768 px after a resize from mobile | P2 | **Needs testing** | `test:platform`; not reproduced on a direct load | — | No horizontal scroll at 320–1920 px |
| MOM-024 | WhatsApp share, calendar, maps | P3 | **Fixed** | — | Share-dialog links; `.ics` with TZID; Maps link | Browser verified ✔ |
| MOM-025 | RSVP deadline, check-in, CSV columns | P3 | **Fixed** | — | `guest-features.test.mjs` | ✔ |
| MOM-026 | Promo codes | P3 | **Fixed** (inert until codes exist in Stripe; D3) | — | Fulfilment requires subtotal = quote when discounted | ✔ |
| MOM-027 | Arabic/RTL, Hindi, Malayalam | P3 | **Blocked (D7)** | Needs reviewed translations and per-layout QA | — | — |
| MOM-028 | Agency/white-label, custom domains, A/B testing, galleries, thank-you cards, co-hosts, watermark demo | P3 | **Backlog** | — | — | — |
