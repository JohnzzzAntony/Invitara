import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {DatabaseSync} from 'node:sqlite';
import {loadCatalog} from '../server/catalog.mjs';

test('expired checkout retries preserve the invitation and reuse one replacement session', async () => {
  const dir=mkdtempSync(path.join(tmpdir(),'invitara-checkout-'));
  const fixture=path.join(dir,'stripe-fixture.mjs');
  const resource=new URL('../node_modules/stripe/esm/resources/Checkout/Sessions.js',import.meta.url).href;
  writeFileSync(fixture, `import {Sessions} from ${JSON.stringify(resource)};
    Sessions.prototype.retrieve=async id=>({id,status:id==='cs_expired'?'expired':'open',url:'https://checkout.stripe.com/replacement'});
    Sessions.prototype.create=async function(body,options){
      if(!options.idempotencyKey.endsWith(':cs_expired'))throw new Error('Replacement must have a stable retry key');
      return {id:'cs_replacement',url:'https://checkout.stripe.com/replacement'};
    };`);
  const origin='http://localhost:3195';
  const child=spawn(process.execPath,['--import',pathToFileURL(fixture).href,'server/index.mjs'],{env:{...process.env,NODE_ENV:'test',PORT:'3195',APP_ORIGIN:origin,DATA_DIR:dir,STRIPE_SECRET_KEY:'sk_test_fixture'},stdio:'pipe'});
  let db;
  try {
    await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Startup timed out')),10000);child.stdout.on('data',d=>{if(String(d).includes('listening')){clearTimeout(timer);resolve();}});child.on('error',reject);});
    const registered=await fetch(origin+'/api/auth/register',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({email:'retry@example.test',password:'checkout-retry-password'})});
    const cookie=registered.headers.getSetCookie().at(-1).split(';')[0];
    const {account}=await registered.json();
    const {createHash}=await import('node:crypto');
    const body={themeId:'edition-vow',plan:'studio',addons:[],eventDate:'2027-06-10',timezone:'Asia/Dubai',email:'retry@example.test',consent:true,draftId:'draft-retry',state:loadCatalog().EVER_siteDefaults('edition-vow')};
    const id=createHash('sha256').update(JSON.stringify([account.id,body.draftId,body.themeId,body.plan,[],body.eventDate,body.timezone])).digest('hex').slice(0,32);
    db=new DatabaseSync(path.join(dir,'invitara.sqlite'));
    db.prepare('INSERT INTO projects VALUES (?,?,?)').run(id,account.id,JSON.stringify({id,paid:false,amount:8295,state:body.state}));
    db.prepare('INSERT INTO sessions VALUES (?,?)').run('cs_expired',id);
    const call=()=>fetch(origin+'/api/checkout',{method:'POST',headers:{Origin:origin,Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify(body)});
    for(const response of await Promise.all([call(),call()])) {assert.equal(response.status,200);assert.equal((await response.json()).url,'https://checkout.stripe.com/replacement');}
    assert.equal((await call()).status,200);
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM sessions WHERE project=?').get(id).n,2);
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM projects').get().n,1);
  } finally {if(db)db.close();if(child.exitCode===null){const exited=new Promise(resolve=>child.once('exit',resolve));child.kill();await exited;}rmSync(dir,{recursive:true,force:true});}
});
