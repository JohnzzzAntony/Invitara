import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveOrigin} from '../backend/origin.mjs';

test('Railway hostname configuration normalizes to the canonical HTTPS origin',()=>{
  const expected='https://invitara-production.up.railway.app';
  for(const value of ['invitara-production.up.railway.app',expected,expected+'/', '  '+expected+'  ']) assert.equal(resolveOrigin(value,true),expected);
  assert.equal(resolveOrigin('https://INVITARA-PRODUCTION.up.railway.app:443/',true),expected);
  assert.equal(resolveOrigin('http://localhost:3000',false),'http://localhost:3000');
  assert.equal(resolveOrigin(undefined,false),'http://localhost:3000');
});

test('invalid origins fail without weakening HTTPS or origin checks',()=>{
  for(const value of ['', 'http://example.com', 'https://user:password@example.com', 'https://example.com/path', 'https://example.com?next=x', 'https://example.com#fragment', 'ftp://example.com', '//example.com', 'not a hostname', 'https://example.com\\evil']) assert.throws(()=>resolveOrigin(value,true),/APP_ORIGIN/);
});
