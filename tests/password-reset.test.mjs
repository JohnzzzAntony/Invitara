import test from 'node:test';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import {mkdtempSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import path from 'node:path';
test('email reset links are single-use, revoke sessions and do not reveal accounts; recovery codes regenerate',async()=>{
 const dir=mkdtempSync(path.join(tmpdir(),'invitara-reset-')),origin='http://localhost:3199';const proc=spawn(process.execPath,['backend/index.mjs'],{env:{...process.env,PORT:'3199',APP_ORIGIN:origin,DATA_DIR:dir,NODE_ENV:'test',RESEND_API_KEY:''},stdio:'pipe'});let out='';proc.stdout.on('data',d=>{out+=d;});
 try{await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error('Startup timeout')),10000);proc.stdout.on('data',()=>{if(out.includes('listening')){clearTimeout(timeout);resolve();}});proc.on('error',reject);});
 const call=(url,body,cookie)=>fetch(origin+'/api'+url,{method:body?'POST':'GET',headers:{Origin:origin,'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},body:body?JSON.stringify(body):undefined});
 const email='reset@example.test',password='first-long-password';
 const reg=await call('/auth/register',{email,password});const cookie=reg.headers.getSetCookie().at(-1).split(';')[0];const {recovery}=await reg.json();
 assert.equal((await(await call('/config')).json()).emailReset,true);
 const unknown=await(await call('/auth/reset-request',{email:'nobody@example.test'})).json(),known=await(await call('/auth/reset-request',{email})).json();
 assert.deepEqual(unknown,known);
 await new Promise(r=>setTimeout(r,200));const token=/#reset=([a-f0-9]{64})/.exec(out)?.[1];assert.ok(token,'dev mode logs the reset link');
 assert.equal((await call('/auth/reset',{token,password:'short'})).status,400);
 const reset=await call('/auth/reset',{token,password:'second-long-password'});assert.equal(reset.status,200);const fresh=reset.headers.getSetCookie().at(-1).split(';')[0];
 assert.equal((await(await call('/me',null,cookie)).json()).account,null,'old sessions are revoked');
 assert.equal((await call('/auth/reset',{token,password:'third-long-password'})).status,400,'token is single-use');
 assert.equal((await call('/auth/login',{email,password})).status,401);
 assert.equal((await call('/auth/recovery-code',{password:'wrong-long-password'},fresh)).status,401);
 const regen=await(await call('/auth/recovery-code',{password:'second-long-password'},fresh)).json();assert.equal(regen.recovery.length,48);
 assert.equal((await call('/auth/recover',{email,password:'fourth-long-password',recovery})).status,401,'old recovery code stops working');
 const login=await call('/auth/login',{email,password:'second-long-password'});const other=login.headers.getSetCookie().at(-1).split(';')[0];
 assert.equal((await call('/auth/logout-all',{},fresh)).status,200);assert.equal((await(await call('/me',null,other)).json()).account,null,'sign out everywhere');
 }finally{proc.kill();await new Promise(r=>proc.once('exit',r));if(path.dirname(dir)!==path.resolve(tmpdir())||!path.basename(dir).startsWith('invitara-reset-'))throw Error('Unsafe cleanup');rmSync(dir,{recursive:true,force:true});}
});
