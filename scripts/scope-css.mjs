/* ==========================================================================
   scope-css.mjs — build frontend/public/css/mu.css
   Takes the Muhibbi template stylesheets (global: html, body, .container …)
   and rewrites every selector so it only applies inside a `.ws` root. That
   lets the generated event site keep the template's exact design while the
   builder chrome (styles.css) stays untouched on the same page.

   Run:  node scripts/scope-css.mjs
   ========================================================================== */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(ROOT, 'vendor/muhibbi-template/assets');
const OUT = resolve(ROOT, 'frontend/public/css/mu.css');

const SCOPE = '.ws';

/* Selectors that mean "the document" — inside the preview that is the root. */
const ROOT_SEL = /^(html|body|:root|html body|body\.[a-z0-9_-]+|html\.[a-z0-9_-]+)$/i;

/* At-rules whose body is a declaration list, not a rule list. */
const FLAT_AT = /^@(font-face|page|viewport|counter-style|font-feature-values|property)/i;
/* At-rules whose body holds rules that must NOT be scoped. */
const RAW_AT = /^@(keyframes|-webkit-keyframes|-moz-keyframes|-o-keyframes)/i;
/* At-rules whose body holds rules that MUST be scoped (conditional groups). */
const NEST_AT = /^@(media|supports|layer|container)/i;

/* ---------------------------------------------------------------- tokenizer */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/* Split a selector list on top-level commas (ignores commas inside :is()/:not()). */
function splitSelectors(sel) {
  const out = [];
  let depth = 0, buf = '';
  for (const ch of sel) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === ',' && depth === 0) { out.push(buf); buf = ''; continue; }
    buf += ch;
  }
  if (buf.trim()) out.push(buf);
  return out.map((s) => s.trim()).filter(Boolean);
}

function scopeOne(sel) {
  const s = sel.trim();
  if (!s) return s;
  if (s.startsWith('@')) return s;
  /* Never scope these — they have no element to match inside the preview. */
  if (/^(from|to|\d+%)$/.test(s)) return s;
  if (ROOT_SEL.test(s)) return SCOPE;
  /* `body .foo` / `html .foo` → `.ws .foo` */
  const rooted = s.match(/^(?:html|body)(?:\.[a-z0-9_-]+)*\s+(.+)$/i);
  if (rooted) return SCOPE + ' ' + rooted[1];
  /* `*` and `*, *::before` */
  if (s === '*') return SCOPE + ', ' + SCOPE + ' *';
  /* Leading pseudo-element on the root, e.g. `body::before` */
  const rootPseudo = s.match(/^(?:html|body)(::?[a-z-]+.*)$/i);
  if (rootPseudo) return SCOPE + rootPseudo[1];
  return SCOPE + ' ' + s;
}

function scopeSelectorList(sel) {
  return splitSelectors(sel).map(scopeOne).join(', ');
}

/* ------------------------------------------------------------------- parser */
function transform(css) {
  let i = 0;
  const n = css.length;
  let out = '';

  function readBlock() {
    /* assumes css[i] === '{' — returns the raw body and leaves i past '}' */
    let depth = 0, start = i;
    for (; i < n; i++) {
      const c = css[i];
      if (c === '"' || c === "'") { i = skipString(i); continue; }
      if (c === '{') depth++;
      else if (c === '}') { depth--; if (depth === 0) { i++; return css.slice(start + 1, i - 1); } }
    }
    return css.slice(start + 1);
  }
  function skipString(pos) {
    const q = css[pos];
    for (let j = pos + 1; j < n; j++) {
      if (css[j] === '\\') { j++; continue; }
      if (css[j] === q) return j;
    }
    return n;
  }

  while (i < n) {
    /* read the prelude up to '{' or ';' */
    let start = i, ch;
    let end = -1, terminator = '';
    for (let j = i; j < n; j++) {
      ch = css[j];
      if (ch === '"' || ch === "'") { j = skipString(j); continue; }
      if (ch === '{' || ch === ';') { end = j; terminator = ch; break; }
    }
    if (end === -1) { out += css.slice(start); break; }

    const prelude = css.slice(start, end).trim();
    i = end;

    if (terminator === ';') {
      /* statement at-rule (@import, @charset) — keep verbatim */
      i++;
      if (prelude) out += prelude + ';\n';
      continue;
    }

    const body = readBlock();

    if (prelude.startsWith('@')) {
      if (FLAT_AT.test(prelude) || RAW_AT.test(prelude)) {
        out += prelude + '{' + body + '}\n';
      } else if (NEST_AT.test(prelude)) {
        out += prelude + '{\n' + transform(body) + '}\n';
      } else {
        out += prelude + '{' + body + '}\n';
      }
      continue;
    }

    if (!prelude) continue;
    out += scopeSelectorList(prelude) + '{' + body + '}\n';
  }
  return out;
}

