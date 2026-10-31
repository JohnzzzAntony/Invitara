import test from 'node:test';
import assert from 'node:assert/strict';
import { writeInvitation, createImage } from '../backend/ai.mjs';

const reply = body => { globalThis.fetch = async () => ({ ok: true, json: async () => body }); };
const fields = [
  { path: 'basics.nameA', type: 'text', label: 'Name', value: 'Sara' },
  { path: 'basics.date', type: 'date', label: 'Date', value: '' },
  { path: 'sections.story.items.0.title', type: 'text', label: 'Title', value: 'We met' },
  { path: 'sections.hero.photo', type: 'photo', label: 'Hero photo' },
  { path: 'sections.gallery.photo', type: 'photo', label: 'Gallery photo' }
];

test('AI draft keeps only requested fields, valid dates and photo slots', async () => {
  reply({ choices: [{ message: { content: '```json\n' + JSON.stringify({
    fields: { 'basics.nameA': 'Anna', 'basics.date': 'next June', 'sections.story.items.0.title': 'Paris', 'basics.evil': 'x' },
    photos: { 'sections.hero.photo': 9 },
    imagePrompts: { 'sections.hero.photo': 'rose garden', 'sections.gallery.photo': 'candle-lit table' }
  }) + '\n```' } }] });
  const out = await writeInvitation({ details: 'Anna & Ben', fields }, 'key');
  assert.deepEqual(out.fields, { 'basics.nameA': 'Anna', 'sections.story.items.0.title': 'Paris' });
  assert.deepEqual(out.photos, {});
  assert.deepEqual(out.imagePrompts, { 'sections.hero.photo': 'rose garden', 'sections.gallery.photo': 'candle-lit table' });
});

test('AI draft rejects unknown field paths and empty details', async () => {
  await assert.rejects(writeInvitation({ details: 'x', fields: [{ path: 'theme.__proto__', type: 'text', label: 'x' }] }, 'key'), /Invalid template fields/);
  await assert.rejects(writeInvitation({ details: ' ', fields }, 'key'), /Add a few details/);
});

test('AI image returns a validated data URL and surfaces provider errors', async () => {
  const jpeg = Buffer.concat([Buffer.from([255, 216, 255, 224]), Buffer.alloc(40)]).toString('base64');
  reply({ artifacts: [{ base64: jpeg }] });
  assert.equal((await createImage({ prompt: 'garden' }, 'key')).image, 'data:image/jpeg;base64,' + jpeg);
  globalThis.fetch = async () => ({ ok: false, status: 403 });
  await assert.rejects(createImage({ prompt: 'garden' }, 'key'), /unavailable/);
});
