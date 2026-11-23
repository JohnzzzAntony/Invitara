# Production deployment

Use the multi-stage Dockerfile or `render.yaml`. The build stage installs build tools, lints the application and creates browser bundles. The runtime stage installs only server dependencies and runs as the non-root `node` user. A static-only host cannot serve authentication, payments, saved invitations or RSVP APIs.

## Configuration

Copy `.env.example` for local development. Never commit populated environment files.

| Variable | Purpose |
| --- | --- |
| `PORT` | HTTP listener, default 3000 |
| `APP_ORIGIN` | Exact origin without a path/trailing slash; HTTPS required in production |
| `NODE_ENV` | `production` enables secure cookies, HSTS and configuration checks |
| `DATA_DIR` | Persistent writable directory for `invitara.sqlite` and WAL files |
| `STRIPE_SECRET_KEY` | Server-only payment credential |
| `STRIPE_WEBHOOK_SECRET` | Server-only webhook signing secret |
| `BUSINESS_NAME`, `SUPPORT_EMAIL` | Public operator contact details; required in production |
| `TRUST_PROXY_HOPS` | Set only for the actual trusted proxy topology; Render uses one hop |
| `RESEND_API_KEY`, `MAIL_FROM` | Optional. Enables password-reset emails through Resend; `MAIL_FROM` must be on a domain verified in Resend. Without them, production offers recovery codes only |
| `SUPPORT_WHATSAPP` | Optional WhatsApp number shown on the contact page |
| `NVIDIA_API_KEY` | Optional. Enables the AI editor assistant |
| `PLAUSIBLE_DOMAIN` | Optional cookieless analytics |

Deploy a single instance with a persistent volume at `/app/data`. Terminate TLS at the trusted reverse proxy and prevent untrusted direct access to the backend port. Configure Stripe events `checkout.session.completed` and `checkout.session.async_payment_succeeded` at `/api/webhook`.

## Release checks

Run `npm ci`, `npm run lint`, `npm run build`, `npm test`, and `npm audit`. With the local server running, run each `test:browser`, `test:visual-editor`, `test:platform`, `test:editions`, and `test:paid-browser` script. Browser checks require Microsoft Edge. Paid browser tests use isolated fixtures; they do not charge cards. Use Stripe test mode to verify hosted checkout and webhook delivery before live payments.

After deployment, verify `/api/health`, sign-in, save, publish, QR sharing, guest RSVP and dashboard export. Restore a database backup into a separate environment as part of release preparation. Back up through SQLite's online backup mechanism or a consistent volume snapshot; copying only the main file while WAL writes are active is unsafe.

Production credentials, DNS/TLS, real webhook delivery, persistent-volume permissions and backup restoration require operator verification. Container builds require Docker. Do not treat a successful JavaScript build as evidence of a deployed service.

## Release checklist and rollback

Pushing to `main` may trigger an automatic Railway deploy. Get owner approval (`docs/implementation-decisions.md`) before pushing release commits.

1. **Back up** the database with SQLite's online backup, e.g. `sqlite3 /app/data/invitara.sqlite ".backup /app/data/backup-YYYYMMDD.sqlite"`, or take a volume snapshot.
2. **Configure** any new variables above. Leave `RESEND_API_KEY` unset if email is not ready; the reset button then stays hidden.
3. **Deploy** and confirm `/api/health` returns `{"ok":true,"paymentsConfigured":true}`.
4. **Smoke test** in production with a disposable account: register → save a draft → Stripe test or real checkout per policy → publish → open the invite link in a private window → RSVP → dashboard shows the reply → CSV export. Then personal link → RSVP shows "personal link"; reset-password email arrives (if configured); `/contact.html` shows the support email; `/pricing.html` shows AED 103.95.
5. **Monitor** logs for `Checkout failed`, `Payment check failed`, `Reset email failed` and 5xx responses for the first hour.

**Rollback:** redeploy the previous Railway deployment (or `git revert` the release commits and push). Schema changes in this release are additive (`password_resets`, `auth_events`, `guests`, optional JSON fields), so older code runs against the newer database unchanged. Restore the backup only if data itself is damaged; restoring loses replies and orders received since the backup.
