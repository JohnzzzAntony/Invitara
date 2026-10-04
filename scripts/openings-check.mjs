import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
const origin=process.env.TEST_ORIGIN||'http://localhost:3000';
const browser=await chromium.launch({channel:'msedge',headless:true});
mkdirSync('artifacts/openings',{recursive:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+'/create.html');
 const themes=await page.evaluate(()=>window.INVITARA_availableTemplates().map(t=>t.id));
 const styles=new Set();
 for(const id of themes){
  await page.goto(origin+'/demo.html?id='+id);
  if(id==='edition-vow'){assert.equal(await page.locator('.ed-book-stage').count(),1);continue;}
  const opening=page.locator('.ed-opening');await opening.waitFor();
  styles.add(await opening.getAttribute('class'));
  assert.equal(await page.locator('.ed-scene canvas').count(),0,'Closed invitation does not load WebGL');
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:900});
   if(width>=768)await page.locator('[data-width="'+(width===768?'tablet':'desktop')+'"]').click();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,id+' opening overflow');
  }
  await page.locator('[data-width="mobile"]').click();await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:'artifacts/openings/'+id+'.png'});
  await page.locator('.ed-opening-button').focus();await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
  assert.equal(await opening.evaluate(el=>el.getAnimations({subtree:true}).length>0),true,'Opening is animated');
  await page.waitForFunction(()=>document.querySelector('.edition').dataset.opened==='true');
  assert.equal(await opening.count(),0);assert.equal(await page.locator('.ed-hero').evaluate(el=>el.inert),false);
  assert.equal(await page.locator('.ed-hero').evaluate(el=>el===document.activeElement),true,'Focus reaches the invitation');
  await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.locator('.ed-opening-button').click();
  await page.waitForFunction(()=>document.querySelector('.edition').dataset.opened==='true');
  assert.equal(await page.locator('.ed-opening').count(),0);
  await page.emulateMedia({reducedMotion:'no-preference'});
 }
 assert.equal(styles.size,13);assert.deepEqual(errors,[]);
 console.log('Passed: 13 distinct opening objects plus wedding book; animated and reduced motion, keyboard focus, deferred WebGL, four viewport widths.');
}finally{await browser.close();}
