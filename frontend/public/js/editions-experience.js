/* Guest controls work before animation chunks load, and with motion disabled. */
(function(){
 'use strict';var E=window,base=E.EVER_bindSite;
 E.EVER_bindSite=function(root,options){
  if(!root.dataset.edition){base(root,options);return;}
  // Reuse RSVP/navigation plumbing without running the older motion system.
  base(root,Object.assign({},options,{editing:true}));
  if(root.dataset.edition==='aangan'){E.INVITARA_housewarmingBind(root,options);return;}
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
  var opening,openingAnimations=[],openingStarted=false,startMotion=function(){};
  // [eyebrow, button, label, signature object]; each object is a short keyframe script below.
  var entrances={
   vow:['Two lives, one story','Untie the ribbon','OUR VOWS','vowbook'],
   orbit:['The next chapter begins','Bring the rings together','YES, TO US','orbit'],
   postmark:['A little note, just for you','Postmark the letter','SAVE THE DATE','postmark'],
   encore:['Your name is on the list','Tear your ticket','ADMIT ONE','ticket'],
   archive:['A lifetime of little moments','Open our album','OUR STORY','album'],
   universe:['Someone wonderful is on the way','Set the stars in motion','HELLO, LITTLE ONE','universe'],
   petal:['An afternoon in full bloom','Let it bloom','THE PETAL SOCIETY','bloom'],
   next:['You are part of what comes next','Toss the cap','THE NEXT CHAPTER','graduation'],
   disco:['The evening belongs to you','Drop the mirrorball','AFTER DARK','mirrorball'],
   form:['An invitation to think forward','Open the structure','FORM / FUTURE','structure'],
   majlis:['An evening of light and gratitude','Light the lantern','UNDER ONE MOON','lantern'],
   mosaic:['Our doors are open to you','Turn the mosaic','EID MUBARAK','mosaic'],
   solstice:['A little warmth, wrapped for you','Raise the winter moon','IN GOOD COMPANY','solstice'],
   elsewhere:['Somewhere worth being together','Take your boarding pass','YOU ARE INVITED','boarding']
  };
  function many(cls,n,style){var out='';for(var i=0;i<n;i++)out+='<i class="'+cls+'" style="'+(style?style(i):'')+'"></i>';return out;}
  var L='<span class="o-label"></span>';
  var objects={
   vowbook:'<div class="o-page">'+L+'</div><div class="o-cover"><span class="o-mono">✦</span></div><i class="o-ribbon o-ribbon-l"></i><i class="o-ribbon o-ribbon-r"></i><i class="o-bow"></i>',
   orbit:'<i class="o-stars"></i><div class="o-orbit"><i class="o-ring o-ring-a"></i></div><div class="o-orbit"><i class="o-ring o-ring-b"></i></div><i class="o-flare"></i>'+L,
   postmark:'<i class="o-env-back"></i><div class="o-letter">'+L+'</div><i class="o-env-front"></i><i class="o-flap"></i><i class="o-stamp"></i><i class="o-postmark"></i>',
   ticket:'<div class="o-ticket">'+L+'<small>ROW A · SEAT 01</small></div><div class="o-stub"><i></i></div>'+many('o-bit',10),
   album:'<i class="o-photo"></i><i class="o-photo"></i><i class="o-photo"></i><div class="o-album">'+L+'</div>',
   universe:'<i class="o-path"></i><i class="o-path"></i><i class="o-path"></i><div class="o-orbit"><i class="o-sat"></i></div><div class="o-orbit"><i class="o-sat"></i></div><div class="o-orbit"><i class="o-sat"></i></div><i class="o-core"></i>'+L,
   bloom:many('o-petal',8,function(i){return 'transform:rotate('+i*45+'deg) scale(.55)';})+'<i class="o-heart"></i>'+L,
   graduation:'<div class="o-paper">'+L+'</div><i class="o-roll o-roll-l"></i><i class="o-roll o-roll-r"></i><div class="o-cap"><i class="o-crown"></i><i class="o-board"></i><i class="o-tassel"></i></div>',
   mirrorball:many('o-beam',4)+'<div class="o-drop"><i class="o-string"></i><div class="o-ball"><i class="o-facets"></i></div></div>'+L,
   structure:L+many('o-slab',4),
   lantern:'<i class="o-moon"></i><i class="o-glow"></i><div class="o-lantern"><i class="o-cap"></i><div class="o-body"><i class="o-light"></i></div><i class="o-base"></i></div>'+L,
   mosaic:'<div class="o-star"></div>'+L+many('o-tile',8,function(i){return 'transform:rotate('+i*45+'deg)';})+'<i class="o-rosette"></i>',
   solstice:'<i class="o-sky"></i><i class="o-moon"></i><i class="o-ridge o-ridge-back"></i><i class="o-ridge o-ridge-front"></i>'+many('o-flake',12,function(i){return 'left:'+(6+i*7.6)+'%;top:'+(i%3*9)+'%';})+L,
   boarding:'<div class="o-pass">'+L+'<small>GATE 01 · SEAT 1A</small><i class="o-code"></i></div><div class="o-pocket"></div><i class="o-visa">ARRIVED</i>'
  };
  // [selector, keyframes | fn(index), duration, delay, easing, stagger] — every script ends by ~1.15s.
  var EASE='cubic-bezier(.22,.7,.18,1)',IN='cubic-bezier(.55,0,.8,.3)',SWING='cubic-bezier(.45,0,.2,1)';
  function rot(a,rest){return {transform:'rotate('+a+'deg)'+(rest||'')};}
  var moves={
   vowbook:[['.o-bow',[{transform:'rotate(45deg)'},{transform:'rotate(45deg) scale(0)',opacity:0}],260,0,IN],['.o-ribbon-l',[{transform:'none'},{transform:'translateX(-130%)',opacity:0}],380,120,IN],['.o-ribbon-r',[{transform:'none'},{transform:'translateX(130%)',opacity:0}],380,120,IN],['.o-cover',[{transform:'rotateY(0)'},{transform:'rotateY(-165deg)'}],760,380,SWING],['.o-page',[{transform:'none'},{transform:'scale(1.06)'}],600,550,EASE]],
   orbit:[['.o-orbit',[{transform:'rotate(0)'},{transform:'rotate(360deg)'}],1000,0,SWING],['.o-ring-a',[{transform:'translateX(-70px)'},{transform:'translateX(-22px)'}],1000,0,SWING],['.o-ring-b',[{transform:'translateX(70px)'},{transform:'translateX(22px)'}],1000,0,SWING],['.o-flare',[{transform:'scale(0)',opacity:0},{transform:'scale(1.6) rotate(45deg)',opacity:1,offset:.5},{transform:'scale(2.4) rotate(90deg)',opacity:0}],500,650,EASE]],
   postmark:[['.o-postmark',[{transform:'scale(2.4) rotate(-40deg)',opacity:0},{transform:'rotate(-12deg)',opacity:.9}],260,0,IN],['.o-flap',[{transform:'rotateX(0)'},{transform:'rotateX(180deg)',opacity:1,offset:.7},{transform:'rotateX(180deg)',opacity:0}],520,320,SWING],['.o-letter',[{transform:'none'},{transform:'translateY(-42%)'}],520,640,EASE]],
   ticket:[['.o-stub',[{transform:'none'},{transform:'rotate(5deg)',offset:.25},{transform:'translate(30px,160px) rotate(32deg)',opacity:0}],720,0,IN],['.o-ticket',[{transform:'none'},{transform:'translateX(10%) scale(1.04)'}],600,350,EASE],['.o-bit',function(i){var a=i/10*Math.PI*2,r=90+i%3*30;return [{transform:'scale(.4)',opacity:0},{opacity:1,offset:.2},{transform:'translate('+Math.round(Math.cos(a)*r)+'px,'+Math.round(Math.sin(a)*r)+'px) rotate('+i*70+'deg)',opacity:0}];},800,250,EASE]],
   album:[['.o-album',[{transform:'rotateY(0)'},{transform:'rotateY(-160deg)',opacity:0}],650,0,SWING],['.o-photo',function(i){return [{transform:'none'},{transform:['translate(-88px,12px) rotate(-14deg)','translateY(-10px) scale(1.08)','translate(88px,16px) rotate(12deg)'][i]}];},650,380,EASE,60]],
   universe:[['.o-path',[{transform:'scale(.2)',opacity:0},{transform:'none',opacity:.45}],800,100,EASE,80],['.o-orbit',function(i){return [rot(0),rot(200+i*70)];},1100,0,EASE],['.o-sat',function(i){return [{transform:'scale(.3)'},{transform:'translateX('+(56+i*30)+'px)'}];},900,80,EASE,60],['.o-core',[{transform:'none'},{transform:'scale(1.18)'}],1000,0,EASE]],
   bloom:[['.o-petal',function(i){var a=i*45;return [rot(a,' scale(.55)'),Object.assign(rot(a+10),{offset:.4}),Object.assign(rot(a+50,' translateY(-150px) scale(.6)'),{opacity:0})];},950,0,'cubic-bezier(.3,.6,.3,1)',25],['.o-heart',[{transform:'none'},{transform:'scale(1.5)',opacity:0}],600,450,EASE]],
   graduation:[['.o-cap',[{transform:'none'},{transform:'translate(30px,-230px) rotate(-340deg) scale(.7)',opacity:0}],850,0,'cubic-bezier(.2,.65,.35,1)'],['.o-paper',[{transform:'scaleX(.06)'},{transform:'none'}],700,300,EASE],['.o-roll-l',[{transform:'translateX(100%)'},{transform:'none'}],700,300,EASE],['.o-roll-r',[{transform:'translateX(-100%)'},{transform:'none'}],700,300,EASE]],
   mirrorball:[['.o-drop',[{transform:'translateY(-46px)'},{transform:'translateY(8px)',offset:.7},{transform:'none'}],480,0,IN],['.o-facets',[rot(0),rot(140)],1150,0,'linear'],['.o-beam',function(i){var a=-50+i*33;return [rot(a,' scaleY(.3)'),{opacity:.85,offset:.35},Object.assign(rot(a+24),{opacity:0})];},750,300,EASE,40]],
   structure:[['.o-slab',function(i){return [{transform:'none'},{transform:'translateX('+(i%2?118:-118)+'%)'}];},620,120,'cubic-bezier(.7,0,.2,1)',90],['.o-label',[{transform:'scale(.92)',opacity:.3},{transform:'none',opacity:1}],500,600,EASE]],
   lantern:[['.o-lantern',[rot(0),Object.assign(rot(8),{offset:.3}),Object.assign(rot(-5),{offset:.6}),Object.assign(rot(2),{offset:.85}),rot(0)],1150,0,'ease-in-out'],['.o-light',[{opacity:0},{opacity:1}],500,150,EASE],['.o-glow',[{transform:'scale(.3)',opacity:0},{transform:'scale(1.9)',opacity:1}],900,250,EASE]],
   mosaic:[['.o-tile',function(i){var a=i*45;return [rot(a),Object.assign(rot(a+90,' scale(.15)'),{opacity:0})];},700,0,'cubic-bezier(.6,0,.3,1)',35],['.o-rosette',[rot(0),rot(180,' scale(0)')],500,0,IN],['.o-star',[{transform:'rotate(-135deg) scale(0)'},{transform:'none'}],650,450,'cubic-bezier(.2,1.3,.4,1)'],['.o-label',[{opacity:0},{opacity:1}],400,750,EASE]],
   solstice:[['.o-moon',[{transform:'none'},{transform:'translateY(-120px)'}],1050,0,EASE],['.o-ridge-back',[{transform:'rotate(-10deg)'},{transform:'rotate(-10deg) translateY(30px)'}],900,200,EASE],['.o-ridge-front',[{transform:'rotate(9deg)'},{transform:'rotate(9deg) translateY(60px)'}],900,200,EASE],['.o-flake',function(i){return [{transform:'translateY(-20px)',opacity:0},{opacity:.9,offset:.3},{transform:'translateY('+(110+i%4*25)+'px)',opacity:0}];},750,100,'linear',30],['.o-label',[{opacity:0},{opacity:1}],400,650,EASE]],
   boarding:[['.o-pass',[{transform:'none'},{transform:'translateY(-72px)'}],600,0,EASE],['.o-visa',[{transform:'scale(2.2) rotate(-30deg)',opacity:0},{transform:'rotate(-10deg)',opacity:.9}],260,620,IN]]
  };
  if(hero&&entrances[key]){
   var entrance=entrances[key],nameList=Array.from(hero.querySelectorAll('.ed-name')).map(function(node){return node.textContent.trim();}).filter(Boolean),photo=hero.querySelector('img');
   opening=document.createElement('section');opening.className='ed-opening ed-opening-'+entrance[3];opening.setAttribute('aria-label','Open your invitation');
   if(photo&&photo.src)opening.style.setProperty('--ed-photo','url('+JSON.stringify(photo.src)+')');
   var eyebrow=document.createElement('p');eyebrow.className='ed-opening-eyebrow';eyebrow.textContent=entrance[0];
   var object=document.createElement('div');object.className='ed-opening-object';object.setAttribute('aria-hidden','true');object.innerHTML=objects[entrance[3]];object.querySelector('.o-label').textContent=entrance[2];
   var mono=object.querySelector('.o-mono');if(mono&&nameList.length)mono.textContent=nameList.map(function(n){return n.charAt(0);}).join('&');
   var names=document.createElement('h2');names.className='ed-opening-names';names.textContent=nameList.join(' & ')||'A celebration awaits';
   var openButton=document.createElement('button');openButton.type='button';openButton.className='ed-opening-button';openButton.textContent=entrance[1];openButton.setAttribute('aria-expanded','false');
   var caption=document.createElement('p');caption.className='ed-opening-caption';caption.textContent='A personal invitation · Tap to open';
   opening.append(eyebrow,object,names,openButton,caption);root.prepend(opening);root.classList.add('ed-awaiting-open');
   var concealed=Array.from(root.children).filter(function(node){return node!==opening;});concealed.forEach(function(node){node.inert=true;});
   function finishOpening(){if(!opening||disposed)return;openingAnimations.forEach(function(a){a.onfinish=null;a.cancel();});openingAnimations=[];root.classList.remove('ed-awaiting-open');root.dataset.opened='true';concealed.forEach(function(node){node.inert=false;});opening.remove();opening=null;
    // The outer letter/doors already reveal these details; avoid a second gate.
    if(key==='postmark'){hero.querySelector('.ed-date')?.classList.remove('ed-sealed-date');trigger?.setAttribute('aria-expanded','true');}
    if(key==='mosaic'){root.classList.remove('ed-courtyard-closed');root.classList.add('ed-courtyard-open');trigger?.setAttribute('aria-expanded','true');}
    hero.tabIndex=-1;hero.focus({preventScroll:true});startMotion();
   }
   function openInvitation(){
    if(openingStarted){finishOpening();return;} // a second tap skips the rest
    openingStarted=true;openButton.setAttribute('aria-expanded','true');
    if(reduced.matches||root.dataset.motion==='none'){finishOpening();return;}
    openButton.textContent='Skip';opening.classList.add('is-opening');var end=0;
    moves[entrance[3]].forEach(function(m){object.querySelectorAll(m[0]).forEach(function(node,i){var delay=m[3]+i*(m[5]||0);end=Math.max(end,delay+m[2]);openingAnimations.push(node.animate(typeof m[1]==='function'?m[1](i):m[1],{duration:m[2],delay:delay,easing:m[4],fill:'forwards'}));});});
    var exit=opening.animate([{opacity:1},{opacity:0}],{duration:300,delay:end-100,fill:'forwards'});openingAnimations.push(exit);exit.onfinish=finishOpening;
   }
   on(openButton,'click',openInvitation);on(object,'click',openInvitation);on(reduced,'change',function(){if(reduced.matches&&openingStarted)finishOpening();});
   clean.push(function(){openingAnimations.forEach(function(a){a.onfinish=null;a.cancel();});});
  }
  var photos=Array.from(root.querySelectorAll('.nx-gallery-photo'));
  if(photos.length){var dialog=document.createElement('dialog');dialog.className='nx-lightbox';dialog.setAttribute('aria-label','Photo gallery');dialog.innerHTML='<button aria-label="Close gallery">×</button><img alt=""><p role="status"></p><div><button aria-label="Previous photograph">←</button><button aria-label="Next photograph">→</button></div>';document.body.appendChild(dialog);var current=0,focus;
   function show(i){current=(i+photos.length)%photos.length;dialog.querySelector('img').src=photos[current].src;dialog.querySelector('img').alt=photos[current].alt;dialog.querySelector('p').textContent=(current+1)+' / '+photos.length+' — '+photos[current].alt;}
   photos.forEach(function(img,i){img.tabIndex=0;img.setAttribute('role','button');img.setAttribute('aria-label','Open photograph: '+img.alt);function open(){focus=img;show(i);dialog.showModal();}on(img,'click',open);on(img,'keydown',function(e){if(['Enter',' '].includes(e.key)){e.preventDefault();open();}});});on(dialog.querySelector('button'),'click',function(){dialog.close();});on(dialog.querySelector('[aria-label="Previous photograph"]'),'click',function(){show(current-1);});on(dialog.querySelector('[aria-label="Next photograph"]'),'click',function(){show(current+1);});on(dialog,'keydown',function(e){if(e.key==='ArrowRight')show(current+1);if(e.key==='ArrowLeft')show(current-1);});on(dialog,'close',function(){focus?.focus({preventScroll:true});});var touch;on(dialog,'touchstart',function(e){touch=e.touches[0].clientX;},{passive:true});on(dialog,'touchend',function(e){var dx=e.changedTouches[0].clientX-touch;if(Math.abs(dx)>65)show(current+(dx<0?1:-1));},{passive:true});clean.push(function(){dialog.remove();});
  }
  if(!reduced.matches&&root.dataset.motion!=='none'){
   var pause=document.createElement('button');pause.className='ed-scene-action';pause.type='button';pause.textContent='Pause motion';pause.setAttribute('aria-pressed','false');hero?.appendChild(pause);on(pause,'click',function(){var paused=pause.getAttribute('aria-pressed')!=='true';pause.setAttribute('aria-pressed',String(paused));pause.textContent=paused?'Resume motion':'Pause motion';root.dataset.paused=String(paused);root.dispatchEvent(new CustomEvent('edition-motion'));});
   startMotion=function(){import('/vendor/editions/editions-motion.js').then(function(module){if(!disposed&&root.isConnected){var stop=module.bindEditionMotion(root);clean.push(stop);}}).catch(function(){pause.remove();});};if(!opening)startMotion();
  }
 };
})();
