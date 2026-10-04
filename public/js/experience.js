(function(){
  'use strict';
  var E=window, original=E.EVER_bindSite;
  if(E.gsap&&E.ScrollTrigger)E.gsap.registerPlugin(E.ScrollTrigger);
  E.EVER_bindSite=function(root,opts){
    original(root,Object.assign({},opts,{rsvpDemo:false}));
    if(!opts||opts.rsvpDemo!==false)root.addEventListener('submit',function(e){if(!e.target.matches('.ws-rsvp-form'))return;e.preventDefault();if(!e.target.reportValidity())return;var note=e.target.querySelector('.ex-form-note');if(note)note.textContent='Preview only. Guest replies become active after you publish.';});
    if(!root.classList.contains('ex')||root.__exBound)return;
    root.__exBound=true;
    var clean=[],motion=[],triggers=[],video=root.querySelector('[data-film]');
    var reduced=matchMedia('(prefers-reduced-motion: reduce)');
    var cover=root.querySelector('.ex-cover'),open=root.querySelector('[data-open]');
    var gs=opts&&opts.editing?null:E.gsap,context=gs?gs.context(function(){},root):null;
    var scroller=root.closest('.ed-canvas-wrap');
    var active=true;
    function on(el,event,fn,options){el.addEventListener(event,fn,options);clean.push(function(){el.removeEventListener(event,fn,options);});}
    function tween(fn){if(context)context.add(fn);else fn();}
    function enter(){
      if(!gs||reduced.matches)return;
      tween(function(){var first=root.querySelector('#ws-sec-hero');if(!first)return;gs.from(first.querySelectorAll('[data-title],.ex-eyebrow,.vellum-flower,.atlas-location,.bloom-intro>.ex-button'),{y:28,opacity:0,duration:1.25,stagger:.12,ease:'power3.out',clearProps:'transform,opacity'});});
    }
    function revealCover(){
      if(!cover)return;
      open.disabled=true;root.__opened=true;
      function finish(){cover.remove();root.classList.remove('is-closed');root.querySelectorAll('.ex-nav,.ex-section,.ex-footer').forEach(function(el){el.inert=false;});var title=root.querySelector('h1');if(title){title.tabIndex=-1;title.focus({preventScroll:true});}if(E.ScrollTrigger)E.ScrollTrigger.refresh();enter();}
      if(!gs||reduced.matches){finish();return;}
      tween(function(){var tl=gs.timeline({onComplete:finish});
        if(root.classList.contains('ex-vellum'))tl.to(cover.querySelector('.ex-seal'),{scale:.85,opacity:0,duration:.3}).to(cover.querySelector('.letter-flap'),{rotationX:160,opacity:0,duration:.8,ease:'power2.inOut'},.2).to(cover.querySelector('.letter-front'),{yPercent:100,duration:1,ease:'power3.inOut'},.45).to(cover.querySelector('.cover-copy'),{y:-30,opacity:0,duration:.5},.2).to(cover,{opacity:0,duration:.45},1);
        else tl.to(cover.querySelector('.storybook,.passport'),{rotationY:-95,xPercent:-10,opacity:0,duration:1.15,ease:'power3.inOut'}).to(cover,{opacity:0,duration:.4},.75);
      });
    }
    if(cover&&open){root.classList.add('is-closed');root.querySelectorAll('.ex-nav,.ex-section,.ex-footer').forEach(function(el){el.inert=true;});on(open,'click',revealCover);}else enter();
    root.querySelectorAll('[data-scratch]').forEach(function(box){
      var canvas=box.querySelector('canvas'),ctx=canvas.getContext('2d',{willReadFrequently:true}),down=false,last=null,done=false;
      var reveal=box.parentElement.querySelector('[data-reveal]');
      function finish(){if(done)return;done=true;box.classList.add('is-revealed');box.setAttribute('aria-live','polite');if(reveal){reveal.textContent='Date revealed ✓';reveal.disabled=true;}root.dispatchEvent(new CustomEvent('date-revealed'));}
      function size(){if(done)return;var r=box.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.max(1,Math.round(r.width*ratio));canvas.height=Math.max(1,Math.round(r.height*ratio));ctx.globalCompositeOperation='source-over';var fill=ctx.createLinearGradient(0,0,canvas.width,canvas.height);fill.addColorStop(0,getComputedStyle(root).getPropertyValue('--ws-gold').trim()||'#b7a47e');fill.addColorStop(.3,'#ede0bb');fill.addColorStop(.6,'#caba96');fill.addColorStop(1,'#e7d9b4');ctx.fillStyle=fill;ctx.fillRect(0,0,canvas.width,canvas.height);for(var i=0;i<2000;i++){ctx.fillStyle=i%2?'#ffffff16':'#4f402f12';ctx.fillRect(Math.random()*canvas.width,Math.random()*canvas.height,1,1);}ctx.globalCompositeOperation='destination-out';}
      function point(e){var r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height};}
      function draw(e){if(!down||done)return;var p=point(e);ctx.lineWidth=canvas.width/7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(last?last.x:p.x,last?last.y:p.y);ctx.lineTo(p.x,p.y);ctx.stroke();last=p;}
      function progress(){if(done)return;var pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data,total=0,clear=0;for(var i=3;i<pixels.length;i+=160){total++;if(pixels[i]<80)clear++;}if(clear/total>.32)finish();}
      on(canvas,'pointerdown',function(e){down=true;last=point(e);canvas.setPointerCapture(e.pointerId);draw(e);});
      on(canvas,'pointermove',draw);on(canvas,'pointerup',function(){down=false;last=null;progress();});on(canvas,'pointercancel',function(){down=false;last=null;});
      if(reveal)on(reveal,'click',finish);
      var ro=new ResizeObserver(size);ro.observe(box);clean.push(function(){ro.disconnect();});size();
    });
    var userPaused=false;
    function playVideo(){if(video&&!reduced.matches&&!userPaused&&!document.hidden&&active)video.play().catch(function(){var b=root.querySelector('[data-film-toggle]');if(b)b.textContent='Play film ▷';});}
    if(video){
      var filmButton=root.querySelector('[data-film-toggle]');
      on(video,'error',function(){video.style.opacity='0';if(filmButton){filmButton.textContent='Film unavailable';filmButton.disabled=true;}},true);
      if(filmButton)on(filmButton,'click',function(){userPaused=!video.paused;if(userPaused)video.pause();else{userPaused=false;video.play().catch(function(){});}filmButton.textContent=userPaused?'Play film ▷':'Pause film Ⅱ';filmButton.setAttribute('aria-pressed',String(userPaused));});
      playVideo();clean.push(function(){video.pause();video.removeAttribute('src');video.querySelectorAll('source').forEach(function(s){s.removeAttribute('src');});video.load();});
    }
    if(gs&&E.ScrollTrigger&&!reduced.matches){
      tween(function(){
        root.querySelectorAll('[data-reveal-text]').forEach(function(el){
          var text=el.textContent;el.setAttribute('aria-label',text);el.innerHTML=text.split(/\s+/).map(function(w){return '<span class="word" aria-hidden="true">'+E.EVER_esc(w)+'</span>';}).join(' ');
          var animation=gs.fromTo(el.querySelectorAll('.word'),{opacity:.18,y:8},{opacity:1,y:0,stagger:.08,ease:'none',scrollTrigger:{trigger:el,scroller:scroller||undefined,start:'top 88%',end:'bottom 55%',scrub:.65}});triggers.push(animation.scrollTrigger);
        });
        root.querySelectorAll('[data-parallax]').forEach(function(el){var image=el.querySelector('img');if(!image)return;var animation=gs.fromTo(image,{scale:1.1,yPercent:-3},{scale:1.03,yPercent:3,ease:'none',scrollTrigger:{trigger:el,scroller:scroller||undefined,start:'top bottom',end:'bottom top',scrub:1.2}});triggers.push(animation.scrollTrigger);});
        root.querySelectorAll('[data-rise]').forEach(function(el){var animation=gs.from(el,{y:30,opacity:0,duration:1,ease:'power3.out',clearProps:'opacity,transform',scrollTrigger:{trigger:el,scroller:scroller||undefined,start:'top 94%',once:true}});triggers.push(animation.scrollTrigger);});
        var cloud=root.querySelectorAll('.bloom-cloud');if(cloud.length)motion.push(gs.to(cloud,{x:24,duration:6,repeat:-1,yoyo:true,ease:'sine.inOut',stagger:1}));
        var stars=root.querySelectorAll('.bloom-star');if(stars.length)motion.push(gs.to(stars,{rotation:35,scale:.8,opacity:.5,duration:3,repeat:-1,yoyo:true,stagger:.5,ease:'sine.inOut'}));
        var orb=root.querySelector('.party-orb');if(orb)motion.push(gs.to(orb,{y:-13,rotation:6,duration:3,repeat:-1,yoyo:true,ease:'sine.inOut'}));
        var ticker=root.querySelector('.party-ticker>span');if(ticker)motion.push(gs.to(ticker,{xPercent:-35,duration:14,repeat:-1,ease:'none'}));
        var route=root.querySelector('.atlas-route path');if(route){var length=route.getTotalLength();var animation=gs.fromTo(route,{strokeDasharray:length,strokeDashoffset:length},{strokeDashoffset:0,ease:'none',scrollTrigger:{trigger:route,scroller:scroller||undefined,start:'top 85%',end:'bottom 35%',scrub:1}});triggers.push(animation.scrollTrigger);}
      });
    }
    var pop=root.querySelector('[data-pop]');
    if(pop)on(pop,'click',function(){
      if(!gs||reduced.matches){pop.querySelector('small').textContent='A little joy, just for you!';return;}
      tween(function(){gs.fromTo(pop,{scale:.92},{scale:1,duration:.6,ease:'elastic.out(1,.4)'});var hero=pop.closest('section'),r=pop.getBoundingClientRect(),h=hero.getBoundingClientRect();for(var i=0;i<34;i++){var bit=document.createElement('i');bit.className='ex-pop-bit';bit.style.background=['#e2ec67','#f3afd0','#fff6de'][i%3];bit.style.left=(r.left-h.left+r.width/2)+'px';bit.style.top=(r.top-h.top+r.height/2)+'px';hero.appendChild(bit);gs.to(bit,{x:(Math.random()-.5)*460,y:(Math.random()-.65)*440,rotation:Math.random()*650,opacity:0,duration:1+Math.random(),ease:'power2.out',onComplete:function(node){node.remove();},onCompleteParams:[bit]});}});
    });
    var observer=new IntersectionObserver(function(entries){active=entries[0].isIntersecting;motion.forEach(function(t){t.paused(!active||document.hidden);});if(video){if(active)playVideo();else video.pause();}},{threshold:.01});observer.observe(root);clean.push(function(){observer.disconnect();});
    on(document,'visibilitychange',function(){motion.forEach(function(t){t.paused(document.hidden||!active);});if(video){if(document.hidden)video.pause();else playVideo();}});
    on(reduced,'change',function(){if(reduced.matches){if(context)context.revert();if(cover&&cover.isConnected){cover.remove();root.classList.remove('is-closed');root.querySelectorAll('.ex-nav,.ex-section,.ex-footer').forEach(function(el){el.inert=false;});}if(video)video.pause();root.querySelectorAll('.word').forEach(function(el){el.style.opacity='1';el.style.transform='none';});}});
    root.__premiumDispose=function(){clean.forEach(function(fn){fn();});if(context)context.revert();triggers.forEach(function(t){if(t)t.kill();});};
  };
})();
