/* Bespoke business compositions. All visible copy and imagery retain editor paths. */
(function(){
 'use strict';var E=window,base=E.INVITARA_artDirect,esc=E.EVER_esc;
 function field(path,value,tag,cls){return '<'+(tag||'span')+' class="'+(cls||'')+'" data-field="'+path+'" data-editable="true">'+esc(value)+'</'+(tag||'span')+'>';}
 function image(path,value,alt,cls){return '<img class="'+(cls||'')+'" data-field="'+path+'" data-editable="true" data-edit-type="image" src="'+esc(E.EVER_photoSrc(value))+'" alt="'+esc(alt)+'" width="900" height="1100" decoding="async">';}
 E.INVITARA_artDirect=function(root,d,t,opts){
  if(!t.business){if(base)base(root,d,t,opts);return;}
  var key=t.family,h=d.sections.hero,b=d.basics,hero=root.querySelector('.nx-section-hero'),config=E.INVITARA_BUSINESS.find(function(e){return e.key===key;});
  root.classList.add('business','business-'+key);root.dataset.business=key;if(!opts.mini&&!opts.editing&&h.openingType==='scroll')root.classList.add('business-scroll-entry');
  ['classic','story','book','magazine','cinematic','reveal','timeline','gallery-experience'].forEach(function(k){root.classList.remove('nx-'+k);});
  if(hero){
   hero.classList.add('business-hero');
   var top='<div class="business-top">'+field('basics.brand',b.brand,'span','business-wordmark')+field('sections.hero.kicker',h.kicker,'span','business-edition')+'</div>';
   var openingDetails='<div class="business-opening-details" aria-label="Event details"><span class="business-opening-label">THE OCCASION</span><div class="business-opening-when"><span class="business-opening-label">WHEN</span><strong>'+field('basics.date',E.EVER_fmtLongDate(b.date),'span','business-opening-date')+' <span aria-hidden="true">·</span> '+field('basics.time',b.time,'span','business-opening-time')+'</strong></div><div class="business-opening-where"><span class="business-opening-label">WHERE</span><strong>'+field('basics.venue',b.venue,'span','business-opening-venue')+' <span aria-hidden="true">·</span> '+field('basics.city',b.city,'span','business-opening-city')+'</strong></div></div>';
   var copy='<div class="business-copy">'+field('sections.hero.kicker',h.kicker,'p','business-kicker')+field('sections.hero.title',h.title,'h1','business-title')+field('sections.hero.note',h.note,'p','business-note')+openingDetails+'<a class="business-cta" href="#ws-sec-story" data-goto="story" data-field="sections.hero.button" data-editable="true" data-edit-type="button">'+esc(h.button)+' <span aria-hidden="true">↗</span></a></div>';
   var overlays={atelier:'<span class="business-door-knob" aria-hidden="true"></span>',aura:'<div class="business-spotlight" aria-hidden="true"></div>',executive:'<div class="business-fold business-fold-top" aria-hidden="true"></div><div class="business-fold business-fold-bottom" aria-hidden="true"></div><span class="business-seal" aria-hidden="true">VF</span>',table:'<div class="business-cloche" aria-hidden="true"><span>FIRST TABLE<br>OPENING MENU</span></div>',skyline:'<div class="business-blueprint" aria-hidden="true"><span>SKYLINE / PRIVATE PREVIEW</span></div>'};
   var cues={brand:'Scroll to part the curtains',atelier:'Scroll to step inside',aura:'Scroll to bring it to light',executive:'Scroll to break the seal',table:'Scroll to lift the cloche',skyline:'Scroll to reveal the residence'};
   var scene='<div class="business-scene">'+image('sections.hero.photo',h.photo,b.brand+' — illustrative preview','business-art')+'<div class="business-scene-lines" aria-hidden="true"></div><div class="business-shutter business-shutter-left" aria-hidden="true"></div><div class="business-shutter business-shutter-right" aria-hidden="true"></div><div class="business-scroll-meter" aria-hidden="true"></div>'+(overlays[key]||'')+'</div>';
   var foot='<div class="business-foot"><span>'+field('basics.date',E.EVER_fmtLongDate(b.date))+' / '+field('basics.time',b.time)+'</span>'+field('basics.city',b.city)+'<span aria-hidden="true">'+cues[key]+' ↓</span></div>';
   hero.innerHTML=top+'<div class="business-composition">'+(key==='table'||key==='skyline'?scene+copy:copy+scene)+'</div>'+foot;
   if(!opts.mini&&h.openingType!=='none'){var button=document.createElement('button');button.type='button';button.className='business-reveal';button.textContent=h.openingType==='scroll'?cues[key]+' · or tap':config.action;button.dataset.label=button.textContent;button.setAttribute('aria-expanded','false');if(h.openingType==='scroll')button.setAttribute('aria-label',cues[key]+'. Scroll to open, or press Enter.');hero.querySelector('.business-scene').append(button);}
   if(key==='aura'&&!opts.mini){var rotation=document.createElement('label');rotation.className='business-rotation';rotation.innerHTML='Explore the form <input aria-label="Rotate product illustration" type="range" min="-25" max="25" value="0"><span>Drag to turn the illustration</span>';hero.querySelector('.business-scene').append(rotation);}
  }
  root.querySelectorAll('.nx-section').forEach(function(section,index){
   var id=section.id.replace('ws-sec-',''),type=(d.sectionTypes||{})[id]||id,s=d.sections[id],p='sections.'+id+'.';
   if(type==='timeline'){
    section.classList.add('business-features');
    section.innerHTML=field(p+'kicker',s.kicker,'p','business-kicker')+field(p+'title',s.title,'h2')+'<div class="business-feature-grid">'+(s.items||[]).map(function(item,i){var path=p+'items.'+i+'.';return key==='table'?'<details class="business-menu-item" open><summary>'+field(path+'time',item.time,'span')+field(path+'title',item.title,'h3')+'<i aria-hidden="true">＋</i></summary>'+field(path+'text',item.text,'p')+'</details>':'<article class="business-feature">'+field(path+'time',item.time,'span','business-index')+(key==='executive'?'<div class="business-speaker-mark" aria-hidden="true">'+esc(item.title.split(' ').map(function(v){return v[0];}).join(''))+'</div>':'')+field(path+'title',item.title,'h3')+field(path+'text',item.text,'p')+'</article>';}).join('')+'</div>';
   }
   if(type==='countdown'){var timer=section.querySelector('[data-deadline]');if(timer){timer.removeAttribute('data-deadline');timer.classList.add('business-countdown');}}
   if(type==='details')section.insertAdjacentHTML('beforeend','<div class="business-calendar"><a class="business-google" target="_blank" rel="noopener noreferrer">Google Calendar ↗</a><button class="business-ics" type="button">Apple / Outlook ↓</button></div>');
   if(type!=='hero'){var chapter=document.createElement('span');chapter.className='business-chapter';chapter.textContent=String(index).padStart(2,'0')+' / '+(s.kicker||s.title||b.brand);section.prepend(chapter);}
  });
 };
})();
