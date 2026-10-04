import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
const origin=process.env.TEST_ORIGIN||'http://localhost:3000';
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
const errors=[],missing=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(origin)&&r.status()===404)missing.push(r.url());});mkdirSync('artifacts/editions',{recursive:true});
try{
 await page.goto(origin+'/create.html');await page.locator('.collection-card').first().waitFor();
 const catalogue=await page.evaluate(()=>window.INVITARA_availableTemplates().map(t=>({id:t.id,key:t.artDirection,occasion:t.occasion,scene:t.editionScene})));
 assert.equal(catalogue.length,14);assert.equal(new Set(catalogue.map(t=>t.occasion)).size,14);assert.equal(new Set(catalogue.map(t=>t.key)).size,14);
 await page.locator('#load-more').click();assert.equal(await page.locator('.collection-card').count(),14);assert.equal(await page.locator('canvas').count(),0,'Catalogue must not allocate WebGL contexts');await page.screenshot({path:'artifacts/editions/collection-desktop.png',fullPage:true});
 for(const width of [320,375,390,414,768,1024,1280,1440,1920]){await page.setViewportSize({width,height:1000});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Catalogue overflow '+width);}
 for(const t of catalogue){
  await page.setViewportSize({width:390,height:844});await page.goto(origin+'/demo.html?id='+t.id);await page.locator('.edition-'+t.key+' .ed-hero').waitFor();assert.equal(await page.locator('.ed-scene canvas').count(),0,'Reduced motion does not load WebGL');
  assert.ok((await page.locator('.ed-names').textContent()).trim());await page.screenshot({path:'artifacts/editions/'+t.key+'-mobile.png'});
  for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1000});if(width>=768)await page.locator('[data-width="'+(width===768?'tablet':'desktop')+'"]').click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,t.key+' overflow at '+width);}
  if(t.key==='vow'){await page.locator('.ed-invite-link').click();await page.locator('.ed-book-open').waitFor();await page.getByRole('button',{name:'Next chapter'}).click();await page.getByRole('button',{name:'Return to cover'}).click();await page.locator('.ed-book-closed').waitFor();}
  if(t.key==='postmark'||t.key==='mosaic'){await page.locator('.ed-invite-link').click();assert.equal(await page.locator('.ed-invite-link').getAttribute('aria-expanded'),'true');}
  if(t.key==='archive'){await page.locator('.nx-gallery-photo').first().click();await page.getByRole('button',{name:'Next photograph'}).click();assert.match(await page.locator('.nx-lightbox p').textContent(),/^2 \/ 3/);await page.getByRole('button',{name:'Close gallery'}).click();}
 }
 await page.setViewportSize({width:1440,height:1000});await page.goto(origin+'/design.html?id=edition-vow');await page.locator('#detail-use').click();await page.locator('#canvas .edition').waitFor();await page.locator('#canvas [data-field="basics.nameA"]').first().click();await page.locator('#visual-text-content').fill('Avery');await page.locator('#save-btn').click();await page.reload();assert.equal(await page.locator('#canvas [data-field="basics.nameA"]').first().textContent(),'Avery');await page.locator('#canvas [data-field="basics.nameA"]').first().click();await page.screenshot({path:'artifacts/editions/editor-desktop.png'});
 await page.emulateMedia({reducedMotion:'no-preference'});
 for(const t of catalogue.filter(t=>t.scene)){
  await page.goto(origin+'/demo.html?id='+t.id);await page.locator('.ed-scene.has-webgl').waitFor({timeout:30000});assert.equal(await page.locator('.ed-scene canvas').count(),1);await page.waitForFunction(()=>document.querySelector('.edition').dataset.sceneRunning==='true');await page.getByRole('button',{name:'Pause motion'}).click();await page.waitForFunction(()=>document.querySelector('.edition').dataset.sceneRunning==='false');assert.equal(await page.locator('.ed-names').evaluate(el=>Number(getComputedStyle(el).opacity)),1,'Paused motion must leave names readable');await page.getByRole('button',{name:'Resume motion'}).click();await page.waitForFunction(()=>document.querySelector('.edition').dataset.sceneRunning==='true');await page.screenshot({path:'artifacts/editions/'+t.key+'-motion.png'});
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('.edition').dataset.sceneRunning==='false');await page.emulateMedia({reducedMotion:'no-preference'});
 }
 assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);writeFileSync('artifacts/editions/results.json',JSON.stringify({designs:catalogue.length,occasions:14,webglScenes:catalogue.filter(t=>t.scene).length,errors,missing},null,2));console.log('Passed: 14 unique editions, all occasions, 9 catalogue widths, 4 guest widths, book/reveal/gallery, inline editing, 6 live Three.js scenes, pause/resume and reduced motion.');
}finally{await browser.close();}
