(function(){
 'use strict';var E=window,cat=E.INVITARA_CATALOG,t=E.EVER_findTemplate(new URLSearchParams(location.search).get('id')||'edition-vow');if(!t){location.replace('create.html');return;}
 function set(id,value){document.getElementById(id).textContent=value;}
 var engine=cat.experiences[t.experience];set('detail-title',t.name);set('detail-breadcrumb',t.name);set('detail-occasion',cat.label(t.occasion)+' invitation');set('detail-description',t.description||engine.description);set('detail-price','AED '+E.EVER_C.startingPrice(t.id)+' / event');set('detail-badges',t.style+' · '+engine.name+' · Fully customisable');
 document.getElementById('detail-features').replaceChildren.apply(document.getElementById('detail-features'),(t.premiumFeatures||engine.features).concat(['Mobile & desktop responsive','Customisable sections','Private RSVP management']).map(function(s){var li=document.createElement('li');li.textContent=s;return li;}));
 document.getElementById('detail-use').onclick=function(){E.INVITARA_CARDS.use(t.id);};['detail-full','detail-preview-link'].forEach(function(id){document.getElementById(id).href='demo.html?id='+t.id;});
 var site=E.EVER_renderSite(E.EVER_siteDefaults(t.id),{});document.getElementById('detail-preview').appendChild(site);E.EVER_bindSite(site);
 document.querySelectorAll('[data-detail-width]').forEach(function(b){b.onclick=function(){document.getElementById('detail-preview').classList.toggle('wide',b.dataset.detailWidth==='desktop');document.querySelectorAll('[data-detail-width]').forEach(function(x){x.setAttribute('aria-pressed',String(x===b));});};});
 // Closest matches first (same experience, then style), always filling the row.
 E.INVITARA_availableTemplates().filter(function(x){return x.id!==t.id;}).map(function(x,i){return {x:x,score:(x.experience===t.experience?4:0)+(x.style===t.style?2:0)+(x.event===t.event?1:0),i:i};}).sort(function(a,b){return b.score-a.score||a.i-b.i;}).slice(0,3).map(function(r){return r.x;}).forEach(function(x){document.getElementById('related-grid').appendChild(E.INVITARA_CARDS.card(x));});
})();
