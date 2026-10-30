/* Occasion marquee: two rows of photo cards drifting in opposite directions.
 * shop.js renders one link per occasion; this file restyles them and duplicates each row once
 * (the copy is inert and hidden from assistive tech) so the CSS loop is seamless.
 * Motion pauses on hover, keyboard focus, off-screen, or via the visible pause button (WCAG 2.2.2).
 * Reduced motion: no drift, rows become swipeable scroll-snap strips. */
(function(){
 'use strict';
 var gallery=document.getElementById('home-occasions');if(!gallery)return;
 var images={wedding:'occasions/wedding.webp',engagement:'occasions/engagement.webp','save-date':'occasions/save-date.webp',birthday:'occasions/birthday.webp',anniversary:'occasions/anniversary.webp',baby:'occasions/baby.webp',bridal:'occasions/bridal.webp',graduation:'occasions/graduation.svg',party:'occasions/party.webp',corporate:'occasions/corporate.webp',ramadan:'occasions/ramadan.svg',eid:'occasions/eid.svg',holiday:'occasions/holiday.webp',housewarming:'ev-home.jpg','brand-launch':'ev-star.jpg','store-opening':'ev-silver.jpg','product-launch':'premium/gala-640.webp','restaurant-opening':'premium/decor-640.webp','property-launch':'ev-cottage.jpg',other:'occasions/other.webp'};
 var notes={wedding:'A beautiful beginning',engagement:'The easiest yes','save-date':'Something to look forward to',birthday:'Another year, more magic',anniversary:'A love worth celebrating',baby:'A little wonder awaits',bridal:'For the bride-to-be',graduation:'Here’s to what comes next',party:'Good people. Great memories.',corporate:'Make a lasting impression',ramadan:'Gather in gratitude',eid:'Together in celebration',holiday:'The joy of coming together',housewarming:'A new chapter at home','brand-launch':'A first look at what’s next','store-opening':'Meet what’s coming','product-launch':'Doors open to something new','restaurant-opening':'A new favourite table awaits','property-launch':'A place to call your own',other:'Make it your own'};
 var cards=Array.from(gallery.children);if(!cards.length)return;
 cards.forEach(function(card){
  var key=card.dataset.occasion||'other',label=card.querySelector('strong').textContent,icon=card.querySelector('.occasion-icon');
  card.className='occasion-photo-card';card.setAttribute('aria-label',label+' invitations');
  var img=document.createElement('img');img.src='assets/'+(images[key]||images.other);img.alt='';img.width=640;img.height=800;img.loading='lazy';img.decoding='async';
  var caption=document.createElement('span');caption.className='occasion-caption';
  var title=document.createElement('strong');title.textContent=label;
  var note=document.createElement('span');note.className='occasion-note';note.textContent=notes[key]||'';
  caption.append(title,note);
  var arrow=document.createElement('span');arrow.className='occasion-arrow';arrow.setAttribute('aria-hidden','true');arrow.textContent='↗';
  card.replaceChildren(img,icon,caption,arrow);
 });
 gallery.className='occasion-marquee';gallery.setAttribute('role','region');gallery.setAttribute('aria-label','Invitations by occasion');
 var half=Math.ceil(cards.length/2),rows=[cards.slice(0,half),cards.slice(half)];
 gallery.replaceChildren();
 rows.forEach(function(set,index){
  var row=document.createElement('div');row.className='occasion-row';row.style.setProperty('--marquee-duration',(set.length*6)+'s');if(index)row.classList.add('is-reverse');
  var track=document.createElement('div');track.className='occasion-track';
  var group=document.createElement('div');group.className='occasion-set';set.forEach(function(card){group.append(card);});
  var clone=group.cloneNode(true);clone.classList.add('is-clone');clone.setAttribute('aria-hidden','true');clone.inert=true;
  track.append(group,clone);row.append(track);gallery.append(row);
 });
 var toggle=document.createElement('button');toggle.type='button';toggle.className='marquee-toggle';
 function setLabel(paused){toggle.setAttribute('aria-pressed',String(paused));toggle.innerHTML=paused?'<span aria-hidden="true">▶</span> Play motion':'<span aria-hidden="true">❚❚</span> Pause motion';}
 setLabel(false);
 toggle.addEventListener('click',function(){var paused=!gallery.classList.contains('is-paused');gallery.classList.toggle('is-paused',paused);setLabel(paused);});
 gallery.after(toggle);
 var visibility=new IntersectionObserver(function(entries){gallery.classList.toggle('is-offscreen',!entries[0].isIntersecting);});visibility.observe(gallery);
 addEventListener('pagehide',function(){visibility.disconnect();});
})();
