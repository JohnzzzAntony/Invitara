import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { loadCatalog } from '../backend/catalog.mjs';

test('SteelFab 2027 is a focused corporate RSVP template with its local artwork and official link', () => {
  const catalog = loadCatalog();
  const template = catalog.EVER_findTemplate('steelfab-2027');
  const state = catalog.EVER_siteDefaults('steelfab-2027');

  assert.equal(template.occasion, 'corporate');
  assert.equal(template.style, 'Industrial');
  assert.deepEqual(Array.from(state.order), ['hero', 'details', 'rsvp']);
  assert.equal(state.basics.date, '2027-01-11');
  assert.equal(state.basics.venue, 'Expo Centre Sharjah');
  assert.equal(state.sections.details.mapUrl, 'https://steelfabme.com/');
  assert.equal(state.sections.rsvp.on, true);
  assert.equal(state.sections.hero.buttonTarget, 'rsvp');
  assert.ok(existsSync(new URL('../frontend/public/assets/steelfab-2027/welding.webp', import.meta.url)));
  assert.ok(catalog.INVITARA_CATALOG.styles.includes('Industrial'));
});
