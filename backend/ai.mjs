// AI assistant for the editor. Proxies NVIDIA's API Catalog so the key never reaches the browser.
// The client sends the active layout's field list; only those paths come back, as plain strings.
import { validatePhoto } from './photo.mjs';

const CHAT_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const CHAT_MODEL = 'nvidia/nemotron-3.5-super-vl-120b-a12b';
const IMAGE_URL = 'https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell';
const PATH = /^(basics\.[a-zA-Z]+|sections\.[a-zA-Z0-9]+\.(?:[a-zA-Z]+|[a-zA-Z]+\.\d{1,2}\.[a-zA-Z]+))$/;
const TYPES = ['text', 'textarea', 'date', 'photo'];

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
    return { path: f.path, type: f.type, label: f.label, value: f.type === 'photo' ? undefined : String(f.value || '').slice(0, 600) };
  });
}

function parseJson(text) {
  const start = String(text).indexOf('{'), end = String(text).lastIndexOf('}');
  try { return JSON.parse(text.slice(start, end + 1)); } catch { throw new AiError(502, 'The AI returned an unreadable draft. Please try again.'); }
}

export async function writeInvitation(body, key) {
  const fields = readFields(body.fields);
  const details = typeof body.details === 'string' ? body.details.trim().slice(0, 4000) : '';
  const tone = typeof body.tone === 'string' ? body.tone.slice(0, 40) : 'Elegant';
  const photos = Array.isArray(body.photos) ? body.photos.slice(0, 6) : [];
  for (const p of photos) {
    let valid = typeof p === 'string' && p.startsWith('data:') && p.length <= 400000;
    try { if (valid) validatePhoto(p); } catch { valid = false; }
    if (!valid) throw new AiError(400, 'Use JPEG, PNG or WebP photos.');
  }
  if (!details) throw new AiError(400, 'Add a few details about your event first.');

  const text = fields.filter(f => f.type !== 'photo'), slots = fields.filter(f => f.type === 'photo');
  const prompt = [
    'You write the copy for a digital event invitation website. Fill every field below for this event.',
    'Tone: ' + tone + '.',
    'Event details from the host:\n' + details,
    'Text fields (path | label | current placeholder text):\n' + text.map(f => f.path + ' | ' + f.label + ' | ' + f.value).join('\n'),
    slots.length ? 'Photo slots (path | label):\n' + slots.map(f => f.path + ' | ' + f.label).join('\n') : '',
    photos.length ? 'The host attached ' + photos.length + ' photos, numbered 0 to ' + (photos.length - 1) + ' in the order shown. Put the best ones in the most prominent slots.' : '',
    'Rules: use the host\'s names, places and times exactly. Keep each value about as long as its placeholder. Dates use YYYY-MM-DD. Never invent phone numbers, emails or links: use an empty string if the host gave none. Write in the language of the event details.',
    'Reply with JSON only, shaped {"fields":{"<text path>":"<text>"},"photos":{"<photo path>":<photo number>},"imagePrompts":{"<photo path without a host photo>":"<short photographic scene description, no people\'s faces, no text>"}}.'
  ].filter(Boolean).join('\n\n');

  const data = await nvidia(CHAT_URL, {
    model: CHAT_MODEL,
    messages: [{ role: 'user', content: [{ type: 'text', text: prompt }, ...photos.map(url => ({ type: 'image_url', image_url: { url } }))] }],
    temperature: 0.7, top_p: 0.95, max_tokens: 8192,
    chat_template_kwargs: { enable_thinking: false }
  }, key);
  const out = parseJson(data.choices?.[0]?.message?.content || '');

  const result = { fields: {}, photos: {}, imagePrompts: {} };
  for (const f of text) {
    const v = out.fields?.[f.path];
    if (typeof v !== 'string') continue;
    if (f.type === 'date') { if (/^\d{4}-\d{2}-\d{2}$/.test(v)) result.fields[f.path] = v; }
    else result.fields[f.path] = v.slice(0, f.type === 'textarea' ? 2000 : 240);
  }
  for (const f of slots) {
    const n = out.photos?.[f.path], p = out.imagePrompts?.[f.path];
    if (Number.isInteger(n) && n >= 0 && n < photos.length) result.photos[f.path] = n;
    else if (typeof p === 'string' && p.trim()) result.imagePrompts[f.path] = p.trim().slice(0, 400);
  }
  return result;
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
  app.post('/api/ai/invitation', route(writeInvitation));
  app.post('/api/ai/image', route(createImage));
}
