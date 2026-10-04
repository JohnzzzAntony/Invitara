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
   var pages=Array.from(root.querySelectorAll(':scope>.nx-section')),nav=document.createElement('nav'),stage=document.createElement('div');
   stage.className='ed-book-stage';stage.setAttribute('aria-label','Invitation book');root.prepend(stage);
   pages.forEach(function(page,i){stage.appendChild(page);page.classList.add('ed-book-sheet');page.dataset.page=i;page.hidden=i!==0;page.inert=i!==0;});
   nav.className='ed-book-toolbar';nav.setAttribute('aria-label','Story pages');nav.innerHTML='<button aria-label="Previous chapter">←</button><span role="status" aria-live="polite"></span><button aria-label="Next chapter">→</button><button aria-label="Return to cover">Cover</button>';stage.after(nav);
   var hint=document.createElement('p');hint.className='ed-book-hint';hint.textContent='Tap the page or scroll to turn · swipe back to return';nav.after(hint);
   var index=0,busy=false,turn=null,wheelTimer,wheelReady=true;
   root.classList.add('ed-book-bound','ed-book-closed');
   function status(){nav.children[1].textContent=index===0?'Cover · '+(pages.length-1)+' chapters':'Chapter '+index+' / '+(pages.length-1);nav.children[0].disabled=index===0;nav.children[2].disabled=index===pages.length-1;root.classList.toggle('ed-book-closed',index===0);root.classList.toggle('ed-book-open',index!==0);root.dataset.bookPage=index;}
   function go(i){
    i=Math.max(0,Math.min(pages.length-1,i));if(busy||i===index)return;
    var old=pages[index],next=pages[i],forward=i>index;busy=true;next.hidden=false;next.inert=true;next.scrollTop=0;
    var sheet=forward?old:next;old.style.zIndex=forward?'3':'1';next.style.zIndex=forward?'1':'3';sheet.classList.add('ed-sheet-turning');
    function finish(){old.hidden=true;old.inert=true;next.hidden=false;next.inert=false;sheet.classList.remove('ed-sheet-turning');old.style.zIndex='';next.style.zIndex='';index=i;busy=false;turn=null;status();if(old.contains(document.activeElement)){next.tabIndex=-1;next.focus({preventScroll:true});}}
    if(reduced.matches||root.dataset.motion==='none'||root.dataset.paused==='true'){finish();return;}
    turn=sheet.animate([{transform:'rotateY('+(forward?0:-105)+'deg)',filter:'brightness('+(forward?1:.65)+')'},{transform:'rotateY('+(forward?-105:0)+'deg)',filter:'brightness('+(forward?.65:1)+')'}],{duration:1050,easing:'cubic-bezier(.32,.02,.18,1)',fill:'none'});turn.onfinish=finish;
   }
   var interactive='a,button,input,select,textarea,label,form,[role="button"],[contenteditable="true"]';
   if(trigger)on(trigger,'click',function(e){e.preventDefault();e.stopImmediatePropagation();go(1);},true);
   on(root,'click',function(e){var link=e.target.closest('[data-goto]');if(!link||link===trigger)return;var target=pages.findIndex(function(page){return page.id==='ws-sec-'+link.dataset.goto;});if(target>=0){e.preventDefault();e.stopImmediatePropagation();go(target);}},true);
   on(stage,'click',function(e){if(!e.target.closest(interactive)&&!getSelection()?.toString())go(index+1);});
   on(nav.children[0],'click',function(){go(index-1);});on(nav.children[2],'click',function(){go(index+1);});on(nav.children[3],'click',function(){go(0);});
   on(root,'keydown',function(e){if(e.target.closest(interactive))return;if(['ArrowRight','ArrowLeft','PageDown','PageUp'].includes(e.key)){e.preventDefault();go(index+(['ArrowRight','PageDown'].includes(e.key)?1:-1));}});
   function boundary(delta){var page=pages[index];return delta>0?page.scrollTop+page.clientHeight>=page.scrollHeight-3:page.scrollTop<=1;}
   on(stage,'wheel',function(e){if(e.target.closest('input,select,textarea'))return;clearTimeout(wheelTimer);wheelTimer=setTimeout(function(){wheelReady=true;},200);if(busy){e.preventDefault();return;}if(Math.abs(e.deltaY)>12&&boundary(e.deltaY)){e.preventDefault();if(wheelReady){wheelReady=false;go(index+(e.deltaY>0?1:-1));}}},{passive:false});
   var start;
   on(stage,'touchstart',function(e){if(e.target.closest(interactive))return;start={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
   on(stage,'touchend',function(e){if(!start)return;var dx=e.changedTouches[0].clientX-start.x,dy=e.changedTouches[0].clientY-start.y;start=null;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy))go(index+(dx<0?1:-1));else if(Math.abs(dy)>90&&boundary(-dy))go(index+(dy<0?1:-1));},{passive:true});
   function settle(){if(turn&&(reduced.matches||root.dataset.paused==='true'))turn.finish();}on(reduced,'change',settle);on(root,'edition-motion',settle);
   clean.push(function(){clearTimeout(wheelTimer);if(turn){turn.onfinish=null;turn.cancel();}});status();
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
