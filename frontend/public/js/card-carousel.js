/* Phone-width card carousels: long card grids become one swipeable row below 768px and stay a grid above.
 * Same Swiper pattern as collection-carousel.js, without coverflow or autoplay (nothing moves on its own). */
(function(){
 'use strict';
 if(!window.Swiper)return;
 var TARGETS=[{selector:'#pricing-grid',label:'Invitation experiences',item:'experience'}];
 var phone=matchMedia('(max-width: 767px)');
 var reduced=matchMedia('(prefers-reduced-motion: reduce)');
 TARGETS.forEach(function(target){
  var grid=document.querySelector(target.selector);if(!grid||grid.children.length<3)return;
  var root=null,controls=null,swiper=null;
  function slides(on){Array.from(grid.children).forEach(function(card){card.classList.toggle('swiper-slide',on);});}
  function mount(){
   root=document.createElement('div');root.className='swiper card-carousel';root.setAttribute('role','region');root.setAttribute('aria-roledescription','carousel');root.setAttribute('aria-label',target.label);
   grid.before(root);root.append(grid);grid.classList.add('swiper-wrapper');slides(true);
   controls=document.createElement('div');controls.className='card-carousel-controls';
   controls.innerHTML='<button type="button" class="carousel-arrow" data-dir="prev" aria-label="Previous '+target.item+'"><span aria-hidden="true">←</span></button><div class="carousel-pagination"></div><button type="button" class="carousel-arrow" data-dir="next" aria-label="Next '+target.item+'"><span aria-hidden="true">→</span></button>';
   root.after(controls);
   swiper=new Swiper(root,{
    slidesPerView:1.25,spaceBetween:12,speed:reduced.matches?0:450,
    keyboard:{enabled:true,onlyInViewport:true},
    navigation:{prevEl:controls.querySelector('[data-dir=prev]'),nextEl:controls.querySelector('[data-dir=next]')},
    a11y:{enabled:true,slideLabelMessage:target.item+' {{index}} of {{slidesLength}}'},
    pagination:{el:controls.querySelector('.carousel-pagination'),clickable:true,bulletClass:'carousel-dot',bulletActiveClass:'is-active',renderBullet:function(index,className){return '<button type="button" class="'+className+'" aria-label="Go to '+target.item+' '+(index+1)+'"></button>';}}
   });
  }
  function unmount(){swiper.destroy(true,true);swiper=null;root.before(grid);root.remove();controls.remove();grid.classList.remove('swiper-wrapper');slides(false);}
  function sync(){if(phone.matches&&!swiper)mount();else if(!phone.matches&&swiper)unmount();}
  phone.addEventListener('change',sync);sync();
 });
})();
