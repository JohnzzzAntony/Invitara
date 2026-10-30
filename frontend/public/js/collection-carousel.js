/* Homepage template carousel: centered Swiper coverflow inspired by Skiper UI Carousel_001.
 * shop.js owns the cards inside #collection-grid; this file only presents them as slides. */
(function(){
 'use strict';
 if(document.body.dataset.page!=='home'||!window.Swiper)return;
 var wrapper=document.getElementById('collection-grid');if(!wrapper)return;
 var reduced=matchMedia('(prefers-reduced-motion: reduce)');
 var root=document.createElement('div');root.className='swiper collection-carousel';root.setAttribute('role','region');root.setAttribute('aria-roledescription','carousel');root.setAttribute('aria-label','Invitation templates');
 wrapper.before(root);root.append(wrapper);wrapper.classList.add('swiper-wrapper');
 var controls=document.createElement('div');controls.className='carousel-controls';
 controls.innerHTML='<button type="button" class="carousel-arrow" data-dir="prev" aria-label="Previous template"><span aria-hidden="true">←</span></button><div class="carousel-pagination" aria-label="Choose template"></div><button type="button" class="carousel-arrow" data-dir="next" aria-label="Next template"><span aria-hidden="true">→</span></button><button type="button" class="carousel-autoplay" aria-pressed="false"></button>';
 root.after(controls);
 function tag(){Array.from(wrapper.children).forEach(function(card){card.classList.add('swiper-slide');});}
 tag();
 var swiper=new Swiper(root,{
  effect:'coverflow',grabCursor:true,centeredSlides:true,slidesPerView:2.43,spaceBetween:40,loop:true,speed:750,
  breakpoints:{0:{slidesPerView:1.18,spaceBetween:18},600:{slidesPerView:1.65,spaceBetween:26},900:{slidesPerView:2.43,spaceBetween:40}},
  coverflowEffect:{rotate:0,stretch:0,depth:100,modifier:2.5,slideShadows:false},
  keyboard:{enabled:true,onlyInViewport:true},
  navigation:{prevEl:controls.querySelector('[data-dir=prev]'),nextEl:controls.querySelector('[data-dir=next]')},
  autoplay:reduced.matches?false:{delay:4500,pauseOnMouseEnter:true,disableOnInteraction:false},
  a11y:{enabled:true,prevSlideMessage:'Previous template',nextSlideMessage:'Next template',slideLabelMessage:'Template {{index}} of {{slidesLength}}'},
  pagination:{el:controls.querySelector('.carousel-pagination'),clickable:true,bulletClass:'carousel-dot',bulletActiveClass:'is-active',renderBullet:function(index,className){return '<button type="button" class="'+className+'" aria-label="Go to template '+(index+1)+'"></button>';}}
 });
 function active(){Array.from(wrapper.children).forEach(function(card,index){var selected=card.classList.contains('swiper-slide-active');card.classList.toggle('is-carousel-active',selected);card.setAttribute('aria-label','Template '+(index+1)+' of '+wrapper.children.length);});}
 swiper.on('slideChangeTransitionStart',active);swiper.on('transitionEnd',active);active();
 /* Autoplay is user-controllable (WCAG 2.2.2): visible pause button, paused while focus is inside, off for reduced motion. */
 var toggle=controls.querySelector('.carousel-autoplay'),userPaused=false;
 function syncToggle(){var running=!userPaused;toggle.setAttribute('aria-pressed',String(!running));toggle.innerHTML=running?'<span aria-hidden="true">❚❚</span> Pause':'<span aria-hidden="true">▶</span> Play';toggle.hidden=reduced.matches;}
 toggle.addEventListener('click',function(){userPaused=!userPaused;if(userPaused)swiper.autoplay.stop();else swiper.autoplay.start();syncToggle();});
 root.addEventListener('focusin',function(){if(swiper.autoplay.running)swiper.autoplay.pause();});
 root.addEventListener('focusout',function(e){if(!root.contains(e.relatedTarget)&&!userPaused&&!reduced.matches)swiper.autoplay.resume();});
 var seen=new IntersectionObserver(function(entries){if(userPaused||reduced.matches)return;if(entries[0].isIntersecting)swiper.autoplay.start();else swiper.autoplay.stop();});seen.observe(root);
 syncToggle();
 reduced.addEventListener('change',function(){swiper.params.speed=reduced.matches?0:750;if(reduced.matches)swiper.autoplay.stop();else if(!userPaused)swiper.autoplay.start();syncToggle();});
 /* Filtering, sorting and search re-render the cards, so re-tag them and start from the first. */
 var observer=new MutationObserver(function(){tag();swiper.update();swiper.slideTo(0,0);active();});observer.observe(wrapper,{childList:true});
 addEventListener('pagehide',function(){observer.disconnect();seen.disconnect();swiper.destroy(true,true);root.remove();controls.remove();wrapper.classList.remove('swiper-wrapper');});
})();
