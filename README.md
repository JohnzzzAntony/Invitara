# Invitara — interactive invitation platform

Production application: Node 24, Express, SQLite, Stripe Checkout and locally bundled Anime.js, Motion, Three.js and GSAP. Browser animation sources are compiled by esbuild. The production server serves `public/` and enforces purchases and event expiry.

## Start locally

```powershell
npm ci
Copy-Item .env.example .env
npm run dev
```

Open http://localhost:3000. Drafts, previews and accounts work without payment credentials. Checkout stays disabled until Stripe is configured; there is no simulated purchase button.

## The collection

The active collection contains 14 independently designed invitations covering 14 occasions. The earlier 54 designs remain available to saved invitations. All use the existing editor/state contract; content, photography, sections, typography and theme settings remain editable. Drafts are local, while paid invitations and guest replies are stored on the server.

## Production deployment

For Railway, follow [the deployment and variables guide](docs/RAILWAY.md). `railway.json` configures the Docker build and healthcheck.

Use the included Dockerfile or `render.yaml`. This application needs **one Node process and a persistent disk**, not static hosting or an ephemeral serverless function. The old Next/static-host scaffold has been removed.

1. Set `APP_ORIGIN` to the exact HTTPS origin without a trailing slash.
2. Set `NODE_ENV=production`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `BUSINESS_NAME`, and `SUPPORT_EMAIL`. Production boot rejects missing required settings.
3. Mount a persistent volume at `/app/data`; set `DATA_DIR=/app/data`. Use a single instance. The process runs as the `node` user; the volume must allow that user to write.
4. Terminate HTTPS at the hosting platform or reverse proxy. Set `TRUST_PROXY_HOPS=1` only when exactly one trusted proxy fronts the app. Do not expose the application port directly behind an untrusted proxy.
5. Register `https://YOUR-DOMAIN/api/webhook` for `checkout.session.completed` and `checkout.session.async_payment_succeeded`. Test with Stripe test credentials before replacing them with live keys.
6. Run `npm run build` and `npm test`. After deployment, verify `/api/health`, sign up, save the recovery code, complete a Stripe test payment, edit and publish, open the guest link from another browser, submit a reply and export it from the dashboard.

The catalog currently uses AED and 5% VAT. Review prices, tax treatment, business contact details, terms and media/font licensing before accepting live orders. Payment redirects are not proof of payment: only verified signed webhooks with the expected amount, currency and registered session unlock the editor. Live checkout and webhook delivery require your own credentials.

## Access and accounts

A purchase is **one payment**, not an automatically renewing subscription. Every save/publish request checks payment and expiry against the server clock. Expiry is the midnight after the event in its selected IANA timezone, including DST. No cron job is necessary. After expiry the editor is read-only, guest replies close, and the published keepsake remains accessible.

Accounts support email/password login across devices and a one-time recovery code. Passwords use salted scrypt hashes. Recovery rotates the code and revokes prior sessions. There is no email verification or email reset delivery; customers must save their recovery code. Cookies are HttpOnly, SameSite=Lax and Secure in production. Do not clear or replace the database between releases.

Published invitations have unguessable public IDs. Anyone with the link can view the invitation. RSVP records are private to the owner; guests can update their own reply in the same browser. No guest identity verification is claimed. CSV export guards spreadsheet formula injection.

## Operations

- Back up `invitara.sqlite` using SQLite's online backup facilities or a platform-consistent disk snapshot. Copying only the main database while WAL writes are active is not a reliable backup.
- Restore backups to a separate environment and test them. Keep persistent storage through redeploys.
- Refunds are handled in Stripe; automatic refund-based access revocation is not implemented. Contact requests and account/data deletion are operator workflows, not a built-in admin console.
- Rate limits are per process. Horizontal scaling needs a shared database/session/rate-limit design and is not supported by this SQLite deployment.
- Images are resized client-side and stored with invitation JSON. Use appropriately sized photos. API bodies are limited to 12 MB. Videos use hosted MP4 URLs rather than uploading binary files into the database.

## Checks

```powershell
npm run lint
npm run build
npm test
npm audit
# Start server first; Edge must be installed:
$env:TEST_ORIGIN='http://localhost:3000'
npm run test:browser
npm run test:visual-editor
npm run test:platform
npm run test:editions
npm run test:paid-browser
```

Browser checks cover the five themes at phone/tablet/desktop widths, opening interactions, date reveal, video playback, mobile editing and reduced motion. Screenshots are saved under `artifacts/`. Backend tests use isolated temporary databases and signed test webhook fixtures; they never send a real payment.

GSAP licence: https://gsap.com/standard-license/

## Expanded platform

The active catalogue contains 14 individually art-directed invitations across 14 occasions. Repeating designs are archived; existing invitations remain supported. Anime.js and Motion animate the new collection, with six lazily loaded Three.js scenes. See [the platform upgrade guide](docs/PLATFORM-UPGRADE.md) for architecture, editor features, sharing, analytics, tests and deployment configuration. Run `npm run test:editions` for the current collection, motion and breakpoint checks. `npm run test:platform` covers archived designs. Run `npm run build` after changing `src/editions-*.js` to regenerate browser bundles.
