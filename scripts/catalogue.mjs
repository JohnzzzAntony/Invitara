/* catalogue.mjs — the one place a build script learns what is in the catalogue.
 *
 * public/js/templates.js is a browser script, not a module, so the build tools
 * cannot import THEMES from it. They read the table out of the source instead.
 * That read lived in three scripts at once and the numbers drifted: the landing
 * generator emitted "8 designs" onto pages whose own copy claimed 27. Keep the
 * parse here, and one edit to THEMES moves every count on the site.
 *
 * Consumers: gen-landing.mjs, landing-content.mjs, sync-seo.mjs.
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/* Matches the opening line of a THEMES entry, which is written on one line by
   convention: `{ id: 'ivory', name: 'Ivory & Sable', event: 'wedding', layout: 'poetic',` */
const THEME_RE = /\{ id: '([a-z0-9-]+)', name: '([^']+)', event: '([a-z]+)', layout: '([a-z]+)'/g;

export const THEMES = [
  ...readFileSync(resolve(ROOT, 'public/js/templates.js'), 'utf8').matchAll(THEME_RE)
].map(([, id, name, event, layout]) => ({ id, name, event, layout }));

/* A parse that silently returns nothing would quietly zero every count on the
   site, so fail loudly instead. */
if (THEMES.length < 2) {
  throw new Error('catalogue.mjs: could not read THEMES from public/js/templates.js');
}

export const DESIGN_COUNT = THEMES.length;
export const LAYOUT_COUNT = new Set(THEMES.map((t) => t.layout)).size;

/** How many designs an occasion actually has; the whole catalogue when null. */
export const countFor = (event) =>
  event ? THEMES.filter((t) => t.event === event).length : DESIGN_COUNT;
