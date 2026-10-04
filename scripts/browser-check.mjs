import {chromium} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
const origin=process.env.TEST_ORIGIN||'http://localhost:3000';
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[],missing=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.url().startsWith(origin)&&r.status()===404)missing.push(r.url());});
mkdirSync('artifacts',{recursive:true});
await page.goto(origin);await page.waitForSelector('.collection-card');await page.waitForTimeout(1800);
if(await page.locator('.collection-card').count()!==6)throw new Error('Expected six featured designs on the homepage');
await page.screenshot({path:'artifacts/storefront-desktop.png'});
await page.setViewportSize({width:390,height:844});await page.screenshot({path:'artifacts/storefront-mobile.png',fullPage:true});
const results=[];
for(const id of ['vellum','nocturne','confetti','bloom','atlas']){
 await page.goto(origin+'/demo.html?id='+id);await page.waitForSelector('.ex');
 if(await page.locator('[data-open]').count()){await page.locator('[data-open]').click();await page.waitForFunction(()=>!document.querySelector('.ex').classList.contains('is-closed'));}
 await page.waitForTimeout(1400);await page.screenshot({path:'artifacts/'+id+'-mobile.png'});
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth||document.querySelector('.ex').scrollWidth>document.querySelector('.ex').clientWidth+1);
 if(overflow)throw new Error(id+' has mobile overflow');
 if(id==='vellum'){const canvas=page.locator('[data-scratch] canvas');await canvas.scrollIntoViewIfNeeded();const r=await canvas.boundingBox();await page.mouse.move(r.x+12,r.y+20);await page.mouse.down();for(let row=0;row<5;row++){await page.mouse.move(r.x+12,r.y+20+row*20);await page.mouse.move(r.x+r.width-12,r.y+20+row*20,{steps:10});}await page.mouse.up();}else await page.locator('[data-reveal]').click();if(!await page.locator('.ex-scratch').evaluate(el=>el.classList.contains('is-revealed')))throw new Error(id+' reveal failed');
 if(id==='confetti'){await page.locator('[data-pop]').click({force:true});}
 if(id==='nocturne'){await page.waitForFunction(()=>document.querySelector('video').readyState>=2);if(await page.locator('video').evaluate(v=>v.videoWidth===0))throw new Error('Film failed');}
 for(const width of [768,1440]){await page.setViewportSize({width,height:1000});await page.locator('[data-width="'+(width===768?'tablet':'desktop')+'"]').click();await page.waitForTimeout(150);if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw new Error(id+' has overflow at '+width);}
 await page.locator('.demo-scroll').evaluate(el=>el.scrollTop=0);await page.screenshot({path:'artifacts/'+id+'-desktop.png'});results.push(id);await page.setViewportSize({width:390,height:844});
}
await page.goto(origin+'/demo.html?id=bloom');await page.locator('#demo-select').click();await page.locator('#mobile-edit').click();await page.waitForSelector('#basics-body input');
await page.locator('#basics-body input[type=text]').first().fill('Milo');await page.locator('#save-btn').click();
await page.locator('#mobile-preview').click();await page.waitForSelector('.ex-bloom');await page.screenshot({path:'artifacts/editor-mobile.png'});
if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw new Error('Editor mobile overflow');
await page.locator('#mobile-edit').click();await page.locator('#tab-design').click();await page.locator('.tpl-chip').filter({hasText:'One More Encore'}).click();await page.waitForFunction(()=>window.EVER_C.activeProject().themeId==='edition-encore');await page.locator('#save-btn').click();if(await page.evaluate(()=>window.EVER_C.activeProject().state.templateId)!=='edition-encore')throw new Error('Draft template and checkout design disagree');await page.locator('#tab-content').click();
await page.emulateMedia({reducedMotion:'reduce'});await page.goto(origin+'/demo.html?id=vellum');await page.locator('[data-open]').click();await page.waitForFunction(()=>!document.querySelector('.ex').classList.contains('is-closed'));if(!await page.locator('h1').isVisible())throw new Error('Reduced motion hides content');
await page.goto(origin+'/create.html');await page.locator('[data-filter-key=occasion][data-filter-value=birthday]').click();if(await page.locator('.collection-card').count()!==1)throw new Error('Filtering failed');
console.log(JSON.stringify({templates:results,errors,missing}));writeFileSync('artifacts/browser-results.json',JSON.stringify({templates:results,errors,missing},null,2));
await browser.close();if(errors.length||missing.length)throw new Error('Browser errors or missing resources');
