import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

test('production boot serves built assets with security headers and secure cookies', async()=>{
  const directory=mkdtempSync(path.join(tmpdir(),'invitara-production-'));
  const endpoint='http://localhost:3199',appOrigin='https://invitara.example';
  const child=spawn(process.execPath,['backend/index.mjs'],{env:{...process.env,NODE_ENV:'production',PORT:'3199',APP_ORIGIN:'invitara.example',DATA_DIR:directory,STRIPE_SECRET_KEY:'sk_test_fixture',STRIPE_WEBHOOK_SECRET:'whsec_fixture',BUSINESS_NAME:'Test operator',SUPPORT_EMAIL:'test@example.test',TRUST_PROXY_HOPS:'0'},stdio:'pipe'});
  try{
    await new Promise((resolve,reject)=>{
      const timeout=setTimeout(()=>reject(new Error('Production startup timed out')),30000);
      child.stdout.on('data',data=>{if(data.toString().includes('listening')){clearTimeout(timeout);resolve();}});
      child.on('error',error=>{clearTimeout(timeout);reject(error);});
      child.on('exit',code=>{clearTimeout(timeout);reject(new Error('Production process exited '+code));});
    });
    const health=await fetch(endpoint+'/api/health');
    const allowed=await fetch(endpoint+'/api/auth/login',{method:'POST',headers:{Origin:appOrigin,'Content-Type':'application/json'},body:'{}'});
    assert.equal(allowed.status,400,'Normalized HTTPS origin passes CSRF middleware and reaches field validation');
    assert.equal(health.status,200);
    assert.match(health.headers.get('strict-transport-security'),/max-age=/);
    assert.match(health.headers.get('set-cookie'),/Secure/);
    assert.match(health.headers.get('set-cookie'),/HttpOnly/);
    assert.equal(health.headers.get('cache-control'),'no-store');
    assert.equal(health.headers.get('x-powered-by'),null);
    for(const url of ['/','/vendor/editions/editions-motion.js','/vendor/gsap.min.js'])assert.equal((await fetch(endpoint+url)).status,200);
    for(const [from,to] of [['/wedding-invitations.html','/wedding-invitations'],['/baby-shower-invitations.html','/baby-shower-invitations'],['/create.html?occasion=eid','/eid-invitations'],['/plan.html','/pricing.html']]){const r=await fetch(endpoint+from,{redirect:'manual'});assert.equal(r.status,301);assert.equal(r.headers.get('location'),to);}
    const landing=await (await fetch(endpoint+'/wedding-invitations')).text();
    assert.match(landing,/<title>Digital Wedding Invitations with Online RSVP \| Invitara<\/title>/);assert.match(landing,/<link rel="canonical" href="[^"]*\/wedding-invitations">/);assert.match(landing,/<h1 id="collection-title"[^>]*>Digital wedding invitations<\/h1>/);
    const graph=JSON.parse(/<script type="application\/ld\+json">(.*?)<\/script>/.exec(landing)[1])['@graph'];
    assert.deepEqual(graph.map(n=>n['@type']),['Organization','WebSite','CollectionPage','BreadcrumbList','FAQPage']);
    const design=await (await fetch(endpoint+'/design.html?id=edition-vow')).text();
    assert.match(design,/<h1 id="detail-title">The Vow<\/h1>/);assert.match(design,/"@type":"Product"/);assert.match(design,/"priceCurrency":"AED"/);
    const home=await (await fetch(endpoint+'/')).text();
    const faqs=JSON.parse(/<script type="application\/ld\+json">(.*?)<\/script>/.exec(home)[1])['@graph'].find(n=>n['@type']==='FAQPage').mainEntity;
    assert.equal(faqs.length,(home.match(/<details>/g)||[]).length,'FAQ markup mirrors visible questions');
    const sitemap=await (await fetch(endpoint+'/sitemap.xml')).text();
    for(const path of ['/wedding-invitations','/design.html?id=edition-vow','/pricing.html'])assert.ok(sitemap.includes(path),path);
    assert.match(await (await fetch(endpoint+'/llms.txt')).text(),/^# Invitara/);
    assert.equal((await fetch(endpoint+'/not-an-occasion')).status,404);
    for(const url of ['/.env','/backend/index.mjs','/server/index.mjs','/frontend/motion/editions-motion.js','/frontend/README.md','/archive/atelier-2026-10-07/README.md','/data/invitara.sqlite','/node_modules/express/package.json'])assert.equal((await fetch(endpoint+url)).status,404);
    assert.equal((await fetch(endpoint+'/api/auth/login',{method:'POST',headers:{Origin:'https://untrusted.example','Content-Type':'application/json'},body:'{}'})).status,403);
  }finally{
    if(child.exitCode===null){const exited=new Promise(resolve=>child.once('exit',resolve));child.kill();await exited;}
    if(path.dirname(path.resolve(directory))!==path.resolve(tmpdir())||!path.basename(directory).startsWith('invitara-production-'))throw new Error('Unsafe temporary path');
    rmSync(directory,{recursive:true,force:true});
  }
});
