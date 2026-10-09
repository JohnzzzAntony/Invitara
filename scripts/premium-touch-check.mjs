import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 const page=await context.newPage();
 await page.goto('http://localhost:3002/create.html?collection=premium#preview=premium-noir');
 await page.locator('.premium-showroom').waitFor();
 assert.ok(await page.locator('.showroom-detail').getAttribute('href'));
 await page.locator('.showroom-heart').click();
 await page.reload();
 assert.equal(await page.locator('.showroom-heart').getAttribute('aria-pressed'),'true');
 await page.getByRole('button',{name:'Scratch',exact:true}).click();
 const canvas=page.locator('.premium-scratch canvas');
 const box=await canvas.boundingBox();
 for(let y=20;y<box.height-20;y+=35){
  if(await canvas.isHidden())break;
  await page.mouse.move(box.x+10,box.y+y);await page.mouse.down();
  await page.mouse.move(box.x+box.width-10,box.y+y,{steps:12});await page.mouse.up();
 }
 await page.getByRole('button',{name:'Explore this template',exact:false}).click();
 const cdp=await context.newCDPSession(page);
 const host=await page.locator('.premium-showroom-content').boundingBox();
 const y=Math.max(180,host.y+60);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:330,y}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:100,y}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await page.waitForFunction(()=>document.querySelector('.showroom-name').textContent.includes('AURELIA'));
 await page.goto('http://localhost:3002/demo.html?id=premium-voyage');
 await page.locator('.suite-opening-button').click();
 await page.locator('.suite-film-button').click();
 await page.waitForFunction(()=>document.querySelector('.suite-film').currentTime>0);
 await page.setViewportSize({width:844,height:390});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.goto('http://localhost:3002/demo.html?id=premium-aurelia');
 await page.locator('.suite-scroll-opening').waitFor();
 await page.evaluate(()=>{document.querySelector('.demo-scroll').scrollTop=10000;});
 await page.locator('.suite-open').waitFor();
 console.log('Passed: scratch coverage, favorite persistence, deep-link, mobile touch swipe, film playback, landscape and complete scroll opening.');
} finally {await browser.close();}
