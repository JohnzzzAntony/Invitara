import test from 'node:test';
import assert from 'node:assert/strict';
import { createImage, editInvitation } from '../backend/ai.mjs';

const reply = body => { globalThis.fetch = async () => ({ ok: true, json: async () => body }); };
const fields = [
  { path: 'basics.nameA', type: 'text', label: 'Name', value: 'Sara' },
  { path: 'basics.date', type: 'date', label: 'Date', value: '' },
  { path: 'sections.story.items.0.title', type: 'text', label: 'Title', value: 'We met' },
  { path: 'sections.hero.photo', type: 'photo', label: 'Hero photo' },
  { path: 'sections.gallery.photo', type: 'photo', label: 'Gallery photo' },
  { path: 'sections.story.bg', type: 'color', label: 'Section background' }
];

test('AI edit places attached photos only in photo slots that exist', async () => {
  reply({ choices: [{ message: { content: '```json\n' + JSON.stringify({ reply: 'Placed.', ops: [
    { type: 'photo', path: 'sections.hero.photo', photo: 0 },
    { type: 'photo', path: 'basics.nameA', photo: 0 },
    { type: 'text', path: 'sections.hero.photo', value: 'x' }
  ] }) + '\n```' } }] });
  const jpeg = 'data:image/jpeg;base64,' + Buffer.concat([Buffer.from([255, 216, 255, 224]), Buffer.alloc(40)]).toString('base64');
  const out = await editInvitation({ message: 'Use my photo', photos: [jpeg], context: { fields, sections: [{ id: 'hero', label: 'Hero' }] } }, 'key');
  assert.deepEqual(out.ops, [{ type: 'photo', path: 'sections.hero.photo', photo: 0 }]);
});

test('AI edit rejects unknown field paths and non-image attachments', async () => {
  const sections = [{ id: 'hero', label: 'Hero' }];
  await assert.rejects(editInvitation({ message: 'x', context: { fields: [{ path: 'theme.__proto__', type: 'text', label: 'x' }], sections } }, 'key'), /Invalid template fields/);
  await assert.rejects(editInvitation({ message: 'x', photos: ['data:text/html;base64,PGI+'], context: { fields, sections } }, 'key'), /Use JPEG, PNG or WebP/);
});

test('AI image returns a validated data URL and surfaces provider errors', async () => {
  const jpeg = Buffer.concat([Buffer.from([255, 216, 255, 224]), Buffer.alloc(40)]).toString('base64');
  reply({ artifacts: [{ base64: jpeg }] });
  assert.equal((await createImage({ prompt: 'garden' }, 'key')).image, 'data:image/jpeg;base64,' + jpeg);
  globalThis.fetch = async () => ({ ok: false, status: 403 });
  await assert.rejects(createImage({ prompt: 'garden' }, 'key'), /unavailable/);
});

test('AI edit keeps only operations the editor and save validation accept', async () => {
  let sent;
  globalThis.fetch = async (url, init) => { sent = JSON.parse(init.body); return { ok: true, json: async () => ({ choices: [{ message: { content: '<think>{"draft":1}</think>' + JSON.stringify({ reply: 'Made it moodier.', ops: [
    { type: 'text', path: 'basics.nameA', value: 'Anna' },
    { type: 'text', path: 'basics.date', value: 'soon' },
    { type: 'text', path: 'basics.evil', value: 'x' },
    { type: 'item', section: 'story', action: 'add' },
    { type: 'text', path: 'sections.story.items.1.title', value: 'Paris' },
    { type: 'text', path: 'sections.story.items.2.title', value: 'too far' },
    { type: 'style', path: 'sections.story', property: 'padding', value: '80px' },
    { type: 'style', path: 'basics.nameA', property: 'fontSize', value: '999px' },
    { type: 'style', path: 'basics.nameA', property: 'color', value: 'red' },
    { type: 'theme', key: 'background', value: '#101010' },
    { type: 'theme', key: 'radius', value: '9px' },
    { type: 'design', key: 'nameFont', value: 'pfd' },
    { type: 'design', key: 'nameFont', value: 'comic' },
    { type: 'design', key: 'accent', value: '#aa8844' },
    { type: 'section', id: 'story', action: 'up' },
    { type: 'section', id: 'nope', action: 'up' },
    { type: 'text', path: 'sections.story.bg', value: '#1a1410' },
    { type: 'text', path: 'sections.story.bg', value: 'black' },
    { type: 'image', path: 'sections.hero.photo', prompt: 'candle-lit hall' },
    { type: 'photo', path: 'sections.hero.photo', photo: 3 }
  ] }) } }] }) }; };
  const context = {
    fields,
    sections: [{ id: 'hero', label: 'Hero' }, { id: 'story', label: 'Story', list: { key: 'items', label: 'Moment', count: 1, fields: [{ k: 'title', type: 'text', label: 'Title' }] } }],
    theme: { background: '#ffffff', radius: 'bad' }, themeSupported: true, design: { nameFont: 'corm' }, options: { nameFont: ['corm', 'pfd'] }, selected: 'basics.nameA'
  };
  const out = await editInvitation({ message: 'Make it moodier', context, history: [{ role: 'user', text: 'hi' }, { role: 'system', text: 'x' }] }, 'key');
  assert.equal(out.reply, 'Made it moodier.');
  assert.deepEqual(out.ops, [
    { type: 'text', path: 'basics.nameA', value: 'Anna' },
    { type: 'item', section: 'story', action: 'add' },
    { type: 'text', path: 'sections.story.items.1.title', value: 'Paris' },
    { type: 'style', path: 'sections.story', property: 'padding', value: '80px' },
    { type: 'theme', key: 'background', value: '#101010' },
    { type: 'design', key: 'nameFont', value: 'pfd' },
    { type: 'design', key: 'accent', value: '#aa8844' },
    { type: 'section', id: 'story', action: 'up' },
    { type: 'text', path: 'sections.story.bg', value: '#1a1410' },
    { type: 'image', path: 'sections.hero.photo', prompt: 'candle-lit hall' }
  ]);
  assert.equal(sent.chat_template_kwargs.enable_thinking, true);
  assert.deepEqual(sent.messages.map(m => m.role), ['system', 'user', 'user']);
  assert.match(sent.messages[2].content[0].text, /Selected element: basics\.nameA/);
  assert.match(sent.messages[2].content[0].text, /Theme now: \{"background":"#ffffff"\}/);
  await assert.rejects(editInvitation({ message: ' ', context }, 'key'), /what to change/);
  await assert.rejects(editInvitation({ message: 'x', context: { fields, sections: [{ id: '../x' }] } }, 'key'), /Invalid sections/);
});

test('AI edit drops theme operations for designs that do not use the theme', async () => {
  reply({ choices: [{ message: { content: JSON.stringify({ reply: 'Dark.', ops: [{ type: 'theme', key: 'background', value: '#101010' }, { type: 'text', path: 'sections.story.bg', value: '#101010' }] }) } }] });
  const out = await editInvitation({ message: 'Make it dark', context: { fields, sections: [{ id: 'story', label: 'Story' }], theme: { background: '#ffffff' } } }, 'key');
  assert.deepEqual(out.ops, [{ type: 'text', path: 'sections.story.bg', value: '#101010' }]);
});
