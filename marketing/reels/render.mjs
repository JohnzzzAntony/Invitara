// Renders each reel in reels.js to marketing/reels/out/<name>.mp4 (1080x1920, H.264, 30 fps) using WebCodecs in Edge.
// Usage: node marketing/reels/render.mjs [reel-name]   (run capture.mjs first)
import { chromium } from '@playwright/test';
import { mkdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url)), site = path.join(here, '..', '..', 'frontend', 'public'), out = path.join(here, 'out');
mkdirSync(out, { recursive: true });
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp4': 'video/mp4' };
const names = process.argv[2] ? [process.argv[2]] : Object.keys((new Function('window', readFileSync(path.join(here, 'reels.js'), 'utf8') + ';return window.REELS'))({}));

const browser = await chromium.launch({ channel: 'msedge', args: ['--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
for (const name of names) {
  const context = await browser.newContext({ viewport: { width: 540, height: 960 }, acceptDownloads: true });
  // Serve the composer, captured footage and brand assets from disk under one routed localhost origin (WebCodecs needs a secure context).
  await context.route('http://localhost:5199/**', route => {
    const url = new URL(route.request().url()), p = decodeURIComponent(url.pathname);
    const file = p.startsWith('/site/') ? path.join(site, p.slice(6)) : path.join(here, p);
    if (!file.startsWith(here) && !file.startsWith(site) || !existsSync(file)) return route.fulfill({ status: 404, body: 'missing' });
    route.fulfill({ status: 200, body: readFileSync(file), headers: { 'content-type': types[path.extname(file)] || 'application/octet-stream' } });
  });
  const page = await context.newPage();
  page.on('pageerror', e => console.error(name, 'page error:', e.message));
  const download = page.waitForEvent('download', { timeout: 180000 });
  await page.goto('http://localhost:5199/composer.html?reel=' + encodeURIComponent(name));
  const file = await download.then(d => d.saveAs(path.join(out, name + '.mp4')).then(() => path.join(out, name + '.mp4'))).catch(() => null);
  const result = await page.evaluate(() => window.__result);
  // Self-check of mp4.js: the browser must play the file back with the right length and size, and decode a frame mid-way.
  const check = file && await page.evaluate(async src => {
    const v = document.createElement('video'); v.muted = true; v.src = src;
    await new Promise((ok, fail) => { v.onloadedmetadata = ok; v.onerror = () => fail(new Error('unplayable')); });
    v.currentTime = v.duration / 2; await new Promise(ok => { v.onseeked = ok; });
    return { duration: +v.duration.toFixed(2), width: v.videoWidth, height: v.videoHeight, decodedMidFrame: v.readyState >= 2 };
  }, '/out/' + name + '.mp4').catch(e => ({ error: e.message }));
  const ok = check && !check.error && Math.abs(check.duration - result.seconds) < 0.1 && check.width === 1080 && check.height === 1920 && check.decodedMidFrame;
  console.log(name, ok ? 'OK' : 'FAILED', JSON.stringify(result), JSON.stringify(check));
  if (!ok) process.exitCode = 1;
  await context.close();
}
await browser.close();
