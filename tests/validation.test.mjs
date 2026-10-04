import test from 'node:test';
import assert from 'node:assert/strict';
import {loadCatalog} from '../server/catalog.mjs';
import {invitationState} from '../server/invitation-state.mjs';

const catalog=loadCatalog();
test('all active and archived designs retain their server validation contract',()=>{
  assert.equal(catalog.INVITARA_availableTemplates().length,14);
  assert.equal(catalog.EVER_THEMES.length,68);
  for(const theme of catalog.EVER_THEMES){
    const state=catalog.EVER_siteDefaults(theme.id);
    const valid=invitationState(catalog,state,theme.id,'2027-06-10');
    assert.equal(valid.templateId,theme.id);
    assert.equal(valid.basics.date,'2027-06-10');
    assert.deepEqual(Array.from(valid.order),Array.from(state.order));
  }
});
test('styles, section types and links reject executable or out-of-schema input',()=>{
  const id='edition-vow',state=catalog.EVER_siteDefaults(id);
  for(const patch of [
    {theme:{background:'url(javascript:alert(1))'}},
    {elementLinks:{'sections.hero.button':'javascript:alert(1)'}},
    {elementStyles:{'basics.nameA':{position:'fixed'}}},
    {sectionTypes:{rsvpCopy1:'rsvp'}},
    {order:['hero','hero']}
  ])assert.throws(()=>invitationState(catalog,{...state,...patch},id,state.basics.date));
  assert.equal(catalog.EVER_safeUrl('javascript:alert(1)'), '');
  assert.equal(catalog.EVER_esc('<img src=x onerror=alert(1)>'),'&lt;img src=x onerror=alert(1)&gt;');
});
