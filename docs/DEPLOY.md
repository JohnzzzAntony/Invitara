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

Deploy a single instance with a persistent volume at `/app/data`. Terminate TLS at the trusted reverse proxy and prevent untrusted direct access to the backend port. Configure Stripe events `checkout.session.completed` and `checkout.session.async_payment_succeeded` at `/api/webhook`.

## Release checks

Run `npm ci`, `npm run lint`, `npm run build`, `npm test`, and `npm audit`. With the local server running, run each `test:browser`, `test:visual-editor`, `test:platform`, `test:editions`, and `test:paid-browser` script. Browser checks require Microsoft Edge. Paid browser tests use isolated fixtures; they do not charge cards. Use Stripe test mode to verify hosted checkout and webhook delivery before live payments.

After deployment, verify `/api/health`, sign-in, save, publish, QR sharing, guest RSVP and dashboard export. Restore a database backup into a separate environment as part of release preparation. Back up through SQLite's online backup mechanism or a consistent volume snapshot; copying only the main file while WAL writes are active is unsafe.

Production credentials, DNS/TLS, real webhook delivery, persistent-volume permissions and backup restoration require operator verification. Container builds require Docker. Do not treat a successful JavaScript build as evidence of a deployed service.
