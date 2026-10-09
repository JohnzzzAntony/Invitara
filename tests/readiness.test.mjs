import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePhoto } from '../backend/photo.mjs';
import { pageHtml } from '../backend/page-meta.mjs';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {loadCatalog} from '../backend/catalog.mjs';

test('draft creation and updates report storage failures rather than success', () => {
  const sandbox={window:loadCatalog(),localStorage:{getItem:()=>JSON.stringify([{id:'draft',state:{title:'Original'}}]),setItem:()=>{throw new Error('QuotaExceededError');}}};
  vm.runInNewContext(readFileSync(new URL('../frontend/public/js/commerce.js',import.meta.url),'utf8'),sandbox);
  assert.equal(sandbox.window.EVER_C.createProject('edition-vow'),null);
  assert.equal(sandbox.window.EVER_C.updateProject('draft',{state:{title:'Unsaved'}}),null);
});

test('photo fields reject executable data, forged image MIME and traversal', () => {
  for (const value of ['data:image/svg+xml,<svg onload="alert(1)"/>', 'data:image/png;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==', 'javascript:alert(1)', '//evil.test/a', 'assets/../../.env', 'https://user:pass@example.com/a']) assert.throws(() => validatePhoto(value));
  for (const value of ['', 'mu-hero-1', 'assets/ws-couple.jpg', 'https://example.com/photo.jpg', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=']) assert.doesNotThrow(() => validatePhoto(value));
});

test('metadata escapes invitation content and excludes account pages from indexing', () => {
  const html = pageHtml('invite.html', 'https://invitara.example', {id:'abc', state:{basics:{title:'<script>alert(1)</script>', date:'2027-06-10', venue:'A & B', city:'Dubai'}}});
  assert.ok(!html.includes('<script>alert(1)</script>'));
  assert.match(html, /og:title" content="&lt;script&gt;/);
  assert.match(html, /noindex, nofollow/);
  assert.match(html, /https:\/\/invitara.example\/invite.html\?e=abc/);
  assert.match(pageHtml('account.html', 'https://invitara.example'), /noindex, nofollow/);
  assert.match(pageHtml('index.html', 'https://invitara.example'), /rel="canonical" href="https:\/\/invitara.example\/"/);
});
