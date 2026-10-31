/* Homepage template gallery: a CSS 3D cylinder that slowly turns, with floating side cards, glows and orbit rings.
 * Drag (or swipe sideways) to spin it with momentum; back cards wash into the paper; scrolling dollies the camera in.
 * shop.js owns the cards inside #collection-grid; this file only arranges them on the ring and drives the rotation. */
(function(){
 'use strict';
 if(document.body.dataset.page!=='home')return;
 var ring=document.getElementById('collection-grid');if(!ring)return;
 var reduced=matchMedia('(prefers-reduced-motion: reduce)'),DURATION=34,MIN_FACES=6,TILT=-7;

 var root=document.createElement('div');root.className='editorial-gallery';root.setAttribute('role','region');root.setAttribute('aria-roledescription','carousel');root.setAttribute('aria-label','Invitation templates');
 root.innerHTML='<div class="eg-backdrop" aria-hidden="true"><span class="eg-glow"></span><span class="eg-glow eg-glow-two"></span><span class="eg-sweep"></span></div><div class="eg-stage"><div class="eg-side eg-left" aria-hidden="true"></div><div class="eg-viewport"></div><div class="eg-side eg-right" aria-hidden="true"></div><span class="eg-orbit" aria-hidden="true"></span><span class="eg-orbit eg-orbit-two" aria-hidden="true"></span><span class="eg-vig" aria-hidden="true"></span></div>';
 ring.before(root);root.querySelector('.eg-viewport').append(ring);ring.classList.add('eg-ring');
 var sides=root.querySelectorAll('.eg-side'),stage=root.querySelector('.eg-stage');

 var controls=document.createElement('div');controls.className='carousel-controls';
 controls.innerHTML='<button type="button" class="carousel-arrow" data-dir="-1" aria-label="Previous template"><span aria-hidden="true">←</span></button><button type="button" class="carousel-arrow" data-dir="1" aria-label="Next template"><span aria-hidden="true">→</span></button><button type="button" class="carousel-autoplay" aria-pressed="false"></button>';
 root.after(controls);
 var toggle=controls.querySelector('.carousel-autoplay');

 var angle=0,target=null,step=60,last=0,frame=0,hover=false,focus=false,userPaused=false,visible=false,radius=300,camZ=0,vel=0,drag=null,depth=[];
 function cards(){return Array.from(ring.children);}
 function spinning(){return !reduced.matches&&!userPaused&&!hover&&!focus&&!drag&&!vel&&cards().length>1;}
 /* Scroll dolly: the camera eases from slightly back to slightly forward as the section crosses the viewport. */
 function camTarget(){if(reduced.matches)return 0;var r=root.getBoundingClientRect(),p=Math.max(0,Math.min(1,(innerHeight-r.top)/(innerHeight+r.height)));return (p-.5)*2*Math.min(64,radius*.12);}

 function layout(){
  var list=cards(),faces=Math.max(list.length,MIN_FACES),width=ring.offsetWidth||280;
  step=360/faces;
  radius=Math.round(width/(2*Math.tan(Math.PI/faces))+width*.12);
  list.forEach(function(card,i){card.style.transform='translate(-50%,-50%) rotateY('+(i*step)+'deg) translateZ('+radius+'px)';});
  ring.style.setProperty('--eg-radius',radius+'px');
  scaleFloats();
 }
 /* Side cards are static clones of the first six previews, rendered at panel size and scaled down. */
 function floats(){
  var list=cards().slice(0,6);
  sides.forEach(function(side,s){
   side.replaceChildren();
   list.slice(s*3,s*3+3).forEach(function(card,i){
    var art=card.querySelector('.collection-art');if(!art)return;
    var box=document.createElement('div');box.className='eg-float eg-float-'+(i+1);
    var inner=art.cloneNode(true);inner.classList.add('eg-float-art');inner.querySelectorAll('a,button').forEach(function(n){n.remove();});
    box.append(inner);side.append(box);
   });
  });
  scaleFloats();
 }
 function scaleFloats(){
  var size=ring.offsetWidth||280;
  root.querySelectorAll('.eg-float').forEach(function(box){var inner=box.firstElementChild;inner.style.width=size+'px';inner.style.transform='scale('+(box.clientWidth/size)+')';});
 }

 /* Rapid clicks step from where the ring is heading, not where it is mid-turn. */
 function heading(){return target===null?angle:target;}
 function nearest(index){var from=heading(),delta=((-index*step-from)%360+540)%360-180;return from+delta;}
 function frontIndex(at){var n=360/step;return ((Math.round(-(at===undefined?angle:at)/step)%n)+n)%n;}
 function go(index){target=nearest(index);if(reduced.matches){angle=target;target=null;}start();}
 function step1(dir){var n=cards().length;if(n)go((frontIndex(heading())+dir+n)%n);}
 function paint(){
  ring.style.transform='translateZ('+camZ.toFixed(1)+'px) rotateX('+TILT+'deg) rotateY('+angle+'deg)';
  var front=frontIndex();
  cards().forEach(function(card,i){
   card.classList.toggle('is-front',i===front);
   /* Depth wash: cards turning away fade into the paper colour; only written when the value changes. */
   var zf=Math.cos((i*step+angle)*Math.PI/180),base=.14+.86*Math.pow((zf+1)/2,.85),d=((1-base)*.85).toFixed(2);
   if(depth[i]!==d){depth[i]=d;card.style.setProperty('--d',d);}
  });
 }
 function tick(now){
  frame=0;var dt=last?Math.min(.1,(now-last)/1000):0;last=now;
  if(drag){}
  else if(vel){angle+=vel;vel*=.94;if(Math.abs(vel)<.02){vel=0;go(frontIndex());}}
  else if(target!==null){angle+=(target-angle)*Math.min(1,dt*6);if(Math.abs(target-angle)<.05){angle=target;target=null;}}
  else if(spinning())angle-=dt*360/DURATION;
  var goal=camTarget();camZ+=(goal-camZ)*.075;if(Math.abs(goal-camZ)<.1)camZ=goal;
  paint();
  if(visible&&!document.hidden&&(drag||vel||target!==null||spinning()||camZ!==goal))frame=requestAnimationFrame(tick);else last=0;
 }
 function start(){if(!frame){last=0;frame=requestAnimationFrame(tick);}}

 controls.querySelectorAll('[data-dir]').forEach(function(btn){btn.addEventListener('click',function(){step1(Number(btn.dataset.dir));});});
 /* Autoplay is user-controllable (WCAG 2.2.2): visible pause button, paused on hover and while focus is inside, off for reduced motion. */
 function syncToggle(){toggle.setAttribute('aria-pressed',String(userPaused));toggle.innerHTML=userPaused?'<span aria-hidden="true">▶</span> Play':'<span aria-hidden="true">❚❚</span> Pause';toggle.hidden=reduced.matches;}
 toggle.addEventListener('click',function(){userPaused=!userPaused;syncToggle();start();});
 root.addEventListener('pointerenter',function(){hover=true;});
 root.addEventListener('pointerleave',function(){hover=false;start();});
 /* Keyboard users: bring the focused card to the front so it is never on the far side of the ring. */
 root.addEventListener('focusin',function(e){focus=true;var card=e.target.closest('.collection-card');if(card&&card.parentElement===ring)go(cards().indexOf(card));});
 root.addEventListener('focusout',function(e){if(!root.contains(e.relatedTarget)){focus=false;start();}});
 root.addEventListener('keydown',function(e){if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();step1(e.key==='ArrowRight'?1:-1);}});
 /* Drag to rotate: 0.25deg per pixel, momentum on release, then snap to the nearest card.
  * Touch only takes over once the gesture is clearly sideways, so vertical swipes still scroll the page.
  * A drag never also clicks: the click that ends a drag is swallowed. */
 var swallowClick=false;
 stage.addEventListener('pointerdown',function(e){
  if(e.button>0||cards().length<2)return;
  drag={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,type:e.pointerType,live:false};vel=0;
 });
 stage.addEventListener('pointermove',function(e){
  if(!drag||e.pointerId!==drag.id)return;
  var dx=e.clientX-drag.x,dy=e.clientY-drag.y,slop=drag.type==='touch'?14:6;
  if(!drag.live){
   if(Math.hypot(dx,dy)<slop)return;
   if(drag.type==='touch'&&Math.abs(dy)>Math.abs(dx)*1.15){drag=null;return;}
   drag.live=true;target=null;stage.classList.add('is-dragging');try{stage.setPointerCapture(e.pointerId);}catch(err){}start();
  }
  var move=(e.clientX-drag.lastX)*.25;drag.lastX=e.clientX;angle+=move;vel=move;paint();
 });
 function endDrag(e){
  if(!drag||e.pointerId!==drag.id)return;
  if(drag.live){swallowClick=true;setTimeout(function(){swallowClick=false;},0);if(reduced.matches)vel=0;if(!vel)go(frontIndex());}
  drag=null;stage.classList.remove('is-dragging');start();
 }
 stage.addEventListener('pointerup',endDrag);stage.addEventListener('pointercancel',endDrag);
 stage.addEventListener('click',function(e){if(swallowClick){e.preventDefault();e.stopPropagation();swallowClick=false;}},true);
 addEventListener('scroll',function(){if(visible)start();},{passive:true});
 var seen=new IntersectionObserver(function(entries){visible=entries[0].isIntersecting;if(visible)start();});seen.observe(root);
 document.addEventListener('visibilitychange',function(){if(!document.hidden)start();});
 reduced.addEventListener('change',function(){syncToggle();start();});
 var resize=new ResizeObserver(layout);resize.observe(ring);resize.observe(root);

 /* Filtering, sorting and search re-render the cards: re-arrange them and face the first one. */
 function refresh(){angle=0;target=null;layout();paint();requestAnimationFrame(function(){requestAnimationFrame(floats);});start();}
 var observer=new MutationObserver(refresh);observer.observe(ring,{childList:true});
 refresh();syncToggle();
 addEventListener('pagehide',function(){cancelAnimationFrame(frame);observer.disconnect();seen.disconnect();resize.disconnect();});
})();
