// Homepage hero (design deck, rotating word, pause) and design collection (Feature Carousel): interactions, widths and reduced motion.
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const origin=process.env.TEST_ORIGIN||'http://localhost:3000';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+'/');
 const title=page.getByRole('heading',{level:1});
 assert.match(await title.textContent(),/^Invitations as joyful as your celebration/);
 await page.waitForFunction(()=>document.querySelector('.mz-deck')?.swiper);
 assert.equal(await page.evaluate(()=>document.querySelector('.mz-deck').swiper.params.effect),'coverflow','wide screens get the coverflow');
 assert.ok(await page.locator('.mz-slide').count()>=5,'the deck shows real designs');
 const hero=page.locator('.mz-hero'),toggle=hero.locator('.mz-toggle');
 await toggle.click();assert.equal(await toggle.getAttribute('aria-label'),'Play');assert.equal(await page.evaluate(()=>document.querySelector('.mz-deck').swiper.autoplay.running),false,'pause stops the deck');
 const word=await page.locator('.mz-word').textContent();await page.waitForTimeout(3000);assert.equal(await page.locator('.mz-word').textContent(),word,'pause holds the rotating word');
 await toggle.click();assert.equal(await page.evaluate(()=>document.querySelector('.mz-deck').swiper.autoplay.running),true);
 const chips=page.locator('.fc-chip');assert.equal(await chips.count(),10);
 const active=()=>page.locator('.fc-chip.is-active').textContent();
 await chips.nth(5).click();await page.waitForTimeout(500);assert.equal(await active(),await chips.nth(5).textContent());
 assert.match(await page.locator('.fc-card[aria-hidden="false"]').getAttribute('href'),/^design\.html\?id=animated-/);
 await page.getByRole('button',{name:'Pause',exact:true}).click();const held=await active();await page.mouse.move(0,0);await page.waitForTimeout(3500);assert.equal(await active(),held,'pause stops autoplay');
 await page.getByRole('button',{name:'Play',exact:true}).click();await page.waitForTimeout(3500);assert.notEqual(await active(),held,'play resumes autoplay');
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'overflow at '+width);}
 await page.setViewportSize({width:390,height:844});await page.reload();await page.waitForFunction(()=>document.querySelector('.mz-deck')?.swiper);
 assert.equal(await page.evaluate(()=>document.querySelector('.mz-deck').swiper.params.effect),'cards','phones get the swipeable card deck');
 await page.setViewportSize({width:1440,height:900});await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.waitForFunction(()=>document.querySelector('.mz-deck')?.swiper);
 assert.equal(await page.locator('.mz-toggle').isHidden(),true,'reduced motion: nothing moves, so no pause button');
 await page.locator('.fc-chip').nth(3).click();
 // With reduced motion the card lands at once: no frame in between.
 assert.ok(['none','matrix(1, 0, 0, 1, 0, 0)'].includes(await page.locator('.fc-card[aria-hidden="false"]').evaluate(el=>getComputedStyle(el).transform)),'reduced motion: the active card is already in place');
 assert.deepEqual(errors,[]);console.log('Passed: hero deck (coverflow and cards), pause holds deck and word; carousel chips, card links, pause/play, 4 widths and reduced motion.');
}finally{await browser.close();}