/* --------------------------------------------------------------- url rewrite */
/* Template CSS lives in assets/css/ and assets/sass/, both referencing
   ../images/… and ../fonts/…. The built file lives in frontend/public/css/, and the
   assets are copied to frontend/public/mu/. */
function rewriteUrls(css) {
  return css.replace(/url\((['"]?)([^'")]+)\1\)/g, (m, q, u) => {
    let p = u.trim();
    if (/^(data:|https?:|\/\/)/i.test(p)) return m;
    p = p.replace(/^\.\.\//, '').replace(/^\.\//, '');
    if (p.startsWith('images/')) p = '../mu/' + p;
    else if (p.startsWith('fonts/')) p = '../mu/' + p;
    else if (/^[\w.@-]+\.(png|jpe?g|gif|svg|woff2?|ttf|eot)/i.test(p)) p = '../mu/images/' + p;
    return 'url("' + p + '")';
  });
}

/* -------------------------------------------------------------- theme hooks */
/* The template hardcodes its palette (a bronze/ivory wedding scheme). Swapping
   those exact hexes for `var(--ws-*, <original>)` makes every one of the 27
   themes able to re-colour all ten layouts, while an unset variable still
   renders the original design. Structural #fff/#000 are deliberately kept. */
const THEME_COLORS = [
  ['#73543b', '--ws-gold'],   /* accent: headings, buttons, rules, icons */
  ['#ccbab0', '--ws-gold-2'], /* accent tint: borders, dividers           */
  ['#e6dcd0', '--ws-soft'],   /* soft panels                              */
  ['#f6f3ee', '--ws-bg'],     /* page background                          */
  ['#ebece6', '--ws-bg'],
  ['#fbf9f9', '--ws-bg'],
  ['#f7f7f7', '--ws-bg'],
  ['#2f2422', '--ws-dark'],   /* dark bands & footers                     */
  ['#041117', '--ws-ink'],    /* body text                                */
  ['#5c5c5c', '--ws-muted']   /* secondary text                           */
];

function themeVars(css) {
  let out = css;
  for (const [hex, name] of THEME_COLORS) {
    out = out.replace(new RegExp(hex, 'gi'), 'var(' + name + ', ' + hex + ')');
  }
  /* rgba() forms of the accent keep their alpha via a companion --*-rgb var */
  out = out.replace(/rgba\(115,\s*84,\s*59,\s*([0-9.]+)\)/gi,
    (m, a) => 'rgba(var(--ws-gold-rgb, 115, 84, 59), ' + a + ')');
  return out;
}

/* ---------------------------------------------------------------------- run */
const parts = [
  ['bootstrap grid + base', 'css/bootstrap.min.css', false],
  ['themify icons', 'css/themify-icons.css', false],
  ['flaticon (muhibbi)', 'css/flaticon_muhibbi.css', false],
  ['animate.css', 'css/animate.css', false],
  ['muhibbi theme', 'sass/style.css', true]
];

let bundle =
  '/* ==========================================================================\n' +
  '   mu.css — Muhibbi template design system, scoped to `.ws`\n' +
  '   GENERATED by scripts/scope-css.mjs — do not edit by hand.\n' +
  '   Source: vendor/muhibbi-template/assets (css/*, sass/style.css); images/fonts: frontend/public/mu/\n' +
  '   Every selector is prefixed with `.ws` so the template\'s global rules\n' +
  '   (html, body, .container, h1…) cannot leak into the builder UI.\n' +
  '   ========================================================================== */\n';

for (const [label, rel, themeable] of parts) {
  const raw = readFileSync(resolve(SRC, rel), 'utf8');
  let css = rewriteUrls(transform(stripComments(raw)));
  if (themeable) css = themeVars(css);
  bundle += '\n/* ---- ' + label + ' (' + rel + ') ---- */\n' + css;
}

writeFileSync(OUT, bundle);
console.log('wrote', OUT, (bundle.length / 1024).toFixed(0) + ' KB');
