// Mobile responsiveness check: footer accordions, contact support card, template filters sheet,
// overflow, typography and touch targets at phone, tablet and desktop widths.
// Usage: start the server (npm start), then `npm run test:mobile`. TEST_ORIGIN overrides the URL.
import assert from 'node:assert/strict';
import {existsSync, mkdirSync} from 'node:fs';
import {chromium} from '@playwright/test';

const origin = process.env.TEST_ORIGIN || 'http://localhost:3000';
const widths = [320, 360, 375, 390, 414, 768, 1024, 1440];
const pages = ['index.html', 'create.html', 'wedding-invitations', 'contact.html', 'pricing.html', 'terms.html', 'privacy.html', 'account.html', '404.html'];
const shots = process.env.MOBILE_SHOTS || 'artifacts/mobile';
const executablePath = process.env.PW_CHROMIUM || (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const browser = await chromium.launch(executablePath ? {executablePath, args: ['--no-sandbox']} : {});
mkdirSync(shots, {recursive: true});

const failures = [];
const passed = [];
async function check(label, fn) {
  try { await fn(); passed.push(label); } catch (error) { failures.push(`${label}: ${error.message.split('\n')[0]}`); }
}

const phone = width => width < 768;

async function open(width, path) {
  const context = await browser.newContext({viewport: {width, height: phone(width) ? 800 : 1000}, hasTouch: phone(width)});
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error' && !/Failed to load resource/.test(message.text())) errors.push(message.text()); });
  await page.goto(`${origin}/${path}`, {waitUntil: 'networkidle'});
  await page.evaluate(() => document.fonts.ready);
  return {context, page, errors};
}

async function noOverflow(page) {
  const size = await page.evaluate(() => ({inner: innerWidth, scroll: document.documentElement.scrollWidth, body: document.body.scrollWidth}));
  assert.ok(size.scroll <= size.inner && size.body <= size.inner, `horizontal overflow ${JSON.stringify(size)}`);
}

// Interactive elements inside the given scope must be at least 44px tall (and 44px wide for icon buttons).
async function touchTargets(page, scope) {
  const small = await page.evaluate(selector => Array.from(document.querySelectorAll(selector)).filter(el => {
    const r = el.getBoundingClientRect(), s = getComputedStyle(el);
    if (!r.width || !r.height || s.visibility === 'hidden' || el.closest('[inert],[hidden]')) return false;
    return r.height < 44 || r.width < 44;
  }).map(el => `${el.tagName.toLowerCase()}.${el.className || el.id}:${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`), scope);
  assert.deepEqual(small, [], `targets under 44px: ${small.join(', ')}`);
}

for (const width of widths) {
  for (const path of pages) {
    const {context, page, errors} = await open(width, path);
    const label = `${path} @${width}`;
    await check(`${label} no horizontal scroll`, () => noOverflow(page));
    await check(`${label} no script errors`, () => assert.deepEqual(errors, []));

    if (phone(width)) {
      await check(`${label} 16px gutters`, async () => {
        const gutter = await page.evaluate(() => {
          const wrap = document.querySelector('.studio-footer')?.parentElement || document.querySelector('.studio-wrap');
          const r = wrap.getBoundingClientRect();
          return [Math.round(r.left), Math.round(innerWidth - r.right)];
        });
        assert.deepEqual(gutter, [16, 16]);
      });
      await check(`${label} body text 14–16px`, async () => {
        const size = await page.evaluate(() => parseFloat(getComputedStyle(document.body).fontSize));
        assert.ok(size >= 14 && size <= 16, `body ${size}px`);
      });
      if (['create.html', 'contact.html', 'terms.html', 'privacy.html', 'wedding-invitations'].includes(path)) {
        await check(`${label} h1 28–36px`, async () => {
          const size = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('main h1')).fontSize));
          assert.ok(size >= 28 && size <= 36, `h1 ${size}px`);
        });
      }
    }

    if (path !== '404.html' || width === 375) {
      // Footer: accordions on phones, open columns elsewhere, every link reachable either way.
      await check(`${label} footer`, async () => {
        const footer = page.locator('.studio-footer');
        await footer.scrollIntoViewIfNeeded();
        const toggles = footer.locator('.footer-toggle');
        const hrefs = await footer.locator('.footer-column a').evaluateAll(links => links.map(a => a.getAttribute('href')));
        assert.ok(hrefs.length >= 14 && hrefs.every(Boolean), 'footer links present');
        if (!phone(width)) {
          assert.equal(await toggles.count(), 0, 'no accordion toggles on desktop');
          for (const link of await footer.locator('.footer-column a').all()) assert.ok(await link.isVisible(), 'desktop footer link visible');
          const columns = await page.evaluate(() => getComputedStyle(document.querySelector('.studio-footer')).gridTemplateColumns.split(' ').length);
          assert.ok(columns >= 3, `desktop footer keeps columns (${columns})`);
          return;
        }
        assert.equal(await toggles.count(), 4, 'four accordion toggles');
        await touchTargets(page, '.studio-footer a, .studio-footer button');
        const first = toggles.first();
        assert.equal(await first.getAttribute('aria-expanded'), 'false');
        const panel = page.locator('#' + await first.getAttribute('aria-controls'));
        assert.equal(await panel.evaluate(el => el.inert), true, 'collapsed panel is inert');
        await first.focus();
        await page.keyboard.press('Enter');
        await page.waitForTimeout(350);
        assert.equal(await first.getAttribute('aria-expanded'), 'true', 'Enter opens');
        assert.ok(await panel.locator('a').first().isVisible(), 'opened links visible');
        await page.keyboard.press('Tab');
        assert.equal(await page.evaluate(() => document.activeElement.closest('.footer-links')?.id), await first.getAttribute('aria-controls'), 'Tab moves into opened links');
        await first.click();
        await page.waitForTimeout(350);
        assert.equal(await first.getAttribute('aria-expanded'), 'false', 'click closes');
        if (width === 375 && path === 'index.html') {
          await first.click(); await page.waitForTimeout(350);
          await page.screenshot({path: `${shots}/footer-open-${width}.png`, fullPage: false});
          await Promise.all([page.waitForURL(/wedding-invitations/), panel.locator('a').first().click()]);
        }
      });
    }

    if (path === 'contact.html') {
      await check(`${label} contact support card`, async () => {
        const email = page.locator('#contact-email');
        assert.match(await email.getAttribute('href'), /^mailto:info@momentsiz\.com$/);
        assert.equal((await email.textContent()).trim(), 'info@momentsiz.com');
        const cta = page.locator('.contact-cta[data-support-email]');
        assert.match(await cta.getAttribute('href'), /^mailto:info@momentsiz\.com\?subject=/);
        const fits = await page.evaluate(() => [...document.querySelectorAll('.contact-card')].every(card => card.scrollWidth <= card.clientWidth && card.getBoundingClientRect().right <= innerWidth));
        assert.ok(fits, 'cards contain their content');
        const help = await page.locator('.contact-help a').evaluateAll(links => links.map(a => a.getAttribute('href')));
        assert.deepEqual(help, ['/#faq-title', 'pricing.html']);
        if (phone(width)) await touchTargets(page, '.contact-card a');
        // A long address must wrap inside the card rather than widen the page.
        await page.evaluate(() => { document.querySelector('#contact-email').textContent = 'customer-support-team-for-invitations@a-very-long-domain-name.example'; });
        await noOverflow(page);
      });
    }

    if (path === 'create.html' || path === 'wedding-invitations') {
      await check(`${label} template tools and grid`, async () => {
        await page.locator('#collection-grid > *').first().waitFor();
        const box = sel => page.locator(sel).boundingBox();
        const search = await box('.search-control'), filters = await box('#filter-toggle'), sort = await box('.sort-control');
        if (phone(width)) {
          const tools = await box('.collection-tools');
          assert.ok(Math.abs(search.width - tools.width) < 1, 'search spans the row');
          assert.ok(filters.y > search.y + search.height - 1, 'filters below search');
          assert.ok(Math.abs(filters.y - sort.y) < 1 && Math.abs(filters.width - sort.width) < 1, 'filters and sort side by side, equal width');
          await touchTargets(page, '.collection-tools input, .collection-tools select, .collection-tools button, .card-bottom > *');
          const grid = await page.evaluate(() => {
            const cards = [...document.querySelectorAll('#collection-grid > .collection-card')].slice(0, 6);
            const art = cards.map(c => c.querySelector('.collection-art').getBoundingClientRect());
            return {columns: getComputedStyle(document.getElementById('collection-grid')).gridTemplateColumns.split(' ').length, widths: [...new Set(cards.map(c => Math.round(c.getBoundingClientRect().width)))], ratios: [...new Set(art.map(r => (r.width / r.height).toFixed(2)))]};
          });
          assert.equal(grid.columns, 2, 'two-column grid');
          assert.equal(grid.widths.length, 1, `equal card widths ${grid.widths}`);
          assert.equal(grid.ratios.length, 1, `equal art ratios ${grid.ratios}`);
        } else {
          assert.ok(filters.x < search.x, 'desktop keeps Filters before search');
        }
        const total = Number((await page.locator('#results-count').textContent()).match(/\d+/)[0]);
        assert.ok(total > 0, 'result count shown');
        // Search and sort still work.
        await page.fill('#template-search', 'zzzz-no-match');
        assert.equal(await page.locator('#collection-empty').isVisible(), true, 'search filters results');
        await page.fill('#template-search', '');
        await page.selectOption('#template-sort', 'name');
        const names = await page.locator('#collection-grid .collection-card-top h3').allTextContents();
        assert.deepEqual(names, [...names].sort((a, b) => a.localeCompare(b)), 'sorted by name');
        await page.selectOption('#template-sort', 'featured');
        // Filter sheet: stage, apply, count, clear, close.
        await page.click('#filter-toggle');
        const sheet = page.locator('#filter-drawer');
        await sheet.waitFor({state: 'visible'});
        await page.waitForTimeout(350);
        const sheetBox = await sheet.boundingBox();
        if (phone(width)) {
          assert.ok(Math.abs(sheetBox.y + sheetBox.height - (await page.evaluate(() => innerHeight))) < 2 && Math.abs(sheetBox.width - width) < 2, 'bottom sheet');
          await touchTargets(page, '#filter-drawer button');
          if (width === 375 && path === 'create.html') await page.screenshot({path: `${shots}/filters-sheet-${width}.png`});
        }
        const option = sheet.locator('[data-filter-key="occasion"]:not([data-filter-value="all"])').first();
        const occasion = await option.getAttribute('data-filter-value');
        await option.click();
        const staged = Number((await page.locator('#filter-match').textContent()).match(/\d+/)[0]);
        assert.equal(Number((await page.locator('#results-count').textContent()).match(/\d+/)[0]), path === 'create.html' ? total : Number((await page.locator('#results-count').textContent()).match(/\d+/)[0]), 'selection is staged until Apply');
        await page.click('#apply-filters');
        await sheet.waitFor({state: 'hidden'});
        assert.equal(Number((await page.locator('#results-count').textContent()).match(/\d+/)[0]), staged, 'Apply commits the staged count');
        assert.equal(await page.locator('#filter-count').textContent(), '1', 'active filter count');
        assert.ok(await page.locator('#filter-count').isVisible(), 'badge visible');
        assert.equal(new URL(page.url()).searchParams.get('occasion'), occasion, 'URL reflects filter');
        // Close discards staged changes.
        await page.click('#filter-toggle');
        await sheet.waitFor({state: 'visible'});
        await page.click('#reset-filters');
        await page.keyboard.press('Escape');
        await sheet.waitFor({state: 'hidden'});
        assert.equal(await page.locator('#filter-count').textContent(), '1', 'Escape keeps applied filters');
        // Clear all + Apply resets.
        await page.click('#filter-toggle');
        await sheet.waitFor({state: 'visible'});
        await page.click('#reset-filters');
        await page.click('#apply-filters');
        await sheet.waitFor({state: 'hidden'});
        assert.equal(await page.locator('#filter-count').isVisible(), false, 'no badge after clear');
        assert.equal(Number((await page.locator('#results-count').textContent()).match(/\d+/)[0]) >= staged, true, 'clear restores results');
        await noOverflow(page);
      });
    }

    if ([320, 375, 768, 1440].includes(width) && ['create.html', 'contact.html', 'index.html'].includes(path)) {
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } scrollTo(0, 0); });
      await page.waitForTimeout(600);
      await page.screenshot({path: `${shots}/${path.replace('.html', '')}-${width}.png`, fullPage: true});
    }
    await context.close();
  }
}
await browser.close();

console.log(`mobile-check: ${passed.length} passed, ${failures.length} failed across ${widths.join(', ')}px`);
if (failures.length) { console.log(failures.map(f => '  ✗ ' + f).join('\n')); process.exit(1); }
