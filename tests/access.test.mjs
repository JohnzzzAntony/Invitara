import test from 'node:test';
import assert from 'node:assert/strict';
import { eventExpiry, editable } from '../server/access.mjs';
const now = Date.parse('2026-01-01T00:00:00Z');
test('Dubai expires at the next local midnight', () => assert.equal(eventExpiry('2026-09-22','Asia/Dubai',now), Date.parse('2026-09-22T20:00:00Z')));
test('DST boundaries use calendar days, not 24-hour offsets', () => {
  assert.equal(eventExpiry('2026-03-08','America/New_York',now), Date.parse('2026-03-09T04:00:00Z'));
  assert.equal(eventExpiry('2026-11-01','America/New_York',now), Date.parse('2026-11-02T05:00:00Z'));
});
test('rejects invalid dates, zones and past events', () => {
  for (const [d,z] of [['2026-02-30','UTC'],['2026-09-22','fake/zone'],['2025-01-01','UTC'],['','UTC']]) assert.throws(() => eventExpiry(d,z,now));
});
test('expiry is exclusive and payment is mandatory', () => {
  assert.equal(editable({paid:true,expiresAt:100},99),true);
  assert.equal(editable({paid:true,expiresAt:100},100),false);
  assert.equal(editable({paid:false,expiresAt:100},99),false);
  assert.equal(editable({paid:true},99),false);
});
