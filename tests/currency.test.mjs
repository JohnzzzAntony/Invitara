import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCatalog } from '../backend/catalog.mjs';

test('every design is AED 99 and prices follow the visitor region', () => {
  const C = loadCatalog().EVER_C;
  assert.equal(C.TEMPLATE_PRICE, 99);
  assert.equal(C.regionCurrency('Asia/Dubai', ['en-US']), 'AED');
  assert.equal(C.regionCurrency('Asia/Kolkata', []), 'INR');
  assert.equal(C.regionCurrency('Europe/Paris', ['fr-FR']), 'EUR');
  assert.equal(C.regionCurrency('America/Chicago', []), 'USD');
  assert.equal(C.regionCurrency('Pacific/Fiji', ['en-GB']), 'GBP');
  assert.equal(C.regionCurrency('Pacific/Fiji', ['fr']), 'AED');
  assert.equal(C.localMoney(99, 'AED'), 'AED 99');
  assert.match(C.localMoney(99, 'USD'), /26\.96/);
});
