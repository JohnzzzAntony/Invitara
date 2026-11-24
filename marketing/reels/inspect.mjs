// Frame-exact contact sheet of a rendered reel: parses the MP4 written by mp4.js and decodes its samples with
// WebCodecs (no player seeking, which is imprecise). Usage: node marketing/reels/inspect.mjs <reel.mp4> <out.png> <seconds...>
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';

const [file, png, ...times] = process.argv.slice(2);
const browser = await chromium.launch({ channel: 'msedge' }), page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
await page.route('http://localhost:5195/**', r => r.request().url().endsWith('.mp4') ? r.fulfill({ body: readFileSync(file), contentType: 'video/mp4' }) : r.fulfill({ body: '<body style="margin:0;background:#333;display:flex;gap:6px;flex-wrap:wrap;font:14px sans-serif;color:#fff"></body>', contentType: 'text/html' }));
await page.goto('http://localhost:5195/');
const info = await page.evaluate(async ts => {
  const b = new Uint8Array(await (await fetch('/r.mp4')).arrayBuffer()), dv = new DataView(b.buffer);
  const type = i => String.fromCharCode(b[i + 4], b[i + 5], b[i + 6], b[i + 7]);
  const find = (name, from = 0, to = b.length) => { for (let i = from; i < to;) { const size = dv.getUint32(i); if (type(i) === name) return i; if (['moov', 'trak', 'mdia', 'minf', 'stbl'].includes(type(i))) { const inner = find(name, i + 8, i + size); if (inner >= 0) return inner; } i += size; } return -1; };
  const stsz = find('stsz'), count = dv.getUint32(stsz + 16), sizes = Array.from({ length: count }, (_, k) => dv.getUint32(stsz + 20 + 4 * k));
  const stco = find('stco'), offset = dv.getUint32(stco + 16), stss = find('stss'), keys = new Set(Array.from({ length: dv.getUint32(stss + 12) }, (_, k) => dv.getUint32(stss + 16 + 4 * k)));
  const mdhd = find('mdhd'), timescale = dv.getUint32(mdhd + 20), stts = find('stts'), delta = dv.getUint32(stts + 20), fps = timescale / delta;
  let avcC = -1; for (let i = find('stsd'); i < b.length - 4; i++) if (b[i] === 97 && b[i + 1] === 118 && b[i + 2] === 99 && b[i + 3] === 67) { avcC = i - 4; break; } const description = b.slice(avcC + 8, avcC + dv.getUint32(avcC));
  const want = new Map(ts.map(t => [Math.round(+t * fps), t])), canvases = new Map();
  const decoder = new VideoDecoder({ output: f => { const n = Math.round(f.timestamp * fps / 1e6); if (want.has(n)) { const c = document.createElement('canvas'); c.width = 270; c.height = 480; c.getContext('2d').drawImage(f, 0, 0, 270, 480); canvases.set(n, c); } f.close(); }, error: e => { throw e; } });
  decoder.configure({ codec: 'avc1.640028', description, codedWidth: 1080, codedHeight: 1920 });
  let at = offset;
  for (let k = 0; k < count; k++) { decoder.decode(new EncodedVideoChunk({ type: keys.has(k + 1) ? 'key' : 'delta', timestamp: Math.round(k * 1e6 / fps), data: b.subarray(at, at + sizes[k]) })); at += sizes[k]; if (decoder.decodeQueueSize > 20) await new Promise(r => decoder.addEventListener('dequeue', r, { once: true })); }
  await decoder.flush();
  for (const [n, t] of want) { const f = document.createElement('figure'); f.style.margin = 0; f.append(canvases.get(n) || 'missing', Object.assign(document.createElement('figcaption'), { textContent: t + 's (frame ' + n + ')' })); document.body.append(f); }
  return { frames: count, fps, seconds: count / fps, endOffset: at, fileBytes: b.length };
}, times);
console.log(JSON.stringify(info));
await page.screenshot({ path: png, fullPage: true }); await browser.close();
