import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const origin=process.env.TEST_ORIGIN||'http://localhost:3002';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+'/');const gallery=page.locator('.occasion-marquee');await gallery.scrollIntoViewIfNeeded();
 const real=gallery.locator('.occasion-set:not(.is-clone) a');assert.equal(await real.count(),20);
 assert.equal(await gallery.locator('.occasion-set.is-clone').evaluateAll(sets=>sets.every(s=>s.inert&&s.getAttribute('aria-hidden')==='true')),true,'clones are inert and hidden');
 const sources=await real.evaluateAll(cards=>cards.map(c=>c.querySelector('img').getAttribute('src')));assert.equal(new Set(sources).size,20,'every occasion has its own photo');
 const shift=()=>page.locator('.occasion-track').first().evaluate(t=>new DOMMatrix(getComputedStyle(t).transform).m41);
 const a=await shift();await page.waitForTimeout(600);assert.ok(await shift()<a,'marquee drifts');
 await page.getByRole('button',{name:'Pause motion'}).click();const paused=await shift();await page.mouse.move(0,0);await page.waitForTimeout(500);assert.equal(await shift(),paused,'pause button stops the drift');
 await page.getByRole('button',{name:'Play motion'}).click();
 const carousel=page.locator('.editorial-gallery');await carousel.scrollIntoViewIfNeeded();
 const active=()=>page.locator('#collection-grid > .collection-card').evaluateAll(cards=>cards.findIndex(c=>c.classList.contains('is-front')));
 const first=await active();await page.getByRole('button',{name:'Next template'}).click();await page.waitForTimeout(900);assert.notEqual(await active(),first,'next arrow advances');
 await page.getByRole('button',{name:'Pause',exact:true}).click();assert.equal(await page.locator('.carousel-autoplay').getAttribute('aria-pressed'),'true');
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'overflow '+width);}
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.locator('.occasion-marquee').scrollIntoViewIfNeeded();
 assert.equal(await page.locator('.occasion-track').first().evaluate(t=>getComputedStyle(t).animationName),'none');assert.equal(await page.locator('.marquee-toggle').isVisible(),false);
 await gallery.screenshot({path:'artifacts/occasion-gallery-mobile.png'});
 await page.locator('.occasion-set:not(.is-clone)').getByRole('link',{name:'Graduation invitations',exact:true}).click();assert.ok(page.url().includes('graduation-invitations'));
 assert.deepEqual(errors,[]);console.log('Passed: 20 distinct occasions, drifting marquee with pause, carousel arrows and autoplay toggle, 4 widths, reduced motion and category navigation.');
}finally{await browser.close();}
