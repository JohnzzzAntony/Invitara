import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {createHash} from 'node:crypto';
import {loadCatalog} from '../backend/catalog.mjs';

test('housewarming replies persist maybe and phone privately; public QR requires a published invitation',async()=>{
 const dir=mkdtempSync(path.join(tmpdir(),'aangan-rsvp-')),origin='http://localhost:3226';
 const proc=spawn(process.execPath,['backend/index.mjs'],{windowsHide:true,env:{...process.env,NODE_ENV:'test',PORT:'3226',APP_ORIGIN:origin,DATA_DIR:dir},stdio:'pipe'});
 let db;
 try{
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Startup timed out')),15000);proc.stdout.on('data',d=>{if(d.toString().includes('listening')){clearTimeout(timer);resolve();}});proc.on('error',reject);});
  const response=await fetch(origin+'/api/projects'),cookie=response.headers.get('set-cookie').split(';')[0],owner=createHash('sha256').update(cookie.split('=')[1]).digest('hex');
  db=new DatabaseSync(path.join(dir,'invitara.sqlite'));
  const state=loadCatalog().EVER_siteDefaults('edition-aangan');
  const project={id:'aangan-fixture',themeId:'edition-aangan',layoutId:'platform',state,eventDate:state.basics.date,timezone:'Asia/Kolkata',paid:true,published:true,expiresAt:Date.now()+86400000};
  db.prepare('INSERT INTO projects VALUES (?,?,?)').run(project.id,owner,JSON.stringify(project));
  const guest=await fetch(origin+'/api/invites/'+project.id),guestCookie=guest.headers.get('set-cookie').split(';')[0];
  const send=body=>fetch(origin+'/api/invites/'+project.id+'/rsvp',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',Cookie:guestCookie},body:JSON.stringify(body)});
  const reply={name:'Anu',attend:'maybe',guests:2,phone:'+91 98765 43210',msg:'May your home be filled with joy.'};
  assert.equal((await send(reply)).status,200);
  assert.equal((await send({...reply,phone:'bad phone'})).status,400);
  assert.equal((await send({...reply,attend:'unknown'})).status,400);
  const rows=await(await fetch(origin+'/api/projects/'+project.id+'/replies',{headers:{Cookie:cookie}})).json();
  assert.equal(rows[0].attend,'maybe');assert.equal(rows[0].phone,reply.phone);assert.equal(rows[0].msg,reply.msg);
  assert.equal((await fetch(origin+'/api/projects/'+project.id+'/replies',{headers:{Cookie:guestCookie}})).status,404);
  const qr=await fetch(origin+'/api/invites/'+project.id+'/qr');assert.equal(qr.status,200);assert.match(qr.headers.get('content-type'),/image\/svg\+xml/);assert.match(await qr.text(),/<svg/);
  project.published=false;db.prepare('UPDATE projects SET body=? WHERE id=?').run(JSON.stringify(project),project.id);
  assert.equal((await fetch(origin+'/api/invites/'+project.id+'/qr')).status,404);
  assert.equal((await send(reply)).status,403);
 }finally{db?.close();proc.kill();}
});
