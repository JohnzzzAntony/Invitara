/* Progressive UI motion; all content remains visible if JavaScript is unavailable. */
(function(){
 'use strict';
 if(!document.body.classList.contains('studio'))return;
 var reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)'),animations=new Set();
 function animate(node,frames,options){if(reduced.matches||!node.animate)return;var a=node.animate(frames,options);animations.add(a);a.onfinish=a.oncancel=function(){animations.delete(a);};return a;}
 reduced.addEventListener('change',function(){if(reduced.matches)animations.forEach(function(a){a.cancel();});});
 var arrow='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12M11 5l5 5-5 5"/></svg>';
 document.querySelectorAll('.studio-button[href],.studio-pill[href]').forEach(function(button){if(button.closest('.ws,.ex,.suite'))return;var old=Array.from(button.children).find(function(n){return /^[→↗]$/.test(n.textContent.trim());});if(old)old.remove();var icon=document.createElement('span');icon.className='ui-action-icon';icon.setAttribute('aria-hidden','true');icon.innerHTML=arrow;button.append(icon);});
 var progress=document.createElement('div');progress.className='ui-scroll-progress';progress.setAttribute('aria-hidden','true');document.body.append(progress);var frame=0;
 function update(){frame=0;var max=document.documentElement.scrollHeight-innerHeight;progress.style.transform='scaleX('+(max>0?Math.min(1,scrollY/max):0)+')';document.body.classList.toggle('ui-scrolled',scrollY>24);}
 function queue(){if(!frame)frame=requestAnimationFrame(update);}
 addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue,{passive:true});update();
 var observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(!entry.isIntersecting)return;observer.unobserve(entry.target);animate(entry.target,[{opacity:.35,transform:'translateY(24px)'},{opacity:1,transform:'translateY(0)'}],{duration:750,easing:'cubic-bezier(.22,1,.36,1)'});});},{threshold:.12});
 document.querySelectorAll('.studio-hero-copy,.section-intro,.home-discovery>h2,.occasion-grid a,.experience-card,.premium-intro,.feature-strip article,.editorial-grid>div,.step,.launch-pricing>div,.invitation-explainer>div,.launch-faq details,.studio-end>h2,.pricing-hero,.pricing-card,.pricing-included,.footer-column').forEach(function(node){node.classList.add('ui-reveal');observer.observe(node);});
 document.querySelectorAll('.experience-card').forEach(function(card){var pending=0,x=0,y=0;card.addEventListener('pointermove',function(e){if(reduced.matches||!fine.matches)return;var rect=card.getBoundingClientRect();x=e.clientX-rect.left;y=e.clientY-rect.top;if(!pending)pending=requestAnimationFrame(function(){pending=0;card.style.setProperty('--pointer-x',x+'px');card.style.setProperty('--pointer-y',y+'px');});});});
 document.querySelectorAll('.launch-faq details').forEach(function(details){var summary=details.querySelector('summary'),active;
 summary.addEventListener('click',function(e){if(reduced.matches)return;e.preventDefault();if(active){active.cancel();active=null;}var start=details.getBoundingClientRect().height,closing=details.open;if(!closing)details.open=true;var end=closing?summary.getBoundingClientRect().height+2:details.getBoundingClientRect().height;details.style.overflow='hidden';active=animate(details,[{height:start+'px'},{height:end+'px'}],{duration:320,easing:'cubic-bezier(.22,1,.36,1)'});if(!active){details.open=!closing;details.style.overflow='';return;}active.addEventListener('finish',function(){details.open=!closing;details.style.overflow='';active=null;});active.addEventListener('cancel',function(){details.style.overflow='';});});
 });
 addEventListener('pagehide',function(){observer.disconnect();cancelAnimationFrame(frame);animations.forEach(function(a){a.cancel();});});
})();
