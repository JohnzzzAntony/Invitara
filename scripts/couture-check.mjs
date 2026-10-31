// Browser contract for the five Couture editions. Run against a local server: TEST_ORIGIN=http://localhost:3000 npm run test:couture
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
const origin=process.env.TEST_ORIGIN||'http://localhost:3000';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined});
mkdirSync('artifacts/couture',{recursive:true});
const keys=['lumiere','obsidian','eclipse','saffron','pearl'];
try{
 for(const key of keys){
  for(const width of [320,390,1440]){
   const page=await browser.newPage({viewport:{width,height:900}}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!/net::ERR_/.test(m.text()))errors.push(m.text());});
   await page.goto(origin+'/demo.html?id=couture-'+key);await page.locator('.couture').waitFor();
   if(width>1000)await page.locator('[data-width="desktop"]').click();
   const open=page.locator('.cx-open-button');
   assert.equal(await open.getAttribute('aria-expanded'),'false',key+' starts closed');
   await open.focus();await page.keyboard.press('Enter');
   assert.equal(await open.getAttribute('aria-expanded'),'true',key+' opens by keyboard');
   assert.ok(await page.locator('.couture').evaluate(el=>el.classList.contains('cx-open')));
   await page.waitForTimeout(3000);await page.screenshot({path:`artifacts/couture/${key}-${width}.png`});
   assert.equal(await page.locator('.cx-photo').evaluate(el=>el.complete&&el.naturalWidth>0),true,key+' hero image loads');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,key+' has no horizontal scroll at '+width);
   assert.match(await page.locator('.cx-google').getAttribute('href'),/ctz=Asia%2FDubai/);
   const download=page.waitForEvent('download');await page.locator('.cx-ics').click();assert.equal((await download).suggestedFilename(),'event.ics');
   await page.locator('.cx-replay').click();assert.equal(await open.getAttribute('aria-expanded'),'false',key+' replays');
   await page.locator('.cx-motion').click();assert.equal(await page.locator('.couture').getAttribute('data-paused'),'true');
   assert.deepEqual(errors,[],key+' console errors');await page.close();
  }
  const reduced=await browser.newPage({reducedMotion:'reduce'});await reduced.goto(origin+'/demo.html?id=couture-'+key);
  assert.equal(await reduced.locator('.couture').getAttribute('data-paused'),'true',key+' honours reduced motion');await reduced.close();
 }
 const page=await browser.newPage();await page.goto(origin+'/create.html?collection=couture');
 await page.locator('.collection-card').first().waitFor();assert.equal(await page.locator('.collection-card').count(),5);
 await page.goto(origin+'/prompts.html');assert.equal(await page.locator('.prompt-card').count(),7);
 await page.goto(origin+'/design.html?id=couture-pearl');await page.getByRole('button',{name:'Copy build prompt'}).waitFor();
 console.log('Couture checks passed for',keys.length,'editions at 320/390/1440px.');
}finally{await browser.close();}
