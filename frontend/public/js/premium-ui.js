/* Progressive UI motion; all content remains visible if JavaScript is unavailable. */
(function(){
 'use strict';
 if(!document.body.classList.contains('studio'))return;
 var reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)'),animations=new Set();
 function animate(node,frames,options){if(reduced.matches||!node.animate)return;var a=node.animate(frames,options);animations.add(a);a.onfinish=a.oncancel=function(){animations.delete(a);};return a;}
 reduced.addEventListener('change',function(){if(reduced.matches)animations.forEach(function(a){a.cancel();});});
 var arrow='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12M11 5l5 5-5 5"/></svg>';
 document.querySelectorAll('.studio-button[href],.studio-pill[href]').forEach(function(button){if(button.closest('.ws,.ex,.suite'))return;var old=Array.from(button.children).find(function(n){return /^[→↗]$/.test(n.textContent.trim());});if(old)old.remove();Array.from(button.childNodes).forEach(function(n){if(n.nodeType===3)n.textContent=n.textContent.replace(/\s*[→↗↓]\s*$/,'');});var icon=document.createElement('span');icon.className='ui-action-icon';icon.setAttribute('aria-hidden','true');icon.innerHTML=arrow;button.append(icon);});
 var progress=document.createElement('div');progress.className='ui-scroll-progress';progress.setAttribute('aria-hidden','true');document.body.append(progress);var frame=0;
 function update(){frame=0;var max=document.documentElement.scrollHeight-innerHeight;progress.style.transform='scaleX('+(max>0?Math.min(1,scrollY/max):0)+')';document.body.classList.toggle('ui-scrolled',scrollY>24);}
 function queue(){if(!frame)frame=requestAnimationFrame(update);}
 addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue,{passive:true});update();
 /* Each kind of section enters with its own motion; groups of siblings cascade. Content is never hidden without JS. */
 var ease='cubic-bezier(.22,1,.36,1)',MOTIONS={
  'blur-rise':{frames:[{opacity:0,transform:'translateY(40px)',filter:'blur(10px)'},{opacity:1,transform:'none',filter:'blur(0)'}],duration:1100},
  curtain:{frames:[{opacity:0,clipPath:'inset(0 0 100% 0)',transform:'translateY(24px)'},{opacity:1,clipPath:'inset(0 0 0% 0)',transform:'none'}],duration:900},
  'cascade-x':{frames:[{opacity:0,transform:'translateX(-36px)'},{opacity:1,transform:'none'}],duration:800,stagger:140},
  'zoom-wipe':{frames:[{opacity:0,clipPath:'inset(10% 6% 10% 6%)',transform:'scale(.96)'},{opacity:1,clipPath:'inset(0 0 0 0)',transform:'none'}],duration:1100},
  'slide-left':{frames:[{opacity:0,transform:'translateX(48px)'},{opacity:1,transform:'none'}],duration:700,stagger:80},
  'tilt-up':{frames:[{opacity:0,transform:'perspective(900px) rotateX(16deg) translateY(36px)'},{opacity:1,transform:'none'}],duration:900,stagger:110},
  'scale-in':{frames:[{opacity:0,transform:'scale(.94) translateY(20px)'},{opacity:1,transform:'none'}],duration:800},
  drop:{frames:[{opacity:0,transform:'translateY(-18px)'},{opacity:1,transform:'none'}],duration:650},
  fade:{frames:[{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'none'}],duration:700,stagger:90}
 },GROUPS=[
  ['blur-rise','.account-panel'],
  // Headings reveal word by word (js/motion.js marks them); their containers only fade so the motions don't stack.
  ['curtain','.home-discovery>h2,.studio-steps>h2,.launch-faq>h2,.studio-end>h2,.legal-page h1'],
  ['cascade-x','.step'],
  ['zoom-wipe','.launch-pricing>div,.editorial-gallery,.pricing-card'],
  ['slide-left','.launch-faq details,.seo-faq details'],
  ['tilt-up','.feature-strip article,.editorial-grid>div,.invitation-explainer>div,.pricing-included,.occasion-guide'],
  ['drop','.collection-tools,.collection-selector,.carousel-controls'],
  ['fade','.footer-column,.legal-page section,.seo-faq,.section-intro,.pricing-section-head,.premium-intro,.pricing-hero,.discovery-heading']
 ];
 function stagger(node,motion){if(!motion.stagger)return 0;var parent=node.parentElement,index=parent?Array.prototype.indexOf.call(parent.children,node):0;return (index%6)*motion.stagger;}
 var observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(!entry.isIntersecting)return;observer.unobserve(entry.target);var motion=MOTIONS[entry.target.dataset.motion]||MOTIONS.fade;animate(entry.target,motion.frames,{duration:motion.duration,delay:(parseFloat(getComputedStyle(entry.target).getPropertyValue('--reveal-delay'))||0)+stagger(entry.target,motion),easing:ease,fill:'backwards'});});},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
 function reveal(node,name){if(node.classList.contains('ui-reveal'))return;node.classList.add('ui-reveal');node.dataset.motion=name;observer.observe(node);}
 GROUPS.forEach(function(group){document.querySelectorAll(group[1]).forEach(function(node){reveal(node,group[0]);});});
 // Template cards render after data loads; the homepage carousel reveals as one piece, the catalogue reveals card by card.
 var grid=document.getElementById('collection-grid');function revealCards(){if(grid.closest('.editorial-gallery'))return;Array.from(grid.children).forEach(function(card,i){if(card.classList.contains('ui-reveal'))return;card.style.setProperty('--reveal-delay',(i%3)*90+'ms');reveal(card,'scale-in');});}if(grid){revealCards();new MutationObserver(revealCards).observe(grid,{childList:true});}
 document.querySelectorAll('.experience-card').forEach(function(card){var pending=0,x=0,y=0;card.addEventListener('pointermove',function(e){if(reduced.matches||!fine.matches)return;var rect=card.getBoundingClientRect();x=e.clientX-rect.left;y=e.clientY-rect.top;if(!pending)pending=requestAnimationFrame(function(){pending=0;card.style.setProperty('--pointer-x',x+'px');card.style.setProperty('--pointer-y',y+'px');});});});
 document.querySelectorAll('.launch-faq details').forEach(function(details){var summary=details.querySelector('summary'),active;
 summary.addEventListener('click',function(e){if(reduced.matches)return;e.preventDefault();if(active){active.cancel();active=null;}var start=details.getBoundingClientRect().height,closing=details.open;if(!closing)details.open=true;var end=closing?summary.getBoundingClientRect().height+2:details.getBoundingClientRect().height;details.style.overflow='hidden';active=animate(details,[{height:start+'px'},{height:end+'px'}],{duration:320,easing:'cubic-bezier(.22,1,.36,1)'});if(!active){details.open=!closing;details.style.overflow='';return;}active.addEventListener('finish',function(){details.open=!closing;details.style.overflow='';active=null;});active.addEventListener('cancel',function(){details.style.overflow='';});});
 });
 addEventListener('pagehide',function(){observer.disconnect();cancelAnimationFrame(frame);animations.forEach(function(a){a.cancel();});});
})();
