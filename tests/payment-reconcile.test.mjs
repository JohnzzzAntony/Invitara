import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {DatabaseSync} from 'node:sqlite';

test('a paid Checkout Session unlocks publishing without a webhook, but only with the expected amount', async () => {
  const dir=mkdtempSync(path.join(tmpdir(),'invitara-reconcile-'));
  const fixture=path.join(dir,'stripe-fixture.mjs');
  const resource=new URL('../node_modules/stripe/esm/resources/Checkout/Sessions.js',import.meta.url).href;
  writeFileSync(fixture, `import {Sessions} from ${JSON.stringify(resource)};
    const projects={cs_paid:'p_paid',cs_short:'p_short',cs_open:'p_open'};
    Sessions.prototype.retrieve=async id=>id==='cs_open'?{id,status:'open',payment_status:'unpaid',metadata:{projectId:'p_open'}}:({id,status:'complete',payment_status:'paid',amount_total:id==='cs_short'?1:8295,currency:'aed',metadata:{projectId:projects[id]}});
    Sessions.prototype.expire=async id=>({id,status:'expired',payment_status:'unpaid',metadata:{projectId:projects[id]}});`);
  const origin='http://localhost:3196';
  const env={...process.env,NODE_ENV:'test',PORT:'3196',APP_ORIGIN:origin,DATA_DIR:dir,STRIPE_SECRET_KEY:'sk_test_fixture'};
  delete env.STRIPE_WEBHOOK_SECRET;
  const child=spawn(process.execPath,['--import',pathToFileURL(fixture).href,'backend/index.mjs'],{env,stdio:'pipe'});
  let db;
  try {
    await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Startup timed out')),10000);child.stdout.on('data',d=>{if(String(d).includes('listening')){clearTimeout(timer);resolve();}});child.on('error',reject);});
    const registered=await fetch(origin+'/api/auth/register',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({email:'reconcile@example.test',password:'reconcile-password'})});
    const cookie=registered.headers.getSetCookie().at(-1).split(';')[0];
    const {account}=await registered.json();
    const state={templateId:'vellum',layoutId:'vellum',basics:{nameA:'Alex',nameB:'Sam',brand:'Alex and Sam celebrate',date:'2099-06-10',time:'14:00',venue:'Test venue'},sections:{rsvp:{on:true}},order:['hero','rsvp']};
    db=new DatabaseSync(path.join(dir,'invitara.sqlite'));
    for(const [id,session] of [['p_paid','cs_paid'],['p_short','cs_short'],['p_open','cs_open']]){
      db.prepare('INSERT INTO projects VALUES (?,?,?)').run(id,account.id,JSON.stringify({id,themeId:'vellum',layoutId:'vellum',paid:false,published:false,amount:8295,eventDate:'2099-06-10',timezone:'Asia/Dubai',expiresAt:Date.parse('2099-06-11T00:00:00+04:00'),state}));
      db.prepare('INSERT INTO sessions VALUES (?,?)').run(session,id);
    }
    const api=(p,method='GET')=>fetch(origin+'/api/projects/'+p,{method,headers:{Origin:origin,Cookie:cookie,'Content-Type':'application/json'},body:method==='GET'?undefined:'{}'});
    const paid=await (await api('p_paid')).json();
    assert.equal(paid.paid,true);
    assert.equal(paid.orderId,'cs_paid');
    assert.equal((await api('p_paid/publish','POST')).status,200);
    assert.equal((await api('p_short')).status,200);
    assert.equal((await (await api('p_short')).json()).paid,false);
    assert.equal((await api('p_short/publish','POST')).status,403);
    assert.equal((await api('p_short','DELETE')).status,409,'A completed checkout blocks deleting a pending invitation.');
    assert.equal((await api('p_open','DELETE')).status,200,'An open checkout is expired before deletion.');
    assert.equal((await api('p_open')).status,404);
  } finally {if(db)db.close();if(child.exitCode===null){const exited=new Promise(resolve=>child.once('exit',resolve));child.kill();await exited;}rmSync(dir,{recursive:true,force:true});}
});
