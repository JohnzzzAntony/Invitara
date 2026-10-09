import test from 'node:test';
import assert from 'node:assert/strict';
import {loadCatalog} from '../backend/catalog.mjs';
import {invitationState} from '../backend/invitation-state.mjs';
import {seoFor,sitemapXml} from '../backend/seo.mjs';
import {spawn} from 'node:child_process';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {createHash} from 'node:crypto';
const catalog=loadCatalog();
test('five premium designs preserve editable sections, authoritative prices and discoverability',()=>{
 const themes=catalog.INVITARA_availableTemplates().filter(t=>t.premium);assert.equal(themes.length,5);
 for(const theme of themes){const state=catalog.EVER_siteDefaults(theme.id),clean=invitationState(catalog,state,theme.id,'2027-06-10');assert.deepEqual(Array.from(clean.order),Array.from(state.order));assert.equal(clean.sections.hero.openingType,state.sections.hero.openingType);assert.ok(clean.sections.rsvp.dietaryEnabled&&clean.sections.rsvp.accommodationEnabled);assert.equal(catalog.EVER_C.quote({themeId:theme.id,plan:'studio',addons:[]}).total,Math.round(theme.price*105)/100);const seo=seoFor('design.html',{origin:'https://example.test',catalog,query:{id:theme.id}});const graph=JSON.parse(seo.jsonLd('').split('>')[1].split('</script')[0])['@graph'];assert.equal(graph.find(x=>x['@type']==='Product').offers.price,theme.price);assert.ok(sitemapXml('https://example.test',catalog,'2026-10-08').includes(theme.id));}
 const state=catalog.EVER_siteDefaults('premium-voyage');for(const patch of [{openingType:'unknown'},{musicUrl:'javascript:alert(1)'}])assert.throws(()=>invitationState(catalog,{...state,sections:{...state.sections,hero:{...state.sections.hero,...patch}}},state.templateId,state.basics.date));
});
test('published premium RSVP stores dietary and accommodation fields privately and rejects malformed input',async()=>{
 const dir=mkdtempSync(path.join(tmpdir(),'premium-rsvp-')),origin='http://localhost:3214';const proc=spawn(process.execPath,['backend/index.mjs'],{windowsHide:true,env:{...process.env,NODE_ENV:'test',PORT:'3214',APP_ORIGIN:origin,DATA_DIR:dir},stdio:'pipe'});let db;
 try{await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Startup timed out')),15000);proc.stdout.on('data',d=>{if(d.toString().includes('listening')){clearTimeout(timer);resolve();}});proc.on('error',reject);});const response=await fetch(origin+'/api/projects'),cookie=response.headers.get('set-cookie').split(';')[0],owner=createHash('sha256').update(cookie.split('=')[1]).digest('hex');db=new DatabaseSync(path.join(dir,'invitara.sqlite'));const state=catalog.EVER_siteDefaults('premium-voyage');state.basics.date='2027-06-10';db.prepare('INSERT INTO projects VALUES (?,?,?)').run('premium-fixture',owner,JSON.stringify({id:'premium-fixture',themeId:'premium-voyage',layoutId:'platform',state,eventDate:'2027-06-10',timezone:'UTC',paid:true,published:true,expiresAt:Date.now()+86400000}));const guest=await fetch(origin+'/api/invites/premium-fixture'),guestCookie=guest.headers.get('set-cookie').split(';')[0];assert.equal(guest.status,200);const reply={name:'Guest',attend:'yes',guests:2,meal:'Vegetarian',dietary:'No nuts',accommodation:'yes',msg:'Wishing you a wonderful day.'};const send=body=>fetch(origin+'/api/invites/premium-fixture/rsvp',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',Cookie:guestCookie},body:JSON.stringify(body)});assert.equal((await send(reply)).status,200);assert.equal((await send({...reply,accommodation:'maybe'})).status,400);assert.equal((await send({...reply,dietary:'x'.repeat(1001)})).status,400);const replies=await(await fetch(origin+'/api/projects/premium-fixture/replies',{headers:{Cookie:cookie}})).json();assert.equal(replies[0].dietary,'No nuts');assert.equal(replies[0].accommodation,'yes');assert.equal((await fetch(origin+'/api/projects/premium-fixture/replies',{headers:{Cookie:guestCookie}})).status,404);
 }finally{db?.close();proc.kill();}
});
