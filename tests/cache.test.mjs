import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

test('account refresh batches cache writes, preserves drafts and replaces old paid records', async () => {
  const saved = new Map([['ever-projects', JSON.stringify([{id:'draft',state:{photo:'local'}},{id:'paid-a',server:true}])], ['ever-orders', JSON.stringify([{projectId:'paid-a',id:'old'}])]]);
  const writes = [];
  const projects = ['paid-a','paid-b'].map(id => ({id,paid:true,orderId:'order-'+id,quote:{currency:'AED'},amount:8295,state:{title:id}}));
  const sandbox = {Set,AbortController,setTimeout,clearTimeout,localStorage:{getItem:key=>saved.get(key),setItem:(key,value)=>{saved.set(key,value);writes.push(key);}},fetch:async()=>({ok:true,json:async()=>projects}),window:{EVER_C:{allProjects:()=>JSON.parse(saved.get('ever-projects')),allOrders:()=>JSON.parse(saved.get('ever-orders'))}}};
  vm.runInNewContext(readFileSync(new URL('../public/js/api.js',import.meta.url),'utf8'),sandbox);
  await sandbox.window.EVER_API.refresh();
  assert.deepEqual(writes,['ever-orders','ever-projects']);
  assert.deepEqual(JSON.parse(saved.get('ever-projects')).map(p=>p.id),['paid-b','paid-a','draft']);
  assert.equal(JSON.parse(saved.get('ever-projects'))[2].state.photo,'local');
  assert.deepEqual(JSON.parse(saved.get('ever-orders')).map(o=>o.id),['order-paid-b','order-paid-a']);
});

test('quota fallback retains local drafts while discarding only reloadable server state', () => {
  const saved = new Map([['ever-projects',JSON.stringify([{id:'draft',state:{photo:'local'}}])]]);
  let attempts = 0;
  const sandbox = {Set,AbortController,setTimeout,clearTimeout,localStorage:{getItem:key=>saved.get(key),setItem:(key,value)=>{if(++attempts===1)throw new Error('Quota exceeded');saved.set(key,value);}},window:{EVER_C:{allProjects:()=>JSON.parse(saved.get('ever-projects'))}}};
  vm.runInNewContext(readFileSync(new URL('../public/js/api.js',import.meta.url),'utf8'),sandbox);
  sandbox.window.EVER_API.cache({id:'paid',state:{photo:'large'}});
  const result=JSON.parse(saved.get('ever-projects'));
  assert.equal(result[0].state,null);
  assert.equal(result[1].state.photo,'local');
});
