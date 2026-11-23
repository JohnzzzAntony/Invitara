import test from 'node:test';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import {mkdtempSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import path from 'node:path';import {DatabaseSync} from 'node:sqlite';

test('cross-account access, session expiry/logout and reset-token edge cases',async()=>{
 const dir=mkdtempSync(path.join(tmpdir(),'invitara-sec-')),origin='http://localhost:3202';
 const proc=spawn(process.execPath,['backend/index.mjs'],{env:{...process.env,PORT:'3202',APP_ORIGIN:origin,DATA_DIR:dir,NODE_ENV:'test',RESEND_API_KEY:''},stdio:'pipe'});let out='',db;proc.stdout.on('data',d=>{out+=d;});
 try{await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error('Startup timeout')),10000);proc.stdout.on('data',()=>{if(out.includes('listening')){clearTimeout(timeout);resolve();}});proc.on('error',reject);});
 const call=(url,body,cookie,method=body?'POST':'GET')=>fetch(origin+'/api'+url,{method,headers:{Origin:origin,'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},body:body?JSON.stringify(body):undefined});
 const register=async email=>{const r=await call('/auth/register',{email,password:'a-long-test-password'});return {cookie:r.headers.getSetCookie().at(-1).split(';')[0],id:(await r.json()).account.id};};
 const host=await register('host@example.test'),intruder=await register('intruder@example.test');
 db=new DatabaseSync(path.join(dir,'invitara.sqlite'));
 const p={id:'hostparty',themeId:'vellum',layoutId:'vellum',paid:true,published:true,eventDate:'2029-06-10',timezone:'UTC',expiresAt:Date.parse('2029-06-11T00:00:00Z'),state:{basics:{date:'2029-06-10'},order:['rsvp'],sections:{rsvp:{guestsMax:4}}}};
 db.prepare('INSERT INTO projects VALUES (?,?,?)').run(p.id,host.id,JSON.stringify(p));
 assert.equal((await call('/invites/hostparty/rsvp',{name:'Guest',attend:'yes',guests:1})).status,200);
 const replyId=(await(await call('/projects/hostparty/replies',null,host.cookie)).json())[0].id;

 // Every private route answers 404 to another signed-in account and leaves data untouched.
 const privateCalls=[['/projects/hostparty',null,'GET'],['/projects/hostparty',{state:p.state},'PUT'],['/projects/hostparty',{paid:true},'DELETE'],['/projects/hostparty/publish',{},'POST'],['/projects/hostparty/replies',null,'GET'],['/projects/hostparty/qr',null,'GET'],['/projects/hostparty/guests',null,'GET'],['/projects/hostparty/guests',{names:['X']},'POST'],['/projects/hostparty/settings',{rsvpDeadline:''},'POST'],['/projects/hostparty/reschedule',{eventDate:'2029-07-01'},'POST'],['/projects/hostparty/replies/'+replyId+'/checkin',{checkedIn:true},'POST']];
 for(const [url,body,method] of privateCalls)assert.equal((await call(url,body,intruder.cookie,method)).status,404,method+' '+url);
 assert.equal((await(await call('/projects',null,intruder.cookie)).json()).length,0);
 const after=JSON.parse(db.prepare("SELECT body FROM projects WHERE id='hostparty'").get().body);assert.equal(after.eventDate,'2029-06-10');assert.equal(after.deletedAt,undefined);
 assert.equal((await(await call('/projects/hostparty/replies',null,host.cookie)).json())[0].checkedIn,undefined);
 // Public invitation payload never carries replies or owner data.
 const pub=await(await call('/invites/hostparty')).json();assert.ok(Object.keys(pub).every(k=>['closed','guest','n','repliesClosed','s','t','z'].includes(k)),Object.keys(pub).join());

 // Sessions: expired sessions are ignored; logout revokes only that session.
 db.prepare('UPDATE account_sessions SET expires=? WHERE owner=?').run(Date.now()-1,intruder.id);
 assert.equal((await(await call('/me',null,intruder.cookie)).json()).account,null);
 assert.equal((await call('/auth/logout',{},host.cookie)).status,200);assert.equal((await(await call('/me',null,host.cookie)).json()).account,null);

 // Reset tokens: invalid format, unknown, expired; per-email throttling stops issuing new tokens.
 assert.equal((await call('/auth/reset',{token:'nope',password:'another-long-password'})).status,400);
 assert.equal((await call('/auth/reset',{token:'a'.repeat(64),password:'another-long-password'})).status,400);
 await call('/auth/reset-request',{email:'host@example.test'});await new Promise(r=>setTimeout(r,150));
 const token=[...out.matchAll(/#reset=([a-f0-9]{64})/g)].at(-1)[1];
 db.prepare('UPDATE password_resets SET expires=?').run(Date.now()-1);
 assert.equal((await call('/auth/reset',{token,password:'another-long-password'})).status,400,'expired token');
 assert.equal(db.prepare('SELECT COUNT(*) AS n FROM password_resets').get().n,0,'expired token is consumed');
 for(let i=0;i<3;i++)await call('/auth/reset-request',{email:'intruder@example.test'});
 const issued=db.prepare('SELECT COUNT(*) AS n FROM auth_events WHERE event=?').get('reset-requested').n;
 const limited=await call('/auth/reset-request',{email:'intruder@example.test'});assert.equal(limited.status,200,'throttled requests look identical');
 assert.equal(db.prepare('SELECT COUNT(*) AS n FROM auth_events WHERE event=?').get('reset-requested').n,issued,'no new token while throttled');
 assert.equal((await call('/auth/login',{email:'host@example.test',password:'a-long-test-password'})).status,200,'expired reset left the password unchanged');
 }finally{db?.close();proc.kill();await new Promise(r=>proc.once('exit',r));if(path.dirname(dir)!==path.resolve(tmpdir())||!path.basename(dir).startsWith('invitara-sec-'))throw Error('Unsafe cleanup');rmSync(dir,{recursive:true,force:true});}
});
