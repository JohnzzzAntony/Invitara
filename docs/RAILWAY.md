# Deploy Invitara on Railway

## Service setup

1. Create a Railway project from GitHub repository `JohnzzzAntony/Invitara`, branch `main`, root directory `/`.
2. The committed `railway.json` selects the root Dockerfile and `/api/health` healthcheck. Leave custom build/start commands and pre-deploy commands empty. Docker builds the browser assets and starts `node server/index.mjs`; tables/indexes are initialized on startup.
3. Attach a persistent Railway volume to this service at `/app/data` BEFORE accepting users. SQLite stores accounts, paid invitations and guest replies there. Use one service replica in one region; do not add Postgres or set `DATABASE_URL`.
4. Generate a public Railway domain in Networking (target port 3000), or configure your custom domain. Set `APP_ORIGIN` to that exact HTTPS origin, with no trailing slash or path.
5. Configure the variables below and deploy. The first automatic deployment can fail until required variables have been entered; it is safe to redeploy after configuration.
6. Check `/api/health`, register a test account, complete a Stripe test checkout, publish, submit a guest reply, verify the dashboard and QR code. Verify persistence with a redeploy, then configure backups and complete a restore test.

## Variables

Paste the following into Railway's Variables → Raw Editor, replacing the marked values. Do not commit populated secrets or paste them into chat.

```dotenv
NODE_ENV=production
PORT=3000
APP_ORIGIN=https://YOUR-SERVICE.up.railway.app
DATA_DIR=/app/data
BUSINESS_NAME=Invitara
SUPPORT_EMAIL=YOUR-REAL-SUPPORT-EMAIL
STRIPE_SECRET_KEY=YOUR-STRIPE-SECRET-KEY
STRIPE_WEBHOOK_SECRET=YOUR-ENDPOINT-SIGNING-SECRET
TRUST_PROXY_HOPS=1
RAILWAY_RUN_UID=0
RAILWAY_DEPLOYMENT_DRAINING_SECONDS=30
```

- `STRIPE_SECRET_KEY`: use a Stripe test-mode secret first. Switch to a live-mode secret when payment testing is complete.
- `STRIPE_WEBHOOK_SECRET`: the `whsec_...` signing secret for the specific deployed endpoint and matching test/live mode. A local Stripe CLI forwarding secret is not the deployed endpoint's secret.
- `APP_ORIGIN`: must match the browser's origin exactly because the API checks Origin headers. Select one canonical domain; redirect alternative domains rather than serving the application under multiple origins. Update the Stripe webhook URL when the domain changes.
- `TRUST_PROXY_HOPS=1`: assumes the app is reached directly through Railway's reverse proxy. Reassess this setting if adding another proxy/CDN.
- `RAILWAY_RUN_UID=0`: Railway documents this override for non-root images writing to Railway's root-owned volumes. It runs the container as root, overriding this Dockerfile's default `node` user. Keep it limited to this Railway service; review a privilege-dropping initialization approach if your deployment requires a non-root application process.
- `RAILWAY_DEPLOYMENT_DRAINING_SECONDS=30`: gives the process time to close HTTP connections and SQLite when Railway sends SIGTERM.
- `PORT=3000`: matches the Dockerfile and public target port. The server also supports Railway's assigned `PORT`; if using that instead, keep networking/healthchecks aligned.

No frontend Stripe publishable key, JWT secret, database URL, SMTP variables or `NEXT_PUBLIC_*` variables are required by the current implementation. Password recovery uses a recovery code, not email delivery.

## Stripe webhook

In Stripe Workbench/Webhooks, create an endpoint:

```text
https://YOUR-DOMAIN/api/webhook
```

Subscribe to:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`

Copy that endpoint's signing secret into `STRIPE_WEBHOOK_SECRET`. Configure separate test/live endpoints or destinations as appropriate and use matching credentials. Payment redirects do not unlock access; signed, matching webhooks do. Production startup requires both Stripe secrets and operator details.

## Storage and operations

The mounted volume is required; data outside it is ephemeral. The repository intentionally excludes the existing local database, secrets and test artifacts, so a fresh deployment starts empty. If existing local customer data must migrate, use a consistent SQLite backup and restore it to the volume before accepting writes; do not copy only the main file while WAL writes are active. Keep backups private. Volume-backed redeployments can briefly interrupt service. Never replace/delete the volume to fix a deployment.

Common startup failures:

- `Production requires ...`: fill the required variables; `APP_ORIGIN` must use HTTPS.
- `EACCES` or SQLite cannot open the database: verify the volume mount, `DATA_DIR` and Railway volume permissions/UID.
- `Invalid request origin`: correct `APP_ORIGIN` to the exact domain being opened.
- Healthcheck timeout: inspect service logs and target port; confirm secrets are configured and the database directory is writable.
- Payment pending: inspect Stripe webhook deliveries, endpoint signing secret, mode and selected event types.

## Verification limits

Local lint, build and production-mode smoke tests passed before push. Docker and Railway credentials are unavailable in the development environment, so no Railway deployment or live payment has been claimed as verified.

Official references: [Dockerfiles](https://docs.railway.com/builds/dockerfiles), [config as code](https://docs.railway.com/config-as-code/reference), [volumes and permissions](https://docs.railway.com/volumes), [variables](https://docs.railway.com/variables/reference), [healthchecks](https://docs.railway.com/deployments/healthchecks).
