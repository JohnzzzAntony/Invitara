// Records real footage of the running site for the reels: 576x1024 JPEG frames with timestamps.
// shortcut: headless screencast ignores deviceScaleFactor, so frames are CSS-pixel size and the renderer upscales 1.875x; capture headed or via virtual-time screenshots if sharper footage is needed.
// Usage: start the site, then `node marketing/reels/capture.mjs [origin]`. Output: marketing/reels/footage/<clip>/.
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const origin = process.argv[2] || 'http://localhost:3100';
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), 'footage');
const T = '/invitation-templates/';
// Each clip: a page, then steps. 'open' taps the template's own opener; 'scroll' glides down by N screens.
const clips = [
  ['palace', T + '12-wedding-royal-palace-doors/index.html', [['wait', 1200], ['open'], ['wait', 4200], ['scroll', 2.2, 4000]]],
  ['garden', T + '11-wedding-moonlit-garden-gates/index.html', [['wait', 1200], ['open'], ['wait', 4200], ['scroll', 2.2, 4000]]],
  ['champagne', T + '13-anniversary-golden-50-champagne/index.html', [['wait', 1000], ['open'], ['wait', 4000], ['scroll', 2, 3500]]],
  ['cinema', T + '14-anniversary-cinema-love-story/index.html', [['wait', 1000], ['open'], ['wait', 4000], ['scroll', 2, 3500]]],
  ['clouds', T + '15-birthday-gates-in-the-clouds/index.html', [['wait', 1000], ['open'], ['wait', 4000], ['scroll', 2, 3500]]],
  ['cocktail', T + '16-birthday-art-deco-cocktail/index.html', [['wait', 1000], ['open'], ['wait', 4000], ['scroll', 2, 3500]]],
  ['perfume', T + '17-product-launch-perfume-unveil/index.html', [['wait', 1000], ['open'], ['wait', 4000], ['scroll', 2, 3500]]],
  ['drop', T + '18-product-launch-coming-soon-drop/index.html', [['wait', 1000], ['open'], ['wait', 4000], ['scroll', 2, 3500]]],
  ['home', T + '19-housewarming-we-found-our-home/index.html', [['wait', 1000], ['open'], ['wait', 4000], ['scroll', 2, 3500]]],
  ['diya', T + '20-housewarming-griha-pravesh-diya/index.html', [['wait', 1000], ['open'], ['wait', 4000], ['scroll', 2, 3500]]],
  ['site-home', '/', [['wait', 3500], ['scroll', 1.2, 2500], ['wait', 1500], ['scroll', 1.5, 3000], ['wait', 1000]]],
  ['site-catalog', '/create.html', [['wait', 2500], ['scroll', 2.5, 5000], ['wait', 800]]],
  ['site-pricing', '/pricing.html', [['wait', 2000], ['scroll', 1.2, 3000], ['wait', 1500]]],
  ['site-design', '/design.html?id=animated-wedding-royal-palace-doors', [['wait', 3000], ['scroll', 1.5, 3500], ['wait', 1000]]],
  // Guest journey on a template: open, glide to RSVP, fill it in, send.
  ['rsvp', T + '12-wedding-royal-palace-doors/index.html', [['wait', 800], ['open'], ['wait', 2600], ['scrollto', '#rsvp', 1800], ['wait', 500], ['type', '#rsvp-name', 'Sara Ahmed'], ['click', 'input[name=attending][value=yes]'], ['select', '#rsvp-guests', '2'], ['type', '#rsvp-msg', 'So happy for you both!'], ['wait', 400], ['click', '#rsvp button[type=submit]'], ['wait', 2200]]],
  // Needs REEL_GUEST_LINK (an /invite.html?e=…&g=… path from a local test invitation).
  ['guest-link', process.env.REEL_GUEST_LINK, [['wait', 2500], ['scrollto', '.invite-guest-actions', 3500], ['wait', 2000]]],
  // Needs REEL_LOGIN=email:password for a local test account that owns a published invitation with replies.
  ['dashboard', '/dashboard.html', [['css', '#dashboard-status{visibility:hidden!important}'], ['wait', 2500], ['click', 'button:text-is("Guest replies")'], ['wait', 3000], ['click', 'dialog[open] .dialog-close'], ['click', 'button:text-is("Share ↗")'], ['js', "document.getElementById('share-link').value='https://momentsiz.com/invite.html?e=clara-and-matteo'"], ['wait', 1500], ['scrollto', 'dialog[open] .personal-links', 800], ['click', 'dialog[open] .personal-links summary'], ['wait', 2500]]]
];

