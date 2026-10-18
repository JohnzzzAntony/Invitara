import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
const origin=process.env.TEST_ORIGIN||'http://localhost:3001';
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
mkdirSync('artifacts/housewarming/scroll',{recursive:true});
async function progress(value){
 await page.evaluate(value=>{const runway=document.querySelector('.hw-entrance-runway'),scroller=document.querySelector('.demo-scroll'),height=document.querySelector('.hw-entrance-stage').clientHeight;const top=runway.getBoundingClientRect().top-scroller.getBoundingClientRect().top+scroller.scrollTop;scroller.scrollTop=top+(runway.offsetHeight-height)*value;},value);
 await page.waitForTimeout(100);
}
try{
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:width===1440?1000:844});
  await page.goto(origin+'/demo.html?id=edition-aangan');await page.locator('.hw-entrance-stage').waitFor();
  await progress(0);
  assert.equal(await page.locator('.hw-hero').getAttribute('aria-hidden'),'true');
  assert.equal(await page.locator('.hw-door').getAttribute('aria-expanded'),'false');
  assert.equal(await page.locator('.hw-nav').isVisible(),false);
  assert.equal(await page.locator('.demo-bar').isVisible(),false);
  await page.screenshot({path:`artifacts/housewarming/scroll/${width}-closed.png`});
  await page.mouse.move(width/2,500);await page.mouse.wheel(0,200);await page.waitForTimeout(200);
  assert.ok(Number(await page.locator('.edition-aangan').getAttribute('data-entrance-progress'))>0,'Real wheel scrolling advances entrance');
  await progress(.28);
  let state=await page.locator('.hw-entrance-stage').evaluate(el=>({angle:parseFloat(el.style.getPropertyValue('--hw-door-turn')),scale:Number(el.style.getPropertyValue('--hw-camera-scale')),top:el.getBoundingClientRect().top}));
  assert.ok(state.angle>30&&state.angle<108);assert.equal(state.scale,1);assert.ok(Math.abs(state.top)<2,'Door remains pinned');
  await page.screenshot({path:`artifacts/housewarming/scroll/${width}-opening.png`});
  await progress(.70);
  state=await page.locator('.hw-entrance-stage').evaluate(el=>({angle:parseFloat(el.style.getPropertyValue('--hw-door-turn')),scale:Number(el.style.getPropertyValue('--hw-camera-scale'))}));
  assert.equal(state.angle,108);assert.ok(state.scale>4);
  await page.screenshot({path:`artifacts/housewarming/scroll/${width}-through.png`});
  await progress(1);
  assert.equal(await page.locator('.hw-hero').getAttribute('aria-hidden'),'false');
  assert.equal(await page.locator('.hw-hero').evaluate(el=>el.inert),false);
  assert.equal(await page.locator('.hw-portal-layer').isVisible(),false);
  assert.equal(await page.locator('.hw-nav').isVisible(),true);
  await page.screenshot({path:`artifacts/housewarming/scroll/${width}-invitation.png`});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await progress(0);assert.equal(await page.locator('.hw-door').getAttribute('aria-expanded'),'false');
 }
 await page.emulateMedia({reducedMotion:'reduce'});await progress(.4);
 assert.equal(await page.locator('.hw-entrance-stage').evaluate(el=>Number(el.style.getPropertyValue('--hw-camera-scale'))),1);
 await page.locator('.hw-skip-entrance').focus();await page.keyboard.press('Enter');
 assert.equal(await page.locator('.hw-hero').getAttribute('aria-hidden'),'false');
 // Published pages scroll the document rather than a preview panel.
 const state=await page.locator('.edition-aangan').evaluate(el=>el.__wsData);
 await page.route('**/api/invites/scroll-fixture',route=>route.fulfill({json:{s:state,t:'edition-aangan',closed:false}}));
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.goto(origin+'/invite.html?e=scroll-fixture');await page.locator('.hw-door').waitFor();
 await page.evaluate(()=>window.scrollTo({top:document.querySelector('.hw-entrance-stage').clientHeight,behavior:'instant'}));await page.waitForTimeout(100);
 assert.ok(Number(await page.locator('.edition-aangan').getAttribute('data-entrance-progress'))>.4);
 assert.ok(Math.abs(await page.locator('.hw-entrance-stage').evaluate(el=>el.getBoundingClientRect().top))<2);
 await page.evaluate(()=>{const runway=document.querySelector('.hw-entrance-runway');window.scrollTo({top:runway.offsetHeight-document.querySelector('.hw-entrance-stage').clientHeight,behavior:'instant'});});await page.waitForTimeout(100);
 assert.equal(await page.locator('.hw-hero').getAttribute('aria-hidden'),'false');
 assert.deepEqual(errors,[]);
 console.log('Passed: door-only first screen, wheel-driven opening, pinned camera passage, invitation reveal, reverse scroll, desktop/mobile, keyboard shortcut, reduced motion, document and preview scrolling.');
}finally{await browser.close();}
