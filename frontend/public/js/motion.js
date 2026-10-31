/* Respondr motion layer for studio pages: splash, heading word reveals, cursor dot, full-screen menu state, showroom FLIP.
 * Loads before premium-ui.js so headings it animates are marked and not animated twice. */
(function(){
 'use strict';
 var body=document.body,html=document.documentElement;if(!body.classList.contains('studio'))return;
 var reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
 if(!reduced.matches)html.classList.add('rs-motion');

 /* ---- Splash (homepage markup; once per session) ---- */
 var readyFns=[],isReady=false;
 function whenReady(fn){if(isReady)fn();else readyFns.push(fn);}
 function ready(){if(isReady)return;isReady=true;html.classList.remove('rs-splashing');readyFns.splice(0).forEach(function(fn){fn();});}
 var splash=document.getElementById('rs-splash');
 if(!splash||html.classList.contains('rs-seen')){if(splash)splash.remove();ready();}
 else{
  var bar=splash.querySelector('s'),born=performance.now(),done=0,total=2,finished=false;
  try{sessionStorage.setItem('rs-splash','1');}catch(e){}
  function tick(){done++;bar.style.transform='scaleX('+Math.min(1,done/total)+')';if(done>=total)finish();}
  function finish(){if(finished)return;finished=true;bar.style.transform='scaleX(1)';setTimeout(function(){splash.classList.add('out');ready();setTimeout(function(){splash.remove();},950);},Math.max(0,1150-(performance.now()-born)));}
  (document.fonts?document.fonts.ready:Promise.resolve()).then(tick,tick);
  var grid=document.getElementById('collection-grid');
  if(grid&&!grid.children.length){var seen=new MutationObserver(function(){if(grid.children.length){seen.disconnect();tick();}});seen.observe(grid,{childList:true});}else tick();
  setTimeout(finish,4000);
 }

 /* ---- Heading word reveals ---- */
 var SKIP='.ws,.collection-art,.ex-mini,.nx-mini,.hs,.eg-float,[aria-hidden="true"],[hidden]';
 function split(h){
  var i=0,label=h.textContent.replace(/\s+/g,' ').trim();
  var walker=document.createTreeWalker(h,NodeFilter.SHOW_TEXT),nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(function(node){
   var frag=document.createDocumentFragment();
   node.textContent.split(/(\s+)/).forEach(function(part){
    if(!part)return;
    if(/^\s+$/.test(part)){frag.append(part);return;}
    var w=document.createElement('span');w.className='rs-word';w.style.setProperty('--i',i++);w.textContent=part;frag.append(w);
   });
   node.replaceWith(frag);
  });
  h.setAttribute('aria-label',label);
  Array.from(h.children).forEach(function(c){c.setAttribute('aria-hidden','true');});
  h.classList.add('rs-words','ui-reveal');
 }
 if(!reduced.matches){
  var headings=Array.from(document.querySelectorAll('main h1,main h2')).filter(function(h){return !h.closest(SKIP)&&!h.querySelector('a,button,input')&&!h.classList.contains('sr-only')&&h.textContent.trim();});
  headings.forEach(split);
  var wordObserver=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('is-in');wordObserver.unobserve(e.target);}});},{threshold:.2,rootMargin:'0px 0px -4% 0px'});
  whenReady(function(){headings.forEach(function(h){wordObserver.observe(h);});});
 }

 /* ---- Cursor dot (fine pointers only; lerp .2 toward the pointer) ---- */
 if(fine.matches&&!reduced.matches){
  var dot=document.createElement('div');dot.className='rs-dot';dot.setAttribute('aria-hidden','true');body.append(dot);
  var tx=-100,ty=-100,cx=-100,cy=-100,raf=0;
  function follow(){cx+=(tx-cx)*.2;cy+=(ty-cy)*.2;dot.style.transform='translate3d('+cx+'px,'+cy+'px,0)';raf=Math.abs(tx-cx)+Math.abs(ty-cy)>.2?requestAnimationFrame(follow):0;}
  addEventListener('pointermove',function(e){if(e.pointerType!=='mouse')return;tx=e.clientX;ty=e.clientY;if(!dot.classList.contains('on')){cx=tx;cy=ty;dot.classList.add('on');}dot.classList.toggle('wide',!!e.target.closest('a,button,summary,select,label,.collection-art'));if(!raf)raf=requestAnimationFrame(follow);},{passive:true});
  document.addEventListener('pointerleave',function(){dot.classList.remove('on');});
 }

 /* ---- Full-screen menu: the header's backdrop-filter would trap the fixed overlay, so lift it while the menu is live ---- */
 var menuBtn=document.querySelector('.studio-menu'),menuTimer=0;
 if(menuBtn){
  new MutationObserver(function(){
   var open=menuBtn.getAttribute('aria-expanded')==='true';clearTimeout(menuTimer);
   if(open)body.classList.add('rs-menu-live');else menuTimer=setTimeout(function(){body.classList.remove('rs-menu-live');},reduced.matches?150:880);
  }).observe(menuBtn,{attributes:true,attributeFilter:['aria-expanded']});
 }

 /* ---- Showroom FLIP: the existing template preview dialog grows out of the card that opened it ---- */
 var lastArt=null,lastAt=0;
 document.addEventListener('click',function(e){var art=e.target.closest('.collection-card');if(art){lastArt=art.querySelector('.collection-art')||art;lastAt=performance.now();}},true);
 new MutationObserver(function(records){
  if(reduced.matches||!lastArt||performance.now()-lastAt>1500)return;
  records.forEach(function(r){r.addedNodes.forEach(function(node){
   if(!(node instanceof HTMLDialogElement)||!node.classList.contains('premium-showroom'))return;
   var from=lastArt.getBoundingClientRect();lastArt=null;
   requestAnimationFrame(function(){
    var to=node.getBoundingClientRect();if(!from.width||!to.width)return;
    node.animate([{transformOrigin:'top left',transform:'translate('+(from.left-to.left)+'px,'+(from.top-to.top)+'px) scale('+Math.max(.04,from.width/to.width)+','+Math.max(.04,from.height/to.height)+')',opacity:.35,borderRadius:'12px'},{transformOrigin:'top left',transform:'none',opacity:1,borderRadius:'0'}],{duration:620,easing:'cubic-bezier(.22,.61,.36,1)'});
   });
  });});
 }).observe(body,{childList:true});
})();
