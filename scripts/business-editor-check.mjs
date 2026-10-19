import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
try{
 for(const key of ['brand','atelier','aura','executive','table','skyline']){
  await page.goto('http://localhost:3001/design.html?id=business-'+key);await page.locator('#detail-use').click();
  await page.locator('#canvas .business').waitFor();
  assert.equal(await page.locator('#canvas .business-reveal').isVisible(),false);
  await page.locator('#canvas [data-field="sections.hero.title"]').click();
  await page.locator('#visual-text-content').fill('Our '+key+' launch');await page.locator('#save-btn').click();await page.reload();
  assert.equal(await page.locator('#canvas [data-field="sections.hero.title"]').textContent(),'Our '+key+' launch');
 }
 assert.deepEqual(errors,[]);console.log('Passed: all six templates enter the editor, expose content without animation overlays, and persist changed titles after save/reload.');
}finally{await browser.close();}
