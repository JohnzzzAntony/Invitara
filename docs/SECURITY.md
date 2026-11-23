# Security controls (verified 24 Nov 2026)

No secret values appear in this document. "Test" means an automated test in `tests/`. This is a code review plus tests, not a penetration test.

| Area | Control | Evidence |
|---|---|---|
| Passwords | scrypt with a random 16-byte salt, constant-time compare, 12–128 characters | `backend/auth.mjs` |
| Sessions | 256-bit random token in `invitara_owner` (HttpOnly, SameSite=Lax, Secure in production); only the SHA-256 hash is stored; 365-day expiry checked on every request; new token on every sign-in | `security-regression.test.mjs` (expiry, logout) |
| Login throttling | 15/min per IP on `/api/auth/*`, 10/min per email | `index.mjs`, `auth.mjs` |
| Recovery code | 192-bit random, stored hashed, rotated on use; regeneration requires the current password | `accounts.test.mjs`, `password-reset.test.mjs` |
| Email reset | 256-bit token, stored hashed, 30 minutes, single use (`DELETE … RETURNING`), older tokens cleared, link in URL fragment, same reply for unknown emails, 3/min per email, all sessions revoked after reset, `auth_events` audit | `password-reset.test.mjs`, `security-regression.test.mjs` |
| CSRF | Every non-GET `/api` request must carry `Origin` equal to `APP_ORIGIN`; SameSite=Lax cookie | `api.test.mjs` |
| Authorization | `owned()` filters by owner on every private project route; other accounts get 404 | `security-regression.test.mjs` (11 routes) |
| Guest privacy | Replies are visible only to the owner; the public invitation payload has no reply or owner data; guest tokens are 128-bit, scoped to one invitation | `accounts.test.mjs`, `guest-features.test.mjs`, `security-regression.test.mjs` |
| Payments | Raw-body webhook with signature check; session must have been created by this server for this project; amount (or pre-discount subtotal when discounted) and currency must match; fulfilment is idempotent; the redirect grants nothing — the editor polls, and the server asks Stripe directly | `api.test.mjs`, `payment-reconcile.test.mjs`, `checkout-retry.test.mjs`, `guest-features.test.mjs` |
| XSS | Templates escape user text; CSP `script-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'` | 114 themes, 10,426 poisoned fields, 0 injected nodes (`docs/QA.md`) |
| Images | data URLs limited to JPEG/PNG/WebP, magic bytes checked, ≤ 7.5 MB; URLs cannot contain credentials or quote characters; paths cannot traverse | `validation.test.mjs` |
| Headers | CSP, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy; HSTS in production | `api.test.mjs` |
| CSV | Formula prefixes neutralised in export | `dashboard-studio.js` |
| Rate limits | checkout 10, RSVP 30, QR 30, AI 20 per IP and 20 per account, all per minute | `index.mjs`, `ai.mjs` |
| Logs | Errors log only the error type; no request bodies, emails or tokens. Exception: in development only, the reset link is printed | Code review |
| Dependencies | `npm audit --omit=dev`: 0 vulnerabilities (24 Nov 2026) | — |

## Remaining risks

- Rate limits are in-memory and per process. Fine for the single-instance deployment; use a shared store if the app ever scales out.
- Refunds do not revoke access (owner decision D4).
- Image pixel dimensions are not checked (byte size is).
- Plain (non-personal) invitation links still accept a reply from anyone holding the link, by design.
- Email verification at signup is not implemented (D6).
