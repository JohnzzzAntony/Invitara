# Performance measurements

**These are lab numbers, not field data.** No CrUX or real-user data is available. Targets (75th percentile, field): LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1. INP needs real interactions and was not measured.

## Method

`node scripts/perf-check.mjs <origin>`: Playwright + Microsoft Edge (headless), local server in development mode (no asset versioning), median of a single run per page, 3 s settle after `load`.

- **mobile:** 390×844 at DPR 3, touch, 4× CPU slowdown, 150 ms latency, 1.6 Mbps down / 750 kbps up
- **desktop:** 1350×940 at DPR 1, no CPU slowdown, 40 ms latency, 10 Mbps down

Headless Edge rasterises in software, so paint-heavy pages read slower than on a real phone GPU.

## Results, 24 Nov 2026

"Before" = commit `97c0a2e` (before this session's work); "after" = current `main` plus working tree. Neither touched performance, so the differences are run-to-run noise (about ±300 ms on mobile LCP).

| Page | Mobile LCP before → after (ms) | Mobile CLS | Desktop LCP before → after (ms) | Desktop CLS | Mobile transfer |
|---|---|---|---|---|---|
| `/` | 4700 → 4396 | 0.003 | 916 → 788 | 0.003 | 54 req, 637 KB |
| `/create.html` | 4124 → 4212 | 0.002 | 536 → 556 | 0.083 | 66 req, 729 KB |
| `/pricing.html` | 2408 → 2320 | 0 | 564 → 548 | 0.002 | 54 req, 419 KB |
| `/wedding-invitations` | 4180 → 3512 | 0.019 | 680 → 792 | 0.043 | 61 req, 558 KB |
| `/design.html?id=edition-ink-and-olive` | 2188 → 2272 | 0 | 652 → 660 | 0.003 | 58 req, 469 KB |
| `/account.html` | 1484 → 1516 | 0 | 384 → 384 | 0.001 | 23 req, 108 KB |

TTFB: about 155 ms on mobile (all of it simulated latency) and about 45 ms on desktop.

## Findings

- **Desktop:** every page has LCP under 1 s and CLS under 0.1.
- **Mobile LCP is over target on `/`, `/create.html` and the occasion pages (3.5–4.7 s).** On `/`, the LCP element is the first hero card image (`assets/animated/11-…jpg`, 34 KB). It is preloaded and downloaded by about 1.7 s but painted at about 4.2–4.8 s.
- **First paint is held to about 3 s on every page under this profile**, including `/pricing.html` and `/` with JavaScript disabled, even though all render-blocking CSS (15 files, about 60 KB) arrives by about 1 s. Removing filters and shadows did not change it. Root cause: **not yet isolated**.
- **Experiment, reverted:** server-rendering the first hero card moved LCP to 4.1–4.3 s, inside the noise. Not kept.

## Next steps (in order)

1. Run Lighthouse or PageSpeed Insights against production for a second opinion, and collect field data (CrUX, or `web-vitals` sent to Plausible) before optimising further.
2. Record a Chrome performance trace of `/` on a real mid-range Android phone to find the 1–3 s gap before first paint.
3. Likely wins to test one at a time, each measured with `scripts/perf-check.mjs`:
   - combine the 15 stylesheets into one versioned file;
   - `defer` the about 25 catalogue scripts on `/`;
   - stop `js/hero.js` from replacing the first card.
