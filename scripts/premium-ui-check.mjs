import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const route of ['/', '/create.html','/pricing.html','/account.html','/dashboard.html']){
  await page.goto('http://localhost:3002'+route);await page.locator('.ui-scroll-progress').waitFor({state:'attached'});
  for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,route+' overflow '+width);}
 }
 await page.goto('http://localhost:3002/');await page.emulateMedia({reducedMotion:'reduce'});
 await page.screenshot({path:'artifacts/premium-ui-home.png',fullPage:true});
 await page.emulateMedia({reducedMotion:'no-preference'});
 const faq=page.locator('.launch-faq details').first();await faq.locator('summary').click();await page.waitForTimeout(400);assert.equal(await faq.getAttribute('open'),'');assert.ok(await faq.locator('p').isVisible());await faq.locator('summary').press('Enter');await page.waitForTimeout(400);assert.equal(await faq.getAttribute('open'),null);
 await page.setViewportSize({width:390,height:844});await page.goto('http://localhost:3002/');await page.getByRole('button',{name:'Open navigation',exact:true}).click();assert.equal(await page.locator('.studio-menu').getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await page.locator('.studio-menu').getAttribute('aria-expanded'),'false');
 await page.emulateMedia({reducedMotion:'reduce'});await page.screenshot({path:'artifacts/premium-ui-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log('Passed: five pages at four widths, animated FAQ mouse/keyboard, mobile menu, reduced motion and no browser errors.');
}finally{await browser.close();}
