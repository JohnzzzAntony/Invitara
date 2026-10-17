/* Sticky card stack adapted from the user-supplied Skiper16 reference.
 * Attribution: Skiper UI, https://skiper-ui.com/ (Gurvinder Singh).
 * Native scrolling; no scroll interception or continuously running animation loop. */
(function(){
 'use strict';
 var host=document.getElementById('home-experiences');if(!host)return;
 var cards=Array.from(host.children),reduced=matchMedia('(prefers-reduced-motion: reduce)'),short=matchMedia('(max-height: 620px)'),frame=0;
 var photos=['ws-rings','ws-cafe','ws-couple','ws-decor','ws-dance','ws-proposal','ev-anniv','ev-tropical'];
 host.classList.add('experience-stack');
 cards.forEach(function(card,i){card.style.setProperty('--stack-index',i);var copy=document.createElement('div');copy.className='stack-copy';while(card.firstChild)copy.append(card.firstChild);var image=document.createElement('img');image.src='assets/'+photos[i]+'.jpg';image.alt='';image.loading='lazy';image.decoding='async';image.width=600;image.height=600;var visual=document.createElement('div');visual.className='stack-visual';visual.append(image);card.append(copy,visual);card.addEventListener('focus',function(){if(!reduced.matches&&!short.matches){var top=host.getBoundingClientRect().top+scrollY;window.scrollTo({top:top+i*(card.offsetHeight+parseFloat(getComputedStyle(host).rowGap))-110,behavior:'instant'});}});});
 function update(){frame=0;var enabled=!reduced.matches&&!short.matches;host.classList.toggle('stack-static',!enabled);var top=host.getBoundingClientRect().top,step=cards[0].offsetHeight+parseFloat(getComputedStyle(host).rowGap);cards.forEach(function(card,i){var p=Math.max(0,Math.min(1,(110+i*10-top-i*step)/Math.max(1,(cards.length-1-i)*step)));var scale=1-p*(cards.length-1-i)*.035;card.style.setProperty('--stack-scale',enabled?scale:1);});}
 function queue(){if(!frame)frame=requestAnimationFrame(update);}
 addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue,{passive:true});reduced.addEventListener('change',update);short.addEventListener('change',update);update();addEventListener('pagehide',function(){cancelAnimationFrame(frame);});
})();
