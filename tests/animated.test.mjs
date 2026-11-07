import test from 'node:test';
import assert from 'node:assert/strict';
import {loadCatalog} from '../backend/catalog.mjs';
import {invitationState} from '../backend/invitation-state.mjs';
import {seoFor,sitemapXml} from '../backend/seo.mjs';

const catalog=loadCatalog(),themes=catalog.INVITARA_availableTemplates();

test('the ten animated invitations are the active collection',()=>{
 assert.equal(themes.length,10);
 assert.ok(themes.every(t=>t.animated&&t.layout===t.id));
 assert.ok(catalog.EVER_THEMES.filter(t=>!t.animated).every(t=>t.archived));
});

test('every visible text saves through server validation, with RSVP and AED 79 pricing',()=>{
 for(const theme of themes){
  const state=catalog.EVER_siteDefaults(theme.id),layout=catalog.EVER_findLayout(theme.id);
  const fields=layout.sections.flatMap(s=>s.fields.map(f=>[s.id,f.k]));
  assert.ok(fields.length>40,theme.id+' has too few editable texts');
  for(const [sid,k] of fields)state.sections[sid][k]='Edited '+k;
  const saved=invitationState(catalog,state,theme.id,'2027-06-10');
  for(const [sid,k] of fields)assert.equal(saved.sections[sid][k],'Edited '+k);
  assert.ok(saved.order.includes('rsvp'),theme.id+' needs an RSVP section for guest replies');
  assert.equal(catalog.EVER_C.quote({themeId:theme.id,plan:'studio',addons:[]}).total,82.95);
  const graph=JSON.parse(seoFor('design.html',{origin:'https://example.test',catalog,query:{id:theme.id}}).jsonLd('').split('>')[1].split('</script')[0])['@graph'];
  assert.equal(graph.find(x=>x['@type']==='Product').offers.price,79);
  assert.ok(sitemapXml('https://example.test',catalog,'2026-11-03').includes(theme.id));
 }
});

test('animated texts reject non-text input',()=>{
 const t=themes[0],state=catalog.EVER_siteDefaults(t.id);state.sections.rsvp[Object.keys(state.sections.rsvp).find(k=>k!=='on')]={html:'<script>'};
 assert.throws(()=>invitationState(catalog,state,t.id,'2027-06-10'),/Invalid or oversized field/);
});

test('quick details: every fact appears in its design, and changing one rewrites every copy',()=>{
 for(const theme of themes){
  const layout=catalog.EVER_findLayout(theme.id),facts=layout.basics.filter(f=>f.fact);
  assert.ok(facts.length>=4,theme.id+' needs quick details');
  for(const f of facts){
   const state=catalog.EVER_siteDefaults(theme.id),sample=state.basics[f.k];
   assert.ok(catalog.INVITARA_replaceFact(state,sample,'Zq Test')>0,theme.id+': "'+sample+'" ('+f.label+') appears nowhere');
   assert.equal(catalog.INVITARA_replaceFact(state,sample,'Zq Other'),0,theme.id+': "'+sample+'" left behind');
  }
  const state=catalog.EVER_siteDefaults(theme.id);for(const f of facts)state.basics[f.k]='Edited';
  assert.equal(invitationState(catalog,state,theme.id,'2027-06-10').basics[facts[0].k],'Edited');
 }
 const s=catalog.EVER_siteDefaults('animated-wedding-moonlit-garden-gates');
 catalog.INVITARA_replaceFact(s,'Sofia','Maya');
 assert.equal(s.sections.top.tg,'Maya');assert.equal(s.sections.footer.tcb,'Maya & Adrian');assert.match(s.basics.title,/^Maya & Adrian/);
 assert.equal(catalog.INVITARA_replaceFact(s,'Maya',''),0,'an empty value must never erase text');
});

test('only occasions with designs get a landing page, filter or sitemap entry',async()=>{
 const {stockedOccasions}=await import('../backend/seo.mjs');
 const stocked=stockedOccasions(catalog).map(o=>o.key);
 assert.ok(stocked.includes('wedding')&&!stocked.includes('eid'));
 assert.ok(!sitemapXml('https://x.test',catalog,'2027-01-01').includes('eid-invitations'));
});
