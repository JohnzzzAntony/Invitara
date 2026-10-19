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
 controls.innerHTML='<div class="carousel-pagination" aria-label="Choose template"></div>';
 root.after(controls);
 function tag(){Array.from(wrapper.children).forEach(function(card){card.classList.add('swiper-slide');});}
 tag();
 var swiper=new Swiper(root,{
  effect:'coverflow',grabCursor:true,centeredSlides:true,slidesPerView:2.43,spaceBetween:40,loop:true,speed:750,
  breakpoints:{0:{slidesPerView:1.18,spaceBetween:18},600:{slidesPerView:1.65,spaceBetween:26},900:{slidesPerView:2.43,spaceBetween:40}},
  coverflowEffect:{rotate:0,stretch:0,depth:100,modifier:2.5,slideShadows:false},
  keyboard:{enabled:true,onlyInViewport:true},
  a11y:{enabled:true,slideLabelMessage:'Template {{index}} of {{slidesLength}}'},
  pagination:{el:controls.querySelector('.carousel-pagination'),clickable:true,bulletClass:'carousel-dot',bulletActiveClass:'is-active',renderBullet:function(index,className){return '<button type="button" class="'+className+'" aria-label="Go to template '+(index+1)+'"></button>';}}
 });
 function active(){Array.from(wrapper.children).forEach(function(card,index){var selected=card.classList.contains('swiper-slide-active');card.classList.toggle('is-carousel-active',selected);card.setAttribute('aria-label','Template '+(index+1)+' of '+wrapper.children.length);});}
 swiper.on('slideChangeTransitionStart',active);swiper.on('transitionEnd',active);active();
 reduced.addEventListener('change',function(){swiper.params.speed=reduced.matches?0:750;});
 /* Filtering, sorting and search re-render the cards, so re-tag them and start from the first. */
 var observer=new MutationObserver(function(){tag();swiper.update();swiper.slideTo(0,0);active();});observer.observe(wrapper,{childList:true});
 addEventListener('pagehide',function(){observer.disconnect();swiper.destroy(true,true);root.remove();controls.remove();wrapper.classList.remove('swiper-wrapper');});
})();
