/* ==========================================================================
   sync-seo.mjs — keep the JSON-LD design lists in step with the catalogue
   Reads THEMES out of public/js/templates.js and rewrites the itemListElement
   arrays in index.html and create.html, plus the "N designs across M layouts"
   phrasing wherever it appears. Run after changing THEMES or the layouts.

   Run:  node scripts/sync-seo.mjs
   ========================================================================== */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { THEMES as themes, DESIGN_COUNT as N, LAYOUT_COUNT as L } from './catalogue.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const rows = themes.map((t, i) => {
  const pos = String(i + 1);
  const pad = pos.length === 1 ? '  ' : ' ';
  /* JSON-LD lives in a <script> block: its contents are NOT HTML-parsed, so
     an entity here would be read literally. Keep the plain character. */
  return `          { "@type": "ListItem", "position": ${pos},${pad}"name": "${t.name}" }`;
}).join(',\n');

let touched = 0;
for (const page of ['public/index.html', 'public/create.html']) {
  const path = resolve(ROOT, page);
  let s = readFileSync(path, 'utf8');
  const before = s;

  /* Only the design catalogue — the pages also carry a BreadcrumbList, which
     uses itemListElement for something else entirely. Anchor on "@type":
     "ItemList" and rewrite just that object's array. */
  s = s.replace(/("@type": "ItemList",[\s\S]*?"itemListElement": \[\n)[\s\S]*?(\n        \])/g,
    (m, head, tail) => head + rows + tail);
  s = s.replace(/("@type": "ItemList",[\s\S]*?)"numberOfItems": \d+/g,
    (m, head) => head + `"numberOfItems": ${N}`);

  /* Bare counts in titles and meta are mechanical, not prose, and they drift:
     both pages advertised "27 Event Website Templates" over a catalogue of
     eight. These two shapes are the only ones that state a number, so they
     are safe to rewrite; anything that describes the designs in words is
     still left alone below. */
  s = s.replace(/\b\d+ (Event Website Templates)/g, (m, tail) => `${N} ${tail}`);
  s = s.replace(/\b\d+ (designs across) \d+ (layouts)/g,
    (m, a, b) => `${N} ${a} ${L} ${b}`);
  /* "one of N designs" / "all N designs" — whole-catalogue counts. Anchored on
     those two words so a future "4 wedding designs" is not swept up with them. */
  s = s.replace(/\b(one of|all) \d+ designs\b/g, (m, lead) => `${lead} ${N} designs`);
  /* Descriptive prose is deliberately NOT rewritten here — it characterises
     the designs and needs a human eye. Grep for “layouts” after adding one. */

  if (s !== before) { writeFileSync(path, s); touched++; }
  console.log(page, s === before ? '(unchanged)' : 'updated');
}

console.log(`${N} designs across ${L} layouts; ${touched} file(s) rewritten`);
