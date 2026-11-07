# Respondr — website audit and rebuild plan

Answers `website-rebuild-brief.md` (November 2026). Evidence comes from the code in this
repository and a live run of `npm run dev` at a 375×812 mobile viewport. No production
analytics exist yet, so the conversion figures below are targets, not measurements.

| Brief field | Answer (from the codebase) |
|---|---|
| Website | Respondr (local: http://localhost:3000; production origin set by `APP_ORIGIN`) |
| Industry | Digital invitations with online RSVP |
| Audience | Hosts planning weddings, birthdays, anniversaries, housewarmings, product launches; UAE first |
| Main goal | Sell one-time invitation purchases |
| Primary action | Pick a design → personalise → pay → share link |
| Language / market | English; AED pricing with 5% VAT (UAE). Arabic is the obvious next language, not built |

**P0 status (2026-11-07):** done: gzip compression (homepage CSS+JS 1,537 → 439 KB transferred,
invite page 899 → 269 KB), offer headline as the H1, `/contact.html` + footer link on every
page (`SUPPORT_EMAIL`, `SUPPORT_WHATSAPP`), opt-in Plausible analytics (`PLAUSIBLE_DOMAIN`).
Open: per-page / per-design asset splitting (issues 1–2), which needs the catalogue scripts restructured.

**P1/P2 status (2026-11-07):** done: one CTA label ("Choose a design") site-wide, homepage
filters/search moved to `/create` only, final CTA band on home, hidden H1 on demo/editor,
`/prompts` noindexed and out of the footer, `frontend.zip` untracked, lint fixed. Checked, no
change needed: served page titles are already unique (issue 11). Dropped: issue 13, since the
orange brand was a deliberate change (commit 7ee51af). Open: social proof (issue 6) waits for real
customer quotes; CSS consolidation (issue 9) and self-hosted fonts go with the asset split.

---

## 1. Executive summary

The product works: catalogue, editor, Stripe checkout, guest RSVP and expiry are built and
tested. **The problem is the marketing shell, not the platform.** Every page loads the CSS
and JavaScript of every design ever made, the homepage headline is the brand name instead
of the offer, and there is no contact route, no social proof and no analytics.

Recommendation: **do not rewrite the app.** Keep Express, the editor and checkout. Rebuild
the public pages (home, designs, pricing, occasion pages, legal) as lean pages that load
only what they show, with a clear offer, visible contact and measurement. That fixes the
brief's goals at a fraction of the cost and risk of a full rewrite.

## 2. Current website issues

Measured on the homepage (mobile, local server, no cache):

| Metric | Value |
|---|---|
| Stylesheets on `index.html` | 21 files, 446 KB |
| Script tags on `index.html` | 38, 1.09 MB |
| Images | 1.49 MB |
| Total | 85 requests, ~3 MB |
| Page height | 5,206 px (≈6.4 screens) |

Other pages are the same shape: `create.html` 19 sheets / 34 scripts, `invite.html` (the
page every guest opens) 15 / 28.

| # | Issue | Severity | Fix | Priority | Impact |
|---|---|---|---|---|---|
| 1 | Every page loads all collections' CSS/JS (≈1.5 MB code on home) | High | Per-page bundles: a shared `site.css` + page-specific files; load design assets only on the design/invite pages that render them | P0 | Faster first load on mobile data; better Core Web Vitals and SEO |
| 2 | Guest invite page loads 15 sheets / 28 scripts | High | Load only the chosen design's layout + motion file | P0 | Guests are the largest audience and arrive on phones via WhatsApp |
| 3 | Hero H1 is "Respondr"; the offer is in small grey text | High | H1 states the offer: "Beautiful digital invitations with online RSVP" | P0 | Passes the 5-second test; H1 keyword for SEO |
| 4 | No contact page, email or WhatsApp link anywhere public | High | Add `/contact` and a footer email/WhatsApp link (uses `SUPPORT_EMAIL`) | P0 | Trust, and a required route for buyers with questions before paying |
| 5 | No analytics | High | Add privacy-friendly analytics with funnel events (see §8) | P0 | Without it no success metric in §11 can be measured |
| 6 | No social proof (testimonials, counts, sample live invites) | Medium | Add a short proof strip: 3 quotes or "live example" links once real customers exist | P1 | Conversion on pricing and home |
| 7 | Homepage is 6+ screens with overlapping sections (discovery grid, full filterable catalogue, steps, pricing, FAQ) | Medium | Home shows 6 featured designs and links to the catalogue; filters/search live only on `/create` | P1 | Shorter page, one clear path |
| 8 | Two primary CTAs with different labels ("Find your invitation", "Create Invitation", "Explore the collection") | Medium | One label everywhere: **"Choose a design"**; secondary is "See pricing" | P1 | Clearer next step |
| 9 | 23 CSS files with layered overrides (`finish.css`, `refinement.css`, `premium-ui.css`…) | Medium | Collapse into tokens + components + per-collection files (§6) | P1 | Easier content/design changes; fewer regressions |
| 10 | `demo.html` and `editor.html` have no `<h1>` | Low | Add a visually hidden H1 | P2 | Accessibility, SEO hygiene |
| 11 | `create.html`, `design.html`, `index.html` share the title "Beautiful Digital Invitations — Respondr" in source (server rewrites some) | Low | Confirm `backend/seo.mjs` gives each a unique title; fix the static fallbacks | P2 | SEO |
| 12 | `frontend.zip`, `archive/`, many historical docs in the repo | Low | Move archive out of the deploy image (already excluded) and delete the zip | P2 | Repo clarity only |
| 13 | Brand: logo/buttons render orange gradient; brand token is `#B96955` | Low | Point logo and primary button at `--brand` / `--brand-strong` | P2 | Consistency |

Already good, keep: unique meta descriptions on all 14 pages, all images have `alt`, no
horizontal overflow on mobile, skip-link and ARIA on the nav, FAQ uses native `<details>`,
a "Pause motion" control, occasion landing pages with structured data, sitemap and
`llms.txt`.

## 3. Recommended new structure

```
/                       Home
/create                 All designs (filters, search)
/<occasion>-invitations Occasion landing pages (exist — keep)
/design?id=…            Design detail + live preview
/pricing                Pricing
/how-it-works           (anchor on home is enough; no new page)
/contact                NEW
/account, /dashboard    Host area (keep)
/editor, /checkout      App (keep)
/i/<id> (invite.html)   Guest invitation (keep, slim down)
/terms, /privacy        Legal (keep)
/prompts                Move out of the footer; internal tool, noindex
```

Skipped on purpose: blog, About page. Add a blog only when there is someone to write for
it; a one-paragraph "About" fits on `/contact`.

## 4. Homepage blueprint

| # | Section | Purpose | Headline | Supporting text | Visual | CTA |
|---|---|---|---|---|---|---|
| 1 | Header | Navigate | — | Designs · Pricing · Log in | Logo in `--brand` | **Choose a design** |
| 2 | Hero | State the offer | Beautiful digital invitations with online RSVP | Pick a design, make it yours, share one link on WhatsApp. Every reply in one place. | Existing hero shelf, static poster on mobile / reduced motion | **Choose a design** · See pricing |
| 3 | Value | Why us | One link. Every reply. | No app for guests · Edit until the event · One payment, no subscription | 3 icon rows | — |
| 4 | Featured designs | Show the product | Find your occasion | Occasion chips + 6 featured cards | Card thumbnails (lazy) | View all designs → |
| 5 | Social proof | Trust | Loved by hosts | 3 short quotes or live example links | Small avatars or invite thumbnails | — |
| 6 | How it works | Reduce doubt | Ready in three steps | Existing three steps (keep the copy) | Numbers only | Choose a design |
| 7 | Pricing | Answer "how much" | One invitation. One payment. | From AED 79 + VAT, includes editor, RSVP, QR code | Price card | See pricing |
| 8 | FAQ | Remove objections | Questions, answered | Existing 5 questions (keep) | — | — |
| 9 | Final CTA | Convert | Your celebration starts here | Personalise free; pay when you publish | `cta-band.jpg` | **Choose a design** |
| 10 | Footer | Find anything | — | Occasions · Designs · Pricing · Contact · Terms · Privacy · email/WhatsApp | — | — |

## 5. Page-by-page plan

| Page | Purpose | Primary CTA | Key sections | SEO title / description |
|---|---|---|---|---|
| Home | Explain offer, route to designs | Choose a design | §4 | Digital Invitations & Online RSVP Maker \| Respondr — "Beautiful digital invitations for weddings, birthdays and every celebration. One link, online RSVP, one payment." |
| Designs `/create` | Browse & pick | Customize this design | Filters, search, grid, price note | Invitation Designs for Every Occasion \| Respondr — "Browse animated wedding, birthday, anniversary and housewarming invitations. Personalise free." |
| Occasion pages | Rank for "<occasion> invitations" | Choose a design | H1, lead, filtered grid, occasion FAQ | Already defined in `backend/seo.mjs` — keep |
| Design detail | Convince on one design | Personalise free | Live preview, what's included, price | "<Design name> — <Occasion> Invitation \| Respondr" |
| Pricing | Remove price doubt | Choose a design | Price per tier, what's included, VAT, refund/expiry terms, FAQ | Simple, One-Time Invitation Pricing \| Respondr — "One payment per event, no subscription. Editor, RSVP and QR code included." |
| Contact (new) | Questions before buying; support | Email / WhatsApp us | Email, WhatsApp, response time, 1-paragraph about, business details | Contact Respondr — "Questions about your invitation? Email or WhatsApp us." |
| Legal | Compliance | — | Existing content | Keep |

## 6. Design system

- **Style:** warm editorial (already in `DESIGN.md`) — keep. Let invitation designs carry the colour; the shell stays quiet.
- **Colour:** `--brand #B96955` (large/decorative), `--brand-strong #9E5240` (text, buttons; AA on white), ink `#171717`, page `#FAF7F2`, white surfaces. Remove the orange gradient.
- **Type:** two families only — Libre Caslon Display for headings, Inter Tight for UI/body. Self-host both (already done for couture fonts) to drop the Google Fonts round trip.
- **Buttons:** pill, 48 px min height, one primary (`--brand-strong` fill) and one secondary (outline). Same label for the same action everywhere.
- **Components:** header, button, card, chip filter, price card, FAQ item, quote, footer. One CSS file each section of the shell; design-specific CSS lives with its collection and loads only where used.
- **Imagery:** real invitation screenshots and posters; WebP/AVIF, `loading="lazy"` below the fold, explicit `width`/`height`.
- **Mobile first:** single column to 640 px; tap targets ≥ 44 px; sticky bottom "Choose a design" bar on design detail.
- **Accessibility:** WCAG 2.2 AA contrast, visible focus, one H1 per page, `prefers-reduced-motion` serves static posters, all motion pausable (already true on home).

## 7. Technical recommendations

- **Platform:** keep Node/Express + static HTML. A CMS is not justified: marketing copy changes rarely and lives in a handful of HTML files plus `backend/seo.mjs`. Revisit if a non-developer must edit weekly.
- **Hosting:** keep Railway/Render, single instance + persistent volume (as `docs/RAILWAY.md`). Put a CDN (Cloudflare) in front for `/assets`, `/css`, `/js`, `/vendor` with long cache + hashed filenames.
- **Speed:** per-page CSS/JS (issue 1–2); `defer` all scripts; lazy-load three.js/GSAP only on pages that use them; compress `assets/` (8.3 MB) to WebP; preload the hero poster. Target homepage < 500 KB, < 25 requests on first view.
- **SEO:** unique titles on static fallbacks; occasion pages already strong; add `Organization` + `Product`/`Offer` schema on pricing; submit sitemap in Search Console.
- **Analytics:** Plausible or GA4 with consent; see §8.
- **Forms/CRM:** no lead form needed — the product *is* the conversion. Contact = `mailto:` + WhatsApp link. Stripe already holds customer records.
- **Security/backup:** existing security headers and server-side payment checks stay. Add a daily copy of the SQLite file from the volume to object storage.
- **Maintenance:** monthly dependency updates; run `npm run build && npm test` before each deploy.

## 8. SEO and analytics plan

Events to track (funnel): `view_design` → `start_editing` → `begin_checkout` → `purchase` (from Stripe webhook) → `publish` → `guest_rsvp`. Plus `contact_click` and `whatsapp_click`.

Keyword map: home → "digital invitations", "online RSVP"; each occasion page → "<occasion> invitations", "digital <occasion> invitation"; pricing → "digital invitation price"; Arabic variants once an Arabic version exists.

## 9. Rebuild roadmap

| Phase | Work | Size |
|---|---|---|
| 1 Audit & strategy | This document. Remaining: competitor check (MyEventOS notes already in `DESIGN.md`) | Done |
| 2 Information architecture | Sitemap §3, content §4–5, add `/contact`, demote `/prompts` | 1 day |
| 3 Design | Apply §6 tokens to the shell; mobile mockups of home + pricing + contact | 2–3 days |
| 4 Development | P0: per-page assets, new hero copy, contact page, analytics. P1: CSS consolidation, shorter home, social proof, single CTA label | 1–2 weeks |
| 5 Launch | Checklist §10; existing redirects in `backend/index.mjs` already cover old URLs | 1–2 days |
| 6 Post-launch | Weekly funnel review; fix the biggest drop-off first | Ongoing |

## 10. Launch checklist

- [ ] `npm run build`, `npm test`, `npm run test:browser` pass
- [ ] Homepage < 500 KB and < 25 requests on first mobile view
- [ ] Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95, SEO 100
- [ ] Every page: one H1, unique title + description, canonical
- [ ] Contact email and WhatsApp work from home, pricing and footer
- [ ] Stripe test purchase → publish → guest RSVP → export, end to end
- [ ] Old URLs (`*-invitations.html`, `plan.html`) 301 correctly
- [ ] Analytics events fire once each; consent respected
- [ ] Tested on iOS Safari, Android Chrome, desktop Chrome/Safari/Firefox
- [ ] `prefers-reduced-motion` shows static posters
- [ ] Sitemap submitted; robots allows public pages, blocks app pages

## 11. Success metrics

Baseline first (two weeks of analytics), then track monthly:

| Metric | Target |
|---|---|
| Homepage weight / LCP on 4G | < 500 KB / < 2.5 s |
| Home → design view | > 40% |
| Design view → start editing | > 25% |
| Start editing → purchase | measure, then improve |
| Contact / WhatsApp clicks | tracked |
| Organic sessions to occasion pages | growing month on month |
| Mobile usability (Search Console) | 0 issues |
