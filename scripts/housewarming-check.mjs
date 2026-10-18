import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';

const origin=process.env.TEST_ORIGIN||'http://localhost:3000';
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
mkdirSync('artifacts/housewarming',{recursive:true});
try {
 await page.goto(origin+'/demo.html?id=edition-aangan&guest=Anu');
 await page.locator('.hw-door').waitFor();
 await page.locator('[data-width="desktop"]').evaluate(el=>el.click());
 await page.screenshot({path:'artifacts/housewarming/desktop.png'});
 assert.match(await page.locator('.hw-personal').textContent(),/Dear Anu/);
 await page.locator('.hw-door').click();
 assert.equal(await page.locator('.hw-door').getAttribute('aria-expanded'),'true');
 await page.locator('.hw-replay').click();
 assert.equal(await page.locator('.hw-door').getAttribute('aria-expanded'),'false');
 await page.locator('.hw-door').click();
 await page.locator('.hw-coating').scrollIntoViewIfNeeded();
 const box=await page.locator('.hw-coating').boundingBox();
 await page.mouse.move(box.x+10,box.y+10);await page.mouse.down();
 for(let y=12;y<box.height;y+=18){await page.mouse.move(box.x+10,box.y+y);await page.mouse.move(box.x+box.width-10,box.y+y,{steps:15});}
 await page.mouse.up();
 await page.locator('.hw-scratch.is-revealed').waitFor();
 assert.match(await page.locator('.hw-google').getAttribute('href'),/calendar.google.com/);
 const downloadPromise=page.waitForEvent('download');await page.locator('.hw-ics').click();
 const download=await downloadPromise;assert.equal(download.suggestedFilename(),'our-housewarming.ics');
 await download.saveAs('artifacts/housewarming/event.ics');
 const value=await page.evaluate(()=>window.INVITARA_housewarmingInstant('2027-01-01','09:00','Asia/Kolkata'));
 assert.equal(new Date(value).toISOString(),'2027-01-01T03:30:00.000Z');
 assert.equal(await page.evaluate(()=>window.INVITARA_housewarmingInstant('2027-07-01','09:00','America/New_York')),Date.parse('2027-07-01T13:00:00Z'));
 await page.locator('.ws-rsvp-form [name=name]').fill('Anu');
 await page.locator('.ws-rsvp-form [name=attend]').selectOption('maybe');
 await page.locator('.ws-rsvp-form button[type=submit]').click();
 assert.match(await page.locator('.ws-rsvp-form .ex-form-note').first().textContent(),/Preview only/);
 for(const width of [320,360,390,430,768,1024,1440]){
   await page.setViewportSize({width,height:900});
   await page.locator('[data-width="'+(width<768?'mobile':width<1024?'tablet':'desktop')+'"]').evaluate(el=>el.click());
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Page overflow '+width);
   assert.equal(await page.locator('.edition-aangan').evaluate(el=>el.scrollWidth>el.clientWidth),false,'Invitation overflow '+width);
 }
 await page.setViewportSize({width:390,height:844});await page.locator('[data-width="mobile"]').evaluate(el=>el.click());
 await page.locator('.hw-replay').click();
 await page.screenshot({path:'artifacts/housewarming/mobile.png',fullPage:true});
 await page.reload();await page.locator('.hw-door').waitFor();
 assert.equal(await page.locator('.hw-scratch').evaluate(el=>el.classList.contains('is-revealed')),true);
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.locator('.hw-door').click();
 await page.waitForTimeout(2000);
 await page.screenshot({path:'artifacts/housewarming/open.png'});
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto(origin+'/demo.html?id=edition-aangan&guest=Touch');
 await page.locator('.hw-coating').scrollIntoViewIfNeeded();
 const touchBox=await page.locator('.hw-coating').boundingBox();
 const cdp=await page.context().newCDPSession(page);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:touchBox.x+15,y:touchBox.y+15}]});
 for(let y=15;y<touchBox.height;y+=20){for(const x of [15,touchBox.width-15])await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:touchBox.x+x,y:touchBox.y+y}]});}
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await page.locator('.hw-scratch.is-revealed').waitFor();
 await page.goto(origin+'/demo.html?id=edition-aangan&guest=Keyboard');
 await page.locator('.hw-reveal').focus();await page.keyboard.press('Enter');
 await page.locator('.hw-scratch.is-revealed').waitFor();
 await page.setViewportSize({width:1440,height:1000});
 await page.goto(origin+'/create.html?occasion=housewarming');
 assert.equal(await page.locator('.collection-card').count(),1);
 await page.goto(origin+'/design.html?id=edition-aangan');await page.locator('#detail-use').click();
 await page.locator('#canvas .edition-aangan').waitFor();
 await page.locator('#canvas [data-field="basics.nameA"]').first().click();
 await page.locator('#visual-text-content').fill('The Nair family');await page.locator('#save-btn').click();await page.reload();
 assert.equal(await page.locator('#canvas [data-field="basics.nameA"]').first().textContent(),'The Nair family');
 assert.deepEqual(errors,[]);
 console.log('Passed: door/replay, personalization, mouse/touch canvas erasure, keyboard fallback, editor save, collection filtering, persistent reveal, ICS download, timezone/DST, honest preview RSVP, 7 widths, reduced motion, no browser errors.');
} finally { await browser.close(); }
