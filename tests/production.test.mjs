import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

test('production boot serves built assets with security headers and secure cookies', async()=>{
  const directory=mkdtempSync(path.join(tmpdir(),'invitara-production-'));
  const endpoint='http://localhost:3199',appOrigin='https://invitara.example';
  const child=spawn(process.execPath,['server/index.mjs'],{env:{...process.env,NODE_ENV:'production',PORT:'3199',APP_ORIGIN:appOrigin,DATA_DIR:directory,STRIPE_SECRET_KEY:'sk_test_fixture',STRIPE_WEBHOOK_SECRET:'whsec_fixture',BUSINESS_NAME:'Test operator',SUPPORT_EMAIL:'test@example.test',TRUST_PROXY_HOPS:'0'},stdio:'pipe'});
  try{
    await new Promise((resolve,reject)=>{
      const timeout=setTimeout(()=>reject(new Error('Production startup timed out')),30000);
      child.stdout.on('data',data=>{if(data.toString().includes('listening')){clearTimeout(timeout);resolve();}});
      child.on('error',error=>{clearTimeout(timeout);reject(error);});
      child.on('exit',code=>{clearTimeout(timeout);reject(new Error('Production process exited '+code));});
    });
    const health=await fetch(endpoint+'/api/health');
    assert.equal(health.status,200);
    assert.match(health.headers.get('strict-transport-security'),/max-age=/);
    assert.match(health.headers.get('set-cookie'),/Secure/);
    assert.match(health.headers.get('set-cookie'),/HttpOnly/);
    assert.equal(health.headers.get('cache-control'),'no-store');
    assert.equal(health.headers.get('x-powered-by'),null);
    for(const url of ['/','/vendor/editions/editions-motion.js','/vendor/gsap.min.js'])assert.equal((await fetch(endpoint+url)).status,200);
    for(const url of ['/.env','/server/index.mjs','/data/invitara.sqlite','/node_modules/express/package.json'])assert.equal((await fetch(endpoint+url)).status,404);
    assert.equal((await fetch(endpoint+'/api/auth/login',{method:'POST',headers:{Origin:'https://untrusted.example','Content-Type':'application/json'},body:'{}'})).status,403);
  }finally{
    if(child.exitCode===null){const exited=new Promise(resolve=>child.once('exit',resolve));child.kill();await exited;}
    if(path.dirname(path.resolve(directory))!==path.resolve(tmpdir())||!path.basename(directory).startsWith('invitara-production-'))throw new Error('Unsafe temporary path');
    rmSync(directory,{recursive:true,force:true});
  }
});
