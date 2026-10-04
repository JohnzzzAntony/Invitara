/* Guest controls work before animation chunks load, and with motion disabled. */
(function(){
 'use strict';var E=window,base=E.EVER_bindSite;
 E.EVER_bindSite=function(root,options){
  if(!root.dataset.edition){base(root,options);return;}
  // Reuse RSVP/navigation plumbing without running the older motion system.
  base(root,Object.assign({},options,{editing:true}));
  if(root.__editionBound)return;root.__editionBound=true;
  var prior=root.__premiumDispose,clean=[],disposed=false,editing=options&&options.editing,key=root.dataset.edition,reduced=matchMedia('(prefers-reduced-motion: reduce)');
  function on(node,event,fn,opts){node.addEventListener(event,fn,opts);clean.push(function(){node.removeEventListener(event,fn,opts);});}
  function destroy(){if(disposed)return;disposed=true;root.__editionDisposed=true;if(prior)prior();clean.splice(0).forEach(function(fn){fn();});}
  root.__premiumDispose=destroy;
  function countdown(){root.querySelectorAll('[data-deadline]').forEach(function(el){var days=Math.max(0,Math.ceil((new Date(el.dataset.deadline+'T00:00:00').getTime()-Date.now())/86400000));el.innerHTML='<strong>'+days+'</strong><span>days until we gather</span>';});}countdown();var timer=setInterval(countdown,60000);clean.push(function(){clearInterval(timer);});
  if(editing)return;
  var hero=root.querySelector('.ed-hero'),trigger=hero?.querySelector('.ed-invite-link');
  if(key==='vow'&&hero){
   var pages=Array.from(root.querySelectorAll(':scope>.nx-section:not(.ed-hero)')),nav=document.createElement('nav');nav.className='ed-book-toolbar';nav.setAttribute('aria-label','Story pages');nav.innerHTML='<button aria-label="Previous chapter">←</button><span role="status"></span><button aria-label="Next chapter">→</button><button aria-label="Return to cover">Cover</button>';hero.after(nav);var index=0;
   function status(){nav.children[1].textContent='Chapter '+(index+1)+' / '+pages.length;nav.children[0].disabled=index===0;nav.children[2].disabled=index===pages.length-1;}
   function go(i){if(!pages.length)return;index=Math.max(0,Math.min(pages.length-1,i));root.classList.remove('ed-book-closed');root.classList.add('ed-book-open');pages[index].scrollIntoView({block:'start',behavior:reduced.matches?'instant':'smooth'});root.dispatchEvent(new CustomEvent('edition-page',{detail:{node:pages[index]}}));status();}
   root.classList.add('ed-book-closed');if(trigger)on(trigger,'click',function(e){e.preventDefault();e.stopImmediatePropagation();go(0);},true);on(nav.children[0],'click',function(){go(index-1);});on(nav.children[2],'click',function(){go(index+1);});on(nav.children[3],'click',function(){root.classList.add('ed-book-closed');root.classList.remove('ed-book-open');hero.scrollIntoView({block:'start'});trigger?.focus({preventScroll:true});});
   on(root,'keydown',function(e){if(e.target.closest('input,select,textarea,button,[contenteditable]'))return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();go(index+(e.key==='ArrowRight'?1:-1));}});var start;
   on(root,'touchstart',function(e){if(e.target.closest('input,select,textarea,button'))return;start={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});on(root,'touchend',function(e){if(!start)return;var dx=e.changedTouches[0].clientX-start.x,dy=e.changedTouches[0].clientY-start.y;start=null;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.5)go(index+(dx<0?1:-1));else if(dy<-90&&root.classList.contains('ed-book-closed'))go(0);},{passive:true});
   on(hero,'wheel',function(e){if(e.deltaY>25&&root.classList.contains('ed-book-closed')){e.preventDefault();go(0);}},{passive:false});status();
   var observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){index=pages.indexOf(entry.target);status();}});},{threshold:.4});pages.forEach(function(page){observer.observe(page);});clean.push(function(){observer.disconnect();});
  }
  if(key==='postmark'&&trigger){var date=hero.querySelector('.ed-date');date.classList.add('ed-sealed-date');trigger.setAttribute('aria-expanded','false');on(trigger,'click',function(e){if(trigger.getAttribute('aria-expanded')==='true')return;e.preventDefault();e.stopImmediatePropagation();date.classList.remove('ed-sealed-date');trigger.setAttribute('aria-expanded','true');trigger.querySelector('span').textContent='The details are yours';date.setAttribute('role','status');root.dispatchEvent(new CustomEvent('edition-reveal',{detail:{node:date}}));},true);}
  if(key==='mosaic'&&trigger){root.classList.add('ed-courtyard-closed');trigger.setAttribute('aria-expanded','false');on(trigger,'click',function(e){if(trigger.getAttribute('aria-expanded')==='true')return;e.preventDefault();e.stopImmediatePropagation();root.classList.remove('ed-courtyard-closed');root.classList.add('ed-courtyard-open');trigger.setAttribute('aria-expanded','true');trigger.querySelector('span').textContent='Come on in';root.dispatchEvent(new CustomEvent('edition-reveal',{detail:{node:hero.querySelector('.ed-courtyard-copy')}}));},true);}
  var photos=Array.from(root.querySelectorAll('.nx-gallery-photo'));
  if(photos.length){var dialog=document.createElement('dialog');dialog.className='nx-lightbox';dialog.setAttribute('aria-label','Photo gallery');dialog.innerHTML='<button aria-label="Close gallery">×</button><img alt=""><p role="status"></p><div><button aria-label="Previous photograph">←</button><button aria-label="Next photograph">→</button></div>';document.body.appendChild(dialog);var current=0,focus;
   function show(i){current=(i+photos.length)%photos.length;dialog.querySelector('img').src=photos[current].src;dialog.querySelector('img').alt=photos[current].alt;dialog.querySelector('p').textContent=(current+1)+' / '+photos.length+' — '+photos[current].alt;}
   photos.forEach(function(img,i){img.tabIndex=0;img.setAttribute('role','button');img.setAttribute('aria-label','Open photograph: '+img.alt);function open(){focus=img;show(i);dialog.showModal();}on(img,'click',open);on(img,'keydown',function(e){if(['Enter',' '].includes(e.key)){e.preventDefault();open();}});});on(dialog.querySelector('button'),'click',function(){dialog.close();});on(dialog.querySelector('[aria-label="Previous photograph"]'),'click',function(){show(current-1);});on(dialog.querySelector('[aria-label="Next photograph"]'),'click',function(){show(current+1);});on(dialog,'keydown',function(e){if(e.key==='ArrowRight')show(current+1);if(e.key==='ArrowLeft')show(current-1);});on(dialog,'close',function(){focus?.focus({preventScroll:true});});var touch;on(dialog,'touchstart',function(e){touch=e.touches[0].clientX;},{passive:true});on(dialog,'touchend',function(e){var dx=e.changedTouches[0].clientX-touch;if(Math.abs(dx)>65)show(current+(dx<0?1:-1));},{passive:true});clean.push(function(){dialog.remove();});
  }
  if(!reduced.matches&&root.dataset.motion!=='none'){
   var pause=document.createElement('button');pause.className='ed-scene-action';pause.type='button';pause.textContent='Pause motion';pause.setAttribute('aria-pressed','false');hero?.appendChild(pause);on(pause,'click',function(){var paused=pause.getAttribute('aria-pressed')!=='true';pause.setAttribute('aria-pressed',String(paused));pause.textContent=paused?'Resume motion':'Pause motion';root.dataset.paused=String(paused);root.dispatchEvent(new CustomEvent('edition-motion'));});
   import('/vendor/editions/editions-motion.js').then(function(module){if(!disposed&&root.isConnected){var stop=module.bindEditionMotion(root);clean.push(stop);}}).catch(function(){pause.remove();});
  }
 };
})();
