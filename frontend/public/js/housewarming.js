/* Aangan: an architectural invitation on the existing platform contract. */
(function () {
  'use strict';
  var E = window, esc = E.EVER_esc;
  function field(path, value, tag, cls) {
    tag = tag || 'span';
    return '<' + tag + ' class="' + (cls || '') + '" data-editable="true" data-field="' + path + '">' + esc(value || '') + '</' + tag + '>';
  }
  function botanical() {
    return '<svg class="hw-botanical" viewBox="0 0 180 300" fill="none" aria-hidden="true"><path d="M89 296C77 211 106 108 76 9M88 247L39 212M87 206L133 166M88 158L38 119M84 106L122 65" stroke="currentColor"/><g fill="currentColor"><ellipse cx="48" cy="217" rx="12" ry="30" transform="rotate(-52 48 217)"/><ellipse cx="123" cy="177" rx="12" ry="31" transform="rotate(42 123 177)"/><ellipse cx="48" cy="129" rx="11" ry="29" transform="rotate(-50 48 129)"/><ellipse cx="113" cy="78" rx="10" ry="28" transform="rotate(38 113 78)"/><ellipse cx="78" cy="33" rx="10" ry="29" transform="rotate(-12 78 33)"/></g></svg>';
  }
  function doorway() {
    return '<div class="hw-architecture"><div class="hw-arch-lines" aria-hidden="true"></div><div class="hw-garland" aria-hidden="true">' + Array.from({length:17},function(_,i){return '<i style="--i:'+i+'"></i>';}).join('') + '</div><div class="hw-lamp hw-lamp-left" aria-hidden="true"><i></i></div><div class="hw-lamp hw-lamp-right" aria-hidden="true"><i></i></div><button class="hw-door" type="button" aria-label="Open the doors to our new home" aria-expanded="false"><span class="hw-door-light"></span><span class="hw-door-inside">Welcome<br><em>home.</em></span><span class="hw-door-panel hw-door-left"><i></i><b></b></span><span class="hw-door-panel hw-door-right"><i></i><b></b></span><span class="hw-door-seal">A<br><small>NEW BEGINNING</small></span></button><div class="hw-step" aria-hidden="true"></div><div class="hw-planter hw-planter-left" aria-hidden="true">'+botanical()+'</div><div class="hw-planter hw-planter-right" aria-hidden="true">'+botanical()+'</div></div>';
  }
  E.INVITARA_housewarmingRender = function (root, d, t, opts) {
    root.classList.add('edition', 'edition-aangan'); root.dataset.edition = 'aangan';
    root.classList.remove('nx-classic');
    var h=d.sections.hero,b=d.basics,hero=root.querySelector('.nx-section-hero');
    if(!hero)return;
    hero.classList.add('ed-hero','hw-hero');
    hero.innerHTML='<div class="hw-topline"><span>AANGAN <i> / </i> THE HOUSEWARMING EDITION</span><span>AN INVITATION TO BELONG</span></div><div class="hw-hero-grid"><div class="hw-hero-copy">'+field('sections.hero.kicker',h.kicker,'p','hw-eyebrow')+'<p class="hw-personal"></p>'+field('sections.hero.title',h.title,'h1','hw-title')+field('sections.hero.note',h.note,'p','hw-intro')+'<div class="hw-hosts"><span>WITH OPEN HEARTS,</span>'+field('basics.nameA',b.nameA,'p','ed-names')+(b.nameB?field('basics.nameB',b.nameB,'p','ed-names'):'')+'</div><button type="button" class="hw-enter">'+esc(h.button)+' <span aria-hidden="true">↗</span></button><p class="hw-instruction">Something beautiful awaits behind this door.</p></div>'+doorway()+'</div><div class="hw-hero-bottom"><span>NEW BEGINNINGS. BEAUTIFUL MEMORIES.</span><span class="hw-enter-note">TAP THE DOOR TO BEGIN <i>↗</i></span></div>';
    if(opts.mini){root.classList.add('hw-mini');return;}
    var story=root.querySelector('.nx-story-copy');if(story)story.insertAdjacentHTML('beforeend','<details class="hw-envelope"><summary>A little note, just for you <span aria-hidden="true">↗</span></summary><div><p>'+esc(h.note)+'</p><span>With love, '+esc(b.nameA)+(b.nameB?' &amp; '+esc(b.nameB):'')+'</span></div></details>');
    var details=root.querySelector('.nx-section-details');
    if(details){var s=d.sections.details;details.innerHTML='<div class="hw-date-copy">'+field('sections.details.kicker',s.kicker,'p','hw-eyebrow')+field('sections.details.title',s.title,'h2')+field('sections.details.note',s.note,'p')+'<button class="hw-reveal hw-text-button" type="button">Reveal date without scratching ↗</button></div><div class="hw-date-wrap"><div class="hw-scratch"><div class="hw-date-under"><span>PLEASE KEEP THIS DAY FOR US</span>'+field('basics.date',E.EVER_fmtLongDate(b.date),'strong')+'<span>'+esc(b.time)+' · '+esc(s.timezone)+'</span></div><canvas class="hw-coating" aria-label="Scratch the gold coating to reveal the date"></canvas><span class="hw-scratch-label" aria-hidden="true">A little golden secret<small>SCRATCH TO REVEAL OUR SPECIAL DATE</small></span></div><div class="hw-calendar" hidden><a class="hw-google" target="_blank" rel="noopener">Google Calendar ↗</a><button class="hw-ics" type="button">Apple / Outlook ↓</button></div></div>';}
    var countdown=root.querySelector('.nx-countdown');if(countdown){countdown.removeAttribute('data-deadline');countdown.classList.add('hw-countdown');}
    var venue=root.querySelector('.nx-section-venue');
    if(venue){var v=d.sections.venue;venue.innerHTML='<figure class="hw-home-photo"><img src="'+esc(E.EVER_photoSrc(v.photo))+'" alt="Home inspiration selected by the hosts" loading="lazy" width="900" height="1100"><figcaption>A PLACE FOR ALL OUR TOMORROWS</figcaption></figure><div class="hw-venue-copy">'+field('sections.venue.kicker',v.kicker,'p','hw-eyebrow')+field('sections.venue.title',v.title,'h2')+field('basics.venue',b.venue,'h3')+field('basics.city',b.city,'p')+field('sections.venue.text',v.text,'p')+'<div class="hw-directions"></div><button class="hw-copy-address hw-text-button" type="button">Copy address ↗</button></div>';}
    var schedule=root.querySelector('.nx-section-schedule');if(schedule&&b.dress)schedule.insertAdjacentHTML('beforeend','<p class="hw-dress"><span>COME AS YOU ARE</span><br>'+field('basics.dress',b.dress)+'</p>');
    var rsvp=root.querySelector('.nx-section-rsvp');if(rsvp){var form=rsvp.querySelector('form');if(form){var select=form.querySelector('[name=attend]');select.insertAdjacentHTML('beforeend','<option value="maybe">I will let you know</option>');form.querySelector('[name=msg]').placeholder='A wish, a blessing, a little love…';var label=document.createElement('label');label.textContent='Phone number (optional)';label.innerHTML+='<input name="phone" type="tel" autocomplete="tel" maxlength="40" placeholder="Your contact number">';form.querySelector('[name=guests]').closest('label').after(label);}}
    var contact=root.querySelector('.nx-section-contact');if(contact){contact.insertAdjacentHTML('afterbegin',botanical());if(b.phone)contact.insertAdjacentHTML('beforeend','<a class="hw-host-phone" href="tel:'+esc(b.phone.replace(/[^+\d]/g,''))+'">Call your hosts · '+esc(b.phone)+'</a>');contact.insertAdjacentHTML('beforeend','<div class="hw-footer-actions"><button class="hw-share" type="button">Share invitation ↗</button><button class="hw-replay" type="button">Return to the doorway ↺</button></div><p class="hw-share-status" role="status"></p><p class="hw-credit">MADE WITH LOVE · INVITARA</p>');}
    root.insertAdjacentHTML('beforeend','<nav class="hw-nav" aria-label="Invitation chapters">'+[['hero','Home'],['details','The day'],['venue','Find us'],['rsvp','RSVP']].filter(function(item){return root.querySelector('#ws-sec-'+item[0]);}).map(function(item){return '<a href="#ws-sec-'+item[0]+'" data-goto="'+item[0]+'">'+item[1]+'</a>';}).join('')+'<span class="hw-progress" aria-hidden="true"></span></nav>');
  };

  /** Convert the editor's local date/time and IANA zone to a UTC instant. */
  function instant(date,time,zone) {
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d{2}:\d{2}$/.test(time))return NaN;
    var target=Date.parse(date+'T'+time+':00Z'),value=target;
    try{var format=new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
      for(var i=0;i<3;i++){var parts={};format.formatToParts(new Date(value)).forEach(function(p){parts[p.type]=p.value;});var wall=Date.parse(parts.year+'-'+parts.month+'-'+parts.day+'T'+parts.hour+':'+parts.minute+':'+parts.second+'Z');value+=target-wall;}return value;
    }catch(_){return NaN;}
  }
  E.INVITARA_housewarmingInstant=instant;
  E.INVITARA_housewarmingBind = function(root,options) {
    if(root.__housewarmingBound)return;root.__housewarmingBound=true;
    var d=root.__wsData,b=d.basics,s=d.sections.details,clean=[],timers=[],editing=options&&options.editing,reduced=matchMedia('(prefers-reduced-motion: reduce)'),prior=root.__premiumDispose;
    function on(node,event,fn,opts){if(!node)return;node.addEventListener(event,fn,opts);clean.push(function(){node.removeEventListener(event,fn,opts);});}
    function q(selector){return root.querySelector(selector);}
    function remember(key,value){try{if(value!==undefined)sessionStorage.setItem(key,value);return sessionStorage.getItem(key);}catch(_){return null;}}
    var key='aangan:'+location.pathname+location.search+':'+b.date;
    var door=q('.hw-door'),enter=q('.hw-enter');if(!door||!enter)return;
    if(!editing)bindDoorJourney();
    else on(enter,'click',function(){q('.nx-section-story')?.scrollIntoView({behavior:'instant'});});

    // The real invitation sits behind the portal; natural scrolling controls the camera.
    // CSS sticky supplies the pin, including inside the preview's own scroll container.
    function bindDoorJourney(){
      var hero=q('.hw-hero'),architecture=q('.hw-architecture');
      var runway=document.createElement('div'),stage=document.createElement('div'),portal=document.createElement('div');
      runway.className='hw-entrance-runway';stage.className='hw-entrance-stage';portal.className='hw-portal-layer';
      portal.setAttribute('aria-label','Entrance to our new home');
      portal.innerHTML='<p class="hw-scroll-cue">Scroll to open<span aria-hidden="true"></span></p><button class="hw-skip-entrance" type="button">Skip entrance and read invitation</button>';
      portal.prepend(architecture);stage.append(hero,portal);runway.append(stage);root.prepend(runway);
      root.classList.add('hw-scroll-experience');
      var scroller=root.closest('.demo-scroll')||window,trigger=null,frame=0,height=0,progress=0,disposed=false;
      var nav=q('.hw-nav'),inside=q('.hw-door-inside'),cue=q('.hw-scroll-cue');
      inside.textContent='';door.setAttribute('aria-label','Enter our home and read the invitation');
      function clamp(value){return Math.max(0,Math.min(1,value));}
      function ease(value){value=clamp(value);return value*value*(3-2*value);}
      function position(){return scroller===window?window.scrollY:scroller.scrollTop;}
      function top(){return runway.getBoundingClientRect().top-(scroller===window?0:scroller.getBoundingClientRect().top)+position();}
      function travel(){return Math.max(1,runway.offsetHeight-height);}
      function paint(value){
        progress=clamp(value);
        var still=reduced.matches||root.dataset.motion==='none';
        var opening=ease((progress-.04)/.42),forward=ease((progress-.44)/.50),fade=ease((progress-.60)/.34);
        stage.style.setProperty('--hw-door-turn',String(still?0:opening*108)+'deg');
        stage.style.setProperty('--hw-camera-scale',String(still?1:1+forward*8));
        stage.style.setProperty('--hw-seal-opacity',String(1-ease(progress/.16)));
        stage.style.setProperty('--hw-portal-opacity',String(1-(still?ease((progress-.12)/.7):fade)));
        stage.style.setProperty('--hw-cue-opacity',String(1-ease(progress/.14)));
        var entered=progress>=.995;
        root.classList.toggle('hw-entered',entered);
        root.dataset.entranceProgress=progress.toFixed(3);
        door.setAttribute('aria-expanded',String(opening>.95||entered));
        hero.inert=!entered;hero.setAttribute('aria-hidden',String(!entered));
        portal.inert=entered;portal.setAttribute('aria-hidden',String(entered));
        if(nav)nav.inert=!entered;
      }
      function update(){frame=0;if(!disposed)paint((position()-top())/travel());}
      function schedule(){if(!frame)frame=requestAnimationFrame(update);}
      function resize(){
        height=scroller===window?window.innerHeight:scroller.clientHeight;
        root.style.setProperty('--hw-stage-height',height+'px');
        root.classList.toggle('hw-still-entrance',reduced.matches||root.dataset.motion==='none');
        if(trigger)trigger.refresh();update();
      }
      function go(value,focus){
        var y=top()+travel()*value;
        scroller.scrollTo({top:y,behavior:'instant'});paint(value);
        if(trigger)trigger.update();
        if(focus){hero.tabIndex=-1;hero.focus({preventScroll:true});}
      }
      // Clicking or pressing Enter is an accessible shortcut, never a prerequisite.
      on(door,'click',function(){go(1,true);});
      on(q('.hw-skip-entrance'),'click',function(){go(1,true);});
      on(enter,'click',function(){(q('.nx-section-story')||q('.nx-section-details'))?.scrollIntoView({behavior:reduced.matches?'instant':'smooth'});});
      on(q('.hw-replay'),'click',function(){go(0,false);door.focus({preventScroll:true});});
      on(nav,'click',function(event){var home=event.target.closest('[data-goto="hero"]');if(home){event.preventDefault();event.stopImmediatePropagation();go(1,true);}},true);
      on(scroller,'scroll',schedule,{passive:true});on(window,'resize',resize);on(reduced,'change',resize);
      if(E.gsap&&E.ScrollTrigger){E.gsap.registerPlugin(E.ScrollTrigger);trigger=E.ScrollTrigger.create({trigger:runway,scroller:scroller,start:'top top',end:'bottom bottom',onUpdate:function(self){paint(self.progress);},onRefresh:function(self){paint(self.progress);}});}
      var observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null;
      if(observer)observer.observe(scroller===window?document.documentElement:scroller);
      resize();cue.setAttribute('aria-hidden','true');
      clean.push(function(){disposed=true;cancelAnimationFrame(frame);observer?.disconnect();trigger?.kill();hero.inert=false;hero.removeAttribute('aria-hidden');if(nav)nav.inert=false;runway.before(hero);hero.querySelector('.hw-hero-grid')?.append(architecture);runway.remove();root.classList.remove('hw-scroll-experience','hw-entered','hw-still-entrance');root.style.removeProperty('--hw-stage-height');});
    }
    if(editing){root.classList.add('hw-editing');}
    else {
      var name=new URLSearchParams(location.search).get('guest');if(name){name=name.replace(/[\p{C}<>]/gu,'').trim().slice(0,80);if(name)q('.hw-personal').textContent='Dear '+name+', you’re invited.';}
      if(!options||options.rsvpDemo!==false){var badge=document.createElement('p');badge.className='hw-sample';badge.textContent='TEMPLATE PREVIEW · Sample date and location. Personalize before publishing.';q('.hw-hero').prepend(badge);}
    }
    var start=instant(b.date,b.time,s.timezone),end=instant(b.date,s.endTime,s.timezone);
    if(end<=start)end+=86400000;
    var timer=q('.hw-countdown');
    function tick(){if(!timer)return;if(!Number.isFinite(start)){timer.textContent='Our date will be announced soon.';return;}var diff=start-Date.now();if(diff<=0){timer.textContent=Date.now()<=end?'Today, our home is yours.':(d.sections.contact.thanks||'Thank you for being part of our new beginning.');return;}var seconds=Math.floor(diff/1000);timer.innerHTML=[Math.floor(seconds/86400),Math.floor(seconds/3600)%24,Math.floor(seconds/60)%60,seconds%60].map(function(n,i){return '<div><strong>'+String(n).padStart(2,'0')+'</strong><span>'+['DAYS','HOURS','MINUTES','SECONDS'][i]+'</span></div>';}).join('');}
    tick();var interval=setInterval(tick,1000);clean.push(function(){clearInterval(interval);});
    function stamp(ms){return new Date(ms).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');}
    var calendar=q('.hw-calendar');
    if(calendar&&Number.isFinite(start)&&Number.isFinite(end)){
      var query=new URLSearchParams({action:'TEMPLATE',text:b.title,dates:stamp(start)+'/'+stamp(end),ctz:s.timezone,location:b.venue+', '+b.city,details:d.sections.hero.note});q('.hw-google').href='https://calendar.google.com/calendar/render?'+query;
      on(q('.hw-ics'),'click',function(){function safe(value){return String(value||'').replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/[,;]/g,'\\$&');}var content=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Invitara//Aangan//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:'+encodeURIComponent(b.title+'-'+b.date)+'@invitara','DTSTAMP:'+stamp(Date.now()),'DTSTART:'+stamp(start),'DTEND:'+stamp(end),'SUMMARY:'+safe(b.title),'LOCATION:'+safe(b.venue+', '+b.city),'DESCRIPTION:'+safe(d.sections.hero.note),'END:VEVENT','END:VCALENDAR'].join('\r\n')+'\r\n';var url=URL.createObjectURL(new Blob([content],{type:'text/calendar;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='our-housewarming.ics';a.click();timers.push(setTimeout(function(){URL.revokeObjectURL(url);},1000));});
    }else if(calendar){calendar.textContent='Set a valid date, time and timezone to add this day to your calendar.';}
    var canvas=q('.hw-coating'),card=q('.hw-scratch'),revealed=false;
    function reveal(){if(!card||revealed)return;revealed=true;card.classList.add('is-revealed');if(canvas)canvas.style.pointerEvents='none';q('.hw-reveal').textContent='The secret is yours';q('.hw-reveal').disabled=true;calendar.hidden=false;card.setAttribute('role','status');remember(key+':date','yes');}
    if(canvas){var ctx=canvas.getContext('2d',{willReadFrequently:true}),down=false,last=null,strokes=0;
      function coat(){if(revealed||!ctx)return;var rect=canvas.getBoundingClientRect();canvas.width=Math.max(1,Math.round(rect.width));canvas.height=Math.max(1,Math.round(rect.height));ctx.globalCompositeOperation='source-over';var gradient=ctx.createLinearGradient(0,0,canvas.width,canvas.height);gradient.addColorStop(0,'#b99556');gradient.addColorStop(.4,'#e3cc94');gradient.addColorStop(.65,'#c4a368');gradient.addColorStop(1,'#e9d9ad');ctx.fillStyle=gradient;ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='rgba(255,255,255,.14)';for(var y=0;y<canvas.height;y+=4)ctx.fillRect(0,y,canvas.width,1);}
      function scratch(e){if(!down||revealed||!ctx)return;var rect=canvas.getBoundingClientRect(),point={x:(e.clientX-rect.left)*canvas.width/rect.width,y:(e.clientY-rect.top)*canvas.height/rect.height};ctx.globalCompositeOperation='destination-out';ctx.lineWidth=42;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(last?last.x:point.x,last?last.y:point.y);ctx.lineTo(point.x+.01,point.y);ctx.stroke();last=point;card.classList.add('is-scratching');if(++strokes%12===0)measure();}
      function measure(){if(!ctx||revealed)return;var pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data,clear=0,total=0;for(var i=3;i<pixels.length;i+=64){total++;if(pixels[i]<128)clear++;}if(clear/total>=.45)reveal();}
      function completion(){if(!down)return;down=false;last=null;measure();}
      on(canvas,'pointerdown',function(e){if(e.button!==0)return;down=true;canvas.setPointerCapture(e.pointerId);scratch(e);});on(canvas,'pointermove',scratch);on(canvas,'pointerup',completion);on(canvas,'pointercancel',completion);on(canvas,'lostpointercapture',completion);
      var observer=new ResizeObserver(coat);observer.observe(canvas);clean.push(function(){observer.disconnect();});coat();on(q('.hw-reveal'),'click',reveal);if(s.scratchReveal===false||editing||remember(key+':date'))reveal();
    }
    var directions=q('.hw-directions'),address=b.venue+', '+b.city;
    if(directions){var configured=!/Your (full address|house name)/i.test(address)&&b.city.trim();if(configured){var maps=/^https:\/\//.test(d.sections.venue.mapUrl)?d.sections.venue.mapUrl:'https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(address);directions.innerHTML='<a href="'+esc(maps)+'" target="_blank" rel="noopener">Google Maps ↗</a><a href="https://maps.apple.com/?daddr='+encodeURIComponent(address)+'" target="_blank" rel="noopener">Apple Maps ↗</a>';}else directions.textContent='Your hosts will share the address here.';}
    on(q('.hw-copy-address'),'click',async function(){try{await navigator.clipboard.writeText(address);q('.hw-copy-address').textContent='Address copied';}catch(_){q('.hw-copy-address').textContent='Select and copy the address above';}});
    on(q('.hw-share'),'click',async function(){var url=new URL(location.href);url.searchParams.delete('guest');var status=q('.hw-share-status');try{if(navigator.share)await navigator.share({title:b.title,text:d.sections.hero.note,url:url.href});else{await navigator.clipboard.writeText(url.href);status.textContent='Invitation link copied.';}}catch(error){if(error.name!=='AbortError'){status.textContent='Copy this invitation link: '+url.href;}}});
    var photos=Array.from(root.querySelectorAll('.nx-gallery-photo'));
    if(!editing&&photos.length){var dialog=document.createElement('dialog');dialog.className='hw-lightbox';dialog.setAttribute('aria-label','Our memories');dialog.innerHTML='<button type="button" aria-label="Close photograph">×</button><img alt=""><p></p>';document.body.appendChild(dialog);photos.forEach(function(photo){photo.tabIndex=0;photo.setAttribute('role','button');function show(){dialog.querySelector('img').src=photo.src;dialog.querySelector('img').alt=photo.alt;dialog.querySelector('p').textContent=photo.alt;dialog.showModal();}on(photo,'click',show);on(photo,'keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();show();}});});on(dialog.querySelector('button'),'click',function(){dialog.close();});clean.push(function(){dialog.remove();});}
    var shareHost=q('.hw-footer-actions');
    if(shareHost){var publicURL=new URL(location.href);publicURL.searchParams.delete('guest');shareHost.insertAdjacentHTML('beforeend','<a target="_blank" rel="noopener" href="https://wa.me/?text='+encodeURIComponent(b.title+' '+publicURL.href)+'">WhatsApp ↗</a><a href="mailto:?subject='+encodeURIComponent(b.title)+'&body='+encodeURIComponent(d.sections.hero.note+' '+publicURL.href)+'">Email ↗</a>');}
    var eventId=new URLSearchParams(location.search).get('e');
    if(eventId&&shareHost&&options?.rsvpDemo===false){var qr=document.createElement('details');qr.className='hw-qr';qr.innerHTML='<summary>Invitation QR code</summary><img width="180" height="180" alt="QR code for this invitation" loading="lazy" src="/api/invites/'+encodeURIComponent(eventId)+'/qr"><a download="invitation-qr.svg" href="/api/invites/'+encodeURIComponent(eventId)+'/qr">Save QR code ↓</a>';shareHost.after(qr);}
    var music=d.sections.hero.musicUrl;
    if(!editing&&music&&/^(https:\/\/|assets\/)/.test(music)){var audio=new Audio(music);audio.loop=true;audio.preload='none';var control=document.createElement('button');control.className='hw-music';control.type='button';control.textContent='Play ambient music';control.setAttribute('aria-pressed','false');root.appendChild(control);on(control,'click',async function(){try{if(audio.paused){await audio.play();control.textContent='Pause ambient music';control.setAttribute('aria-pressed','true');}else{audio.pause();control.textContent='Play ambient music';control.setAttribute('aria-pressed','false');}}catch(_){control.textContent='Music unavailable';}});clean.push(function(){audio.pause();audio.removeAttribute('src');audio.load();});}
    if(!editing&&root.dataset.motion!=='none'&&E.gsap&&E.ScrollTrigger){E.gsap.registerPlugin(E.ScrollTrigger);var scroller=root.closest('.demo-scroll')||window;var mm=E.gsap.matchMedia();mm.add('(prefers-reduced-motion: no-preference)',function(){var context=E.gsap.context(function(){root.querySelectorAll('.nx-section:not(.hw-hero)').forEach(function(section){E.gsap.from(section.children,{y:30,opacity:0,duration:.85,stagger:.1,ease:'power2.out',scrollTrigger:{scroller:scroller,trigger:section,start:'top 90%',once:true}});});E.gsap.to(q('.hw-progress'),{scaleX:1,ease:'none',scrollTrigger:{scroller:scroller,trigger:root,start:'top top',end:'bottom bottom',scrub:true}});var photo=q('.hw-home-photo img');if(photo)E.gsap.fromTo(photo,{yPercent:-5},{yPercent:5,ease:'none',scrollTrigger:{scroller:scroller,trigger:photo,start:'top bottom',end:'bottom top',scrub:true}});},root);return function(){context.revert();};});clean.push(function(){mm.revert();});}
    root.__premiumDispose=function(){if(prior)prior();clean.splice(0).forEach(function(fn){fn();});timers.forEach(clearTimeout);};
  };
})();
