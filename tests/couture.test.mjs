import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {loadCatalog} from '../backend/catalog.mjs';
import {invitationState} from '../backend/invitation-state.mjs';

const catalog=loadCatalog(),themes=[...catalog.INVITARA_availableTemplates().filter(t=>t.couture)];

test('five couture editions load in the authoritative server catalogue',()=>{
 assert.deepEqual([...themes.map(t=>t.id)],['couture-lumiere','couture-obsidian','couture-eclipse','couture-saffron','couture-pearl']);
 assert.deepEqual([...themes.map(t=>t.occasion)],['wedding','corporate','product-launch','birthday','anniversary']);
});

test('couture defaults validate, keep edits, reference real assets and price with VAT',()=>{
 for(const theme of themes){
  const state=catalog.EVER_siteDefaults(theme.id);
  state.basics.nameA='Customer host';state.basics.brand='L';state.sections.hero.title='A personal\ntitle';
  state.sections.schedule.items[0].text='Customer agenda';state.sections.hero.openingType='scroll';
  const saved=invitationState(catalog,state,theme.id,'2027-06-10');
  assert.equal(saved.basics.nameA,'Customer host');assert.equal(saved.basics.brand,'L');
  assert.equal(saved.sections.hero.title,'A personal\ntitle');assert.equal(saved.sections.schedule.items[0].text,'Customer agenda');
  assert.equal(saved.sections.hero.openingType,'scroll');
  for(const photo of [saved.sections.hero.photo,saved.sections.story.photo,...saved.sections.gallery.items.map(i=>i.photo)])assert.ok(existsSync('frontend/public/'+photo),theme.id+' missing '+photo);
  assert.equal(catalog.EVER_C.quote({themeId:theme.id,plan:'studio',addons:[]}).total,Math.round(theme.price*105)/100);
 }
});

test('invalid couture opening modes are rejected',()=>{
 const state=catalog.EVER_siteDefaults('couture-lumiere');state.sections.hero.openingType='explode';
 assert.throws(()=>invitationState(catalog,state,'couture-lumiere','2027-06-10'),/opening mode/);
});
