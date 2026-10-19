import test from 'node:test';
import assert from 'node:assert/strict';
import {loadCatalog} from '../backend/catalog.mjs';
import {invitationState} from '../backend/invitation-state.mjs';
import {spawn} from 'node:child_process';
import {mkdtempSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {createHash} from 'node:crypto';
const catalog=loadCatalog(),themes=catalog.INVITARA_availableTemplates().filter(t=>t.business);
test('six business editions retain editable content, assets and authoritative pricing',()=>{
 assert.equal(themes.length,6);
 for(const theme of themes){
  const state=catalog.EVER_siteDefaults(theme.id);
  state.basics.brand='A customer brand';state.sections.hero.title='A personal launch';
  state.sections.timeline.items[0].title='Custom feature';state.sections.schedule.items[0].text='Customer agenda';
  const saved=invitationState(catalog,state,theme.id,'2027-06-10');
  assert.equal(saved.sections.timeline.items[0].title,'Custom feature');assert.equal(saved.sections.schedule.items[0].text,'Customer agenda');assert.equal(saved.basics.brand,'A customer brand');assert.equal(saved.sections.hero.title,'A personal launch');
  assert.ok(existsSync('frontend/public/'+saved.sections.hero.photo));
  assert.equal(catalog.EVER_C.quote({themeId:theme.id,plan:'studio',addons:[]}).total,Math.round(theme.price*105)/100);
  assert.equal(state.sections.gallery.on,false);assert.equal(state.sections.rsvp.dietaryEnabled,theme.family==='table');
 }
});
test('all six published business editions store real guest replies privately',async()=>{
 const dir=mkdtempSync(path.join(tmpdir(),'business-rsvp-')),origin='http://localhost:3237';
 const proc=spawn(process.execPath,['backend/index.mjs'],{windowsHide:true,env:{...process.env,NODE_ENV:'test',PORT:'3237',APP_ORIGIN:origin,DATA_DIR:dir},stdio:'pipe'});let db;
 try{
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Startup timed out')),15000);proc.stdout.on('data',d=>{if(d.toString().includes('listening')){clearTimeout(timer);resolve();}});proc.on('error',reject);});
  const response=await fetch(origin+'/api/projects'),cookie=response.headers.get('set-cookie').split(';')[0],owner=createHash('sha256').update(cookie.split('=')[1]).digest('hex');
  db=new DatabaseSync(path.join(dir,'invitara.sqlite'));
  for(const theme of themes){
   const state=catalog.EVER_siteDefaults(theme.id),id=theme.id+'-fixture';
   db.prepare('INSERT INTO projects VALUES (?,?,?)').run(id,owner,JSON.stringify({id,themeId:theme.id,layoutId:'platform',state,eventDate:state.basics.date,timezone:'Asia/Dubai',paid:true,published:true,expiresAt:Date.now()+86400000}));
   const guest=await fetch(origin+'/api/invites/'+id);assert.equal(guest.status,200);const guestCookie=guest.headers.get('set-cookie').split(';')[0];
   const reply={name:'Actual guest',attend:'yes',guests:2,msg:'Looking forward to the event.',...(theme.family==='table'?{dietary:'No nuts'}:{})};
   const send=body=>fetch(origin+'/api/invites/'+id+'/rsvp',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',Cookie:guestCookie},body:JSON.stringify(body)});
   assert.equal((await send(reply)).status,200);assert.equal((await send({...reply,guests:51})).status,400);
   const rows=await(await fetch(origin+'/api/projects/'+id+'/replies',{headers:{Cookie:cookie}})).json();assert.equal(rows[0].name,reply.name);assert.equal(rows[0].msg,reply.msg);if(theme.family==='table')assert.equal(rows[0].dietary,'No nuts');
   assert.equal((await fetch(origin+'/api/projects/'+id+'/replies',{headers:{Cookie:guestCookie}})).status,404);
   const qr=await fetch(origin+'/api/invites/'+id+'/qr');assert.equal(qr.status,200);assert.match(qr.headers.get('content-type'),/image\/svg/);
  }
 }finally{db?.close();proc.kill();}
});
