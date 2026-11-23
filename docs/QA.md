# QA matrix and results (24 Nov 2026)

## Commands

| Command | What it covers | Result |
|---|---|---|
| `npm run lint` | ESLint, 0 warnings allowed | ✅ pass |
| `npm run build` | Motion bundles; validates 117 JS files, module imports, HTML/CSS local references | ✅ pass |
| `npm test` | 22 Node test files: auth, recovery, email reset, sessions, cross-account access, payments and webhooks, discounts, checkout retry, RSVP, personal links, deadlines, reschedule, check-in, validation, SEO metadata, caching | ✅ 46/46 pass |
| `npm audit --omit=dev` | Production dependencies | ✅ 0 vulnerabilities |
| `npm run test:browser` | Storefront smoke (Edge) | ❌ fails, also on `97c0a2e`: waits for `.collection-card` on the homepage, which was redesigned |
| `npm run test:refinement` | Responsive and navigation | ❌ fails, also on `97c0a2e`: clicks "outside" the mobile menu, but the menu is now full-screen (`inset:0`), so there is no outside |
| `npm run test:paid-browser` | Paid editor and publish flow | ❌ fails, also on `97c0a2e`: timeout clicking `.nx-section-hero a` |
| `npm run test:visual-editor` | Visual editor | ❌ fails, also on `97c0a2e`: `.collection-card` |
| `npm run test:platform` | Platform editor | ❌ fails, also on `97c0a2e`: editor overflow at 768 px. Not reproduced on a direct load at 768 px (scroll width 753); only after resizing up from 390 px with the mobile inspector open. Needs testing (P2) |
| `node scripts/perf-check.mjs` | Lab Web Vitals | see `docs/PERFORMANCE.md` |

All five browser-suite failures were reproduced identically on the commit before this session (`97c0a2e`, separate worktree and database). These suites need updating to the current UI; until then, the browser journeys below were checked by hand.

## Manual and scripted browser checks (Edge / built-in browser, local)

| Journey | Result |
|---|---|
| Recovery tab → "Email me a reset link" → generic message; link from dev log → new password → lands in dashboard signed in | ✅ |
| Signed-in account page: sign out everywhere, new recovery code form | ✅ rendered |
| Pricing page: AED 103.95, "AED 99 + AED 4.95 VAT" | ✅ |
| Dashboard share: WhatsApp link, personal links for 2 guests, per-guest WhatsApp text | ✅ |
| Personal link as guest: greeting, name pre-filled, "Add to calendar"; "Get directions" hidden because the design has its own map | ✅, no console errors |
| XSS: 114 themes rendered with an HTML payload in every text field (10,426 fields) | ✅ 0 injected elements |
| SEO: 20/20 sitemap URLs 200; one title, description, canonical, h1 and JSON-LD on public pages; private pages and invitations noindex; 49/49 internal links 200; unknown page 404 | ✅ |

## Not covered (blocked or unverified)

- Stripe test-mode hosted checkout, decline, cancel and real webhook delivery. Needs test keys and `stripe listen`.
- Real email delivery. Needs Resend.
- AI builder success, timeout and quota against the real provider. Needs `NVIDIA_API_KEY`; the limits are unit-tested in `ai.test.mjs`.
- WebKit (Safari) and Firefox. The suites only use Edge.
- Arabic/RTL: not built.
- Screen-reader pass with NVDA or VoiceOver: not done.
