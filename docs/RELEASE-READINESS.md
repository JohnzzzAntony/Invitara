# Invitara release readiness — 7 October 2026

## Result

Local release candidate; production acceptance remains open. This file reconciles the supplied **Invitara Full UI/UX Functional Security Deployment Report** with the current application. The supplied report is audit input, not authorization to change production accounts, credentials, prices or customer records.

The application is Express/SQLite, not Next.js or Tailwind. The obsolete Next scaffold is absent; the supplied AGENTS.md is retained. The catalogue is bundled JavaScript, not a template database/API. Both the local and Railway homepage rendered six featured designs during this review; the full local catalogue contains 14 active editions and preserves 54 archived designs. The reported general empty-catalogue outage was not reproduced. No template records were fabricated or seeded.

## Changes

- Catalogue: loading/error/retry treatment, separate genuine no-match state, case-insensitive supported filters, baby-shower/save-the-date/bridal-shower aliases, and recovery from unknown URL filters. Shared hidden-state CSS prevents component display rules from exposing hidden controls.
- Homepage: direct digital invitation/RSVP description, no-subscription messaging, actual catalogue-derived VAT-inclusive starting price (currently AED 82.95), and accessible FAQ disclosures explaining drafts, privacy, expiry and recovery.
- Accounts: copy/download recovery key, explicit acknowledgment before continuing, focused key display, and visible account errors outside the form when signed in.
- Navigation: mobile scroll locking, keyboard cycling, Escape/outside/link closing and focus restoration.
- Landing pages: the former occasion pages (`wedding-invitations.html` etc.) were meta-refresh stubs that dropped every visitor on the unfiltered catalogue with stale "five experiences" copy. They are now server 301 redirects that keep the occasion filter (`/create.html?occasion=wedding`); `plan.html` redirects to pricing. Checkout no longer sends older plan-less drafts to that dead page; it assigns the single plan.
- Autosave states: "Saving…", "✓ Saved", and on failure "Couldn’t save" with a Retry save button plus a one-time toast stating the previous version is safe. The failure is now visible on phones, where the status was previously hidden.
- Draft reliability: failed project storage writes return failure; the editor no longer reports success if its project copy could not be stored. Existing Save is the retry action. Failed creation explains storage limitations.
- API: bounded fetch wait and actionable connection/timeout errors.
- Checkout: expired Stripe sessions can be replaced for the same invitation. Concurrent retries use a stable replacement idempotency key; historical session mappings remain available for delayed signed webhook verification.
- Publish: explicitly explains that anyone with the link can view the invitation; guest replies remain private.
- Image fields: server-side allowlist of library IDs, asset paths and HTTP(S) URLs; data images require JPEG/PNG/WebP MIME, matching file signature and size bounds. Executable data, credential-bearing URLs and traversal paths are rejected. This is signature validation, not full image decoding or malware scanning. Browser uploads are already resized and re-encoded; remote image URLs are not fetched by the server.
- SEO: server-rendered canonical/Open Graph metadata, escaped event title/date/venue for published invitations, account/editor/checkout/dashboard noindex, pricing in sitemap, and Permissions-Policy. Social cards use bundled artwork rather than exposing uploaded photographs to crawlers.

## Design decisions

Refined editorial: warm paper, olive ink, Manrope application type, independently styled invitation artwork and restrained existing Anime.js choreography. The overlapping invitation covers remain the visual anchor. Existing tokens, 1200px container, responsive spacing and 48px controls are retained. Feasibility score: 15 (impact 4 + fit 5 + feasibility 5 + performance 5 − consistency risk 4). The requested skills informed accessibility, token consistency, motion, restrained changes and concise reporting. Adding Tailwind or replacing working animations would introduce an unnecessary framework migration.

## Report coverage

