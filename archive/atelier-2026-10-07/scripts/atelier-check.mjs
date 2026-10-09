import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdirSync,mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
const origin='http://localhost:3210';
const child=spawn(process.execPath,['server/index.mjs'],{windowsHide:true,env:{...process.env,PORT:'3210',APP_ORIGIN:origin,DATA_DIR:mkdtempSync(path.join(tmpdir(),'atelier-'))},stdio:'pipe'});
let browser;
try{
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Startup timed out')),20000);child.stdout.on('data',d=>{if(d.toString().includes('listening')){clearTimeout(timer);resolve();}});child.on('error',reject);});
 browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 mkdirSync('artifacts/atelier',{recursive:true});
 await page.goto(origin+'/create.html?tier=atelier');await page.locator('.collection-card').first().waitFor();
 const themes=await page.evaluate(()=>window.INVITARA_availableTemplates().filter(t=>t.tier==='atelier').map(t=>({id:t.id,price:t.price,occasion:t.occasion})));
 assert.equal(themes.length,14);assert.equal(new Set(themes.map(t=>t.occasion)).size,14);
 assert.match(await page.locator('#results-count').textContent(),/14 designs/);
 await page.locator('#load-more').click();assert.equal(await page.locator('.collection-card').count(),14);
 await page.screenshot({path:'artifacts/atelier/collection.png',fullPage:true});
 await page.getByRole('button',{name:'Signature · AED 79',exact:true}).click();assert.match(await page.locator('#results-count').textContent(),/14 designs/);
 for(const t of themes){
  const html=await(await fetch(origin+'/design.html?id='+t.id)).text();assert.ok(html.includes('AED '+t.price+' / event + 5% VAT'));assert.ok(html.includes('About this invitation'));
  const graph=JSON.parse(html.split('<script type="application/ld+json">')[1].split('</script>')[0])['@graph'];assert.equal(graph.find(x=>x['@type']==='Product').offers.price,t.price);
  await page.goto(origin+'/demo.html?id='+t.id);await page.locator('.atelier .ed-headline').waitFor();
  for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1000});if(width>=768)await page.locator('[data-width="'+(width===768?'tablet':'desktop')+'"]').click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,t.id+' overflow '+width);assert.ok(await page.locator('.ed-headline').isVisible());}
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:'artifacts/atelier/'+t.id+'.png',fullPage:true});
  await page.locator('.ed-invite-link').click();assert.ok(await page.locator('.nx-section-rsvp').count());
 }
 await page.setViewportSize({width:1440,height:1000});await page.goto(origin+'/design.html?id=atelier-palais');await page.locator('#detail-use').click();await page.locator('#canvas .atelier').waitFor();await page.locator('#canvas [data-field="basics.nameA"]').first().click();await page.locator('#visual-text-content').fill('Avery');await page.locator('#save-btn').click();await page.reload();assert.equal(await page.locator('#canvas [data-field="basics.nameA"]').first().textContent(),'Avery');
 const quote=await page.evaluate(()=>window.EVER_C.quote({themeId:'atelier-palais',plan:'studio',addons:[]}));assert.equal(quote.total,313.95);
 await page.emulateMedia({reducedMotion:'no-preference'});await page.goto(origin+'/demo.html?id=atelier-celeste');await page.getByRole('button',{name:'Pause motion'}).click();assert.equal(await page.locator('.edition').getAttribute('data-paused'),'true');await page.getByRole('button',{name:'Resume motion'}).click();await page.emulateMedia({reducedMotion:'reduce'});
 assert.deepEqual(errors,[]);console.log('Passed: 14 Atelier designs, 4 widths each, collection filters, editor persistence, VAT quote, Product metadata, visible FAQs and motion controls.');
}finally{await browser?.close();child.kill();}
