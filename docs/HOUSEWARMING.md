# Aangan — the housewarming edition

Preview: `/demo.html?id=edition-aangan`. Collection: `/create.html?occasion=housewarming`.

## Existing stack

Express 5, browser JavaScript, existing GSAP/ScrollTrigger, native Canvas and CSS 3D, SQLite, and the installed QRCode package. No packages added. No React/Next.js migration. JavaScript follows the existing platform schema rather than introducing a TypeScript build.

## Art direction

Warm architectural editorial; DFII 14 (impact 5, fit 5, feasibility 5, performance 4, consistency risk 5). A carved double doorway, garland and brass lamps establish the visual signature. Local Derivia display font and the existing Jost body font; forest green, ivory, antique gold and terracotta. Spacing follows an 8px rhythm with generous chapter margins. Motion uses a single door opening, gentle section reveals and photographic parallax. Reduced-motion preferences disable transitions and GSAP motion.

## Files

- `frontend/public/js/editions-catalog.js`: central sample content and registration (`edition-aangan`).
- `frontend/public/js/housewarming.js`: render/bind components, scratch canvas, zoned countdown, calendars, optional music/gallery, envelope, sharing and QR.
- `frontend/public/css/housewarming.css`: scoped responsive design and doorway illustration.
- Existing edition layout/binding files delegate to the Aangan renderer. HTML entry points load its script and CSS.
- `frontend/public/js/layouts/platform.js`: editable timezone, end time and scratch switch.
- `backend/index.mjs`: existing private SQLite RSVP storage extended with optional phone and Aangan-only Maybe; public QR checks publication/payment and is rate limited.
- Dashboard displays Maybe/phone and includes phone in its existing formula-safe CSV export.

## Personalize

Select Aangan in the existing editor. Change host names, title, house name (`basics.venue`), full address (`basics.city`), date, 24-hour start time, ceremony schedule, message and dress code. In The celebration settings, set the IANA timezone (for example `Asia/Kolkata`) and 24-hour end time. An end time at or before start time represents the following day. Use the same timezone in checkout/event settings so invitation countdown and the platform's event-expiry policy agree.

All initial names/address are placeholders. The inherited future date is a **sample**, clearly labeled in preview. Replace it before publishing. Maps are unavailable until the placeholder address is replaced. Google/Apple directions use the configured address; no fake map is shown. Hosts can supply a secure map URL. The hero illustration is original CSS artwork; sample photographs are existing project assets, not photographs of the host's actual home.

Colors use existing theme controls. Turn sections on/off and reorder using the existing editor. `details.scratchReveal` disables scratching; the keyboard reveal button is always available. Add gallery images and enable the Gallery section to use the lightbox. Set `hero.musicUrl` to an existing local `assets/` path or HTTPS audio to show music controls. Music starts only after a user gesture. No new audio or external media service is required.

Guest personalization: append `&guest=Anu` to a published invitation URL. Display uses escaped text. Share links omit the personalized name. The scratched date persists for the current session; the doorway always follows scroll position and can be replayed without losing replies; storage failures do not block the invitation.

## RSVP and privacy

Published invitations use `/api/invites/:id/rsvp` and the existing paid/published/expiry checks, session identity, rate limit and SQLite database. Replies include name, yes/no/maybe, guest count, optional phone and private message. Only API-confirmed writes show success. Preview forms explicitly report that replies are not saved. The dashboard supports private replies and CSV export. Blessings remain private; there is no automatically public blessing wall.

The published footer offers a real QR code from `/api/invites/:id/qr` and an SVG download. Draft and unpaid projects cannot generate a public QR. The existing owner QR endpoint remains available.

## Run and deploy

Node 24+. `npm run dev`, then open the preview route above. No additional environment variables. Existing `APP_ORIGIN`, `DATA_DIR`, payment and account configuration in `.env.example` continue to apply. Keep `APP_ORIGIN` equal to the final public URL for working QR links. Deploy with the existing Docker/Railway/Render configuration; run `npm run build`, then `npm start`. SQLite requires a persistent data volume. See `docs/DEPLOY.md` and `docs/RAILWAY.md`.

## Verification

`npm run lint`, `npm run build`, `npm test`. Run `node scripts/housewarming-check.mjs` against a local server (`TEST_ORIGIN` overrides port 3000). The focused browser check covers opening/replay, genuine pointer scratching, persistent reveal, calendar download, timezone/DST conversion, honest preview RSVP, 320–1440px widths, reduced motion and console errors. The housewarming API test verifies private persistence of Maybe/phone, malformed input, QR authorization and unpublished replies.

The template deliberately uses ordinary scrolling, never scroll trapping. Its chapters remain accessible even without opening the door. Real phone hardware and audible music playback require host/device testing. No external deployment was performed.


## Scroll-through entrance

The guest experience begins with only the architectural doorway. An approximately 2.2-viewport natural scroll sequence opens both panels, moves the camera through the frame, then reveals the invitation in the same pinned viewport. A sticky stage handles both document scrolling and the preview panel; the existing GSAP ScrollTrigger tracks progress. Scrolling backward reverses the scene. No wheel or touch event is cancelled.

Invitation headings, preview toolbar and floating navigation remain hidden during the entrance. The editor and miniature catalogue cards retain a static, editable composition. The doorway button and a keyboard-focusable skip control take guests directly to the invitation. Reduced motion uses a shorter crossfade without 3D rotation or camera zoom. Replay changes scroll position only and preserves the RSVP form and revealed date.

`node scripts/housewarming-scroll-check.mjs` verifies the door-only start, wheel-driven panel opening, pinned position, camera movement, invitation reveal, reversal, reduced motion, keyboard entry, 320/390/1440px layouts and both published-page and preview scrolling. Screenshots are saved under `artifacts/housewarming/scroll/`.
