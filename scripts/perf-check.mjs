// Lab Web Vitals for representative pages: LCP, CLS, TTFB, requests and transferred bytes.
// Usage: start the server, then `node scripts/perf-check.mjs [origin] [invite-id]`. Lab numbers, not field (CrUX) data.
import { chromium } from '@playwright/test';

const origin = process.argv[2] || 'http://localhost:3000', invite = process.argv[3];
const pages = ['/', '/create.html', '/pricing.html', '/wedding-invitations', '/design.html?id=edition-ink-and-olive', '/account.html', ...(invite ? ['/invite.html?e=' + invite] : [])];
const profiles = {
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, cpu: 4, net: { latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 } },
  desktop: { viewport: { width: 1350, height: 940 }, deviceScaleFactor: 1, isMobile: false, hasTouch: false, cpu: 1, net: { latency: 40, downloadThroughput: 10e6 / 8, uploadThroughput: 5e6 / 8 } }
};
const browser = await chromium.launch({ channel: 'msedge' });
const rows = [];
for (const [name, p] of Object.entries(profiles)) for (const url of pages) {
  const context = await browser.newContext({ viewport: p.viewport, deviceScaleFactor: p.deviceScaleFactor, isMobile: p.isMobile, hasTouch: p.hasTouch });
  const page = await context.newPage(), cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, ...p.net });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: p.cpu });
  let bytes = 0, requests = 0;
  cdp.on('Network.loadingFinished', e => { bytes += e.encodedDataLength; requests++; });
  await page.addInitScript(() => {
    window.__vitals = { lcp: 0, cls: 0 };
    new PerformanceObserver(l => { for (const e of l.getEntries()) window.__vitals.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__vitals.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
  });
  const response = await page.goto(origin + url, { waitUntil: 'load', timeout: 90000 });
  await page.waitForTimeout(3000);
  const v = await page.evaluate(() => ({ ...window.__vitals, ttfb: performance.getEntriesByType('navigation')[0].responseStart }));
  rows.push({ profile: name, url, status: response.status(), lcpMs: Math.round(v.lcp), cls: +v.cls.toFixed(3), ttfbMs: Math.round(v.ttfb), requests, kb: Math.round(bytes / 1024) });
  await context.close();
}
await browser.close();
console.table(rows);
