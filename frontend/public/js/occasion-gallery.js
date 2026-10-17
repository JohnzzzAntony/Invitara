/* Occasion gallery adapted from user-supplied Skiper30 / Skiper UI
 * https://skiper-ui.com/ — inspired by https://www.siena.film/films/my-project-x
 * Native scrolling, bounded column movement, and complete reduced-motion fallback. */
(function(){
 'use strict';
 var gallery=document.getElementById('home-occasions');if(!gallery)return;
 var cards=Array.from(gallery.children),keys=['wedding','engagement','save-date','birthday','anniversary','baby','bridal','graduation','party','corporate','ramadan','eid','holiday','other'];
 var notes=['A beautiful beginning','The easiest yes','Something to look forward to','Another year, more magic','A love worth celebrating','A little wonder awaits','For the bride-to-be','Here’s to what comes next','Good people. Great memories.','Make a lasting impression','Gather in gratitude','Together in celebration','The joy of coming together','Make it your own'];
 var columns=[];gallery.classList.add('occasion-gallery');gallery.setAttribute('aria-label','Explore invitations by occasion');
 for(var i=0;i<4;i++){var col=document.createElement('div');col.className='occasion-column';gallery.append(col);columns.push(col);}
 cards.forEach(function(card,index){var key=keys[index],label=card.querySelector('strong').textContent,icon=card.querySelector('.occasion-icon');card.className='occasion-photo-card';card.style.setProperty('--occasion-order',index);card.setAttribute('aria-label',label+' invitations');var img=document.createElement('img');img.src='assets/occasions/'+key+(['graduation','ramadan','eid'].includes(key)?'.svg':'.webp');img.alt='';img.width=640;img.height=820;img.loading='lazy';img.decoding='async';var caption=document.createElement('span');caption.className='occasion-caption';var title=document.createElement('strong');title.textContent=label;var note=document.createElement('span');note.className='occasion-note';note.textContent=notes[index];caption.append(title,note);var arrow=document.createElement('span');arrow.className='occasion-arrow';arrow.setAttribute('aria-hidden','true');arrow.textContent='↗';card.replaceChildren(img,icon,caption,arrow);columns[index%4].append(card);});
 var reduced=matchMedia('(prefers-reduced-motion: reduce)'),desktop=matchMedia('(min-width: 768px)'),frame=0,visible=false,offsets=[-1,.8,-.55,1.2];
 function update(){frame=0;var enabled=!reduced.matches&&desktop.matches;var rect=gallery.getBoundingClientRect(),p=Math.max(0,Math.min(1,(innerHeight-rect.top)/(innerHeight+rect.height)));columns.forEach(function(col,i){col.style.transform=enabled?'translate3d(0,'+((p-.5)*100*offsets[i])+'px,0)':'';});}
 function queue(){if(!frame&&visible)frame=requestAnimationFrame(update);}
 var observer=new IntersectionObserver(function(entries){visible=entries[0].isIntersecting;if(visible)queue();},{rootMargin:'150px'});observer.observe(gallery);
 addEventListener('scroll',queue,{passive:true});addEventListener('resize',update,{passive:true});reduced.addEventListener('change',update);desktop.addEventListener('change',update);update();
 addEventListener('pagehide',function(){cancelAnimationFrame(frame);});
})();
