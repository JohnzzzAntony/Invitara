# Production cleanup report — 4 October 2026

This pass preserves the existing design catalogue, prices, payment rules, event expiry, saved invitations and public routes. The repository already had substantial uncommitted development changes; pre-existing deletions are not counted below. No customer database, uploaded media, saved invitation or account was removed.

## 1. Files removed

- `next.config.ts`
- `next-env.d.ts`
- `tsconfig.json`
- `src/app/page.tsx`
- `src/app/layout.tsx`
- `bun.lock`
- `scripts/check-public-js.mjs`
- `scripts/gen-deploy-headers.mjs`
- `scripts/set-domain.mjs`
- `scripts/catalogue.mjs`
- `scripts/gen-landing.mjs`
- `scripts/landing-content.mjs`
- `scripts/sync-seo.mjs`

The obsolete `.next/` generated cache and empty `src/app/` directory were removed. The deleted scripts belonged only to the old Next/static-host and generated-landing pipeline; current redirect routes remain available. Photo/CSS source generators and vendor materials remain.

## 2. Dead code removed

Removed the unused local simulated-order creator and sequence helper, unused encoded-invitation decoder, unused editor slug helpers, unused variables/parameter and obsolete hooks for previously deleted scene/cover modules. Removed five unused Owl/Slick stylesheet source entries and 615 generated CSS lines; this also eliminated an existing missing image reference. Published links now use the server invitation ID rather than embedding the full state in a redundant URL fragment.

## 3. Dependencies

Removed `@ffmpeg-installer/ffmpeg` and its platform installer. Moved Anime.js, GSAP, Motion and Three.js to build-only dependencies; the runtime has four direct packages: Express, Luxon, QRCode and Stripe. Added a functioning ESLint 10 configuration and its supported configuration packages. Updated Playwright only from 1.55.0 to 1.55.1 to fix its browser-download certificate advisory. No application dependency received a major upgrade. npm reports a valid dependency tree and no deduplication opportunities; differing transitive major versions remain as required by their parents.

## 4. Refactoring

Extracted shared catalogue loading and invitation-state validation into server modules. The paid browser fixture uses the same catalogue loader. Consolidated response headers, repeated rate-limit bucket logic and account JSON requests. Corrected the dashboard preview function being shadowed by its thumbnail variable. Replaced stale architecture, state-contract and deployment documentation with the current Express/SQLite setup. Added a multi-stage Docker build that generates assets before installing runtime-only packages.

## 5. Performance

Dashboard refresh batches local-storage writes instead of repeatedly serializing every project. Dashboard metrics are included in the project query, with owner and session indexes for common lookups. Removed thumbnails and legacy previews release resize/intersection observers. The build copies pinned GSAP assets reproducibly and retains lazy scene chunks. These are structural optimizations, not measured latency or conversion claims.

## 6. Security

The initial audit found two high-severity development dependency entries from the same Playwright advisory; the patch resolved them. Final npm audit reports zero vulnerabilities. Source-pattern scanning found no live credentials or private keys; fixture credentials are synthetic. Malformed JSON API bodies now return 400, invalid proxy-hop configuration fails startup, and error logging avoids echoing parser messages that may contain submitted content. Parameterized SQL, ownership checks, signed webhooks, style/link validation and private-file serving boundaries were reviewed and tested.

The existing CSP still allows inline scripts/styles. Tightening it requires a separate nonce/hash migration and browser verification. This review is not a penetration test or a guarantee that every vulnerability has been eliminated.

## 7. Validation

- `npm run lint`: passed, zero warnings; rules were not disabled to conceal failures.
- `npm run build`: passed; 53 JavaScript files, module imports and local HTML/CSS references validated.
- `npm test`: 11 tests passed, including authentication/recovery, payments, ownership, expiry, all 68 registered state schemas, cache behavior and production-mode security smoke checks.
- `test:browser`, `test:visual-editor`, `test:platform`, `test:editions`, `test:paid-browser`: all passed. Covers original designs, 49 archived platform designs through eight engines, 14 active editions, six WebGL scenes, editor persistence, seven paid fixtures, QR, RSVP, dashboard preview and responsive widths.
- `npm audit`: zero findings; `npm ls --all`: no dependency-tree problems; deduplication dry run: already up to date.
- `git diff --check`: passed. Final scan found no source references to removed files, temporary source files or browser debug statements.
- TypeScript checks are not applicable: the only TypeScript files were the unused Next shell, now removed. JavaScript receives lint, syntax, import and browser checks rather than static type checking.

One initial baseline authentication test timed out during concurrent package installation. It passed unchanged on subsequent complete runs. Test failures were not suppressed.

## 8. Build result

Production browser build and Node production-mode startup passed. The Dockerfile was updated but Docker is not installed in this environment, so the container image itself remains unverified. Production smoke tests use synthetic Stripe settings and never contact the payment provider.

## 9. Remaining technical debt

Large legacy editor/renderer modules and compatibility exports remain; splitting them further would be a separate refactor. Archived templates, photo IDs, fonts and vendor assets may be referenced by persisted invitation state and must not be purged solely from a source-text scan. Existing historical design notes and older redirect-page copy remain. The generated Next instruction in `AGENTS.md` was preserved as supplied by the user despite no active Next runtime.

## 10. Manual review before deployment

Build/run the Docker image, verify real Stripe test checkout and webhook delivery, configure HTTPS/proxy topology, test persistent-volume permissions and restore a backup. Review the existing inline CSP allowance, asset/font licences, business contact details and established operational account-deletion/refund workflows. These deployment and policy tasks were not represented as completed by local tests.

Detailed local evidence: `artifacts/final-dependency-audit.json`, `artifacts/dependency-tree.json`, `artifacts/cleanup-security.json`, `artifacts/editions/results.json` and browser screenshots under `artifacts/`.