const only = process.argv[3];
const browser = await chromium.launch({ channel: 'msedge' });
for (const [name, url, steps] of clips) {
  if (only && only !== name) continue;
  if (!url) { console.log(name, 'skipped: missing environment variable'); continue; }
  const dir = path.join(out, name);
  rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  const context = await browser.newContext({ viewport: { width: 576, height: 1024 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  if (name === 'dashboard') {
    const [email, password] = String(process.env.REEL_LOGIN || '').split(':');
    const r = await context.request.post(origin + '/api/auth/login', { headers: { Origin: process.env.REEL_API_ORIGIN || origin }, data: { email, password } });
    if (!r.ok()) { console.log(name, 'skipped: login failed'); await context.close(); continue; }
  }
  await page.goto(origin + url, { waitUntil: 'load' });
  // Marketing footage: no install banner or skip links over the artwork.
  await page.addStyleTag({ content: '.install-prompt,[class*=install],.skip,.skip-link{display:none!important}' }).catch(() => {});
  const cdp = await context.newCDPSession(page), frames = [];
  cdp.on('Page.screencastFrame', async f => {
    frames.push({ t: f.metadata.timestamp, data: f.data });
    await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 88, maxWidth: 1080, maxHeight: 1920, everyNthFrame: 1 });
  for (const [kind, a, b] of steps) {
    if (kind === 'wait') await page.waitForTimeout(a);
    if (kind === 'open') {
      const opener = page.locator('button.tap, button[class*=open], button[aria-label*=open i], button[aria-label*=tap i], button').first();
      if (await opener.count()) await opener.click({ timeout: 3000 }).catch(() => page.mouse.click(288, 560));
      else await page.mouse.click(288, 560);
    }
    if (kind === 'css') await page.addStyleTag({ content: a });
    if (kind === 'js') await page.evaluate(a);
    if (kind === 'click') await page.locator(a).first().click({ timeout: 5000 });
    if (kind === 'select') await page.locator(a).selectOption(b);
    if (kind === 'type') { await page.locator(a).click(); await page.keyboard.type(b, { delay: 70 }); }
    if (kind === 'scrollto') await page.evaluate(([sel, ms]) => new Promise(done => {
      const el = document.querySelector(sel); if (!el) return done();
      const start = scrollY, by = el.getBoundingClientRect().top - innerHeight * .12, t0 = performance.now();
      (function step(now) { const k = Math.min(1, (now - t0) / ms), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; scrollTo(0, start + by * e); k < 1 ? requestAnimationFrame(step) : done(); })(t0);
    }), [a, b]);
    if (kind === 'scroll') await page.evaluate(([screens, ms]) => new Promise(done => {
      const start = scrollY, by = innerHeight * screens, t0 = performance.now();
      (function step(now) { const k = Math.min(1, (now - t0) / ms), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; scrollTo(0, start + by * e); k < 1 ? requestAnimationFrame(step) : done(); })(t0);
    }), [a, b]);
  }
  await cdp.send('Page.stopScreencast');
  const t0 = frames[0]?.t || 0, index = frames.map((f, i) => { const file = String(i).padStart(4, '0') + '.jpg'; writeFileSync(path.join(dir, file), Buffer.from(f.data, 'base64')); return [file, +(f.t - t0).toFixed(3)]; });
  writeFileSync(path.join(dir, 'frames.json'), JSON.stringify(index));
  console.log(name, frames.length + ' frames', (index.at(-1)?.[1] || 0).toFixed(1) + 's');
  await context.close();
}
await browser.close();
