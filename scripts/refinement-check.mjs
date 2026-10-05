import assert from 'node:assert/strict';
import {mkdirSync, writeFileSync} from 'node:fs';
import {chromium} from '@playwright/test';

const origin = process.env.TEST_ORIGIN || 'http://localhost:3000';
const widths = [1440, 1280, 1024, 768, 430, 390, 375, 320];
const routes = ['index.html', 'create.html', 'design.html?id=edition-vow', 'pricing.html', 'account.html', 'dashboard.html', 'terms.html', 'privacy.html', '404.html', 'demo.html?id=edition-orbit', 'invite.html'];
const browser = await chromium.launch({channel: 'msedge', headless: true});
const context = await browser.newContext({viewport: {width: 1440, height: 1000}, reducedMotion: 'reduce'});
const page = await context.newPage();
const errors = [], results = [];
page.on('pageerror', error => errors.push(error.message));
mkdirSync('artifacts/refinement', {recursive: true});

async function noOverflow(label) {
  const overflow = await page.evaluate(() => ({width: innerWidth, scroll: document.documentElement.scrollWidth}));
  assert.ok(overflow.scroll <= overflow.width + 1, `${label}: ${JSON.stringify(overflow)}`);
}

try {
  for (const route of routes) {
    await page.goto(`${origin}/${route}`);
    await page.locator('main, .demo-frame, .invite-missing').first().waitFor();
    await page.evaluate(() => document.fonts.ready);
    for (const width of widths) {
      await page.setViewportSize({width, height: width < 768 ? 844 : 1000});
      await noOverflow(`${route} at ${width}`);
      if ([1440, 390].includes(width)) {
        await page.screenshot({path: `artifacts/refinement/${route.split('.')[0]}-${width}.png`, fullPage: true});
        if (route === 'index.html') await page.screenshot({path: `artifacts/refinement/hero-${width}.png`});
      }
      results.push({route, width});
    }
  }

  await page.goto(`${origin}/index.html`);
  await page.locator('.studio-menu').click();
  assert.equal(await page.locator('.studio-menu').getAttribute('aria-expanded'), 'true');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.studio-menu').getAttribute('aria-expanded'), 'false');
  await page.locator('.studio-menu').click();
  await page.locator('.studio-links a[href="index.html#how"]').click();
  assert.equal(await page.locator('.studio-menu').getAttribute('aria-expanded'), 'false');
  await page.locator('.studio-menu').click();
  await page.mouse.click(5, 700);
  assert.equal(await page.locator('.studio-menu').getAttribute('aria-expanded'), 'false');

  await page.locator('[data-filter=birthday]').click();
  await page.locator('#template-search').fill('no-matching-invitation');
  await page.locator('#collection-empty').waitFor({state: 'visible'});
  await page.locator('#empty-reset').click();
  assert.equal(await page.locator('.collection-card').count(), 6);
  assert.equal(await page.locator('[data-filter=all]').getAttribute('aria-pressed'), 'true');

  await page.goto(`${origin}/create.html`);
  await page.locator('#template-sort').selectOption('name');
  const names = await page.locator('.collection-card h3').allTextContents();
  assert.deepEqual(names, [...names].sort((a, b) => a.localeCompare(b)));
  await page.locator('#load-more').click();
  assert.equal(await page.locator('.collection-card').count(), 14);
  await page.locator('.card-bottom button').first().click();
  await page.waitForURL('**/editor.html');
  await page.locator('#mobile-edit').click();
  await page.locator('#basics-body input[type=text]').first().fill('A lovely celebration');
  await page.locator('#save-btn').click();
  for (const width of widths) {
    await page.setViewportSize({width, height: 1000});
    await noOverflow(`editor at ${width}`);
  }
  await page.setViewportSize({width: 390, height: 844});
  await page.locator('#mobile-preview').click();
  await page.screenshot({path: 'artifacts/refinement/editor-390.png'});
  await page.goto(`${origin}/dashboard.html`);
  await page.locator('.dashboard-card').first().waitFor();
  await page.locator('.dashboard-card-actions button').filter({hasText: /^Preview$/}).first().click();
  await page.locator('.dashboard-live-preview[open]').waitFor();
  await noOverflow('dashboard preview');
  await page.getByRole('button', {name: 'Close preview', exact: true}).click();

  await page.goto(`${origin}/account.html`);
  await page.locator('[data-auth=login]').focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('[data-auth=register]').getAttribute('aria-selected'), 'true');
  await page.locator('input[name=email]').fill(`refinement-${Date.now()}@example.test`);
  await page.locator('input[name=password]').fill('refinement-test-password');
  await page.locator('#account-submit').click();
  await page.locator('#recovery-result').waitFor({state: 'visible'});
  assert.ok((await page.locator('#recovery-code').textContent()).length > 10);
  await page.locator('#account-continue').click();
  await page.goto(`${origin}/checkout.html`);
  await page.locator('#event-zone option').first().waitFor({state: 'attached'});
  for (const width of widths) {
    await page.setViewportSize({width, height: 1000});
    await noOverflow(`checkout at ${width}`);
  }
  await page.setViewportSize({width: 390, height: 844});
  await page.screenshot({path: 'artifacts/refinement/checkout-390.png', fullPage: true});

  await page.route('**/api/me', async route => {
    await new Promise(resolve => setTimeout(resolve, 500));
    await route.fulfill({status: 503, contentType: 'application/json', body: JSON.stringify({error: 'Temporary test outage'})});
  });
  await page.goto(`${origin}/dashboard.html`);
  await page.locator('#dashboard-loading').waitFor({state: 'visible'});
  await page.locator('#dashboard-retry').waitFor({state: 'visible'});
  assert.equal(await page.locator('#dashboard-loading').isVisible(), false);
  await page.unroute('**/api/me');
  await page.locator('#dashboard-retry').click();
  await page.locator('#dashboard-retry').waitFor({state: 'hidden'});
  await page.locator('#dashboard-loading').waitFor({state: 'hidden'});

  assert.deepEqual(errors, []);
  writeFileSync('artifacts/refinement/results.json', JSON.stringify({results, errors}, null, 2));
  console.log(`${results.length + 16} responsive checks passed. Navigation, filters, reset, sort, pagination, draft editing, preview, registration, checkout and account retry passed. No JavaScript errors.`);
} finally {
  await browser.close();
}
