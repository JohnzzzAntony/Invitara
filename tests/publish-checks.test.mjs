import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCatalog } from '../backend/catalog.mjs';

test('publish checks come from each template and pass once its own details are personalised', () => {
  const w = loadCatalog(), C = w.EVER_C;
  const labels = id => Array.from(C.validate(w.EVER_siteDefaults(id)), c => c.label);
  assert.deepEqual(labels('animated-wedding-moonlit-garden-gates').slice(0, 2), ['First name', 'Second name']);
  assert.ok(labels('animated-product-launch-perfume-unveil').includes('Product'));
  assert.ok(!labels('animated-product-launch-perfume-unveil').includes('First name'));

  const state = w.EVER_siteDefaults('animated-wedding-moonlit-garden-gates');
  assert.equal(C.isValid(state), false, 'sample text cannot be published');
  Object.assign(state.basics, { factFirstname: 'Noura', factSecondname: 'Omar', factInitials: 'N & O', factDateasshown: '20 · 11 · 2027', factReplybydate: '30 October 2027', factVenue: 'Emirates Palace', factVenueaddress: 'West Corniche, Abu Dhabi', title: 'Noura & Omar' });
  assert.equal(C.isValid(state), true, 'a sample start time is allowed');
  state.sections.rsvp.on = false;
  assert.equal(C.isValid(state), false, 'RSVP must stay on');
});
