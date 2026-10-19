/* Occasion gallery adapted from user-supplied Skiper30 / Skiper UI
 * https://skiper-ui.com/ — inspired by https://www.siena.film/films/my-project-x
 * Native scrolling, bounded column movement, and complete reduced-motion fallback. */
(function(){
 'use strict';
 var gallery=document.getElementById('home-occasions');if(!gallery)return;
 var cards=Array.from(gallery.children),keys=['wedding','engagement','save-date','birthday','anniversary','baby','bridal','graduation','party','corporate','ramadan','eid','holiday','party','corporate','party','corporate','party','corporate','other'];
 var notes=['A beautiful beginning','The easiest yes','Something to look forward to','Another year, more magic','A love worth celebrating','A little wonder awaits','For the bride-to-be','Here’s to what comes next','Good people. Great memories.','Make a lasting impression','Gather in gratitude','Together in celebration','The joy of coming together','A new chapter at home','A first look at what’s next','Meet what’s coming','Doors open to something lovely','A new favourite table awaits','A place to call your own','Make it your own'];
 var columns=[];gallery.classList.add('occasion-gallery');gallery.setAttribute('aria-label','Explore invitations by occasion');
 for(var i=0;i<4;i++){var col=document.createElement('div');col.className='occasion-column';gallery.append(col);columns.push(col);}
 cards.forEach(function(card,index){var key=keys[index],label=card.querySelector('strong').textContent,icon=card.querySelector('.occasion-icon');card.className='occasion-photo-card';card.style.setProperty('--occasion-order',index);card.setAttribute('aria-label',label+' invitations');var img=document.createElement('img');img.src='assets/occasions/'+key+(['graduation','ramadan','eid'].includes(key)?'.svg':'.webp');img.alt='';img.width=640;img.height=820;img.loading='lazy';img.decoding='async';var caption=document.createElement('span');caption.className='occasion-caption';var title=document.createElement('strong');title.textContent=label;var note=document.createElement('span');note.className='occasion-note';note.textContent=notes[index];caption.append(title,note);var arrow=document.createElement('span');arrow.className='occasion-arrow';arrow.setAttribute('aria-hidden','true');arrow.textContent='↗';card.replaceChildren(img,icon,caption,arrow);columns[index%4].append(card);});
 var reduced=matchMedia('(prefers-reduced-motion: reduce)'),animations=[];
 gallery.classList.add('occasion-parallax-gallery');
 var observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){
  if(!entry.isIntersecting)return;
  observer.unobserve(entry.target);
  if(reduced.matches)return;
  var index=cards.indexOf(entry.target);
  var animation=entry.target.animate([{opacity:0,translate:'0 24px'},{opacity:1,translate:'0 0'}],{duration:650,delay:(index%4)*65,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'});
  animations.push(animation);animation.onfinish=function(){animations=animations.filter(function(item){return item!==animation;});};
 });},{threshold:.08});
 cards.forEach(function(card){observer.observe(card);});
 reduced.addEventListener('change',function(){if(reduced.matches){animations.forEach(function(animation){animation.cancel();});animations=[];}});
 addEventListener('pagehide',function(){animations.forEach(function(animation){animation.cancel();});});
})();
