// Homepage hero (Shadow Text) and design collection (Feature Carousel): interactions, widths and reduced motion.
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const origin=process.env.TEST_ORIGIN||'http://localhost:3000';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+'/');
 const letter=page.locator('.shadow-letter').first();
 await page.waitForFunction(()=>document.querySelector('.shadow-letter')?.style.textShadow.includes('px'));
 assert.equal(await page.getByRole('heading',{level:1}).textContent().then(t=>t.includes('Beautiful digital invitations with online RSVP.')),true);
 const box=await page.locator('.lh-title').boundingBox(),shadow=()=>letter.evaluate(el=>el.style.textShadow.split(',')[0]);
 await page.mouse.move(box.x+box.width+40,box.y-40);await page.waitForTimeout(900);const fromRight=await shadow();
 await page.mouse.move(box.x-40,box.y+box.height+40);await page.waitForTimeout(900);assert.notEqual(await shadow(),fromRight,'the pointer moves the shadows');
 const chips=page.locator('.fc-chip');assert.equal(await chips.count(),10);
 const active=()=>page.locator('.fc-chip.is-active').textContent();
 await chips.nth(5).click();await page.waitForTimeout(500);assert.equal(await active(),await chips.nth(5).textContent());
 assert.match(await page.locator('.fc-card[aria-hidden="false"]').getAttribute('href'),/^design\.html\?id=animated-/);
 await page.getByRole('button',{name:'Pause',exact:true}).click();const held=await active();await page.mouse.move(0,0);await page.waitForTimeout(3500);assert.equal(await active(),held,'pause stops autoplay');
 await page.getByRole('button',{name:'Play',exact:true}).click();await page.waitForTimeout(3500);assert.notEqual(await active(),held,'play resumes autoplay');
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'overflow at '+width);}
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();
 await page.waitForFunction(()=>document.querySelector('.shadow-letter')?.style.textShadow.includes('px'));
 await page.locator('.fc-chip').nth(3).click();
 // With reduced motion the card lands at once: no frame in between.
 assert.ok(['none','matrix(1, 0, 0, 1, 0, 0)'].includes(await page.locator('.fc-card[aria-hidden="false"]').evaluate(el=>getComputedStyle(el).transform)),'reduced motion: the active card is already in place');
 assert.deepEqual(errors,[]);console.log('Passed: shadow headline follows the pointer; carousel chips, card links, pause/play, 4 widths and reduced motion.');
}finally{await browser.close();}
