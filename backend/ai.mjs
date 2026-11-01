// AI assistant for the editor. Proxies NVIDIA's API Catalog so the key never reaches the browser.
// The client sends the editor's state; the model replies with edit operations, and only operations
// on that state's fields and sections, with values the save endpoint accepts, come back.
import { validatePhoto } from './photo.mjs';
import { STYLE_CHOICES, STYLE_RANGES, THEME_COLORS, THEME_CHOICES, validStyle, validTheme } from './invitation-state.mjs';

const CHAT_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const CHAT_MODEL = 'nvidia/nemotron-3.5-super-vl-120b-a12b';
const IMAGE_URL = 'https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell';
const PATH = /^(basics\.[a-zA-Z]+|sections\.[a-zA-Z0-9]+\.(?:[a-zA-Z]+|[a-zA-Z]+\.\d{1,2}\.[a-zA-Z]+))$/;
const TYPES = ['text', 'textarea', 'date', 'photo', 'color'];

class AiError extends Error { constructor(status, message) { super(message); this.status = status; } }

async function nvidia(url, body, key) {
  let r;
  try { r = await fetch(url, { method: 'POST', headers: { Authorization: 'Bearer ' + key, Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(120000) }); }
  catch { throw new AiError(504, 'The AI service took too long. Please try again.'); }
  if (!r.ok) {
    console.error('NVIDIA request failed:', r.status, [401, 403].includes(r.status) ? '(check NVIDIA_API_KEY)' : '');
    throw new AiError(502, r.status === 429 ? 'The AI service is busy. Please wait a minute and try again.' : 'The AI service is unavailable right now. Please try again later.');
  }
  return r.json();
}

function readFields(input) {
  if (!Array.isArray(input) || !input.length || input.length > 250) throw new AiError(400, 'This template has no editable fields.');
  return input.map(f => {
    if (!f || typeof f.path !== 'string' || !PATH.test(f.path) || !TYPES.includes(f.type) || typeof f.label !== 'string' || f.label.length > 120 || (f.value != null && typeof f.value !== 'string')) throw new AiError(400, 'Invalid template fields.');
    return f.type === 'photo' ? { path: f.path, type: f.type, label: f.label, filled: !!f.filled } : { path: f.path, type: f.type, label: f.label, value: String(f.value || '').slice(0, 600) };
  });
}

function parseJson(text) {
  text = String(text).replace(/<think>[\s\S]*?<\/think>/g, '');
  const start = text.indexOf('{'), end = text.lastIndexOf('}');
  try { return JSON.parse(text.slice(start, end + 1)); } catch { throw new AiError(502, 'The AI returned an unreadable draft. Please try again.'); }
}

function readPhotos(input) {
  const photos = Array.isArray(input) ? input.slice(0, 6) : [];
  for (const p of photos) {
    let valid = typeof p === 'string' && p.startsWith('data:') && p.length <= 400000;
    try { if (valid) validatePhoto(p); } catch { valid = false; }
    if (!valid) throw new AiError(400, 'Use JPEG, PNG or WebP photos.');
  }
  return photos;
}

const ID = /^[a-zA-Z0-9]{1,40}$/;
const SECTION_ACTIONS = ['up', 'down', 'hide', 'show', 'delete', 'duplicate'];
const DESIGN_KEYS = ['nameFont', 'bodyFont', 'accent', 'btnShape', 'spacing'];
const short = (v, n) => typeof v === 'string' ? v.slice(0, n) : '';

/* The editor's current state as the model sees it: fields with values, sections (with list
   item counts), theme, design choices and their allowed values, and the selected element. */
function readContext(c) {
  if (!c || typeof c !== 'object') throw new AiError(400, 'Invalid editor state.');
  const fields = readFields(c.fields);
  if (!Array.isArray(c.sections) || c.sections.length > 60) throw new AiError(400, 'Invalid sections.');
  const sections = c.sections.map(s => {
    if (!s || !ID.test(s.id)) throw new AiError(400, 'Invalid sections.');
    const out = { id: s.id, label: short(s.label, 120), on: s.on !== false };
    const l = s.list;
    if (l && ID.test(l.key) && Number.isInteger(l.count) && l.count >= 0 && l.count <= 100 && Array.isArray(l.fields)) {
      out.list = { key: l.key, label: short(l.label, 60), count: l.count, fields: l.fields.filter(f => f && ID.test(f.k) && TYPES.includes(f.type)).slice(0, 20).map(f => ({ k: f.k, type: f.type, label: short(f.label, 60) })) };
    }
    return out;
  });
  const options = {}, design = {}, theme = {};
  for (const k of DESIGN_KEYS) {
    options[k] = Array.isArray(c.options?.[k]) ? c.options[k].filter(v => typeof v === 'string' && v.length <= 40).slice(0, 30) : [];
    design[k] = short(c.design?.[k], 40);
  }
  for (const [k, v] of Object.entries(c.theme && typeof c.theme === 'object' ? c.theme : {})) if (validTheme(k, v)) theme[k] = v;
  return { fields, sections, options, design, theme, themeSupported: c.themeSupported === true, selected: short(c.selected, 200) };
}

/* Keeps only operations the editor can apply and the save endpoint will accept. */
function checkOps(ops, ctx, photoCount) {
  const field = new Map(ctx.fields.map(f => [f.path, f])), section = new Map(ctx.sections.map(s => [s.id, s]));
  const added = {};
  for (const op of ops) if (op?.type === 'item' && op.action === 'add' && section.get(op.section)?.list) added[op.section] = (added[op.section] || 0) + 1;
  /* Text and photo fields, including list items the same reply adds. */
  const fieldAt = path => {
    if (field.has(path)) return field.get(path);
    const m = /^sections\.([a-zA-Z0-9]+)\.([a-zA-Z0-9]+)\.(\d{1,3})\.([a-zA-Z0-9]+)$/.exec(String(path)), list = m && section.get(m[1])?.list;
    if (!list || list.key !== m[2] || +m[3] >= list.count + (added[m[1]] || 0)) return null;
    return list.fields.find(f => f.k === m[4]) || null;
  };
  const out = [];
  for (const op of ops.slice(0, 300)) {
    if (!op || typeof op !== 'object') continue;
    const f = fieldAt(op.path);
    if (op.type === 'text' && f && f.type !== 'photo' && typeof op.value === 'string') {
      if (f.type === 'date') { if (/^\d{4}-\d{2}-\d{2}$/.test(op.value)) out.push({ type: 'text', path: op.path, value: op.value }); }
      else if (f.type === 'color') { if (/^(#[a-f0-9]{6})?$/i.test(op.value)) out.push({ type: 'text', path: op.path, value: op.value }); }
      else out.push({ type: 'text', path: op.path, value: op.value.slice(0, f.type === 'textarea' ? 2000 : 240) });
    } else if (op.type === 'photo' && f?.type === 'photo' && Number.isInteger(op.photo) && op.photo >= 0 && op.photo < photoCount) {
      out.push({ type: 'photo', path: op.path, photo: op.photo });
    } else if (op.type === 'image' && f?.type === 'photo' && typeof op.prompt === 'string' && op.prompt.trim()) {
      out.push({ type: 'image', path: op.path, prompt: op.prompt.trim().slice(0, 400) });
    } else if (op.type === 'style' && (f || /^sections\.([a-zA-Z0-9]+)$/.test(op.path) && section.has(op.path.slice(9))) && validStyle(op.property, op.value)) {
      out.push({ type: 'style', path: op.path, property: op.property, value: op.value });
    } else if (op.type === 'theme' && ctx.themeSupported && validTheme(op.key, op.value)) {
      out.push({ type: 'theme', key: op.key, value: op.value });
    } else if (op.type === 'design' && DESIGN_KEYS.includes(op.key) && typeof op.value === 'string' && (ctx.options[op.key].includes(op.value) || op.key === 'accent' && /^#[a-f0-9]{6}$/i.test(op.value))) {
      out.push({ type: 'design', key: op.key, value: op.value });
    } else if (op.type === 'section' && section.has(op.id) && SECTION_ACTIONS.includes(op.action)) {
      out.push({ type: 'section', id: op.id, action: op.action });
    } else if (op.type === 'item' && section.get(op.section)?.list && (op.action === 'add' || op.action === 'remove' && Number.isInteger(op.index) && op.index >= 0 && op.index < section.get(op.section).list.count)) {
      out.push(op.action === 'add' ? { type: 'item', section: op.section, action: 'add' } : { type: 'item', section: op.section, action: 'remove', index: op.index });
    }
  }
  return out;
}

const EDIT_GUIDE = [
  'You are the design and copy assistant inside a digital invitation website editor. The host tells you what they want; you make it happen by returning edit operations that the editor applies immediately.',
  'Think it through first: work out exactly what the host is asking, which fields, sections and styles are involved, and the complete set of operations needed. Do every part of the request, not just the first part. When the host asks for something broad ("make it luxurious", "write everything", "redesign it"), make a coherent, complete set of changes across text, theme, typography and sections.',
  'Operations (JSON objects):',
  '{"type":"text","path":"<field path>","value":"<new text>"}: text, textarea, date and color fields (dates as YYYY-MM-DD; colors as #rrggbb, or "" for the design default). New list items are addressed sections.<id>.<list key>.<index>.<field>.',
  '{"type":"photo","path":"<photo field path>","photo":<number of a photo the host attached>}',
  '{"type":"image","path":"<photo field path>","prompt":"<photographic scene description; no faces of real people, no text>"}: creates a new image with AI.',
  '{"type":"style","path":"<field path or sections.<id> for a whole section>","property":"<property>","value":"<value>"}. Choices: ' + JSON.stringify(STYLE_CHOICES) + '. Numeric ranges [min,max,unit]: ' + JSON.stringify(STYLE_RANGES) + '. Also color and backgroundColor as #rrggbb, objectPosition as "x% y%", filter one of none, grayscale(1), sepia(.4), brightness(.65).',
  '{"type":"theme","key":"<key>","value":"<value>"}: whole-site theme. Colors (#rrggbb): ' + THEME_COLORS.join(', ') + '. Choices: ' + JSON.stringify(THEME_CHOICES) + '.',
  '{"type":"design","key":"nameFont|bodyFont|accent|btnShape|spacing","value":"<one of the allowed options listed with the invitation; accent may also be #rrggbb>"}',
  '{"type":"section","id":"<section id>","action":"up|down|hide|show|delete|duplicate"}',
  '{"type":"item","section":"<section id with a list>","action":"add"} or {"type":"item","section":"<id>","action":"remove","index":<n>}',
  'Rules: only use paths, section ids and values that exist in the invitation below. Keep the host\'s names, dates, places and facts exactly; never invent phone numbers, emails or links. Keep text about as long as the design expects unless asked otherwise. Keep colors readable: text must contrast with its background. Whenever you change a section\'s background color, also set that section\'s text color with {"type":"style","path":"sections.<id>","property":"color","value":"#rrggbb"}; it applies to all text in the section. "This", "it" or "the selected element" means the selected element when one is given. Write in the language the host uses.',
  'Reply with JSON only: {"reply":"<one or two friendly sentences telling the host what you changed, or a question if the request is unclear>","ops":[...]}. If nothing should change, return an empty ops list and explain why in reply.'
].join('\n\n');

export async function editInvitation(body, key) {
  const message = typeof body.message === 'string' ? body.message.trim().slice(0, 4000) : '';
  if (!message) throw new AiError(400, 'Tell the assistant what to change.');
  const ctx = readContext(body.context), photos = readPhotos(body.photos);
  const history = (Array.isArray(body.history) ? body.history.slice(-8) : [])
    .filter(m => m && ['user', 'assistant'].includes(m.role) && typeof m.text === 'string')
    .map(m => ({ role: m.role, content: m.text.slice(0, 2000) }));
  const state = [
    'Current invitation:',
    'Fields (path | type | label | current value):\n' + ctx.fields.map(f => f.path + ' | ' + f.type + ' | ' + f.label + ' | ' + (f.type === 'photo' ? (f.filled ? '[photo set]' : '[empty]') : f.value)).join('\n'),
    'Sections in page order:\n' + ctx.sections.map(s => s.id + ' | ' + s.label + (s.on ? '' : ' (hidden)') + (s.list ? ' | list "' + s.list.key + '" with ' + s.list.count + ' items, item fields: ' + s.list.fields.map(f => f.k + ' (' + f.type + ')').join(', ') : '')).join('\n'),
    ctx.themeSupported ? 'Theme now: ' + JSON.stringify(ctx.theme) : 'This design does not use theme operations. Change colors with the color fields (such as section backgrounds), the accent design option and text color styles instead.',
    'Design now: ' + JSON.stringify(ctx.design) + '. Allowed design options: ' + JSON.stringify(ctx.options),
    ctx.selected ? 'Selected element: ' + ctx.selected : 'No element is selected.',
    photos.length ? 'The host attached ' + photos.length + ' photos, numbered 0 to ' + (photos.length - 1) + ' in the order shown.' : '',
    'Host\'s request:\n' + message
  ].filter(Boolean).join('\n\n');

  const data = await nvidia(CHAT_URL, {
    model: CHAT_MODEL,
    messages: [{ role: 'system', content: EDIT_GUIDE }, ...history, { role: 'user', content: [{ type: 'text', text: state }, ...photos.map(url => ({ type: 'image_url', image_url: { url } }))] }],
    temperature: 0.6, top_p: 0.95, max_tokens: 16384,
    chat_template_kwargs: { enable_thinking: true }
  }, key);
  const out = parseJson(data.choices?.[0]?.message?.content || '');
  const ops = checkOps(Array.isArray(out.ops) ? out.ops : [], ctx, photos.length);
  const reply = typeof out.reply === 'string' && out.reply.trim() ? out.reply.trim().slice(0, 1000) : ops.length ? 'Done.' : 'I could not find anything to change for that request.';
  return { reply, ops };
}

export async function createImage(body, key) {
  const prompt = typeof body.prompt === 'string' ? body.prompt.trim().slice(0, 500) : '';
  if (!prompt) throw new AiError(400, 'Describe the image first.');
  const data = await nvidia(IMAGE_URL, { prompt: prompt + '. Elegant editorial event photography, soft natural light, no text, no watermark.', width: 1024, height: 1024, steps: 4, seed: 0 }, key);
  const b64 = data.artifacts?.[0]?.base64 || data.image;
  if (typeof b64 !== 'string') throw new AiError(502, 'The AI did not return an image. Please try again.');
  const head = Buffer.from(b64.slice(0, 16), 'base64');
  const url = 'data:image/' + (head[0] === 0x89 ? 'png' : head.toString('ascii', 8, 12) === 'WEBP' ? 'webp' : 'jpeg') + ';base64,' + b64;
  try { validatePhoto(url); } catch { throw new AiError(502, 'The AI returned an unusable image. Please try again.'); }
  return { image: url };
}

export function mountAi(app, limited) {
  const route = handler => async (req, res) => {
    const key = process.env.NVIDIA_API_KEY;
    if (!key) return res.status(503).json({ error: 'The AI assistant is not configured on this server.' });
    if (limited('ai:' + req.ip, 20)) return res.status(429).json({ error: 'Too many AI requests. Please wait a minute.' });
    try { res.json(await handler(req.body, key)); }
    catch (e) {
      if (!(e instanceof AiError)) { console.error('AI request failed:', e.name); e = new AiError(500, 'The AI request failed. Please try again.'); }
      res.status(e.status).json({ error: e.message });
    }
  };
  app.post('/api/ai/image', route(createImage));
  app.post('/api/ai/edit', route(editInvitation));
}
