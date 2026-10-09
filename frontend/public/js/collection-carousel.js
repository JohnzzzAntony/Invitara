/* Homepage template carousel: Swiper coverflow with autoplay.
 * Effect adapted from Skiper UI Carousel_003 (https://skiper-ui.com), in vanilla JavaScript.
 * shop.js owns the cards inside #collection-grid; this file only presents them as slides. */
(function(){
 'use strict';
 if(document.body.dataset.page!=='home'||!window.Swiper)return;
 var wrapper=document.getElementById('collection-grid');if(!wrapper)return;
 var reduced=matchMedia('(prefers-reduced-motion: reduce)'),paused=reduced.matches;
 var root=document.createElement('div');root.className='swiper collection-carousel';root.setAttribute('aria-label','Invitation templates');
 wrapper.before(root);root.append(wrapper);wrapper.classList.add('swiper-wrapper');
 var controls=document.createElement('div');controls.className='carousel-controls';
 controls.innerHTML='<button type="button" class="carousel-prev" aria-label="Previous template">←</button><span class="carousel-position" aria-hidden="true"></span><button type="button" class="carousel-next" aria-label="Next template">→</button><button type="button" class="carousel-pause" aria-pressed="false"></button>';
 root.after(controls);
 var pause=controls.querySelector('.carousel-pause');
 function tag(){Array.from(wrapper.children).forEach(function(card){card.classList.add('swiper-slide');});}
 tag();
 var swiper=new Swiper(root,{
  effect:'coverflow',grabCursor:true,centeredSlides:true,slidesPerView:'auto',rewind:true,speed:700,
  coverflowEffect:{rotate:40,stretch:0,depth:100,modifier:1,slideShadows:false},
  autoplay:{delay:2800,disableOnInteraction:false,pauseOnMouseEnter:true},
  keyboard:{enabled:true,onlyInViewport:true},
  a11y:{enabled:true,slideLabelMessage:'Template {{index}} of {{slidesLength}}'},
  navigation:{prevEl:controls.querySelector('.carousel-prev'),nextEl:controls.querySelector('.carousel-next')},
  pagination:{el:controls.querySelector('.carousel-position'),type:'fraction',formatFractionCurrent:function(n){return String(n).padStart(2,'0');},formatFractionTotal:function(n){return String(n).padStart(2,'0');}}
 });
 function label(){pause.textContent=paused?'Play slideshow':'Pause slideshow';pause.setAttribute('aria-pressed',String(paused));}
 function sync(){if(!swiper.autoplay)return;if(paused||document.hidden||!visible)swiper.autoplay.stop();else swiper.autoplay.start();}
 var visible=false;
 pause.onclick=function(){paused=!paused;label();sync();};
 document.addEventListener('visibilitychange',sync);
 reduced.addEventListener('change',function(){paused=reduced.matches;label();sync();});
 new IntersectionObserver(function(entries){visible=entries[0].isIntersecting;sync();},{threshold:.2}).observe(root);
 /* Filtering, sorting and search re-render the cards, so re-tag them and start from the first. */
 new MutationObserver(function(){tag();swiper.update();swiper.slideTo(0,0);}).observe(wrapper,{childList:true});
 label();
})();