| Report areas | Disposition |
| --- | --- |
| 3, 7–10: discovery, filters, cards, preview, customize | Existing real catalogue/preview/editor verified; failure recovery and URL normalization added. There is no template API to repair. |
| 4–6, 21–22, 26–35, 50–53, 63–66: journey, clarity, design, motion, accessibility | Existing refined design retained; pricing/FAQ/copy/navigation/states improved. Responsive and reduced-motion checks pass. Full WCAG conformance and measured field performance are not claimed. |
| 11–12, 37: authentication and recovery | Existing scrypt, hashed recovery tokens, rotation/session revocation and rate limits verified by tests. Recovery acknowledgment and copy UX added. Email verification/reset delivery remain unsupported and are disclosed. |
| 13–16, 23–25: dashboard/editor/guest/RSVP | Existing save, undo/redo, preview, publish, replies/search/CSV and outage retry exercised. Draft quota failure fixed. Only backend-supported yes/no attendance and meal/guest fields are offered; no invented pending/maybe counts. |
| 17–19, 38–42: privacy/security | Ownership, session-bound replies, origin enforcement, signed payment and validation tests pass. Publish privacy notice, photo validation and Permissions-Policy added. Existing inline CSP allowance remains; this is not a penetration-test certification. |
| 20: payment edge cases | Signed webhook, amount/currency/session ownership, unpaid access, expiry and duplicate handling tested. Expired-session concurrent retry regression added. Real hosted checkout and provider webhook delivery remain operator acceptance gates. Refund revocation remains an operator workflow. |
| 36: uploads | Signature/size/type/path checks added. No executable upload route or server-side remote fetch exists. Full decoder/dimension inspection and malware scanning are not implemented. |
| 43–45: database/time/expiry | Existing SQLite parameterized queries, indexes, WAL and timezone rules verified locally. Backups and restore instructions exist; production restore and volume permissions require infrastructure access. |
| 46–49: sharing/SEO/404 (legacy landing redirects added) | Existing QR/native sharing/CSV and branded 404 retained. Dynamic event metadata/canonicals/noindex/sitemap improved. Existing public URLs remain compatible; a URL migration is not necessary to restore functionality. |
| 54–61, 68–71: acceptance/performance/deployment | Local suites below pass. Production operational gates below remain open. |
| 62, 67: real functionality/product structure | Existing working routes preserved. No fabricated testimonials, counters, reviews or purchase simulation added. |

## Verification

- Lint and production build pass; build validates browser/server syntax, module imports and local asset references.
- Backend tests cover expiry/DST, authentication/recovery, ownership, RSVP privacy, signed webhooks, checkout retries, schema/style/link/photo validation, metadata escaping and cache/storage behavior.
- Refinement suite: 104 responsive checks plus filter aliases/invalid filters and a simulated missing-catalogue-script retry; navigation, account acknowledgment, draft editor, checkout and dashboard outages.
- Paid browser suite: seven isolated paid fixtures, including current Vow and archived Book; saving, locked dates, publish, public RSVP, QR, dashboard and expiry.
- Visual editor suite: nine widths; text editing, undo/redo, presets, image controls, preview, mobile inspector and sections.
- Editions suite: 14 active editions, all occasions, nine catalogue widths, four guest widths, interactive openings, six Three.js scenes and reduced motion.
- Storefront suite: original five invitation interactions, no JavaScript errors or missing local assets.
- Production npm dependency audit: zero reported vulnerabilities at verification time.

Screenshots and machine-readable results are in ignored `artifacts/`, including `artifacts/refinement/`. Tests use isolated synthetic data and no real payments. Initial sandbox process restrictions required running test subprocesses outside the sandbox. Test fixture issues (browser globals, Windows import URL and cookie parsing) were corrected before passing reruns.

## Open production acceptance gates

1. Deploy this candidate, then verify real Stripe **test-mode** hosted checkout, failed/cancelled payments, provider retries and signed webhook delivery. No live card transaction was performed.
2. Confirm Railway persistent volume, operator details, proxy topology, HTTPS, matching Stripe mode/secrets and backup schedule. Perform a restore into a separate environment and a redeploy persistence test. Docker/Railway CLI are unavailable here.
3. Measure Lighthouse/Core Web Vitals under throttling and validate physical iOS Safari, Firefox, Android and WhatsApp browsers. Edge/Chromium automated checks do not prove those environments or performance targets.
4. Review asset/font licences, actual business policies, support/deletion/refund operations and the current inline CSP allowance before live sales. Automatic refund-based revocation remains unimplemented.

No deployment, production configuration change, production data mutation or claim that every report recommendation is complete is made by this pass.
