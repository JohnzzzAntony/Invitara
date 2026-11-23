# Implementation decisions and owner questions

## Decisions made

- **Keep the stack.** Express + SQLite + static pages + Stripe + NVIDIA AI. No framework migration: every audit finding was fixable in place.
- **Email without a dependency.** Reset emails go to Resend's REST API with `fetch`. If `RESEND_API_KEY` is unset, production sends nothing and `/api/config` reports `emailReset:false`, so the button is hidden. Development prints the reset link to stdout (it contains a token; non-production only).
- **Reset token in the URL fragment** (`/account.html#reset=…`): never sent to the server, logs or `Referer`.
- **Additive schema only.** New tables: `password_resets`, `auth_events`, `guests`. New optional JSON fields on projects: `rsvpDeadline`, `reschedules`, `rescheduledAt`; on replies: `invited`, `checkedIn`. Existing rows need no migration; rollback leaves the extra tables unused.
- **Personal links are opt-in.** The plain link still accepts replies, so existing published invitations behave as before.
- **Prices:** display only. `TEMPLATE_PRICE` (99) and `VAT_RATE` (0.05) are unchanged. Stripe was already charging 103.95.
- **Browser-suite failures are not hidden.** They were reproduced on the pre-session commit and recorded (see `docs/QA.md`).

## Owner decisions needed

| # | Decision | Current state |
|---|---|---|
| D1 | Confirm VAT registration and that AED 103.95 including 5% VAT is the consumer price | Shown on all pages (pushed to `main` on 23 Nov) |
| D2 | **Rescheduling policy.** One free date change per purchase is now in `terms.html` and the dashboard | Published to `main` on 23 Nov **without legal sign-off**. Approve, change, or ask for a revert |
| D3 | Promo codes: whether to offer any | Checkout accepts Stripe promotion codes; none exist until created in Stripe |
| D4 | Refunds: should a refunded order lose publish/editor access? Partial refunds? | Not handled. Refunded orders keep access |
| D5 | Support email / WhatsApp values | Read from `SUPPORT_EMAIL` and `SUPPORT_WHATSAPP`; none invented |
| D6 | Email provider (Resend account, verified sending domain); then email verification at signup | Not configured |
| D7 | Arabic (RTL), Hindi, Malayalam: who provides and reviews the translations | Not started |
| D8 | Free watermarked demo mode | Not built |
| D9 | Should link previews (WhatsApp/iMessage) show the event date, venue and city, or only the title? | They show date, venue and city |

## Blocked or unverified

- Real Stripe test-mode checkout and webhook delivery: needs test keys and a reachable webhook URL (`stripe listen --forward-to localhost:3000/api/webhook`).
- Real email delivery: needs D6.
- Field Core Web Vitals (CrUX): needs production traffic. Lab numbers are in `docs/PERFORMANCE.md`.
- WebKit and Firefox: the existing suites use Edge only.
- Production backup restore and volume permissions: need Railway access.
