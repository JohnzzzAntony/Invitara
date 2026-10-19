import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
const origin=process.env.TEST_ORIGIN||'http://localhost:3001';
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
mkdirSync('artifacts/business',{recursive:true});
try {
 for(const key of ['brand','atelier','aura','executive','table','skyline']){
  await page.goto(origin+'/demo.html?id=business-'+key);
  await page.locator('.business').waitFor();
  await page.locator('[data-width="desktop"]').click();
  await page.locator('.business-reveal').click();await page.waitForTimeout(1800);
  assert.equal(await page.locator('.business-reveal').getAttribute('aria-expanded'),'true');
  await page.waitForTimeout(1700);await page.evaluate(()=>document.querySelector('.demo-scroll').scrollTop=0);
  await page.screenshot({path:'artifacts/business/'+key+'-desktop.png'});
  assert.equal(await page.locator('.business-art').evaluate(el=>el.complete&&el.naturalWidth>0),true);
  assert.match(await page.locator('.business-google').getAttribute('href'),/ctz=Asia%2FDubai/);
  const download=page.waitForEvent('download');await page.locator('.business-ics').click();assert.equal((await download).suggestedFilename(),'event.ics');
  await page.locator('.business-replay').click();assert.equal(await page.locator('.business-reveal').getAttribute('aria-expanded'),'false');
  await page.locator('.business-reveal').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('.business-reveal').getAttribute('aria-expanded'),'true');
  if(key==='aura'){await page.locator('.business-rotation input').fill('20');assert.equal(await page.locator('.business').evaluate(el=>el.style.getPropertyValue('--biz-rotate')),'20deg');}
  if(key==='table'){await page.locator('.business-menu-item summary').first().click();assert.equal(await page.locator('.business-menu-item').first().getAttribute('open'),null);}
  await page.locator('.business-motion').click();assert.equal(await page.locator('.business').getAttribute('data-paused'),'true');
  for(const width of [390,320]){
   await page.locator('[data-width="mobile"]').evaluate(el=>el.click());await page.setViewportSize({width,height:844});
   await page.locator('.business-hero').scrollIntoViewIfNeeded();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   const clipped=await page.locator('.business-title').evaluate(el=>el.scrollWidth>el.clientWidth+2);assert.equal(clipped,false,key+' heading fits');
   await page.screenshot({path:'artifacts/business/'+key+'-'+width+'.png'});
  }
  await page.setViewportSize({width:1440,height:1000});
 }
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();assert.equal(await page.locator('.business').getAttribute('data-paused'),'true');
 await page.goto(origin+'/create.html');await page.locator('[data-filter-value="business"]').click();await page.locator('.collection-card').first().waitFor();assert.equal(await page.locator('.collection-card').count(),6);await page.screenshot({path:'artifacts/business/collection.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log('Passed six templates: desktop/mobile, reveal/replay/keyboard, artwork, calendar export, product rotation, menu, reduced motion, collection filtering.');
}finally{await browser.close();}
