/* Bespoke compositions over the existing, validated section schema. */
(function(){
 'use strict';var E=window,esc=E.EVER_esc;
 function field(path,value,tag,cls,type){return '<'+(tag||'span')+' class="'+(cls||'')+'" data-field="'+path+'" data-editable="true"'+(type?' data-edit-type="'+type+'"':'')+'>'+esc(value)+'</'+(tag||'span')+'>';}
 function image(path,value,cls){return '<img class="'+(cls||'')+'" data-field="'+path+'" data-editable="true" data-edit-type="image" src="'+esc(E.EVER_photoSrc(value))+'" alt="A personal moment from the celebration" loading="eager" decoding="async">';}
 function star(cls){return '<svg class="'+(cls||'ed-star')+'" viewBox="0 0 100 100" aria-hidden="true"><path d="M50 0 59 34 85 15 66 41 100 50 66 59 85 85 59 66 50 100 41 66 15 85 34 59 0 50 34 41 15 15 41 34Z" fill="currentColor"/></svg>';}
 function flower(){return '<svg class="ed-petal-art" viewBox="0 0 600 700" aria-hidden="true"><g fill="currentColor">'+[0,45,90,135,180,225,270,315].map(function(r){return '<ellipse cx="300" cy="210" rx="72" ry="190" transform="rotate('+r+' 300 350)"/>';}).join('')+'</g><circle cx="300" cy="350" r="70" fill="var(--ws-bg)"/></svg>';}
 function lattice(){return '<svg class="ed-mosaic-art" viewBox="0 0 400 400" aria-hidden="true"><defs><pattern id="edition-tile" width="80" height="80" patternUnits="userSpaceOnUse"><path d="m40 2 11 27 27 11-27 11-11 27-11-27L2 40l27-11Z" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="20" y="20" width="40" height="40" transform="rotate(45 40 40)" fill="none" stroke="currentColor" stroke-width=".5"/></pattern></defs><rect width="400" height="400" fill="url(#edition-tile)"/></svg>';}
 E.INVITARA_artDirect=function(root,d,t,opts){
  if(!t.artDirection)return;var key=t.artDirection,hero=root.querySelector('.nx-section-hero');
  root.classList.add('edition','edition-'+key);root.dataset.edition=key;root.dataset.scene=t.editionScene||'';
  ['classic','story','book','magazine','cinematic','reveal','timeline','gallery-experience'].forEach(function(k){root.classList.remove('nx-'+k);});
  if(!hero)return;
  var h=d.sections.hero,b=d.basics;
  var kicker=field('sections.hero.kicker',h.kicker,'p','ed-eyebrow');
  var headline=field('sections.hero.title',h.title,'h2','ed-headline');
  var names='<h1 class="ed-names">'+field('basics.nameA',b.nameA,'span','ed-name')+(b.nameB?'<i aria-hidden="true">&</i>'+field('basics.nameB',b.nameB,'span','ed-name'):'')+'</h1>';
  var note=field('sections.hero.note',h.note,'p','ed-note');
  var date=field('basics.date',E.EVER_fmtLongDate(b.date),'span','ed-date','date');
  var city=field('basics.city',b.city,'span','ed-city');
  var cta='<a class="ed-invite-link nx-button" href="#ws-sec-'+(d.order.find(function(id){return id!=='hero'&&d.sections[id]?.on!==false;})||'rsvp')+'" data-goto="'+(d.order.find(function(id){return id!=='hero'&&d.sections[id]?.on!==false;})||'rsvp')+'" data-field="sections.hero.button" data-editable="true" data-edit-type="button"><span>'+esc(h.button)+'</span><span aria-hidden="true">↗</span></a>';
  var photo=image('sections.hero.photo',h.photo,'ed-hero-photo');
  var index='<div class="ed-edition-label"><span>THE INVITATION</span><span>№ '+t.editionNumber+'</span></div>';
  var meta='<div class="ed-meta">'+date+city+'</div>';
  var scene='<div class="ed-scene" data-scene-host="'+esc(t.editionScene)+'" aria-hidden="true"><div class="ed-scene-fallback ed-fallback-'+esc(t.editionScene)+'"></div></div>';
  var html='';
  if(key==='vow')html=index+'<div class="ed-vow-top">'+kicker+'<span class="ed-vow-mark" aria-hidden="true">V.</span></div><div class="ed-vow-title">'+names+'</div><figure class="ed-vow-figure"><figcaption class="ed-photo-caption">The beginning of everything</figcaption><div class="ed-vow-photo">'+photo+'</div></figure><div class="ed-vow-bottom">'+headline+'<div>'+meta+cta+'</div></div>';
  if(key==='orbit')html=index+'<div class="ed-orbit-top">'+kicker+names+'</div>'+scene+'<div class="ed-orbit-bottom">'+headline+meta+cta+'</div><span class="ed-orbit-coordinate" aria-hidden="true">25°12′ N — TWO WORLDS, ONE ORBIT</span>';
  if(key==='postmark')html='<div class="ed-postcard-top"><span class="ed-postal">PRIVATE CORRESPONDENCE</span><div class="ed-stamp">'+photo+'<span>WITH LOVE</span></div></div><div class="ed-postcard-copy">'+kicker+headline+names+'</div><div class="ed-postcard-bottom"><div class="ed-postal-address">'+note+city+'</div><div class="ed-postal-date"><span class="ed-postal-label">PLEASE SAVE</span>'+date+cta+'</div></div><span class="ed-postmark-seal" aria-hidden="true">SPECIAL<br>DELIVERY<br>♥</span>';
  if(key==='encore')html='<div class="ed-concert-header">'+kicker+'<span>ADMIT ONE & YOUR FAVOURITE PEOPLE</span></div>'+headline+'<div class="ed-record" aria-hidden="true"><div class="ed-record-label">'+star()+'<span>ONE MORE<br>ENCORE</span></div></div><div class="ed-concert-host">'+names+note+'</div><div class="ed-ticket">'+meta+cta+'<div class="ed-barcode" aria-hidden="true"></div></div>';
  if(key==='archive')html=index+'<div class="ed-archive-heading">'+kicker+headline+'</div><div class="ed-contact-sheet"><figure>'+photo+'<figcaption>01 — A LIFE WELL LOVED</figcaption></figure><figure>'+image('sections.story.photo',d.sections.story.photo,'ed-archive-photo')+'<figcaption>02 — STILL OUR FAVOURITE STORY</figcaption></figure><span class="ed-archive-year" aria-hidden="true">us,<br>always.</span></div><div class="ed-archive-footer">'+names+meta+cta+'</div>';
  if(key==='universe')html=index+'<div class="ed-universe-copy">'+kicker+headline+'</div>'+scene+'<div class="ed-cloud ed-cloud-one" aria-hidden="true"></div><div class="ed-cloud ed-cloud-two" aria-hidden="true"></div><div class="ed-universe-bottom">'+names+note+meta+cta+'</div>';
  if(key==='petal')html='<div class="ed-petal-header">'+kicker+'<span>THE PETAL SOCIETY</span></div>'+flower()+'<div class="ed-petal-portrait">'+photo+'</div><div class="ed-petal-copy">'+headline+names+meta+cta+'</div>';
  if(key==='next')html='<div class="ed-next-top">'+kicker+'<span>CLASS OF '+esc(String(b.date).slice(0,4))+'</span></div>'+headline+'<div class="ed-next-arrow" aria-hidden="true">↗</div><div class="ed-next-grid"><div>'+names+note+'</div><div>'+meta+cta+'</div></div><div class="ed-next-stripes" aria-hidden="true"></div>';
  if(key==='disco')html=index+'<div class="ed-disco-intro">'+kicker+'</div>'+scene+'<div class="ed-disco-copy">'+headline+names+meta+cta+'</div><div class="ed-disco-edge" aria-hidden="true">AFTER DARK / UNTIL LATE / GOOD COMPANY</div>';
  if(key==='form')html='<div class="ed-forum-top"><span>FORM / FUTURE</span>'+kicker+'</div><div class="ed-form-grid"><div>'+headline+'</div>'+scene+'</div><div class="ed-forum-bottom">'+names+'<div>'+meta+cta+'</div></div><div class="ed-form-index"><span>01 / CONVERSATION</span><span>02 / CONNECTION</span><span>03 / WHAT COMES NEXT</span></div>';
  if(key==='majlis')html=index+'<div class="ed-majlis-arch">'+scene+'<div class="ed-majlis-stars" aria-hidden="true">'+star()+star()+star()+'</div></div><div class="ed-majlis-copy">'+kicker+headline+names+meta+cta+'</div>';
  if(key==='mosaic')html='<div class="ed-mosaic-top">'+kicker+'<span>A CELEBRATION OF TOGETHERNESS</span></div><div class="ed-courtyard">'+lattice()+'<div class="ed-courtyard-door ed-door-left"></div><div class="ed-courtyard-door ed-door-right"></div><div class="ed-courtyard-copy">'+headline+names+'</div></div><div class="ed-mosaic-bottom">'+note+meta+cta+'</div>';
  if(key==='solstice')html=index+scene+'<div class="ed-winter-moon" aria-hidden="true"></div><div class="ed-winter-ridge ed-ridge-back" aria-hidden="true"></div><div class="ed-winter-ridge ed-ridge-front" aria-hidden="true"></div><div class="ed-solstice-copy">'+kicker+headline+names+meta+cta+'</div>';
  if(key==='elsewhere')html='<div class="ed-travel-top"><span>A POSTCARD FROM US</span>'+city+'</div><div class="ed-travel-photo">'+photo+'<div class="ed-travel-seal" aria-hidden="true">SOMEWHERE<br>TOGETHER<br>↗</div></div><div class="ed-travel-copy">'+kicker+headline+'<div class="ed-travel-bottom">'+names+'<div>'+date+cta+'</div></div></div>';
  if(t.tier==='atelier'){
   root.classList.add('atelier');
   var monogram=field('basics.brand',b.brand,'span','at-monogram');
   var mast='<div class="at-mast">'+kicker+'<span>INVITATION / '+esc(t.editionNumber)+'</span></div>';
   var frame='<figure class="at-frame">'+photo+'<figcaption>'+city+'</figcaption></figure>';
   var copy='<div class="at-copy">'+headline+names+note+'</div>';
   var footer='<div class="at-footer">'+meta+cta+'</div>';
   var ornament='<svg class="at-engraving" viewBox="0 0 200 200" fill="none" stroke="currentColor" aria-hidden="true">'+[0,30,60,90,120,150].map(function(r){return '<ellipse cx="100" cy="100" rx="34" ry="92" transform="rotate('+r+' 100 100)"/>';}).join('')+'<circle cx="100" cy="100" r="62"/></svg>';
   var diptych='<div class="at-diptych">'+frame+'<figure class="at-frame">'+image('sections.story.photo',d.sections.story.photo,'ed-hero-photo')+'<figcaption>A MOMENT TO KEEP</figcaption></figure></div>';
   var layouts={
    palais:mast+'<div class="at-palais-mark">'+monogram+'</div>'+frame+copy+footer,
    celeste:mast+'<div class="at-orbit">'+ornament+frame+'</div>'+copy+footer,
    correspondence:mast+'<div class="at-letter">'+monogram+copy+frame+'</div>'+footer,
    velvet:mast+copy+'<div class="at-velvet-stage">'+frame+ornament+'</div>'+footer,
    heirloom:mast+copy+diptych+footer,
    lullaby:mast+'<div class="at-nursery">'+ornament+frame+'</div>'+copy+footer,
    fleur:mast+'<div class="at-garden">'+frame+ornament+'</div>'+copy+footer,
    laureate:mast+'<div class="at-college">'+copy+frame+'</div>'+monogram+footer,
    noir:mast+'<div class="at-deco">'+ornament+copy+'</div>'+frame+footer,
    summit:mast+'<div class="at-summit">'+copy+frame+'</div>'+footer,
    safira:mast+'<div class="at-courtyard">'+ornament+frame+'</div>'+copy+footer,
    zellige:mast+ornament+copy+diptych+footer,
    evergreen:mast+'<div class="at-wreath">'+ornament+frame+'</div>'+copy+footer,
    riviera:mast+frame+'<div class="at-destination">'+copy+ornament+'</div>'+footer
   };
   html=layouts[key];
  }
  hero.classList.add('ed-hero');hero.innerHTML=html;
  root.querySelectorAll('.nx-section:not(.ed-hero)').forEach(function(section,i){var label=document.createElement('span');label.className='ed-section-index';label.textContent=String(i+1).padStart(2,'0')+' / '+(section.dataset.chapter||'');label.setAttribute('aria-hidden','true');section.prepend(label);});
  if(opts.mini)root.classList.add('ed-static-preview');
 };
})();
