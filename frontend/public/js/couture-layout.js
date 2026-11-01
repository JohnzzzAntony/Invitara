/* Couture compositions. Every visible word and image keeps its editor data-field path. */
(function(){
 'use strict';var E=window,base=E.INVITARA_artDirect,esc=E.EVER_esc;
 function field(path,value,tag,cls){return '<'+(tag||'span')+' class="'+(cls||'')+'" data-field="'+path+'" data-editable="true">'+esc(value)+'</'+(tag||'span')+'>';}
 function image(path,value,alt){return '<img class="cx-photo" data-field="'+path+'" data-editable="true" data-edit-type="image" src="'+esc(E.EVER_photoSrc(value))+'" alt="'+esc(alt)+'" width="900" height="1100" decoding="async">';}
 function repeat(n,fn){var out='';for(var i=0;i<n;i++)out+=fn(i);return out;}
 // Decorative layers only; all are aria-hidden and carry no content.
 var ornaments={
  lumiere:function(){return '<div class="cx-veil cx-doors" aria-hidden="true"><i class="cx-door cx-door-l"></i><i class="cx-door cx-door-r"></i></div><span class="cx-sweep" aria-hidden="true"></span>';},
  obsidian:function(){return '<div class="cx-veil cx-facets" aria-hidden="true">'+repeat(12,function(i){return '<i style="--i:'+i+'"></i>';})+'</div><svg class="cx-gem" viewBox="0 0 100 100" aria-hidden="true"><path d="M30 18h40l20 22-40 46L10 40Z M10 40h80 M30 18l20 68 20-68 M30 18l-6 22 26 46 26-46-6-22" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>';},
  eclipse:function(){return '<div class="cx-corona" aria-hidden="true"></div><div class="cx-veil cx-moon" aria-hidden="true"></div><span class="cx-flare" aria-hidden="true"></span>';},
  saffron:function(){return '<div class="cx-veil cx-silk" aria-hidden="true"></div><div class="cx-petals" aria-hidden="true">'+repeat(14,function(i){return '<i style="--i:'+i+'"></i>';})+'</div>';},
  pearl:function(){return '<div class="cx-veil cx-ink" aria-hidden="true"></div><svg class="cx-waves" viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden="true"><path d="M0 30Q25 10 50 30T100 30T150 30T200 30T250 30T300 30T350 30T400 30" fill="none" stroke="currentColor"/><path d="M0 44Q25 24 50 44T100 44T150 44T200 44T250 44T300 44T350 44T400 44" fill="none" stroke="currentColor" opacity=".5"/></svg>';}
 };
 Object.assign(ornaments,{
  rosewater:function(){return '<div class="cx-veil cx-rosewater" aria-hidden="true"></div>';},
  fieldnotes:function(){return '<svg class="cx-botanical" viewBox="0 0 400 500" aria-hidden="true"><path d="M25 470C115 360 100 185 195 40M82 405c-45-9-62-39-62-75 38 8 62 31 62 75Zm25-87c-41-11-54-40-49-72 35 10 52 30 49 72Zm33-87c-38-12-48-39-40-68 32 10 47 29 40 68Zm32-77c-29-13-34-34-23-56 26 12 35 30 23 56Zm-77 185c44-3 65-27 70-59-39 3-63 22-70 59Zm33-91c38-4 54-27 55-55-34 4-51 20-55 55Z"/></svg><div class="cx-veil cx-field-wash" aria-hidden="true"></div>';},
  heirloom:function(){return '<div class="cx-veil cx-seal" aria-hidden="true"><span>H</span></div>';},
  camellia:function(){return '<div class="cx-veil cx-fan" aria-hidden="true">'+repeat(9,function(i){return '<i style="--i:'+i+'"></i>';})+'</div>';},
  solstice:function(){return '<div class="cx-veil cx-sunbeams" aria-hidden="true"></div>';},
  wildflower:function(){return '<div class="cx-veil cx-wildflowers" aria-hidden="true">'+repeat(12,function(i){return '<i style="--i:'+i+'"></i>';})+'</div>';},
  'sunday-table':function(){return '<div class="cx-veil cx-linen" aria-hidden="true"><i></i><i></i></div>';},
  marigold:function(){return '<div class="cx-veil cx-lantern" aria-hidden="true"></div>';},
  afterglow:function(){return '<div class="cx-veil cx-confetti" aria-hidden="true">'+repeat(18,function(i){return '<i style="--i:'+i+'"></i>';})+'</div>';},
  'paper-moon':function(){return '<div class="cx-veil cx-vellum" aria-hidden="true"><i></i><i></i></div>';}
 });
 E.INVITARA_artDirect=function(root,d,t,opts){
  if(!t.couture){if(base)base(root,d,t,opts);return;}
  var key=t.family,h=d.sections.hero,b=d.basics,hero=root.querySelector('.nx-section-hero'),config=(E.INVITARA_COUTURE||[]).find(function(e){return e.key===key;})||{};
  root.classList.add('couture','couture-'+key);root.dataset.couture=key;
  ['classic','story','book','magazine','cinematic','reveal','timeline','gallery-experience'].forEach(function(k){root.classList.remove('nx-'+k);});
  // Mini cards and the editor show the finished composition; guests get the opening.
  if(opts.mini||opts.editing||h.openingType==='none')root.classList.add('cx-open');
  if(hero){
   hero.classList.add('cx-hero');
   var numeral=key==='saffron'||key==='pearl'?field('basics.brand',b.brand,'span','cx-numeral'):'';
   var names=field('basics.nameA',b.nameA,'span','cx-name')+(b.nameB?'<em class="cx-amp" aria-hidden="true">&amp;</em>'+field('basics.nameB',b.nameB,'span','cx-name'):'');
   var meta='<dl class="cx-meta"><div><dt>When</dt><dd>'+field('basics.date',E.EVER_fmtLongDate(b.date))+' · '+field('basics.time',b.time)+'</dd></div><div><dt>Where</dt><dd>'+field('basics.venue',b.venue)+' · '+field('basics.city',b.city)+'</dd></div></dl>';
   var copy='<div class="cx-copy">'+field('sections.hero.kicker',h.kicker,'p','cx-kicker')+field('sections.hero.title',h.title,'h1','cx-title')+'<p class="cx-names">'+names+'</p>'+field('sections.hero.note',h.note,'p','cx-note')+meta+'<a class="cx-cta" href="#ws-sec-story" data-goto="story" data-field="sections.hero.button" data-editable="true" data-edit-type="button">'+esc(h.button)+' <span aria-hidden="true">→</span></a></div>';
   var art='<div class="cx-art">'+numeral+'<div class="cx-frame">'+image('sections.hero.photo',h.photo,(b.nameA||'The host')+' — invitation portrait')+(ornaments[key]?ornaments[key]():'')+'</div></div>';
   hero.innerHTML='<div class="cx-top">'+field('basics.brand',b.brand,'span','cx-wordmark')+'<span class="cx-label">'+esc(config.label||t.name)+'</span></div><div class="cx-stage">'+art+copy+'</div><div class="cx-foot"><span>'+field('basics.date',E.EVER_fmtLongDate(b.date))+'</span><span aria-hidden="true">'+esc(config.cue||'Scroll')+' ↓</span></div>';
   if(!opts.mini&&!opts.editing&&h.openingType!=='none'){var button=document.createElement('button');button.type='button';button.className='cx-open-button';button.textContent=config.action||'Open the invitation';button.setAttribute('aria-expanded','false');if(h.openingType==='scroll')button.setAttribute('aria-label',(config.action||'Open the invitation')+'. Scroll or press Enter to open.');hero.querySelector('.cx-frame').append(button);}
  }
  root.querySelectorAll('.nx-section').forEach(function(section){
   var id=section.id.replace('ws-sec-',''),type=(d.sectionTypes||{})[id]||id;
   if(type==='hero')return;
   section.classList.add('cx-section');
   if(type==='timeline')section.classList.add('cx-chapters');
   if(type==='countdown'){var timer=section.querySelector('[data-deadline]');if(timer){timer.removeAttribute('data-deadline');timer.classList.add('cx-countdown');}}
   if(type==='details')section.insertAdjacentHTML('beforeend','<div class="cx-calendar"><a class="cx-google" target="_blank" rel="noopener noreferrer">Google Calendar ↗</a><button class="cx-ics" type="button">Apple / Outlook ↓</button></div>');
  });
 };
})();
