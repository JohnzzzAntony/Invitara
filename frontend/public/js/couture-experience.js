/* Couture guest interactions: opening veil, parallax, countdown, calendars and motion controls.
 * Everything registered here is released by root.__premiumDispose. Preview replies stay preview-only. */
(function(){
 'use strict';var E=window,base=E.EVER_bindSite;
 E.EVER_bindSite=function(root,options){
  if(!root.dataset.couture){base(root,options);return;}
  base(root,Object.assign({},options,{editing:true}));if(root.__coutureBound)return;root.__coutureBound=true;
  root.classList.remove('nx-editing');
  var prior=root.__premiumDispose,clean=[],animations=[],frame=0,disposed=false,editing=options&&options.editing,
   reduced=matchMedia('(prefers-reduced-motion: reduce)'),paused=reduced.matches||root.dataset.motion==='none',
   d=root.__wsData,b=d.basics,details=d.sections.details,openingType=d.sections.hero.openingType,
   hero=root.querySelector('.cx-hero'),button=root.querySelector('.cx-open-button'),film=root.querySelector('.cx-film');
  function on(node,event,fn,opts){if(!node)return;node.addEventListener(event,fn,opts);clean.push(function(){node.removeEventListener(event,fn,opts);});}
  root.__premiumDispose=function(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);animations.forEach(function(a){a.cancel();});clean.splice(0).forEach(function(fn){fn();});if(prior)prior();};

  // Countdown and calendar use the event's IANA timezone, shared with the housewarming helper.
  var instant=E.INVITARA_housewarmingInstant,start=instant?instant(b.date,b.time,details.timezone):NaN,end=instant?instant(b.date,details.endTime,details.timezone):NaN;
  if(end<=start)end+=86400000;
  function tick(){root.querySelectorAll('.cx-countdown').forEach(function(timer){if(!Number.isFinite(start)){timer.textContent='Event date to be announced.';return;}var diff=Math.max(0,Math.floor((start-Date.now())/1000));if(!diff){timer.textContent=Date.now()<=end?'The day is here. Welcome.':'Thank you for celebrating with us.';return;}timer.innerHTML=[Math.floor(diff/86400),Math.floor(diff/3600)%24,Math.floor(diff/60)%60,diff%60].map(function(n,i){return '<div><strong>'+String(n).padStart(2,'0')+'</strong><span>'+['Days','Hours','Minutes','Seconds'][i]+'</span></div>';}).join('');});}
  tick();var timer=setInterval(tick,1000);clean.push(function(){clearInterval(timer);});
  function stamp(ms){return new Date(ms).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');}
  root.querySelectorAll('.cx-calendar').forEach(function(calendar){
   if(!Number.isFinite(start)||!Number.isFinite(end)){calendar.textContent='Set an event date, time and timezone to enable calendar links.';return;}
   calendar.querySelector('.cx-google').href='https://calendar.google.com/calendar/render?'+new URLSearchParams({action:'TEMPLATE',text:b.title,dates:stamp(start)+'/'+stamp(end),ctz:details.timezone,location:b.venue+', '+b.city,details:d.sections.hero.note});
   on(calendar.querySelector('.cx-ics'),'click',function(){
    function safe(v){return String(v||'').replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/[,;]/g,'\\$&');}
    var body=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Respondr//Couture//EN','BEGIN:VEVENT','UID:'+encodeURIComponent(b.title+'-'+b.date)+'@respondr','DTSTAMP:'+stamp(Date.now()),'DTSTART:'+stamp(start),'DTEND:'+stamp(end),'SUMMARY:'+safe(b.title),'LOCATION:'+safe(b.venue+', '+b.city),'DESCRIPTION:'+safe(d.sections.hero.note),'END:VEVENT','END:VCALENDAR'].join('\r\n')+'\r\n';
    var url=URL.createObjectURL(new Blob([body],{type:'text/calendar;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='event.ics';a.click();
    var t=setTimeout(function(){URL.revokeObjectURL(url);},1000);clean.push(function(){clearTimeout(t);URL.revokeObjectURL(url);});
   });
  });
  if(editing){root.classList.add('cx-open');return;}

  var controls=document.createElement('div');controls.className='cx-toolbar';controls.setAttribute('aria-label','Invitation controls');
  controls.innerHTML='<button type="button" class="cx-motion">Pause motion</button><button type="button" class="cx-replay">Replay opening</button><button type="button" class="cx-share">Share ↗</button><span class="cx-status" role="status"></span>';root.prepend(controls);
  var motion=controls.querySelector('.cx-motion'),replay=controls.querySelector('.cx-replay'),status=controls.querySelector('.cx-status');
  function setMotion(){root.dataset.paused=String(paused);motion.textContent=paused?'Resume motion':'Pause motion';motion.setAttribute('aria-pressed',String(paused));if(film){if(paused)film.pause();else film.play().catch(function(){});}if(paused){animations.forEach(function(a){a.cancel();});animations=[];}}
  on(motion,'click',function(){paused=!paused;setMotion();});on(reduced,'change',function(){paused=reduced.matches||root.dataset.motion==='none';setMotion();});setMotion();

  function open(){if(root.classList.contains('cx-open'))return;root.classList.add('cx-open');if(button){button.textContent='Opened';button.setAttribute('aria-expanded','true');button.tabIndex=-1;}}
  if(button){button.dataset.label=button.textContent;on(button,'click',open);}else{open();replay.hidden=true;}
  on(replay,'click',function(){root.classList.remove('cx-open');if(button){button.textContent=button.dataset.label;button.setAttribute('aria-expanded','false');button.tabIndex=0;}hero.scrollIntoView({behavior:'instant',block:'start'});if(button)button.focus({preventScroll:true});});
  on(controls.querySelector('.cx-share'),'click',async function(){try{if(navigator.share)await navigator.share({title:b.title,url:location.href});else{await navigator.clipboard.writeText(location.href);status.textContent='Link copied';}}catch(error){if(error.name!=='AbortError')status.textContent='Copy the link from your address bar.';}});

  // Scroll progress through the hero drives parallax; a scroll-mode opening triggers once guests begin scrolling.
  function update(){frame=0;if(disposed||!hero)return;var r=hero.getBoundingClientRect(),host=root.closest('.ed-canvas-wrap')||root.closest('.demo-scroll')||(E.EVER_scrollHost&&E.EVER_scrollHost(root)),top=host?host.getBoundingClientRect().top:0,p=Math.max(0,Math.min(1,(top-r.top)/Math.max(1,r.height)));root.style.setProperty('--cx-p',paused?'0':p.toFixed(4));if(openingType==='scroll'&&p>.04)open();}
  function queue(){if(!frame&&!disposed)frame=requestAnimationFrame(update);}
  on(document,'scroll',queue,{capture:true,passive:true});on(window,'resize',queue,{passive:true});queue();

  // One-shot section entrances. Content is never hidden before JavaScript runs.
  if(window.IntersectionObserver){var observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(!entry.isIntersecting)return;observer.unobserve(entry.target);if(paused)return;var a=entry.target.animate([{opacity:0,transform:'translateY(28px)'},{opacity:1,transform:'none'}],{duration:root.dataset.motion==='gentle'?400:1000,easing:'cubic-bezier(.2,.8,.2,1)'});animations.push(a);a.finished.then(function(){animations=animations.filter(function(x){return x!==a;});}).catch(function(){});});},{threshold:.08});root.querySelectorAll('.cx-section').forEach(function(section){observer.observe(section);});clean.push(function(){observer.disconnect();});}
 };
})();
